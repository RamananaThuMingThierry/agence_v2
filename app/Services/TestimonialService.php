<?php

namespace App\Services;

use App\Interfaces\TestimonialInterface;
use App\Models\Testimonial;

class TestimonialService
{
    public function __construct(private TestimonialInterface $testimonialRepository) {}

    public function getAllTestimonials(
        string|array|null $keys = null,
        mixed $values = null,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false,
        ?int $paginate = null,
        array $orderBy = ['id' => 'desc']
    ) {
        return $this->testimonialRepository->getAll(
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

    public function getByIdTestimonial(
        int|string|null $id,
        array $fields = ['*'],
        array $relations = [],
        bool $withTrashed = false,
        bool $onlyTrashed = false
    ): ?Testimonial {
        return $this->testimonialRepository->getById(
            $id,
            $fields,
            $relations,
            $withTrashed,
            $onlyTrashed
        );
    }

    public function createTestimonial(array $data): ?Testimonial
    {
        return $this->testimonialRepository->create($data);
    }

    public function updateTestimonial(Testimonial $testimonial, array $data): ?Testimonial
    {
        return $this->testimonialRepository->update($testimonial, $data);
    }

    public function deleteTestimonial(Testimonial $testimonial): void
    {
        $this->testimonialRepository->delete($testimonial);
    }

    public function restoreTestimonial(int $id): ?Testimonial
    {
        return $this->testimonialRepository->restore($id);
    }

    public function forceDeleteTestimonial(int $id): void
    {
        $this->testimonialRepository->forceDelete($id);
    }
}
