import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorState from "../components/mobile/ErrorState";
import { getErrorMessage, logAppError } from "../lib/errors";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logAppError("Mobile app route crashed", { ...error, details: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ErrorState
        title="页面载入失败"
        message="这个页面暂时无法显示。"
        details={getErrorMessage(this.state.error, "Route crashed")}
        actionLabel="重新载入"
        onRetry={() => this.setState({ error: null })}
      />
    );
  }
}
