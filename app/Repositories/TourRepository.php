<?php

namespace App\Repositories;

use App\Interfaces\TourInterface;
use App\Models\Tour;

class TourRepository extends BaseRepository implements TourInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc'])
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Tour::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyOrderBy($q, $orderBy);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $paginate ? $q->paginate($paginate, $fields) : $q->get($fields);
    }

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Tour
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Tour::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->find($id, $fields);
    }

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Tour
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Tour::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->first($fields);
    }

    public function create(array $data): ?Tour
    {
        return Tour::create($data);
    }

    public function update(Tour $tour, array $data): ?Tour
    {
        $tour->update($data);

        return $tour;
    }

    public function delete(Tour $tour): void
    {
        $tour->delete();
    }

    public function restore(int $id): ?Tour
    {
        $tour = Tour::withTrashed()->find($id);
        if ($tour && $tour->trashed()) {
            $tour->restore();
        }

        return $tour?->fresh();
    }

    public function forceDelete(int $id): void
    {
        $tour = Tour::withTrashed()->find($id);
        if ($tour) {
            $tour->forceDelete();
        }
    }
}
