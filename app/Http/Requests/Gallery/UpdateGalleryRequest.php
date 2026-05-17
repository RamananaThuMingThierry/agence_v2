<?php

namespace App\Http\Requests\Gallery;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'captions' => ['sometimes', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'existing_images' => ['sometimes'],
            'removed_image_ids' => ['sometimes'],
            'cover_image_id' => ['sometimes', 'nullable', 'integer'],
            'cover_new_index' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
