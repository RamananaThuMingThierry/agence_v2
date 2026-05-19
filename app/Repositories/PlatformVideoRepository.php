<?php

namespace App\Repositories;

use App\Interfaces\PlatformVideoInterface;
use App\Models\PlatformVideo;

class PlatformVideoRepository extends BaseRepository implements PlatformVideoInterface
{
    public function getAll(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false, ?int $paginate = null, array $orderBy = ['order' => 'asc', 'id' => 'desc'])
    {
        $fields = $this->withRequiredColumns($fields);

        $q = PlatformVideo::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyOrderBy($q, $orderBy);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $paginate ? $q->paginate($paginate, $fields) : $q->get($fields);
    }

    public function getById(int|string|null $id, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?PlatformVideo
    {
        $fields = $this->withRequiredColumns($fields);

        $q = PlatformVideo::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->find($id, $fields);
    }

    public function getByKeys(string|array|null $keys, mixed $values, array $fields = [], array $relations = [], bool $withTrashed = false, bool $onlyTrashed = false): ?PlatformVideo
    {
        $fields = $this->withRequiredColumns($fields);

        $q = PlatformVideo::query();
        $q = $this->applyRelation($q, $relations);
        $q = $this->applyFilter($q, $keys, $values);
        $q = $this->applyTrashed($q, $withTrashed, $onlyTrashed);

        return $q->first($fields);
    }

    public function create(array $data): ?PlatformVideo
    {
        return PlatformVideo::create($data);
    }

    public function update(PlatformVideo $platformVideo, array $data): ?PlatformVideo
    {
        $platformVideo->update($data);

        return $platformVideo;
    }

    public function delete(PlatformVideo $platformVideo): void
    {
        $platformVideo->delete();
    }

    public function restore(int $id): ?PlatformVideo
    {
        $platformVideo = PlatformVideo::withTrashed()->find($id);
        if ($platformVideo && $platformVideo->trashed()) {
            $platformVideo->restore();
        }

        return $platformVideo?->fresh();
    }

    public function forceDelete(int $id): void
    {
        $platformVideo = PlatformVideo::withTrashed()->find($id);
        if ($platformVideo) {
            $platformVideo->forceDelete();
        }
    }
}
