import { createContext, useContext, useState, useEffect } from 'react';
// @ts-expect-error not typed yet
import SpotifyAuth from '../modules/auth';
import { SpotifyContextType } from '../types';

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isValid = await SpotifyAuth.isTokenValid();
                setIsAuthenticated(isValid);
                if (isValid) {
                    setAccessToken(localStorage.getItem('access_token'));
                }
            } catch (error) {
                console.error('Auth failed:', error);
                setIsAuthenticated(false);
            }
        };

        if (window.location.search.includes('code=')) {
            SpotifyAuth.handleRedirectCallback().then(() => {
                setAccessToken(localStorage.getItem('access_token'));
                setIsAuthenticated(true);
            });
        } else {
            checkAuth();
        }
    }, []);

    const login = () => SpotifyAuth.redirectToSpotify();

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('code_verifier');
        setAccessToken(null);
        setIsAuthenticated(false);
    };

    return (
        <SpotifyContext.Provider value={{ accessToken, isAuthenticated, login, logout }}>
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotify = () => {
    const context = useContext(SpotifyContext);
    if (!context) {
        throw new Error('No Spotify context found');
    }
    return context;
};
