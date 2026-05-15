<?php

namespace App\Repositories;

use App\Interfaces\SlideInterface;
use App\Models\Slide;

class SlideRepository extends BaseRepository implements SlideInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['order' => 'asc', 'id' => 'desc'])
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Slide::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyOrderBy($q, $orderBy);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $paginate ? $q->paginate($paginate, $fields) : $q->get($fields);
    }

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Slide
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Slide::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->findOrFail($id, $fields);
    }

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Slide
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Slide::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->first($fields);
    }

    public function create(array $data): ?Slide
    {
        return Slide::create($data);
    }

    public function update(Slide $slide, array $data): ?Slide
    {
        $slide->update($data);

        return $slide;
    }

    public function delete(Slide $slide): void
    {
        $slide->delete();
    }

    public function restore(int $id): ?Slide
    {
        $slide = Slide::withTrashed()->find($id);
        if ($slide && $slide->trashed()) {
            $slide->restore();
        }

        return $slide?->fresh();
    }

    public function forceDelete(int $id): void
    {
        $slide = Slide::withTrashed()->find($id);
        if ($slide) {
            $slide->forceDelete();
        }
    }
}
