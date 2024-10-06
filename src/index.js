import './style.css';

const SPOTIFY_CLIENT_ID = 'e9b64b0e4fdd4f97bbc6e17ef0ad960d';
const SPOTIFY_REDIRECT_URI = 'http://localhost:8080';
const SCOPES = 'user-library-read';

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
            localStorage.setItem('access_token', data.access_token);
            console.log('Access token:', data);
        }
    } catch (error) {
        console.error('Error getting access token:', error);
    }
};

const handleRedirectCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    // if the user approves the Spotify redirect, get an access token and allow the user to use the app
    if (authCode) {
        await getAccessToken(authCode);
        // change the url back to the home page
        window.history.replaceState({}, '', '/');
    }
};

const main = () => {
    const songsContainer = document.querySelector('.songs-container ul');
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => {
        redirectToSpotify();
    });


    // Handle redirect from Spotify
    if (window.location.search.includes('code=')) {
        handleRedirectCallback();
    }
};

main();

