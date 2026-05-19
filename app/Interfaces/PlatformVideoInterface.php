<?php

namespace App\Interfaces;

use App\Models\PlatformVideo;

interface PlatformVideoInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['order' => 'asc', 'id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?PlatformVideo;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?PlatformVideo;

    public function create(array $data): ?PlatformVideo;

    public function update(PlatformVideo $platformVideo, array $data): ?PlatformVideo;

    public function delete(PlatformVideo $platformVideo): void;

    public function restore(int $id): ?PlatformVideo;

    public function forceDelete(int $id): void;
}
