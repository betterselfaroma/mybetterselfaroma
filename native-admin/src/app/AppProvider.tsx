import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "../components/Toast";

type ToastTone = "success" | "error" | "info";

type AppContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
