<?php

namespace App\Shared\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * Validation et stockage sur disque des pièces jointes, commun à tous les
 * modules qui en ont besoin (DIT, TIK, ...) — mêmes règles partout : 5 Mo
 * max, PDF/image/Office, rangées sous var/uploads/{type}/{numero},
 * volontairement HORS de public/ (DocumentRoot Apache, servi sans contrôle
 * d'accès) : les fichiers ne sont accessibles qu'via une route de téléchargement
 * authentifiée propre à chaque module.
 */
final class FileUploadService
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-powerpoint', // ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    ];

    public function __construct(private readonly KernelInterface $kernel) {}

    public function uploadDir(string $type, string $numero): string
    {
        $dir = $this->kernel->getProjectDir() . "/var/uploads/{$type}/{$numero}";
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir;
    }

    /**
     * @return array{0: ?string, 1: ?string} [message d'erreur, nom de fichier stocké]
     */
    public function validateAndStore(UploadedFile $file, string $type, string $numero): array
    {
        if (!$file->isValid()) {
            return ["Le fichier \"{$file->getClientOriginalName()}\" n'a pas pu être envoyé.", null];
        }

        $error = $this->validateSizeAndMime($file);
        if ($error) {
            return [$error, null];
        }

        $storedName = self::storedName($file);
        $file->move($this->uploadDir($type, $numero), $storedName);

        return [null, $storedName];
    }

    /**
     * @param UploadedFile[] $files
     * @return array{0: ?string, 1: array<array{name:string,storedName:string,sizeKb:int}>}
     */
    public function validateAndStoreMany(array $files, string $type, string $numero): array
    {
        $stored = [];

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile || !$file->isValid()) {
                return ["Le fichier \"{$file?->getClientOriginalName()}\" n'a pas pu être envoyé.", []];
            }

            $error = $this->validateSizeAndMime($file);
            if ($error) {
                return [$error, []];
            }

            $originalName = $file->getClientOriginalName();
            $sizeKb = (int) round($file->getSize() / 1024); // avant move() : le fichier temporaire disparaît après

            $storedName = self::storedName($file);
            $file->move($this->uploadDir($type, $numero), $storedName);

            $stored[] = [
                'name' => $originalName,
                'storedName' => $storedName,
                'sizeKb' => $sizeKb,
            ];
        }

        return [null, $stored];
    }

    private function validateSizeAndMime(UploadedFile $file): ?string
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return "Le fichier \"{$file->getClientOriginalName()}\" dépasse la taille maximale de 5 Mo.";
        }
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
            return "Le fichier \"{$file->getClientOriginalName()}\" n'est pas d'un type autorisé (PDF, image, Office).";
        }

        return null;
    }

    private static function storedName(UploadedFile $file): string
    {
        return uniqid('', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
    }
}
