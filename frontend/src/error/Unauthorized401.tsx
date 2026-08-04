import { useNavigate } from "react-router";

export default function Unauthorized401() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 text-global-primary">
      <h1 className="text-6xl font-bold text-global-secondary">401</h1>

      <h2 className="text-3xl font-bold text-global-secondary">
        Authentification requise
      </h2>

      <p className="text-lg">
        Vous devez être connecté pour accéder à cette page.
      </p>

      <p className="text-sm text-gray-500">
        Votre session a expiré ou vous n'avez pas encore ouvert de session.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-global-secondary text-white hover:bg-opacity-90 transition"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
