<?php

namespace App\Http\Requests\PlatformVideo;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlatformVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'source_type' => ['sometimes', 'in:external,upload'],
            'video_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'video_file' => ['sometimes', 'nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200'],
            'thumbnail' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'tour_id' => ['sometimes', 'nullable', 'integer', 'exists:tours,id'],
            'placement' => ['sometimes', 'string', 'max:100'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
