<?php

namespace App\Services;

use App\Interfaces\CategoryInterface;
use App\Models\Category;

class CategoryService
{
    public function __construct(private CategoryInterface $categoryRepository) {}

    public function getAllCategories(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        ?int $paginate = null,
        array $orderBy = ['name' => 'asc', 'id' => 'desc']
    ) {
        return $this->categoryRepository->getAll($keys, $values, $fields, $relations, $paginate, $orderBy);
    }

    public function getByIdCategory(int|string|null $id, array $fields = ['*'], array $relations = []): ?Category
    {
        return $this->categoryRepository->getById($id, $fields, $relations);
    }

    public function createCategory(array $data): ?Category
    {
        return $this->categoryRepository->create($data);
    }

    public function updateCategory(Category $category, array $data): ?Category
    {
        return $this->categoryRepository->update($category, $data);
    }

    public function deleteCategory(Category $category): void
    {
        $this->categoryRepository->delete($category);
    }
}
