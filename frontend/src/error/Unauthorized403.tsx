import { useNavigate } from "react-router";

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 text-global-primary">
      <h1 className="text-6xl font-bold text-global-secondary">403</h1>

      <h2 className="text-3xl font-bold text-global-secondary">Accès refusé</h2>

      <p className="text-lg">
        Vous n'êtes pas autorisé à accéder à cette page.
      </p>

      <p className="text-sm text-gray-500">
        Vous ne disposez pas des permissions nécessaires pour consulter cette
        ressource.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-global-secondary text-white hover:bg-opacity-90 transition"
        >
          Revenir en arrière
        </button>
      </div>
    </div>
  );
}
