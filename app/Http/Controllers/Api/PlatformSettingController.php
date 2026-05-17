<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlatformSetting\UpdatePlatformSettingRequest;
use App\Models\PlatformSetting;
use App\Services\ActivityLogService;
use App\Services\PlatformSettingService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class PlatformSettingController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private PlatformSettingService $platformSettingService,
        private ActivityLogService $activityLogService
    ) {}

    public function show(Request $request): JsonResponse
    {
        try {
            $platformSetting = $this->platformSettingService->getPlatformSetting();

            return response()->json([
                'data' => $platformSetting,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'platform_setting_show_error',
                'Failed to fetch platform settings: ' . $e->getMessage(),
                $e,
                $request->user(),
                PlatformSetting::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch platform settings.'], 500);
        }
    }

    public function update(UpdatePlatformSettingRequest $request): JsonResponse
    {
        $platformSetting = $this->platformSettingService->getPlatformSetting();
        $validated = $request->validated();

        if (array_key_exists('logo', $validated) && $validated['logo'] instanceof UploadedFile) {
            $validated['logo'] = $this->uploadFile($request, 'logo', 'uploads/platform', $platformSetting->logo);
        }

        $platformSetting = $this->platformSettingService->updatePlatformSetting($platformSetting, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'Platform settings updated successfully.',
            $request->user(),
            PlatformSetting::class,
            $platformSetting->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $platformSetting,
        ]);
    }
}
