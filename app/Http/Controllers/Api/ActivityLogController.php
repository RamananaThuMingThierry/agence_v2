<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ActivityLogController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        try{
            $activityLogs = $this->activityLogService->getAllActivityLogs(
                keys: null,               // si tu veux tous les logs sans filtre
                values: null,             // idem
                fields: ['*'],
                relations: ['user'],
                paginate: $request->integer('per_page'),
                orderBy: ['id' => 'desc']
            );

            return response()->json($activityLogs);
        }catch(Throwable $e){
            $this->activityLogService->logError(
                $request,
                'activity_logs_index_error',
                'Erreur lors de la consultation des activity logs.',
                $e,
                $request->user(),
                ActivityLog::class,
                null,
                500
            );

            throw $e;
        }
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try{

            $id = decrypt_to_int_or_null($encryptedId);

            if(is_null($id)){

                $this->activityLogService->logError(
                    $request,
                    'activity_log_show_invalid_id',
                    'ID d\'activity log invalide lors de la consultation.',
                    null,
                    $request->user(),
                    ActivityLog::class,
                    null,
                    400
                );

                return response()->json(['message' => 'ID d\'activity log invalide.'], 400);
            }

            $activityLog = $this->activityLogService->getByIdActivityLog($id, ['*'], ['user']);

            if (!$activityLog) {

                $this->activityLogService->logError(
                    $request,
                    'activity_log_show_not_found',
                    'Activity log non trouvé lors de la consultation.',
                    null,
                    $request->user(),
                    ActivityLog::class,
                    $id,
                    404
                );

                return response()->json(['message' => 'Activity log non trouvé lors de la consultation.'], 404);
            }

            return response()->json([
                'activity_log' => $activityLog,
            ]);

        }catch(Throwable $e){

            $this->activityLogService->logError(
                $request,
                'activity_log_show_error',
                'Erreur lors de la consultation d\'un activity log.',
                $e,
                $request->user(),
                ActivityLog::class,
                null,
                500
            );

            throw $e;
        }
    }

    public function destroy(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {

            $this->activityLogService->logError(
                request(),
                'activity_log_delete_invalid_id',
                'ID d\'activity log invalide lors de la suppression.',
                null,
                request()->user(),
                ActivityLog::class,
                null,
                400
            );

            return response()->json(['message' => 'ID d\'activity log invalide.'], 400);
        }

        $activityLog = $this->activityLogService->getByIdActivityLog($id);

        if (!$activityLog) {

            $this->activityLogService->logError(
                request(),
                'activity_log_delete_not_found',
                'Activity log non trouvé lors de la suppression.',
                null,
                request()->user(),
                ActivityLog::class,
                $id,
                404
            );

            return response()->json(['message' => 'Activity log non trouvé lors de la suppression.'], 404);
        }

        $this->activityLogService->deleteActivityLog($activityLog);

        return response()->json(['message' => 'Activity log supprimé avec succès.']);
    }
}
