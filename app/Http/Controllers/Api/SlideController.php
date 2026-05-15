<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Slide\StoreSlideRequest;
use App\Http\Requests\Slide\UpdateSlideRequest;
use App\Models\Slide;
use App\Services\ActivityLogService;
use App\Services\SlideService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class SlideController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private SlideService $slideService,
        private ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $slides = $this->slideService->getAllSlides(
                fields: ['*'],
                withTrashed: $request->boolean('with_trashed'),
                onlyTrashed: $request->boolean('only_trashed'),
                paginate: $request->integer('per_page'),
                orderBy: ['order' => 'asc', 'id' => 'desc'],
            );

            return response()->json([
                'data' => $slides,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'slides_index_error',
                'Failed to fetch slides: ' . $e->getMessage(),
                $e,
                $request->user(),
                Slide::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch slides.'], 500);
        }
    }

    public function store(StoreSlideRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/slides');
        }

        $slide = $this->slideService->createSlide($validated);

        $this->activityLogService->logSuccess(
            $request,
            'create',
            'Slide created successfully.',
            $request->user(),
            Slide::class,
            $slide->id,
            201,
            ['created_slide_title' => $slide->title]
        );

        return response()->json([
            'data' => $slide,
        ], 201);
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {

        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                $this->activityLogService->logWarning(
                    $request,
                    'slide_show_invalid_id',
                    'Attempted to fetch slide with invalid ID.',
                    $request->user(),
                    Slide::class,
                    null,
                    400
                );

                return response()->json(['message' => 'Invalid slide ID.'], 400);
            }

            $slide = $this->slideService->getByIdSlide($id);

            if (!$slide) {
                $this->activityLogService->logWarning(
                    $request,
                    'slide_show_not_found',
                    'Attempted to fetch non-existent slide.',
                    $request->user(),
                    Slide::class,
                    $id,
                    404
                );

                return response()->json(['message' => 'Slide not found.'], 404);
            }

            return response()->json([
                'data' => $slide,
            ]);
        } catch (Throwable $e) {

            dd($e->getMessage());

            $this->activityLogService->logError(
                $request,
                'slide_show_error',
                'Failed to fetch slide: ' . $e->getMessage(),
                $e,
                $request->user(),
                Slide::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch slide.'], 500);
        }
    }

    public function update(UpdateSlideRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);


        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'slide_update_invalid_id',
                'Attempted to update slide with invalid ID.',
                $request->user(),
                Slide::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid slide ID.'], 400);
        }

        $slide = $this->slideService->getByIdSlide($id);

        if (!$slide) {
            $this->activityLogService->logWarning(
                $request,
                'slide_update_not_found',
                'Attempted to update non-existent slide.',
                $request->user(),
                Slide::class,
                $id,
                404
            );

            return response()->json(['message' => 'Slide not found.'], 404);
        }

        $validated = $request->validated();

        if (array_key_exists('image', $validated) && $validated['image'] instanceof UploadedFile) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/slides', $slide->image);
        }

        $slide = $this->slideService->updateSlide($slide, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'Slide updated successfully.',
            $request->user(),
            Slide::class,
            $slide->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $slide,
        ]);
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'slide_destroy_invalid_id',
                'Attempted to delete slide with invalid ID.',
                $request->user(),
                Slide::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid slide ID.'], 400);
        }

        $slide = $this->slideService->getByIdSlide($id);

        if (!$slide) {
            $this->activityLogService->logWarning(
                $request,
                'slide_destroy_not_found',
                'Attempted to delete non-existent slide.',
                $request->user(),
                Slide::class,
                $id,
                404
            );

            return response()->json(['message' => 'Slide not found.'], 404);
        }

        $deletedSlideId = $slide->id;
        $deletedSlideTitle = $slide->title;

        $this->slideService->deleteSlide($slide);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Slide deleted successfully.',
            $request->user(),
            Slide::class,
            $deletedSlideId,
            200,
            ['deleted_slide_title' => $deletedSlideTitle]
        );

        return response()->json(['message' => 'Slide deleted successfully.']);
    }

    public function restore(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'slide_restore_invalid_id',
                'Attempted to restore slide with invalid ID.',
                $request->user(),
                Slide::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid slide ID.'], 400);
        }

        $slide = $this->slideService->restoreSlide($id);

        if (!$slide) {
            $this->activityLogService->logWarning(
                $request,
                'slide_restore_not_found',
                'Attempted to restore non-existent slide.',
                $request->user(),
                Slide::class,
                $id,
                404
            );

            return response()->json(['message' => 'Slide not found.'], 404);
        }

        $this->activityLogService->logInfo(
            $request,
            'restore',
            'Slide restored successfully.',
            $request->user(),
            Slide::class,
            $slide->id,
            200,
            ['restored_slide_title' => $slide->title]
        );

        return response()->json([
            'data' => $slide,
        ]);
    }

    public function forceDelete(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'slide_force_delete_invalid_id',
                'Attempted to permanently delete slide with invalid ID.',
                $request->user(),
                Slide::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid slide ID.'], 400);
        }

        $slide = Slide::withTrashed()->find($id);

        if (!$slide) {
            $this->activityLogService->logWarning(
                $request,
                'slide_force_delete_not_found',
                'Attempted to permanently delete non-existent slide.',
                $request->user(),
                Slide::class,
                $id,
                404
            );

            return response()->json(['message' => 'Slide not found.'], 404);
        }

        $deletedSlideTitle = $slide->title;
        $this->deleteFile($slide->image, 'uploads/slides');

        $this->slideService->forceDeleteSlide($id);

        $this->activityLogService->logWarning(
            $request,
            'force_delete',
            'Slide permanently deleted successfully.',
            $request->user(),
            Slide::class,
            $id,
            200,
            ['permanently_deleted_slide_title' => $deletedSlideTitle]
        );

        return response()->json(['message' => 'Slide permanently deleted successfully.']);
    }
}
