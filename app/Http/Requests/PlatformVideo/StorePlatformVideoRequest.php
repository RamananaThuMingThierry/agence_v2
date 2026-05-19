<?php

namespace App\Http\Requests\PlatformVideo;

use Illuminate\Foundation\Http\FormRequest;

class StorePlatformVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'source_type' => ['required', 'in:external,upload'],
            'video_url' => ['nullable', 'url', 'max:2048', 'required_if:source_type,external'],
            'video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200', 'required_if:source_type,upload'],
            'thumbnail' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'tour_id' => ['sometimes', 'nullable', 'integer', 'exists:tours,id'],
            'placement' => ['sometimes', 'string', 'max:100'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
