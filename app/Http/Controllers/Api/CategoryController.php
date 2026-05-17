<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\ActivityLogService;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService,
        private ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $categories = $this->categoryService->getAllCategories(
                fields: ['*'],
                paginate: $request->integer('per_page'),
                orderBy: ['name' => 'asc', 'id' => 'desc'],
            );

            return response()->json([
                'data' => $categories,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'categories_index_error',
                'Failed to fetch categories: ' . $e->getMessage(),
                $e,
                $request->user(),
                Category::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch categories.'], 500);
        }
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        $this->activityLogService->logSuccess(
            $request,
            'create',
            'Category created successfully.',
            $request->user(),
            Category::class,
            $category->id,
            201,
            ['created_category_name' => $category->name]
        );

        return response()->json([
            'data' => $category,
        ], 201);
    }

    public function show(Request $request, string $encryptedId): JsonResponse
    {
        try {
            $id = decrypt_to_int_or_null($encryptedId);

            if (is_null($id)) {
                $this->activityLogService->logWarning(
                    $request,
                    'category_show_invalid_id',
                    'Attempted to fetch category with invalid ID.',
                    $request->user(),
                    Category::class,
                    null,
                    400
                );

                return response()->json(['message' => 'Invalid category ID.'], 400);
            }

            $category = $this->categoryService->getByIdCategory($id);

            if (!$category) {
                $this->activityLogService->logWarning(
                    $request,
                    'category_show_not_found',
                    'Attempted to fetch non-existent category.',
                    $request->user(),
                    Category::class,
                    $id,
                    404
                );

                return response()->json(['message' => 'Category not found.'], 404);
            }

            return response()->json([
                'data' => $category,
            ]);
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'category_show_error',
                'Failed to fetch category: ' . $e->getMessage(),
                $e,
                $request->user(),
                Category::class,
                null,
                500
            );

            return response()->json(['message' => 'Failed to fetch category.'], 500);
        }
    }

    public function update(UpdateCategoryRequest $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'category_update_invalid_id',
                'Attempted to update category with invalid ID.',
                $request->user(),
                Category::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid category ID.'], 400);
        }

        $category = $this->categoryService->getByIdCategory($id);

        if (!$category) {
            $this->activityLogService->logWarning(
                $request,
                'category_update_not_found',
                'Attempted to update non-existent category.',
                $request->user(),
                Category::class,
                $id,
                404
            );

            return response()->json(['message' => 'Category not found.'], 404);
        }

        $validated = $request->validated();
        $category = $this->categoryService->updateCategory($category, $validated);

        $this->activityLogService->logInfo(
            $request,
            'update',
            'Category updated successfully.',
            $request->user(),
            Category::class,
            $category->id,
            200,
            ['updated_fields' => array_keys($validated)]
        );

        return response()->json([
            'data' => $category,
        ]);
    }

    public function destroy(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            $this->activityLogService->logWarning(
                $request,
                'category_destroy_invalid_id',
                'Attempted to delete category with invalid ID.',
                $request->user(),
                Category::class,
                null,
                400
            );

            return response()->json(['message' => 'Invalid category ID.'], 400);
        }

        $category = $this->categoryService->getByIdCategory($id);

        if (!$category) {
            $this->activityLogService->logWarning(
                $request,
                'category_destroy_not_found',
                'Attempted to delete non-existent category.',
                $request->user(),
                Category::class,
                $id,
                404
            );

            return response()->json(['message' => 'Category not found.'], 404);
        }

        $deletedCategoryId = $category->id;
        $deletedCategoryName = $category->name;
        $this->categoryService->deleteCategory($category);

        $this->activityLogService->logWarning(
            $request,
            'delete',
            'Category deleted successfully.',
            $request->user(),
            Category::class,
            $deletedCategoryId,
            200,
            ['deleted_category_name' => $deletedCategoryName]
        );

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
