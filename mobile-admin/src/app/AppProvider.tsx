import { createContext, useCallback, useContext, useMemo, useState } from "react";
import AppToast, { type ToastTone } from "../components/mobile/AppToast";

type ToastState = {
  id: number;
  tone: ToastTone;
  message: string;
} | null;

type AppContextValue = {
  pageDirty: boolean;
  setPageDirty: (dirty: boolean) => void;
  showToast: (message: string, tone?: ToastTone) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pageDirty, setPageDirty] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now();
    setToast({ id, tone, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ pageDirty, setPageDirty, showToast }), [pageDirty, showToast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <AppToast toast={toast} onClose={() => setToast(null)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
