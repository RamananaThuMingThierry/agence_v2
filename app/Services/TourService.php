<?php

namespace App\Services;

use App\Interfaces\TourInterface;
use App\Models\Tour;

class TourService
{
    public function __construct(private TourInterface $tourRepository) {}

    public function getAllTours(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false,
        ?int $paginate = null,
        array $orderBy = ['id' => 'desc']
    ) {
        return $this->tourRepository->getAll(
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

    public function getByIdTour(
        int|string|null $id,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Tour {
        return $this->tourRepository->getById(
            $id,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function getByKeysTour(
        string|array|null $keys,
        mixed $values,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Tour {
        return $this->tourRepository->getByKeys(
            $keys,
            $values,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function createTour(array $data): ?Tour
    {
        return $this->tourRepository->create($data);
    }

    public function updateTour(Tour $tour, array $data): ?Tour
    {
        return $this->tourRepository->update($tour, $data);
    }

    public function deleteTour(Tour $tour): void
    {
        $this->tourRepository->delete($tour);
    }

    public function restoreTour(int $id): ?Tour
    {
        return $this->tourRepository->restore($id);
    }

    public function forceDeleteTour(int $id): void
    {
        $this->tourRepository->forceDelete($id);
    }
}
