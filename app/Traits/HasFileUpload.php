<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

trait HasFileUpload
{
    /**
     * Supprime un fichier existant.
     */
    private function deleteFile(?string $filePath, string $baseDirectory): void
    {
        if (!$filePath || !str_starts_with($filePath, $baseDirectory)) {
            return;
        }

        $fullPath = public_path($filePath);

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    /**
     * Upload un fichier et supprime l'ancien si présent.
     *
     * @param Request $request
     * @param string $fieldName nom du champ dans la requête
     * @param string $directory dossier cible, ex: 'uploads/users'
     * @param string|null $currentFile fichier existant à supprimer
     * @return string|null chemin relatif du fichier uploadé
     */
    public function uploadFile(Request $request, string $fieldName, string $directory, ?string $currentFile = null): ?string
    {
        if (!$request->hasFile($fieldName)) {
            return $currentFile;
        }

        $this->deleteFile($currentFile, $directory);

        $fullDirectory = public_path($directory);

        if (!File::exists($fullDirectory)) {
            File::makeDirectory($fullDirectory, 0755, true);
        }

        $file = $request->file($fieldName);
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->move($fullDirectory, $filename);

        return $directory . '/' . $filename;
    }
}
