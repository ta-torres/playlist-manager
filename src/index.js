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
            return data.access_token;
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
        const accessToken = await getAccessToken(authCode);
        const mainContent = document.querySelector('.main-content');
        const loginMessage = document.querySelector('.login-message');

        const usersProfile = await getUsersProfile(accessToken);
        loginMessage.textContent = `Welcome ${usersProfile.display_name}!`;
        // change the url back to the home page
        window.history.replaceState({}, '', '/');
        mainContent.classList.toggle('disabled');
    }
};

const main = () => {
    const listContainer = document.querySelector('.list-container ul');
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => {
        redirectToSpotify();
    });

    const likedSongsBtn = document.querySelector('.liked-songs-btn');
    likedSongsBtn.addEventListener('click', async () => {
        listContainer.textContent = '';
        const songs = await getLikedSongs(localStorage.getItem('access_token'));
        const parsedSongs = await parseSongs(songs);
        for (let song of parsedSongs) {
            const songItem = createSongItem(song);
            listContainer.appendChild(songItem);
        }
    });

    // Handle redirect from Spotify
    if (window.location.search.includes('code=')) {
        handleRedirectCallback();
    }
};

main();

const getLikedSongs = async (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/tracks';
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
};

const parseSongs = (data) => {
    const songs = data.items.map((item) => ({
        title: item.track.name,
        artist: item.track.artists[0].name,
        cover: item.track.album.images[0].url,
        releaseDate: new Date(item.track.album.release_date).getFullYear(),
        duration: {
            minutes: Math.floor(item.track.duration_ms / 60000),
            seconds: Math.floor((item.track.duration_ms % 60000) / 1000),
        },
    }));
    console.log(songs);
    return songs;
};

const createSongItem = (song) => {
    const item = document.createElement('li');

    const details = document.createElement('div');
    details.className = 'details';

    const cover = document.createElement('div');
    cover.className = 'cover';
    const img = document.createElement('img');
    img.src = song.cover;
    img.width = 64;
    img.height = 64;
    img.alt = `${song.title} cover`;
    cover.appendChild(img);

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = song.title;
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = song.artist;

    info.appendChild(title);
    info.appendChild(description);

    details.appendChild(cover);
    details.appendChild(info);

    const stats = document.createElement('div');
    stats.className = 'stats';
    const stat1 = document.createElement('p');
    stat1.className = 'stat-1';
    stat1.textContent = song.duration.minutes + ':' + song.duration.seconds;
    const stat2 = document.createElement('p');
    stat2.className = 'stat-2';
    stat2.textContent = song.releaseDate;

    stats.appendChild(stat1);
    stats.appendChild(stat2);

    item.appendChild(details);
    item.appendChild(stats);

    return item;
};

const getUsersProfile = async (accessToken) => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};
