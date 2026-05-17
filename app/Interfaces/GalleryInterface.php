<?php

namespace App\Interfaces;

use App\Models\Gallery;

interface GalleryInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Gallery;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Gallery;

    public function create(array $data): ?Gallery;

    public function update(Gallery $gallery, array $data): ?Gallery;

    public function delete(Gallery $gallery): void;
}
