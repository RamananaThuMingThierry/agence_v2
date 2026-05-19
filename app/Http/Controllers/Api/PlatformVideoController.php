<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlatformVideo\StorePlatformVideoRequest;
use App\Http\Requests\PlatformVideo\UpdatePlatformVideoRequest;
use App\Models\PlatformVideo;
use App\Services\ActivityLogService;
use App\Services\PlatformVideoService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class PlatformVideoController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private PlatformVideoService $platformVideoService,
        private ActivityLogService $activityLogService
    ) {}

    public function publicIndex(): JsonResponse
    {
        $videos = PlatformVideo::query()
            ->with(['relatedTour:id,title'])
            ->where('is_active', true)
            ->orderBy('placement')
            ->orderBy('order')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $videos,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $videos = $this->platformVideoService->getAllPlatformVideos(
                keys: $request->filled('placement') ? 'placement' : null,
                values: $request->input('placement'),
                fields: ['*'],
                relations: ['relatedTour'],
                withTrashed: $request->boolean('with_trashed'),
                onlyTrashed: $request->boolean('only_trashed'),
                paginate: $request->integer('per_page'),
                orderBy: ['placement' => 'asc', 'order' => 'asc', 'id' => 'desc'],
            );

            return response()->json([
                'data' => $videos,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'platform_videos_index_error',
                'Failed to fetch platform videos: ' . $e->getMessage(),
                $e,
                $request->user(),
                PlatformVideo::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch platform videos.'], 500);
        }
    }

    public function store(StorePlatformVideoRequest $request): JsonResponse
    {
        $validated = $this->preparePayload($request->validated(), $request);

        $video = $this->platformVideoService->createPlatformVideo($validated);

        $this->activityLogService->logSuccess(
            $request,
            'create',
            'Platform video created successfully.',
            $request->user(),
            PlatformVideo::class,
            $video->id,
            201,
            ['created_platform_video_title' => $video->title]
        );

        return response()->json([
            'data' => $video,
        ], 201);
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                return response()->json(['message' => 'Invalid platform video ID.'], 400);
            }

            $video = $this->platformVideoService->getByIdPlatformVideo($id, relations: ['relatedTour'], withTrashed: true);

            if (!$video) {
                return response()->json(['message' => 'Platform video not found.'], 404);
            }

            return response()->json([
                'data' => $video,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'platform_video_show_error',
                'Failed to fetch platform video: ' . $e->getMessage(),
                $e,
                $request->user(),
                PlatformVideo::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch platform video.'], 500);
        }
    }

    public function update(UpdatePlatformVideoRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid platform video ID.'], 400);
        }

        $video = $this->platformVideoService->getByIdPlatformVideo($id, relations: ['relatedTour'], withTrashed: true);

        if (!$video) {
            return response()->json(['message' => 'Platform video not found.'], 404);
        }

        $validated = $this->preparePayload($request->validated(), $request, $video);

        $video = $this->platformVideoService->updatePlatformVideo($video, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'Platform video updated successfully.',
            $request->user(),
            PlatformVideo::class,
            $video->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $video,
        ]);
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid platform video ID.'], 400);
        }

        $video = $this->platformVideoService->getByIdPlatformVideo($id);

        if (!$video) {
            return response()->json(['message' => 'Platform video not found.'], 404);
        }

        $deletedVideoId = $video->id;
        $deletedVideoTitle = $video->title;
        $this->platformVideoService->deletePlatformVideo($video);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Platform video deleted successfully.',
            $request->user(),
            PlatformVideo::class,
            $deletedVideoId,
            200,
            ['deleted_platform_video_title' => $deletedVideoTitle]
        );

        return response()->json(['message' => 'Platform video deleted successfully.']);
    }

    public function restore(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid platform video ID.'], 400);
        }

        $video = $this->platformVideoService->restorePlatformVideo($id);

        if (!$video) {
            return response()->json(['message' => 'Platform video not found.'], 404);
        }

        $this->activityLogService->logInfo(
            $request,
            'restore',
            'Platform video restored successfully.',
            $request->user(),
            PlatformVideo::class,
            $video->id,
            200,
            ['restored_platform_video_title' => $video->title]
        );

        return response()->json([
            'data' => $video,
        ]);
    }

    public function forceDelete(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'Invalid platform video ID.'], 400);
        }

        $video = PlatformVideo::withTrashed()->find($id);

        if (!$video) {
            return response()->json(['message' => 'Platform video not found.'], 404);
        }

        $deletedVideoTitle = $video->title;
        $this->deleteFile($video->video_path, 'uploads/videos');
        $this->deleteFile($video->thumbnail, 'uploads/video-thumbnails');
        $this->platformVideoService->forceDeletePlatformVideo($id);

        $this->activityLogService->logWarning(
            $request,
            'force_delete',
            'Platform video permanently deleted successfully.',
            $request->user(),
            PlatformVideo::class,
            $id,
            200,
            ['permanently_deleted_platform_video_title' => $deletedVideoTitle]
        );

        return response()->json(['message' => 'Platform video permanently deleted successfully.']);
    }

    private function preparePayload(array $validated, Request $request, ?PlatformVideo $existing = null): array
    {
        $sourceType = $validated['source_type'] ?? $existing?->source_type ?? 'external';

        if (array_key_exists('thumbnail', $validated) && $validated['thumbnail'] instanceof UploadedFile) {
            $validated['thumbnail'] = $this->uploadFile($request, 'thumbnail', 'uploads/video-thumbnails', $existing?->thumbnail);
        }

        if ($sourceType === 'upload') {
            if (array_key_exists('video_file', $validated) && $validated['video_file'] instanceof UploadedFile) {
                $validated['video_path'] = $this->uploadFile($request, 'video_file', 'uploads/videos', $existing?->video_path);
            }

            $validated['video_url'] = null;
        }

        if ($sourceType === 'external') {
            if ($existing?->source_type === 'upload' && $existing->video_path) {
                $this->deleteFile($existing->video_path, 'uploads/videos');
            }

            $validated['video_path'] = null;
        }

        unset($validated['video_file']);

        return $validated;
    }
}
