<?php

namespace App\Services;

use App\Interfaces\GalleryInterface;
use App\Models\Gallery;

class GalleryService
{
    public function __construct(private GalleryInterface $galleryRepository) {}

    public function getAllGalleries(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false,
        ?int $paginate = null,
        array $orderBy = ['id' => 'desc']
    ) {
        return $this->galleryRepository->getAll(
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

    public function getByIdGallery(
        int|string|null $id,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Gallery {
        return $this->galleryRepository->getById(
            $id,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function getByKeysGallery(
        string|array|null $keys,
        mixed $values,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Gallery {
        return $this->galleryRepository->getByKeys(
            $keys,
            $values,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function createGallery(array $data): ?Gallery
    {
        return $this->galleryRepository->create($data);
    }

    public function updateGallery(Gallery $gallery, array $data): ?Gallery
    {
        return $this->galleryRepository->update($gallery, $data);
    }

    public function deleteGallery(Gallery $gallery): void
    {
        $this->galleryRepository->delete($gallery);
    }
}
