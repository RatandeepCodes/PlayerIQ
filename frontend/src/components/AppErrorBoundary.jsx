import { Component } from "react";

import AppStatusScreen from "./AppStatusScreen.jsx";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("PlayerIQ frontend crashed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppStatusScreen
          eyebrow="Application Error"
          title="PlayerIQ hit an unexpected issue"
          message="Refresh the workspace to recover. If this continues, restart the frontend after checking the backend and AI services."
          tone="error"
          action={
            <button className="auth-submit" type="button" onClick={() => window.location.reload()}>
              Reload workspace
            </button>
          }
        />
      );
    }

    return this.props.children;
  }
}
