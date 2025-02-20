import { useSpotify } from '../context/SpotifyContext';
import { SpotifyContextType } from '../types';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useSpotify() as SpotifyContextType;

    if (isLoading) {
        return (
            <div className="loading-page">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
