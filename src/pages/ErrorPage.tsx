import { Link } from 'react-router';

const ErrorPage = () => {
    return (
        <div className="page">
            <div className="error-page">
                <h1>404</h1>
                <p>Page not found</p>
                <Link to="/" className="btn">
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
