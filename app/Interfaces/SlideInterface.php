<?php

namespace App\Interfaces;

use App\Models\Slide;

interface SlideInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['order' => 'asc', 'id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Slide;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Slide;

    public function create(array $data): ?Slide;

    public function update(Slide $slide, array $data): ?Slide;

    public function delete(Slide $slide): void;

    public function restore(int $id): ?Slide;

    public function forceDelete(int $id): void;
}
