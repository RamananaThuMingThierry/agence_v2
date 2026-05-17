<?php

namespace App\Interfaces;

use App\Models\Tour;

interface TourInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Tour;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Tour;

    public function create(array $data): ?Tour;

    public function update(Tour $tour, array $data): ?Tour;

    public function delete(Tour $tour): void;

    public function restore(int $id): ?Tour;

    public function forceDelete(int $id): void;
}
