<?php

namespace App\Services;

use App\Interfaces\SlideInterface;
use App\Models\Slide;

class SlideService
{
    public function __construct(private SlideInterface $slideRepository) {}

    public function getAllSlides(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false,
        ?int $paginate = null,
        array $orderBy = ['order' => 'asc', 'id' => 'desc']
    ) {
        return $this->slideRepository->getAll(
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

    public function getByIdSlide(
        int|string|null $id,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Slide {
        return $this->slideRepository->getById(
            $id,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function getByKeysSlide(
        string|array|null $keys,
        mixed $values,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Slide {
        return $this->slideRepository->getByKeys(
            $keys,
            $values,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function createSlide(array $data): ?Slide
    {
        return $this->slideRepository->create($data);
    }

    public function updateSlide(Slide $slide, array $data): ?Slide
    {
        return $this->slideRepository->update($slide, $data);
    }

    public function deleteSlide(Slide $slide): void
    {
        $this->slideRepository->delete($slide);
    }

    public function restoreSlide(int $id): ?Slide
    {
        return $this->slideRepository->restore($id);
    }

    public function forceDeleteSlide(int $id): void
    {
        $this->slideRepository->forceDelete($id);
    }
}
