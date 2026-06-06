import { Component } from "react"

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <span className="error-boundary-icon">⚠️</span>
                        <h2>Something went wrong</h2>
                        <p>The page encountered an unexpected error. Please try refreshing.</p>
                        <button
                            type="button"
                            className="button button-dark"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
