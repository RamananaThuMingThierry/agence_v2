<?php

namespace App\Repositories;

use App\Interfaces\GalleryInterface;
use App\Models\Gallery;

class GalleryRepository extends BaseRepository implements GalleryInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['id' => 'desc'])
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Gallery::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyOrderBy($q, $orderBy);

        return $paginate ? $q->paginate($paginate, $fields) : $q->get($fields);
    }

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Gallery
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Gallery::query();
        $q = $this->applyRelation($q, $relations);

        return $q->find($id, $fields);
    }

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?Gallery
    {
        $fields = $this->withRequiredColumns($fields);

        $q = Gallery::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);

        return $q->first($fields);
    }

    public function create(array $data): ?Gallery
    {
        return Gallery::create($data);
    }

    public function update(Gallery $gallery, array $data): ?Gallery
    {
        $gallery->update($data);

        return $gallery;
    }

    public function delete(Gallery $gallery): void
    {
        $gallery->delete();
    }
}
