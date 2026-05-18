<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Testimonial\StoreTestimonialRequest;
use App\Http\Requests\Testimonial\UpdateTestimonialRequest;
use App\Models\Testimonial;
use App\Services\ActivityLogService;
use App\Services\TestimonialService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class TestimonialController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private TestimonialService $testimonialService,
        private ActivityLogService $activityLogService
    ) {}

    public function publicIndex(): JsonResponse
    {
        try {
            $testimonials = $this->testimonialService->getAllTestimonials(
                keys: 'status',
                values: 'publish',
                fields: ['*'],
                orderBy: ['id' => 'desc']
            );

            return response()->json([
                'data' => $testimonials,
            ]);
        } catch (Throwable) {
            return response()->json(['message' => 'Failed to fetch published testimonials.'], 500);
        }
    }

    public function publicStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'message' => ['required', 'string'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/testimonials');
        }

        $testimonial = $this->testimonialService->createTestimonial([
            'name' => $validated['name'],
            'image' => $validated['image'] ?? null,
            'message' => $validated['message'],
            'rating' => $validated['rating'],
            'status' => 'publish',
        ]);

        $this->activityLogService->logInfo(
            $request,
            'public_testimonial_created',
            'Public testimonial created successfully.',
            null,
            Testimonial::class,
            $testimonial->id,
            201,
            ['testimonial_name' => $testimonial->name]
        );

        return response()->json([
            'data' => $testimonial,
            'message' => 'Avis envoye avec succes.',
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $testimonials = $this->testimonialService->getAllTestimonials(
                fields: ['*'],
                withTrashed: $request->boolean('with_trashed'),
                onlyTrashed: $request->boolean('only_trashed'),
                paginate: $request->integer('per_page'),
                orderBy: ['id' => 'desc'],
            );

            return response()->json([
                'data' => $testimonials,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'testimonials_index_error',
                'Failed to fetch testimonials: ' . $e->getMessage(),
                $e,
                $request->user(),
                Testimonial::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch testimonials.'], 500);
        }
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/testimonials');
        }

        $testimonial = $this->testimonialService->createTestimonial($validated);

        $this->activityLogService->logSuccess(
            $request,
            'create',
            'Testimonial created successfully.',
            $request->user(),
            Testimonial::class,
            $testimonial->id,
            201,
            ['created_testimonial_name' => $testimonial->name]
        );

        return response()->json([
            'data' => $testimonial,
        ], 201);
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                return response()->json(['message' => 'Invalid testimonial ID.'], 400);
            }

            $testimonial = $this->testimonialService->getByIdTestimonial($id, withTrashed: true);

            if (!$testimonial) {
                return response()->json(['message' => 'Testimonial not found.'], 404);
            }

            return response()->json([
                'data' => $testimonial,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'testimonial_show_error',
                'Failed to fetch testimonial: ' . $e->getMessage(),
                $e,
                $request->user(),
                Testimonial::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch testimonial.'], 500);
        }
    }

    public function update(UpdateTestimonialRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid testimonial ID.'], 400);
        }

        $testimonial = $this->testimonialService->getByIdTestimonial($id, withTrashed: true);

        if (!$testimonial) {
            return response()->json(['message' => 'Testimonial not found.'], 404);
        }

        $validated = $request->validated();

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/testimonials', $testimonial->image);
        }

        $testimonial = $this->testimonialService->updateTestimonial($testimonial, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'Testimonial updated successfully.',
            $request->user(),
            Testimonial::class,
            $testimonial->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $testimonial,
        ]);
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid testimonial ID.'], 400);
        }

        $testimonial = $this->testimonialService->getByIdTestimonial($id);

        if (!$testimonial) {
            return response()->json(['message' => 'Testimonial not found.'], 404);
        }

        $deletedTestimonialId = $testimonial->id;
        $deletedTestimonialName = $testimonial->name;

        $this->testimonialService->deleteTestimonial($testimonial);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Testimonial deleted successfully.',
            $request->user(),
            Testimonial::class,
            $deletedTestimonialId,
            200,
            ['deleted_testimonial_name' => $deletedTestimonialName]
        );

        return response()->json(['message' => 'Testimonial deleted successfully.']);
    }

    public function restore(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid testimonial ID.'], 400);
        }

        $testimonial = $this->testimonialService->restoreTestimonial($id);

        if (!$testimonial) {
            return response()->json(['message' => 'Testimonial not found.'], 404);
        }

        $this->activityLogService->logInfo(
            $request,
            'restore',
            'Testimonial restored successfully.',
            $request->user(),
            Testimonial::class,
            $testimonial->id,
            200,
            ['restored_testimonial_name' => $testimonial->name]
        );

        return response()->json([
            'data' => $testimonial,
        ]);
    }

    public function forceDelete(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid testimonial ID.'], 400);
        }

        $testimonial = Testimonial::withTrashed()->find($id);

        if (!$testimonial) {
            return response()->json(['message' => 'Testimonial not found.'], 404);
        }

        $deletedTestimonialName = $testimonial->name;
        $this->deleteFile($testimonial->image, 'uploads/testimonials');

        $this->testimonialService->forceDeleteTestimonial($id);

        $this->activityLogService->logWarning(
            $request,
            'force_delete',
            'Testimonial permanently deleted successfully.',
            $request->user(),
            Testimonial::class,
            $id,
            200,
            ['permanently_deleted_testimonial_name' => $deletedTestimonialName]
        );

        return response()->json(['message' => 'Testimonial permanently deleted successfully.']);
    }
}