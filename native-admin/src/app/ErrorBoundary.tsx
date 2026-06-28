import React from "react";
import { View } from "react-native";
import ErrorState from "../components/ErrorState";
import { getErrorMessage, logAppError } from "../lib/errors";
import { colors } from "../theme";

type State = {
  error: string;
};

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: "" };

  static getDerivedStateFromError(error: unknown) {
    return { error: getErrorMessage(error, "App crashed") };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    logAppError("Native admin app crashed", { error, details: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: "center", padding: 20 }}>
          <ErrorState title="App failed" message="Admin App 遇到错误。" details={this.state.error} />
        </View>
      );
    }

    return this.props.children;
  }
}
