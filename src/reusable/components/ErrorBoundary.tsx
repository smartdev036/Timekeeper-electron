import React, { ErrorInfo } from "react";

interface ErrorBoundaryState {
    hasError: boolean
    stack: string
}

class ErrorBoundary extends React.Component {
    state: ErrorBoundaryState

    constructor(props: any) {
        super(props);
        this.state = { hasError: false, stack: "" };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, stack: error.stack };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{padding: 20}}>
                    <h1 style={{color: "red", fontWeight: 100}}>App Crashed. Error details:</h1>
                    <pre style={{userSelect: "all", overflow: "auto"}}>{this.state.stack}</pre>
                </div>
                
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary