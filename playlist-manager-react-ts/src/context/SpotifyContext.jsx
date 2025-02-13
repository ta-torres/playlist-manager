import { createContext, useContext, useState, useEffect } from 'react';
import SpotifyAuth from '../modules/auth';

const SpotifyContext = createContext(null);

export const SpotifyProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem('access_token'),
    );
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (SpotifyAuth.isTokenValid()) {
            setIsAuthenticated(true);
        }

        if (window.location.search.includes('code=')) {
            SpotifyAuth.handleRedirectCallback().then(() => {
                setAccessToken(localStorage.getItem('access_token'));
                setIsAuthenticated(true);
            });
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
