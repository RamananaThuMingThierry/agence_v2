<?php

namespace App\Repositories;

use App\Interfaces\TestimonialInterface;
use App\Models\Testimonial;

class TestimonialRepository extends BaseRepository implements TestimonialInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc'])
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Testimonial::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyOrderBy($q, $orderBy);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $paginate ? $q->paginate($paginate, $fields) : $q->get($fields);
    }

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Testimonial
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Testimonial::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->find($id, $fields);
    }

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Testimonial
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Testimonial::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->first($fields);
    }

    public function create(array $data): ?Testimonial
    {
        return Testimonial::create($data);
    }

    public function update(Testimonial $testimonial, array $data): ?Testimonial
    {
        $testimonial->update($data);

        return $testimonial;
    }

    public function delete(Testimonial $testimonial): void
    {
        $testimonial->delete();
    }

    public function restore(int $id): ?Testimonial
    {
        $testimonial = Testimonial::withTrashed()->find($id);
        if ($testimonial && $testimonial->trashed()) {
            $testimonial->restore();
        }

        return $testimonial?->fresh();
    }

    public function forceDelete(int $id): void
    {
        $testimonial = Testimonial::withTrashed()->find($id);
        if ($testimonial) {
            $testimonial->forceDelete();
        }
    }
}
