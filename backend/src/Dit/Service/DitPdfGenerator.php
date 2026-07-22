<?php

namespace App\Dit\Service;

use App\Dit\Entity\Irium\Dit;
use App\Dit\Repository\MaterielRepository;
use Symfony\Component\HttpKernel\KernelInterface;
use TCPDF;

final class DitPdfGenerator
{
    public function __construct(
        private readonly DitPayloadFactory $payloadFactory,
        private readonly MaterielRepository $materielRepo,
        private readonly KernelInterface $kernel
    ) {}

    public function generate(Dit $dit): string
    {
        $dto = $this->payloadFactory->create($dit);
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

        // Désactiver les en-têtes et pieds de page par défaut de TCPDF
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(true, 15);

        $pdf->AddPage();

        // 1. En-tête : Logo et Titre
        $pdf->setFont('helvetica', 'B', 14);
        $pdf->setAbsY(11);
        
        $logoPath = $this->kernel->getProjectDir() . '/public/assets/logoHFF.jpg';
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, '', '', 45, 12);
        }
        
        $pdf->setAbsX(60);
        $pdf->Cell(105, 6, "DEMANDE D'INTERVENTION - SCT", 0, 0, 'C', false, '', 0, false, 'T', 'M');

        $pdf->setAbsX(170);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->Cell(35, 6, $dto->numeroDemandeIntervention, 0, 0, 'L', false, '', 0, false, 'T', 'M');

        $pdf->Ln(6, true);

        // Libellé type document (déjà résolu dans le DTO)
        $pdf->setFont('helvetica', 'B', 12);
        $pdf->setAbsX(60);
        $pdf->cell(105, 6, $dto->typeDocument ?? '', 0, 0, 'C', false, '', 0, false, 'T', 'M');

        $pdf->SetTextColor(0, 0, 0);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->setAbsX(170);
        // Date demande (déjà formatée en Y-m-d, on la reformate en d/m/Y si besoin)
        $dateDemandeFmt = '';
        if ($dto->dateDemande) {
            $dateDemandeFmt = implode('/', array_reverse(explode('-', $dto->dateDemande)));
        }
        $pdf->cell(35, 6, 'Le : ' . $dateDemandeFmt, 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(7, true);

        // 2. Objet et Détails
        $pdf->SetTextColor(0, 0, 0);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Objet :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->objet ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(7, true);

        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Détails :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->MultiCell(160, 100, $dto->details ?? '', 1, 'L', 0, 0, '', '', true);
        $pdf->Ln(3, true);
        
        $pdf->setAbsY(133);

        // 3. Catégorie, Contrat et Devis
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->MultiCell(25, 6, "Catégorie :", 0, 'L', false, 0);
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(50, 6, $dto->categorieDemande ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(95);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->MultiCell(40, 6, "Client Sous Contrat :", 0, 'L', false, 0);
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(15, 6, $dto->clientSousContrat ?? 'NON', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(155);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Devis demandé :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->demandeDevis ?? 'NON', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(6, true);

        // 4. Section Intervention
        $this->renderTextWithLine($pdf, 'Intervention');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Date prévue :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        
        $datePrevueFmt = '';
        if ($dto->datePrevue) {
            $datePrevueFmt = implode('/', array_reverse(explode('-', $dto->datePrevue)));
        }
        $pdf->cell(50, 6, $datePrevueFmt, 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(130);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(20, 6, 'Urgence :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->worNiveauUrgence ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(6, true);

        // 5. Section Agence - Service
        $this->renderTextWithLine($pdf, 'Agence - Service');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Emetteur :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(50, 6, $dto->agenceEmetteur ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(130);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(20, 6, 'Débiteur :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->agenceServiceDebiteur ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(6, true);

        // 6. Section Réparation
        $this->renderTextWithLine($pdf, 'Réparation');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Type :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(30, 6, $dto->interneExterne ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(70);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(23, 6, 'Réparation :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(35, 6, $dto->typeReparation ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(130);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Réalisé par :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->reparationRealise ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(6, true);

        // 7. Section Client (seulement si Externe)
        if ($dto->interneExterne === 'EXTERNE') {
            $this->renderTextWithLine($pdf, 'Client');
            $pdf->SetTextColor(0, 0, 0);
            $pdf->setFont('helvetica', 'B', 10);
            $pdf->cell(25, 6, 'Numéro :', 0, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->setFont('helvetica', '', 9);
            $pdf->cell(50, 6, $dto->numClient ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
            
            $pdf->setAbsX(90);
            $pdf->setFont('helvetica', 'B', 10);
            $pdf->cell(15, 6, 'Nom :', 0, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->setFont('helvetica', '', 9);
            $nomClient = $dto->nomClient ?? '';
            if (mb_strlen($nomClient) > 40) {
                $nomClient = mb_substr($nomClient, 0, 37) . '...';
            }
            $pdf->cell(0, 6, $nomClient, 1, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->Ln(7, true);

            $pdf->setFont('helvetica', 'B', 10);
            $pdf->cell(25, 6, 'N° tel :', 0, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->setFont('helvetica', '', 9);
            $pdf->cell(50, 6, $dto->telephoneClient ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
            
            $pdf->setAbsX(90);
            $pdf->setFont('helvetica', 'B', 10);
            $pdf->cell(15, 6, 'Email :', 0, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->setFont('helvetica', '', 9);
            $pdf->cell(0, 6, $dto->emailClient ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
            $pdf->Ln(7, true);
        }

        // 8. Section Caractéristiques du matériel
        $this->renderTextWithLine($pdf, 'Caractéristiques du matériel');
        $pdf->SetTextColor(0, 0, 0);
        
        $materiel = $this->materielRepo->find((int)$dto->idMateriel);
        
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Désignation :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(70, 6, $materiel ? ($materiel->getDesignation() ?? '') : '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(140);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(20, 6, 'N° Série :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->numSerie ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(7, true);

        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'N° Parc :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(30, 6, $dto->numParc ?? '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(70);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(21, 6, 'Modèle :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(37, 6, $materiel ? ($materiel->getModele() ?? '') : '', 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(130);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(30, 6, 'Constructeur :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $materiel ? ($materiel->getConstructeur() ?? '') : '', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(7, true);

        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(25, 6, 'Id Matériel :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(20, 6, $dto->idMateriel, 1, 0, '', false, '', 0, false, 'T', 'M');
        
        $pdf->setAbsX(80);
        $pdf->setFont('helvetica', 'B', 10);
        $pdf->cell(33, 6, 'Livraison partielle :', 0, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->setFont('helvetica', '', 9);
        $pdf->cell(0, 6, $dto->livraisonPartielle ?? 'NON', 1, 0, '', false, '', 0, false, 'T', 'M');
        $pdf->Ln(6, true);

        // E-mail demandeur en haut
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('helvetica', 'BI', 10);
        $pdf->SetXY(110, 2);
        $pdf->Cell(85, 6, "email : " . ($dit->getMailDemandeur() ?? ''), 0, 0, 'R');

        // 9. Deuxième page : Historique de réparation (si applicable)
        if ($materiel) {
            $exclure = $this->materielRepo->exclureHistorique($materiel->getRefFou(), $materiel->getRecAlph(), $materiel->getNumMat());
            if (!$exclure) {
                $historique = $this->materielRepo->getHistorique($materiel->getNumMat());
                if (!empty($historique)) {
                    $this->renderHistorique($pdf, $historique);
                }
            }
        }

        return $pdf->Output('', 'S');
    }

    private function renderTextWithLine(
        TCPDF $pdf,
        string $text,
        int $totalWidth = 180,
        int $lineOffset = 3,
        string $font = 'helvetica',
        string $fontStyle = 'B',
        int $fontSize = 11,
        array $textColor = [14, 65, 148],
        array $lineColor = [14, 65, 148],
        int $lineHeight = 1
    ): void {
        $pdf->setFont($font, $fontStyle, $fontSize);
        $pdf->SetTextColor($textColor[0], $textColor[1], $textColor[2]);

        $textWidth = $pdf->GetStringWidth($text);
        $pdf->Cell($textWidth, 6, $text, 0, 0, 'L');

        $pdf->SetFillColor($lineColor[0], $lineColor[1], $lineColor[2]);
        $remainingWidth = $totalWidth - $textWidth - $lineOffset;

        $lineStartX = $pdf->GetX() + $lineOffset;
        $lineStartY = $pdf->GetY() + 3;

        if ($remainingWidth > 0) {
            $pdf->Rect($lineStartX, $lineStartY, $remainingWidth, $lineHeight, 'F');
        }

        $pdf->Ln(6, true);
    }

    private function renderHistorique(TCPDF $pdf, array $historique): void
    {
        $pdf->AddPage();

        $header = ['Agences', 'Services', 'Date', 'numor', 'interv', 'commentaire', 'pos', 'Sommes'];

        $html = '<h2 style="text-align:center">HISTORIQUE DE REPARATION</h2>';
        $html .= '<table border="0.5" cellpadding="3" cellspacing="0" align="center" style="font-size: 8px; border-color: #ccc;">';
        $html .= '<thead>';
        $html .= '<tr style="background-color: #f2f2f2; font-weight: bold;">';
        
        foreach ($header as $key => $value) {
            if ($key === 0) {
                $html .= '<th style="width: 45px;">' . $value . '</th>';
            } elseif ($key === 1) {
                $html .= '<th style="width: 45px;">' . $value . '</th>';
            } elseif ($key === 2) {
                $html .= '<th style="width: 55px;">' . $value . '</th>';
            } elseif ($key === 3) {
                $html .= '<th style="width: 55px;">' . $value . '</th>';
            } elseif ($key === 4) {
                $html .= '<th style="width: 35px;">' . $value . '</th>';
            } elseif ($key === 5) {
                $html .= '<th style="width: 215px; text-align: left;">' . $value . '</th>';
            } elseif ($key === 6) {
                $html .= '<th style="width: 30px;">' . $value . '</th>';
            } elseif ($key === 7) {
                $html .= '<th style="width: 60px; text-align: right;">' . $value . '</th>';
            }
        }
        $html .= '</tr>';
        $html .= '</thead>';
        $html .= '<tbody>';

        foreach ($historique as $row) {
            $html .= '<tr>';
            $html .= '<td style="width: 45px;">' . ($row['codeagence'] ?? '') . '</td>';
            $html .= '<td style="width: 45px;">' . ($row['codeservice'] ?? '') . '</td>';
            $html .= '<td style="width: 55px;">' . ($row['datedebut'] ?? '') . '</td>';
            $html .= '<td style="width: 55px;">' . ($row['numeroor'] ?? '') . '</td>';
            $html .= '<td style="width: 35px;">' . ($row['numerointervention'] ?? '') . '</td>';
            $html .= '<td style="width: 215px; text-align: left;">' . ($row['commentaire'] ?? '') . '</td>';
            $html .= '<td style="width: 30px;">' . ($row['pos'] ?? '') . '</td>';
            $html .= '<td style="width: 60px; text-align: right;">' . ($row['somme'] ?? '0') . '</td>';
            $html .= '</tr>';
        }

        $html .= '</tbody>';
        $html .= '</table>';

        $pdf->writeHTML($html, true, false, true, false, '');
    }
}
