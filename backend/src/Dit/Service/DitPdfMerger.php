<?php

namespace App\Dit\Service;

final class DitPdfMerger
{
    /**
     * Fusionne le PDF principal avec d'autres fichiers PDF ou images
     *
     * @param string[] $files Liste des chemins des fichiers à fusionner (dans l'ordre)
     * @param string $outputFile Chemin de sortie du fichier fusionné
     * @throws \Exception
     */
    public function merge(array $files, string $outputFile): void
    {
        // Instancier FPDI pour TCPDF
        $pdf = new \setasign\Fpdi\Tcpdf\Fpdi();

        // Désactiver les en-têtes et pieds de page par défaut
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        foreach ($files as $file) {
            if (!file_exists($file)) {
                continue;
            }

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if ($ext === 'pdf') {
                // Normaliser le PDF au format compatible PDF 1.4 via Ghostscript
                $this->normalizePdf($file);

                $pageCount = $pdf->setSourceFile($file);
                for ($i = 1; $i <= $pageCount; $i++) {
                    $tplId = $pdf->importPage($i);
                    $size = $pdf->getTemplateSize($tplId);
                    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    $pdf->useTemplate($tplId);
                }
            } elseif (in_array($ext, ['jpg', 'jpeg', 'png'], true)) {
                // Récupérer les dimensions de l'image
                $imgSize = getimagesize($file);
                if (!$imgSize) {
                    continue;
                }
                [$imgWidth, $imgHeight] = $imgSize;

                // Calculer l'orientation de la page en fonction des dimensions de l'image
                $orientation = ($imgWidth > $imgHeight) ? 'L' : 'P';

                $pdf->AddPage($orientation);

                // Récupérer les dimensions de la page
                $pageWidth = $pdf->GetPageWidth();
                $pageHeight = $pdf->GetPageHeight();

                // Calculer les dimensions pour adapter l'image tout en la centrant
                $scale = min($pageWidth / $imgWidth, $pageHeight / $imgHeight);
                $imgDisplayWidth = $imgWidth * $scale;
                $imgDisplayHeight = $imgHeight * $scale;

                $x = ($pageWidth - $imgDisplayWidth) / 2;
                $y = ($pageHeight - $imgDisplayHeight) / 2;

                // Insérer l'image centrée
                $pdf->Image($file, $x, $y, $imgDisplayWidth, $imgDisplayHeight);
            }
        }

        // Sauvegarder le fichier fusionné
        $pdf->Output($outputFile, 'F');
    }

    /**
     * Utilise Ghostscript pour normaliser le PDF au format compatible PDF 1.4
     * afin de prévenir les erreurs d'incompatibilité de FPDI sur les versions 1.5+.
     */
    private function normalizePdf(string $filePath): string
    {
        $tempFile = $filePath . "_temp.pdf";

        if (!file_exists($filePath)) {
            throw new \Exception("Fichier introuvable : $filePath");
        }

        // Commande Ghostscript sous Linux Docker
        $command = sprintf(
            'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>&1',
            escapeshellarg($tempFile),
            escapeshellarg($filePath)
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $msg = implode("\n", $output);
            throw new \Exception("Erreur lors de la normalisation du PDF avec Ghostscript (code: $returnVar). Sortie : $msg");
        }

        if (!rename($tempFile, $filePath)) {
            throw new \Exception("Impossible de remplacer le fichier PDF original.");
        }

        return $filePath;
    }
}
