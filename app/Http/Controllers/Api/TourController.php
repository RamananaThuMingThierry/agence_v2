<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tour\StoreTourRequest;
use App\Http\Requests\Tour\UpdateTourRequest;
use App\Models\Tour;
use App\Models\TourReview;
use App\Services\ActivityLogService;
use App\Services\TourService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class TourController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private TourService $tourService,
        private ActivityLogService $activityLogService
    ) {}

    public function publicIndex(): JsonResponse
    {
        try {
            $tours = $this->tourService->getAllTours(
                keys: 'status',
                values: 'active',
                fields: ['*'],
                relations: ['images', 'programs', 'inclusions', 'exclusions'],
                orderBy: ['id' => 'desc'],
            );

            return response()->json([
                'data' => $tours,
            ]);
        } catch (Throwable) {
            return response()->json(['message' => 'Failed to fetch public tours.'], 500);
        }
    }

    public function publicShow(string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                return response()->json(['message' => 'Invalid tour ID.'], 400);
            }

            $tour = $this->tourService->getByKeysTour(
                ['id', 'status'],
                [$id, 'active'],
                relations: ['images', 'programs', 'inclusions', 'exclusions', 'reviews' => fn ($query) => $query->where('status', 'publish')]
            );

            if (!$tour) {
                return response()->json(['message' => 'Tour not found.'], 404);
            }

            return response()->json([
                'data' => $tour,
            ]);
        } catch (Throwable) {
            return response()->json(['message' => 'Failed to fetch public tour.'], 500);
        }
    }

    public function publicStoreReview(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = Tour::query()->where('id', $id)->where('status', 'active')->first();

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['required', 'string', 'max:2000'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/reviews');
        }

        $review = $tour->reviews()->create([
            'name' => $validated['name'],
            'image' => $validated['image'] ?? null,
            'rating' => $validated['rating'],
            'review' => $validated['review'],
            'status' => 'publish',
        ]);

        $this->activityLogService->logInfo(
            $request,
            'public_tour_review_created',
            'Public tour review created successfully.',
            null,
            TourReview::class,
            $review->id,
            201,
            ['tour_id' => $tour->id, 'reviewer_name' => $review->name]
        );

        return response()->json([
            'data' => $review,
            'message' => 'Avis envoye avec succes.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $tours = $this->tourService->getAllTours(
                fields: ['*'],
                relations: ['images', 'programs', 'inclusions', 'exclusions'],
                withTrashed: $request->boolean('with_trashed'),
                onlyTrashed: $request->boolean('only_trashed'),
                paginate: $request->integer('per_page'),
                orderBy: ['id' => 'desc'],
            );

            return response()->json([
                'data' => $tours,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'tours_index_error',
                'Failed to fetch tours: ' . $e->getMessage(),
                $e,
                $request->user(),
                Tour::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch tours.'], 500);
        }
    }

    public function store(StoreTourRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $tour = DB::transaction(function () use ($request, $validated) {
                $tour = $this->tourService->createTour([
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'slug' => $this->makeUniqueSlug($validated['slug'] ?? null, $validated['title']),
                    'price' => $validated['price'],
                    'duration' => $validated['duration'],
                    'category' => $validated['category'],
                    'start_location' => $validated['start_location'] ?? null,
                    'end_location' => $validated['end_location'] ?? null,
                    'status' => $validated['status'],
                ]);

                $this->syncTourImages($request, $tour);
                $this->syncTourPrograms($request, $tour);
                $this->syncTourInclusions($request, $tour);
                $this->syncTourExclusions($request, $tour);

                return $tour->fresh(['images', 'programs', 'inclusions', 'exclusions']);
            });

            $this->activityLogService->logSuccess(
                $request,
                'create',
                'Tour created successfully.',
                $request->user(),
                Tour::class,
                $tour->id,
                201,
                ['created_tour_title' => $tour->title]
            );

            return response()->json([
                'data' => $tour,
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'tour_store_error',
                'Failed to create tour: ' . $e->getMessage(),
                $e,
                $request->user(),
                Tour::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to create tour.'], 500);
        }
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                return response()->json(['message' => 'Invalid tour ID.'], 400);
            }

            $tour = $this->tourService->getByIdTour($id, relations: ['images', 'programs', 'inclusions', 'exclusions', 'reviews'], withTrashed: true);

            if (!$tour) {
                return response()->json(['message' => 'Tour not found.'], 404);
            }

            return response()->json([
                'data' => $tour,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'tour_show_error',
                'Failed to fetch tour: ' . $e->getMessage(),
                $e,
                $request->user(),
                Tour::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch tour.'], 500);
        }
    }

    public function update(UpdateTourRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = $this->tourService->getByIdTour($id, relations: ['images', 'programs', 'inclusions', 'exclusions', 'reviews']);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        try {
            $validated = $request->validated();

            $tour = DB::transaction(function () use ($request, $validated, $tour) {
                $this->tourService->updateTour($tour, [
                    'title' => $validated['title'] ?? $tour->title,
                    'description' => array_key_exists('description', $validated) ? $validated['description'] : $tour->description,
                    'slug' => $this->makeUniqueSlug($validated['slug'] ?? $tour->slug, $validated['title'] ?? $tour->title, $tour->id),
                    'price' => $validated['price'] ?? $tour->price,
                    'duration' => $validated['duration'] ?? $tour->duration,
                    'category' => $validated['category'] ?? $tour->category,
                    'start_location' => array_key_exists('start_location', $validated) ? $validated['start_location'] : $tour->start_location,
                    'end_location' => array_key_exists('end_location', $validated) ? $validated['end_location'] : $tour->end_location,
                    'status' => $validated['status'] ?? $tour->status,
                ]);

                $this->syncTourImages($request, $tour, true);
                $this->syncTourPrograms($request, $tour);
                $this->syncTourInclusions($request, $tour);
                $this->syncTourExclusions($request, $tour);

                return $tour->fresh(['images', 'programs', 'inclusions', 'exclusions']);
            });

            $this->activityLogService->logInfo(
                $request,
                'update',
                'Tour updated successfully.',
                $request->user(),
                Tour::class,
                $tour->id,
                200,
                ['updated_fields' => array_keys($validated)]
            );

            return response()->json([
                'data' => $tour,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'tour_update_error',
                'Failed to update tour: ' . $e->getMessage(),
                $e,
                $request->user(),
                Tour::class,
                $tour->id,
                500
            );

            return response()->json(['message' => 'Failed to update tour.'], 500);
        }
    }


    public function updateReview(Request $request, string $encryptedTourId, string $reviewId): JsonResponse
    {
        $tourId = decrypt_to_int_or_null($encryptedTourId);

        if (is_null($tourId)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = Tour::query()->find($tourId);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        $review = TourReview::query()->where('tour_id', $tour->id)->find($reviewId);

        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:publish,archived'],
        ]);

        $review->update([
            'status' => $validated['status'],
        ]);

        $this->activityLogService->logInfo(
            $request,
            'tour_review_update',
            'Tour review updated successfully.',
            $request->user(),
            TourReview::class,
            $review->id,
            200,
            ['tour_id' => $tour->id, 'status' => $review->status]
        );

        return response()->json([
            'data' => $review->fresh(),
        ]);
    }

    public function destroyReview(Request $request, string $encryptedTourId, string $reviewId): JsonResponse
    {
        $tourId = decrypt_to_int_or_null($encryptedTourId);

        if (is_null($tourId)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = Tour::query()->find($tourId);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        $review = TourReview::query()->where('tour_id', $tour->id)->find($reviewId);

        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        $deletedReviewId = $review->id;
        $reviewerName = $review->name;
        $review->delete();

        $this->activityLogService->logWarning(
            $request,
            'tour_review_delete',
            'Tour review deleted successfully.',
            $request->user(),
            TourReview::class,
            $deletedReviewId,
            200,
            ['tour_id' => $tour->id, 'reviewer_name' => $reviewerName]
        );

        return response()->json([
            'message' => 'Review deleted successfully.',
        ]);
    }
    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = $this->tourService->getByIdTour($id);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        $deletedTourId = $tour->id;
        $deletedTourTitle = $tour->title;
        $this->tourService->deleteTour($tour);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Tour deleted successfully.',
            $request->user(),
            Tour::class,
            $deletedTourId,
            200,
            ['deleted_tour_title' => $deletedTourTitle]
        );

        return response()->json(['message' => 'Tour deleted successfully.']);
    }

    public function restore(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = $this->tourService->restoreTour($id);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        $this->activityLogService->logInfo(
            $request,
            'restore',
            'Tour restored successfully.',
            $request->user(),
            Tour::class,
            $tour->id,
            200,
            ['restored_tour_title' => $tour->title]
        );

        return response()->json([
            'data' => $tour,
        ]);
    }

    public function forceDelete(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid tour ID.'], 400);
        }

        $tour = Tour::withTrashed()->with('images')->find($id);

        if (!$tour) {
            return response()->json(['message' => 'Tour not found.'], 404);
        }

        foreach ($tour->images as $image) {
            $this->deleteFile($image->image_url, 'uploads/tours');
        }

        $deletedTourTitle = $tour->title;
        $this->tourService->forceDeleteTour($id);

        $this->activityLogService->logWarning(
            $request,
            'force_delete',
            'Tour permanently deleted successfully.',
            $request->user(),
            Tour::class,
            $id,
            200,
            ['permanently_deleted_tour_title' => $deletedTourTitle]
        );

        return response()->json(['message' => 'Tour permanently deleted successfully.']);
    }

    private function syncTourImages(Request $request, Tour $tour, bool $isUpdate = false): void
    {
        $existingImages = $tour->images()->get()->keyBy('id');
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
                $this->deleteFile($image->image_url, 'uploads/tours');
                $image->delete();
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

            $imagePath = $this->storeTourFile($file);
            $createdImages[$index] = $tour->images()->create([
                'image_url' => $imagePath,
                'caption' => $captions[$index] ?? null,
                'is_cover' => false,
            ]);
        }

        $remainingImages = $tour->images()->get();

        if ($remainingImages->isEmpty()) {
            throw ValidationException::withMessages([
                'images' => ['Ajoutez au moins une image pour le tour.'],
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

        $tour->images()->update(['is_cover' => false]);
        $tour->images()->where('id', $selectedCoverId)->update(['is_cover' => true]);
    }

    private function syncTourPrograms(Request $request, Tour $tour): void
    {
        $programs = collect($this->decodeJsonArray($request->input('programs')))
            ->filter(fn ($item) => is_array($item) && ($item['title'] ?? null));

        $tour->programs()->withTrashed()->get()->each(function ($program) {
            $program->forceDelete();
        });

        foreach ($programs as $program) {
            $tour->programs()->create([
                'day_number' => (int) ($program['day_number'] ?? 0),
                'title' => $program['title'] ?? '',
                'description' => $program['description'] ?? '',
                'activities' => $program['activities'] ?? null,
            ]);
        }
    }

    private function syncTourInclusions(Request $request, Tour $tour): void
    {
        $items = collect($this->decodeJsonArray($request->input('inclusions')))
            ->map(fn ($item) => is_array($item) ? ($item['description'] ?? null) : $item)
            ->filter(fn ($item) => filled($item));

        $tour->inclusions()->delete();

        foreach ($items as $item) {
            $tour->inclusions()->create([
                'description' => $item,
            ]);
        }
    }

    private function syncTourExclusions(Request $request, Tour $tour): void
    {
        $items = collect($this->decodeJsonArray($request->input('exclusions')))
            ->map(fn ($item) => is_array($item) ? ($item['description'] ?? null) : $item)
            ->filter(fn ($item) => filled($item));

        $tour->exclusions()->delete();

        foreach ($items as $item) {
            $tour->exclusions()->create([
                'description' => $item,
            ]);
        }
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

    private function storeTourFile(UploadedFile $file): string
    {
        if (!$file->isValid()) {
            throw ValidationException::withMessages([
                'images' => [sprintf('Le fichier "%s" n\'a pas pu etre telecharge correctement.', $file->getClientOriginalName())],
            ]);
        }

        $directory = public_path('uploads/tours');

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return 'uploads/tours/' . $filename;
    }

    private function makeUniqueSlug(?string $slug, string $title, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($slug ?: $title);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'tour';
        $candidate = $baseSlug;
        $counter = 2;

        while (Tour::withTrashed()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $candidate)
            ->exists()) {
            $candidate = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $candidate;
    }
}