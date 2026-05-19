<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\UserService;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class UserController extends Controller
{
    use HasFileUpload;

    public function __construct(
        private UserService $userService,
        private ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try{

            $users = $this->userService->getAllUsers(
                fields:['*'],
                withTrashed: $request->boolean('with_trashed'),
                onlyTrashed: $request->boolean('only_trashed'),
                paginate: $request->integer('per_page'),
            );

            return response()->json([
                'data' => $users
            ]);

        }catch(Throwable $e){

            $this->activityLogService->logError(
                $request,
                'users_index_error',
                'Failed to fetch users: ' . $e->getMessage(),
                $e,
                $request->user(),
                User::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch users.'], 500);
        }
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if(array_key_exists('avatar', $validated) && $validated['avatar'] instanceof UploadedFile) {
            $validated['avatar'] = $this->uploadFile($request, 'avatar', 'uploads/users', null);
        }

        $user = $this->userService->createUser($validated);

        $this->activityLogService->logSuccess(
            $request,
            'create',
            'User created successfully.',
            $request->user(),
            User::class,
            $user->id,
            201,
            ['created_user_email' => $user->email]
        );

        return response()->json($user->load('activityLogs'), 201);
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try{
            $id = decrypt_to_int_or_null($encryptedId);

            if(is_null($id)){

                $this->activityLogService->logWarning(
                    $request,
                    'user_show_invalid_id',
                    'Attempted to fetch user with invalid ID.',
                    $request->user(),
                    User::class,
                    null,
                    400
                );

                return response()->json(['message' => 'Invalid user ID.'], 400);
            }

            $user = $this->userService->getByIdUser($id);

            if (!$user) {

                $this->activityLogService->logWarning(
                    $request,
                    'user_show_not_found',
                    'Attempted to fetch non-existent user.',
                    $request->user(),
                    User::class,
                    $id,
                    404
                );

                return response()->json(['message' => 'User not found.'], 404);
            }

            return response()->json([
                'data' => $user
            ]);
        }catch(Throwable $e){

            $this->activityLogService->logError(
                $request,
                'user_show_error',
                'Failed to fetch user: ' . $e->getMessage(),
                $e,
                $request->user(),
                User::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch user.'], 500);

        }
    }

    public function update(UpdateUserRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if(is_null($id)){

            $this->activityLogService->logWarning(
                $request,
                'user_update_invalid_id',
                'Attempted to update user with invalid ID.',
                $request->user(),
                User::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid user ID.'], 400);
        }

        $user = $this->userService->getByIdUser($id);

        if (!$user) {

            $this->activityLogService->logWarning(
                $request,
                'user_update_not_found',
                'Attempted to update non-existent user.',
                $request->user(),
                User::class,
                $id,
                404
            );

            return response()->json(['message' => 'User not found.'], 404);
        }

        $validated = $request->validated();

        if (
            (int) $request->user()?->id === (int) $user->id
            && array_key_exists('role', $validated)
            && $validated['role'] !== $user->role
        ) {
            $this->activityLogService->logWarning(
                $request,
                'user_update_self_role_forbidden',
                'Attempted to change the role of the currently authenticated user.',
                $request->user(),
                User::class,
                $user->id,
                403
            );

            return response()->json(['message' => 'You cannot change your own role.'], 403);
        }

        if (
            (int) $request->user()?->id !== (int) $user->id
            && array_key_exists('password', $validated)
            && filled($validated['password'])
        ) {
            $this->activityLogService->logWarning(
                $request,
                'user_update_other_password_forbidden',
                'Attempted to change the password of another user.',
                $request->user(),
                User::class,
                $user->id,
                403
            );

            return response()->json(['message' => 'You cannot change another user password.'], 403);
        }

        if(array_key_exists('avatar', $validated) && $validated['avatar'] instanceof UploadedFile) {
            $validated['avatar'] = $this->uploadFile($request, 'avatar', 'uploads/users', $user->avatar);
        }

        if (array_key_exists('password', $validated) && $validated['password'] === null) {
            unset($validated['password']);
        }

        $user = $this->userService->updateUser($user, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'User updated successfully.',
            $request->user(),
            User::class,
            $user->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $user
        ]);
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if(is_null($id)){

            $this->activityLogService->logWarning(
                $request,
                'user_destroy_invalid_id',
                'Attempted to delete user with invalid ID.',
                $request->user(),
                User::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid user ID.'], 400);
        }

        $user = $this->userService->getByIdUser($id);

        if (!$user) {

            $this->activityLogService->logWarning(
                $request,
                'user_destroy_not_found',
                'Attempted to delete non-existent user.',
                $request->user(),
                User::class,
                $id,
                404
            );

            return response()->json(['message' => 'User not found.'], 404);
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            $this->activityLogService->logWarning(
                $request,
                'user_destroy_self_forbidden',
                'Attempted to delete currently authenticated user.',
                $request->user(),
                User::class,
                $user->id,
                403
            );

            return response()->json(['message' => 'You cannot delete your own authenticated account.'], 403);
        }

        $deletedUserId = $user->id;
        $deletedUserEmail = $user->email;

        $this->userService->deleteUser($user);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'User deleted successfully.',
            $request->user(),
            User::class,
            $deletedUserId,
            200,
            ['deleted_user_email' => $deletedUserEmail]
        );

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function restore(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if(is_null($id)){

            $this->activityLogService->logWarning(
                $request,
                'user_restore_invalid_id',
                'Attempted to restore user with invalid ID.',
                $request->user(),
                User::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid user ID.'], 400);
        }

        $user = $this->userService->restoreUser($id);

        if (!$user) {

            $this->activityLogService->logWarning(
                $request,
                'user_restore_not_found',
                'Attempted to restore non-existent user.',
                $request->user(),
                User::class,
                $id,
                404
            );

            return response()->json(['message' => 'User not found.'], 404);
        }

        $this->activityLogService->logInfo(
            $request,
            'restore',
            'User restored successfully.',
            $request->user(),
            User::class,
            $user->id,
            200,
            ['restored_user_email' => $user->email]
        );

        return response()->json([
            'data' => $user
        ]);
    }

    public function forceDelete(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if(is_null($id)){

            $this->activityLogService->logWarning(
                $request,
                'user_force_delete_invalid_id',
                'Attempted to permanently delete user with invalid ID.',
                $request->user(),
                User::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid user ID.'], 400);
        }

        $user = User::withTrashed()->find($id);

        if (!$user) {

            $this->activityLogService->logWarning(
                $request,
                'user_force_delete_not_found',
                'Attempted to permanently delete non-existent user.',
                $request->user(),
                User::class,
                $id,
                404
            );

            return response()->json(['message' => 'User not found.'], 404);
        }

        if ((int) $request->user()?->id === (int) $user->id) {
            $this->activityLogService->logWarning(
                $request,
                'user_force_delete_self_forbidden',
                'Attempted to permanently delete currently authenticated user.',
                $request->user(),
                User::class,
                $user->id,
                403
            );

            return response()->json(['message' => 'You cannot delete your own authenticated account.'], 403);
        }

        $deletedUserEmail = $user->email;
        $this->deleteFile($user->avatar, 'uploads/users');

        $this->userService->forceDeleteUser($id);

        $this->activityLogService->logWarning(
            $request,
            'force_delete',
            'User permanently deleted successfully.',
            $request->user(),
            User::class,
            $id,
            200,
            ['permanently_deleted_user_email' => $deletedUserEmail]
        );

        return response()->json(['message' => 'User permanently deleted successfully.']);
    }
}
