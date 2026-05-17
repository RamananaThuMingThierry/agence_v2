<?php

namespace App\Interfaces;

use App\Models\Testimonial;

interface TestimonialInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = ['*'], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc']);

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Testimonial;

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Testimonial;

    public function create(array $data): ?Testimonial;

    public function update(Testimonial $testimonial, array $data): ?Testimonial;

    public function delete(Testimonial $testimonial): void;

    public function restore(int $id): ?Testimonial;

    public function forceDelete(int $id): void;
}
