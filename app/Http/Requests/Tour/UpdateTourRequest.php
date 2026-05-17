<?php

namespace App\Http\Requests\Tour;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $routeTour = $this->route('tour');
        $tourId = is_numeric($routeTour) ? (int) $routeTour : decrypt_to_int_or_null(is_string($routeTour) ? $routeTour : null);

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:tours,slug,' . $tourId],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'duration' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'start_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'end_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'captions' => ['sometimes', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'existing_images' => ['sometimes'],
            'removed_image_ids' => ['sometimes'],
            'cover_image_id' => ['sometimes', 'nullable', 'integer'],
            'cover_new_index' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'programs' => ['sometimes'],
            'inclusions' => ['sometimes'],
            'exclusions' => ['sometimes'],
        ];
    }
}
