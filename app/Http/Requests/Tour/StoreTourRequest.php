<?php

namespace App\Http\Requests\Tour;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tours,slug'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'start_location' => ['nullable', 'string', 'max:255'],
            'end_location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'captions' => ['sometimes', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'cover_new_index' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'programs' => ['sometimes'],
            'inclusions' => ['sometimes'],
            'exclusions' => ['sometimes'],
        ];
    }
}
