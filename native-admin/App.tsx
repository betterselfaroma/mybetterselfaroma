import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";

import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "./src/app/ErrorBoundary";
import { AppProvider } from "./src/app/AppProvider";
import { AuthProvider } from "./src/app/AuthProvider";
import Navigation from "./src/app/Navigation";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Navigation />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
