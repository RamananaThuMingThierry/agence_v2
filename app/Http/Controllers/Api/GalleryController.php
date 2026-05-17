<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gallery\StoreGalleryRequest;
use App\Http\Requests\Gallery\UpdateGalleryRequest;
use App\Models\Gallery;
use App\Services\ActivityLogService;
use App\Services\GalleryService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class GalleryController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private GalleryService $galleryService,
        private ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $galleries = $this->galleryService->getAllGalleries(
                fields: ['*'],
                relations: ['category:id,name', 'images'],
                paginate: $request->integer('per_page'),
                orderBy: ['id' => 'desc'],
            );

            return response()->json([
                'data' => $galleries,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'galleries_index_error',
                'Failed to fetch galleries: ' . $e->getMessage(),
                $e,
                $request->user(),
                Gallery::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch galleries.'], 500);
        }
    }

    public function store(StoreGalleryRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $gallery = DB::transaction(function () use ($request, $validated) {
                $gallery = $this->galleryService->createGallery([
                    'title' => $validated['title'],
                    'subtitle' => $validated['subtitle'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'category_id' => $validated['category_id'],
                ]);

                $this->syncGalleryImages($request, $gallery);

                return $gallery->fresh(['category:id,name', 'images']);
            });

            $this->activityLogService->logSuccess(
                $request,
                'create',
                'Gallery created successfully.',
                $request->user(),
                Gallery::class,
                $gallery->id,
                201,
                ['created_gallery_title' => $gallery->title]
            );

            return response()->json([
                'data' => $gallery,
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'gallery_store_error',
                'Failed to create gallery: ' . $e->getMessage(),
                $e,
                $request->user(),
                Gallery::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to create gallery.'], 500);
        }
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                return response()->json(['message' => 'Invalid gallery ID.'], 400);
            }

            $gallery = $this->galleryService->getByIdGallery($id, relations: ['category:id,name', 'images']);

            if (!$gallery) {
                return response()->json(['message' => 'Gallery not found.'], 404);
            }

            return response()->json([
                'data' => $gallery,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'gallery_show_error',
                'Failed to fetch gallery: ' . $e->getMessage(),
                $e,
                $request->user(),
                Gallery::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch gallery.'], 500);
        }
    }

    public function update(UpdateGalleryRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid gallery ID.'], 400);
        }

        $gallery = $this->galleryService->getByIdGallery($id, relations: ['images']);

        if (!$gallery) {
            return response()->json(['message' => 'Gallery not found.'], 404);
        }

        try {
            $validated = $request->validated();

            $gallery = DB::transaction(function () use ($request, $validated, $gallery) {
                $this->galleryService->updateGallery($gallery, [
                    'title' => $validated['title'] ?? $gallery->title,
                    'subtitle' => array_key_exists('subtitle', $validated) ? $validated['subtitle'] : $gallery->subtitle,
                    'description' => array_key_exists('description', $validated) ? $validated['description'] : $gallery->description,
                    'category_id' => $validated['category_id'] ?? $gallery->category_id,
                ]);

                $this->syncGalleryImages($request, $gallery, true);

                return $gallery->fresh(['category:id,name', 'images']);
            });

            $this->activityLogService->logInfo(
                $request,
                'update',
                'Gallery updated successfully.',
                $request->user(),
                Gallery::class,
                $gallery->id,
                200,
                ['updated_fields' => array_keys($validated)]
            );

            return response()->json([
                'data' => $gallery,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'gallery_update_error',
                'Failed to update gallery: ' . $e->getMessage(),
                $e,
                $request->user(),
                Gallery::class,
                $gallery->id,
                500
            );

            return response()->json(['message' => 'Failed to update gallery.'], 500);
        }
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid gallery ID.'], 400);
        }

        $gallery = $this->galleryService->getByIdGallery($id, relations: ['images']);

        if (!$gallery) {
            return response()->json(['message' => 'Gallery not found.'], 404);
        }

        foreach ($gallery->images as $image) {
            $this->deleteFile($image->image_url, 'uploads/galleries');
            $image->forceDelete();
        }

        $deletedGalleryId = $gallery->id;
        $deletedGalleryTitle = $gallery->title;
        $this->galleryService->deleteGallery($gallery);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Gallery deleted successfully.',
            $request->user(),
            Gallery::class,
            $deletedGalleryId,
            200,
            ['deleted_gallery_title' => $deletedGalleryTitle]
        );

        return response()->json(['message' => 'Gallery deleted successfully.']);
    }

    private function syncGalleryImages(Request $request, Gallery $gallery, bool $isUpdate = false): void
    {
        $existingImages = $gallery->images()->get()->keyBy('id');
        $existingPayload = collect($this->decodeJsonArray($request->input('existing_images')))
            ->filter(fn ($item) => is_array($item) && isset($item['id']))
            ->keyBy(fn ($item) => (int) $item['id']);
        $removedImageIds = collect($this->decodeJsonArray($request->input('removed_image_ids')))
            ->map(fn ($value) => (int) $value)
            ->filter()
            ->values();

        foreach ($removedImageIds as $imageId) {
            $image = $existingImages->get($imageId);

            if ($image) {
                $this->deleteFile($image->image_url, 'uploads/galleries');
                $image->forceDelete();
            }
        }

        foreach ($existingPayload as $imageId => $payload) {
            $image = $existingImages->get((int) $imageId);

            if ($image && !$removedImageIds->contains((int) $imageId)) {
                $image->update([
                    'caption' => $payload['caption'] ?? null,
                ]);
            }
        }

        $createdImages = [];
        $newFiles = array_values($request->file('images', []));
        $captions = $request->input('captions', []);

        foreach ($newFiles as $index => $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $imagePath = $this->storeGalleryFile($file);
            $createdImages[$index] = $gallery->images()->create([
                'image_url' => $imagePath,
                'caption' => $captions[$index] ?? null,
                'is_cover' => false,
            ]);
        }

        $remainingImages = $gallery->images()->get();

        if ($remainingImages->isEmpty()) {
            throw ValidationException::withMessages([
                'images' => ['Ajoutez au moins une image pour la galerie.'],
            ]);
        }

        $selectedCoverId = null;
        $coverImageId = $request->input('cover_image_id');
        $coverNewIndex = $request->input('cover_new_index');

        if ($coverImageId && $remainingImages->contains('id', (int) $coverImageId)) {
            $selectedCoverId = (int) $coverImageId;
        } elseif ($coverNewIndex !== null && isset($createdImages[(int) $coverNewIndex])) {
            $selectedCoverId = $createdImages[(int) $coverNewIndex]->id;
        } elseif ($isUpdate) {
            $selectedCoverId = $remainingImages->firstWhere('is_cover', true)?->id;
        }

        if (!$selectedCoverId) {
            $selectedCoverId = $remainingImages->first()->id;
        }

        $gallery->images()->update(['is_cover' => false]);
        $gallery->images()->where('id', $selectedCoverId)->update(['is_cover' => true]);
    }

    private function decodeJsonArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (!is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function storeGalleryFile(UploadedFile $file): string
    {
        if (!$file->isValid()) {
            throw ValidationException::withMessages([
                'images' => [sprintf('Le fichier "%s" n\'a pas pu etre telecharge correctement.', $file->getClientOriginalName())],
            ]);
        }

        $directory = public_path('uploads/galleries');

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return 'uploads/galleries/' . $filename;
    }
}
