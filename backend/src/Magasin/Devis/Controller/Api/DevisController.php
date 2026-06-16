<?php

namespace App\Appro\Controller\Api;

use App\Appro\Repository\Ips\NegEntRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class DevisController extends AbstractController
{
    #[Route('/api/devis', name: 'api_devis_list', methods: ['GET'])]
    public function getDevis(Request $request, NegEntRepository $negEntRepository): JsonResponse
    {
        // Récupération des paramètres de requête (Query Parameters) avec valeurs par défaut
        $codeSociete = $request->query->get('codeSociete', 'HF');
        $sucNeg      = $request->query->get('sucNeg', '01');
        $skip        = $request->query->getInt('skip', 0);
        $limit       = $request->query->getInt('limit', 50);

        try {
            $devis = $negEntRepository->findDevisList($codeSociete, $sucNeg, $skip, $limit);

            return new JsonResponse($devis);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des devis : ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    #[Route('/api/devis/clients', name: 'api_devis_devis_clients', methods: ['GET'])]
    public function getClients(NegEntRepository $negEntRepository): JsonResponse
    {
        try {
            $clients = $negEntRepository->getCodeLibelleClient();

            return new JsonResponse($clients);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des clients : ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
