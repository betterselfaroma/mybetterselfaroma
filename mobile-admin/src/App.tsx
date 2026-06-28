import { AppProvider } from "./app/AppProvider";
import { AuthProvider } from "./app/AuthProvider";
import AppRouter from "./app/AppRouter";

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppProvider>
  );
}
