import { createContext, useContext, useState, useEffect } from 'react';
import SpotifyAuth from '../modules/auth';

const SpotifyContext = createContext(null);

export const SpotifyProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem('access_token'),
    );
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

    return (
        <SpotifyContext.Provider
            value={{ accessToken, isAuthenticated, login }}
        >
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
