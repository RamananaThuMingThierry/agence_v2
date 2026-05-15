<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\ActivityLogService;

class AuthController extends Controller
{
    public function __construct(private ActivityLogService $activityLog){}

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {

            $this->activityLog->logWarning(
                $request,
                'login_failed',
                'Failed login attempt for email: ' . $validated['email'],
                $user->id,
                null,
                null,
                400,
                ['email' => $validated['email']],

            );

            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        if ($user->role !== 'admin') {

            $this->activityLog->logWarning(
                $request,
                'unauthorized_access',
                'Unauthorized login attempt by user ID: ' . $user->id,
                $user->id,
                null,
                null,
                403,
                ['user_id' => $user->id],
            );

            return response()->json([
                'message' => 'Only admins can access the dashboard.',
            ], 403);
        }

        if ($user->status !== 'active') {

            $this->activityLog->logWarning(
                $request,
                'inactive_account_login_attempt',
                'Login attempt for inactive account ID: ' . $user->id,
                $user->id,
                null,
                null,
                403,
                ['user_id' => $user->id],
            );
            
            return response()->json([
                'message' => 'This account is inactive.',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user->createToken('world-of-tour-madagascar')->plainTextToken;

        return response()->json([
            'message' => 'Authenticated successfully.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
