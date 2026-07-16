import { ConfirmationDialogProvider } from "./components/common/ConfirmDialog";
import { AuthProvider } from "./context/authContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ConfirmationDialogProvider>
        <AppRoutes />
      </ConfirmationDialogProvider>
    </AuthProvider>
  );
}
