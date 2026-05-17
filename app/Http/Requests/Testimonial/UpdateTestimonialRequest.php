<?php

namespace App\Http\Requests\Testimonial;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'message' => ['sometimes', 'required', 'string'],
            'rating' => ['sometimes', 'required', 'integer', 'min:1', 'max:5'],
            'status' => ['sometimes', 'required', 'in:publish,archived'],
        ];
    }
}
