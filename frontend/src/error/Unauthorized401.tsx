import { Button } from "@/components/ui/button";
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
        <Button variant="brand" onClick={handleLogin}>
          Se Connecter
        </Button>
      </div>
    </div>
  );
}
