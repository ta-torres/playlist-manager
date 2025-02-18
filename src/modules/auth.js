const SPOTIFY_CLIENT_ID = 'e9b64b0e4fdd4f97bbc6e17ef0ad960d';
const SPOTIFY_REDIRECT_URI = 'http://localhost:5173';
const SCOPES =
    'user-library-read playlist-read-private playlist-modify-private playlist-modify-public';

const generateAuthCode = async () => {
    const generateRandomString = (length) => {
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce(
            (acc, x) => acc + possible[x % possible.length],
            '',
        );
    };

    const sha256 = async (plain) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    };

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    };

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    window.localStorage.setItem('code_verifier', codeVerifier);

    return codeChallenge;
};

const redirectToSpotify = async () => {
    const codeChallenge = await generateAuthCode();
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params = {
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: SPOTIFY_REDIRECT_URI,
    };
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
};

const getAccessToken = async (authCode) => {
    try {
        const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
        const codeVerifier = localStorage.getItem('code_verifier');

        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: SPOTIFY_CLIENT_ID,
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
        });

        const data = await response.json();
        if (data.access_token) {
            const expirationTime =
                new Date().getTime() + data.expires_in * 1000;
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('token_expiry', expirationTime);
            localStorage.setItem('refresh_token', data.refresh_token);
            return data.access_token;
        }
    } catch (error) {
        console.error('Error getting access token:', error);
    }
};

const isTokenValid = async () => {
    const token = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    if (token && tokenExpiry && new Date().getTime() < tokenExpiry) {
        return true;
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
        try {
            await getRefreshToken();
            return true;
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_expiry');
            localStorage.removeItem('refresh_token');
            console.error('Error refreshing token:', error);
            return false;
        }
    }
    return false;
};

const getRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const url = 'https://accounts.spotify.com/api/token';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: SPOTIFY_CLIENT_ID,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching refresh token: ${response.status}`);
        }

        const data = await response.json();

        const expirationTime = new Date().getTime() + data.expires_in * 1000;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_expiry', expirationTime);
        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
        }

        return data.access_token;
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('refresh_token');
        console.error('Error refreshing token:', error);
    }
};

const handleRedirectCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode) {
        const accessToken = await getAccessToken(authCode);
        // window.history.replaceState({}, '', '/');
        window.location.href = 'http://localhost:5173';
    }
};

const SpotifyAuth = {
    redirectToSpotify,
    isTokenValid,
    handleRedirectCallback,
    getRefreshToken,
};

export default SpotifyAuth;
