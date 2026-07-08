<?php

namespace App\Tests\Unit\Tik;

use App\Security\Entity\Personnel;
use App\Security\Entity\User;
use App\Tik\Entity\Tik;
use App\Tik\Entity\TikCategorie;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires pour l'entité Tik — pas de DB, juste le comportement de
 * l'objet (getters/setters, constantes de statut, décodage JSON des fichiers).
 */
class TikEntityTest extends TestCase
{
    public function testDefaultStatutIsOuvert(): void
    {
        $tik = new Tik();
        $this->assertSame(Tik::STATUT_OUVERT, $tik->getStatut());
    }

    public function testDefaultNiveauUrgenceIsP4(): void
    {
        $tik = new Tik();
        $this->assertSame('P4', $tik->getNiveauUrgence());
    }

    public function testCreatedAtIsSetOnConstruction(): void
    {
        $before = new \DateTime('-1 second');
        $tik = new Tik();
        $after = new \DateTime('+1 second');

        $this->assertGreaterThanOrEqual($before->getTimestamp(), $tik->getCreatedAt()->getTimestamp());
        $this->assertLessThanOrEqual($after->getTimestamp(), $tik->getCreatedAt()->getTimestamp());
    }

    public function testStatutConstantsAreDistinct(): void
    {
        $statuts = [
            Tik::STATUT_OUVERT, Tik::STATUT_PLANIFIE, Tik::STATUT_EN_COURS,
            Tik::STATUT_RESOLU, Tik::STATUT_REFUSE, Tik::STATUT_CLOTURE,
            Tik::STATUT_REOUVERT, Tik::STATUT_EN_ATTENTE,
        ];

        $this->assertCount(8, $statuts);
        $this->assertCount(8, array_unique($statuts), 'Deux constantes de statut ont la même valeur');
    }

    public function testFluentSettersReturnSelf(): void
    {
        $tik = new Tik();

        $this->assertSame($tik, $tik->setObjetDemande('Objet'));
        $this->assertSame($tik, $tik->setDetailDemande('Détail'));
        $this->assertSame($tik, $tik->setStatut(Tik::STATUT_EN_COURS));
        $this->assertSame($tik, $tik->setNiveauUrgence('P1'));
    }

    public function testGetFileNamesAsArrayReturnsEmptyArrayWhenNull(): void
    {
        $tik = new Tik();
        $this->assertSame([], $tik->getFileNamesAsArray());
    }

    public function testGetFileNamesAsArrayDecodesJson(): void
    {
        $tik = new Tik();
        $files = [
            ['name' => 'facture.pdf', 'storedName' => 'abc123_facture.pdf', 'sizeKb' => 42],
        ];
        $tik->setFileNames(json_encode($files));

        $this->assertSame($files, $tik->getFileNamesAsArray());
    }

    public function testGetFileNamesAsArrayReturnsEmptyArrayOnInvalidJson(): void
    {
        $tik = new Tik();
        $tik->setFileNames('{ceci n\'est pas du json');

        $this->assertSame([], $tik->getFileNamesAsArray());
    }

    public function testCategorieAssociation(): void
    {
        $categorie = new TikCategorie();
        $categorie->setDescription('MATERIELS');

        $tik = new Tik();
        $tik->setCategorie($categorie);

        $this->assertSame($categorie, $tik->getCategorie());
        $this->assertSame('MATERIELS', $tik->getCategorie()->getDescription());
    }

    public function testIntervenantAndDemandeurAssociations(): void
    {
        $tik = new Tik();
        $this->assertNull($tik->getIntervenant());
        $this->assertNull($tik->getDemandeur());
        $this->assertNull($tik->getValidateur());

        $personnel = new Personnel();
        $personnel->setNom('RAKOTO')->setPrenoms('Jean')->setMatricule('1234');
        $tik->setIntervenant($personnel);
        $this->assertSame($personnel, $tik->getIntervenant());

        $user = new User();
        $tik->setValidateur($user);
        $this->assertSame($user, $tik->getValidateur());
    }
}
