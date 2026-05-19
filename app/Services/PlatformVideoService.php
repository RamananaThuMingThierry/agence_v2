<?php

namespace App\Services;

use App\Interfaces\PlatformVideoInterface;
use App\Models\PlatformVideo;

class PlatformVideoService
{
    public function __construct(private PlatformVideoInterface $platformVideoRepository) {}

    public function getAllPlatformVideos(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false,
        ?int $paginate = null,
        array $orderBy = ['order' => 'asc', 'id' => 'desc']
    ) {
        return $this->platformVideoRepository->getAll(
            $keys,
            $values,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed,
            $paginate,
            $orderBy
        );
    }

    public function getByIdPlatformVideo(
        int|string|null $id,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?PlatformVideo {
        return $this->platformVideoRepository->getById(
            $id,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function getByKeysPlatformVideo(
        string|array|null $keys,
        mixed $values,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?PlatformVideo {
        return $this->platformVideoRepository->getByKeys(
            $keys,
            $values,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function createPlatformVideo(array $data): ?PlatformVideo
    {
        return $this->platformVideoRepository->create($data);
    }

    public function updatePlatformVideo(PlatformVideo $platformVideo, array $data): ?PlatformVideo
    {
        return $this->platformVideoRepository->update($platformVideo, $data);
    }

    public function deletePlatformVideo(PlatformVideo $platformVideo): void
    {
        $this->platformVideoRepository->delete($platformVideo);
    }

    public function restorePlatformVideo(int $id): ?PlatformVideo
    {
        return $this->platformVideoRepository->restore($id);
    }

    public function forceDeletePlatformVideo(int $id): void
    {
        $this->platformVideoRepository->forceDelete($id);
    }
}
