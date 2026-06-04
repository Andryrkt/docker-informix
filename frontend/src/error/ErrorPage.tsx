import { useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 text-global-primary">
      <h1 className="text-4xl font-bold text-global-secondary">Erreur</h1>
      <p className="text-lg ">
        Une erreur est survenue lors du chargement de la page.
      </p>
      <p className="text-sm text-gray-500">
        {error?.statusText || error?.message || "Erreur inconnue."}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6 ">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-global-secondary text-white  hover:bg-opacity-90 transition"
        >
          Revenir en arrière
        </button>
      </div>
    </div>
  );
}
