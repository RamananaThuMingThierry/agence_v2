<?php

namespace App\Interfaces;

use App\Models\Category;

interface CategoryInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], ?int $paginate = null, array $orderBy = ['id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = []): ?Category;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = []): ?Category;

    public function create(array $data): ?Category;

    public function update(Category $category, array $data): ?Category;

    public function delete(Category $category): void;
}
