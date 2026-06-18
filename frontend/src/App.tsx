import { ConfirmationDialogProvider } from "./components/common/ConfirmDialog";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {

  return (
    <ConfirmationDialogProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ConfirmationDialogProvider>
  );
}
