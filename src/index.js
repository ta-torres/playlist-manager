import './style.css';

const SPOTIFY_CLIENT_ID = 'e9b64b0e4fdd4f97bbc6e17ef0ad960d';
const SPOTIFY_REDIRECT_URI = 'http://localhost:8080';
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

const isTokenValid = () => {
    const token = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    if (token && tokenExpiry && new Date().getTime() < tokenExpiry) {
        return true;
    } else {
        if (localStorage.getItem('refresh_token')) getRefreshToken();
    }
};

const getRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const url = 'https://accounts.spotify.com/api/token';

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: SPOTIFY_CLIENT_ID,
        }),
    };
    const body = await fetch(url, payload);
    const response = await body.json();
    console.log(response);

    const expirationTime = new Date().getTime() + response.expires_in * 1000;
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('token_expiry', expirationTime);
    if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
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
        const loginSection = document.querySelector('.login');
        loginSection.classList.add('disabled');

        const usersProfile = await getUsersProfile(accessToken);
        loginMessage.textContent = `Welcome ${usersProfile.display_name}!`;
        // change the url back to the home page
        window.history.replaceState({}, '', '/');
        mainContent.classList.toggle('disabled');
    }
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

const main = () => {
    const listContainer = document.querySelector('.list-container ul');
    const loginBtn = document.querySelector('.login-btn');
    const mainContent = document.querySelector('.main-content');
    const loginSection = document.querySelector('.login');

    if (isTokenValid()) {
        mainContent.classList.remove('disabled');
        loginSection.classList.add('disabled');

        const accessToken = localStorage.getItem('access_token');
        getUsersProfile(accessToken).then((profile) => {
            const loginMessage = document.querySelector('.login-message');
            loginMessage.textContent = `Welcome ${profile.display_name}!`;
        });
    }

    loginBtn.addEventListener('click', () => {
        redirectToSpotify();
    });

    const likedSongsBtn = document.querySelector('.liked-songs-btn');
    likedSongsBtn.addEventListener('click', async () => {
        listContainer.classList.remove('playlists');
        listContainer.textContent = '';
        const songs = await getLikedSongs(
            localStorage.getItem('access_token'),
            20,
        );
        const parsedSongs = await parseSongs(songs);
        for (let song of parsedSongs) {
            const songItem = createSongItem(song);
            listContainer.appendChild(songItem);
        }
    });

    const showPlaylistsBtn = document.querySelector('.show-playlists-btn');
    showPlaylistsBtn.addEventListener('click', async () => {
        listContainer.classList.add('playlists');
        listContainer.textContent = '';
        const playlists = await getPlaylists(
            localStorage.getItem('access_token'),
        );
        const parsedPlaylists = await parsePlaylists(playlists);
        for (let playlist of parsedPlaylists) {
            const playlistItem = createPlaylistItem(playlist);
            listContainer.appendChild(playlistItem);
        }
    });

    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    createPlaylistBtn.addEventListener('click', async () => {
        await createPlaylistByDecade();
    });

    if (window.location.search.includes('code=')) {
        handleRedirectCallback();
    }
};

main();

const getLikedSongs = async (accessToken, limit) => {
    let url =
        'https://api.spotify.com/v1/me/tracks' +
        (limit ? '?limit=' + limit : '?limit=50');
    let songs = [];
    let songsLeft = true;

    while (songsLeft) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();

        songs = songs.concat(data.items);

        if (limit && songs.length >= limit) {
            songsLeft = false;
        }
        if (data.next) {
            url = data.next;
        } else {
            songsLeft = false;
        }
    }
    return { items: songs };
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
        id: item.track.id,
    }));
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

const createPlaylistItem = (playlist) => {
    const item = document.createElement('li');

    const details = document.createElement('div');
    details.className = 'details';

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = playlist.title;
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = playlist.description;

    info.appendChild(title);
    info.appendChild(description);

    details.appendChild(info);

    const stats = document.createElement('div');
    stats.className = 'stats';
    const stat1 = document.createElement('p');
    stat1.className = 'stat-1';
    stat1.textContent = playlist.tracks;
    const stat2 = document.createElement('p');
    stat2.className = 'stat-2';
    stat2.textContent = playlist.owner;

    stats.appendChild(stat1);
    stats.appendChild(stat2);

    item.appendChild(details);
    item.appendChild(stats);

    return item;
};

const getPlaylists = async (accessToken) => {
    try {
        const response = await fetch(
            'https://api.spotify.com/v1/me/playlists',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        const playlistData = await response.json();
        return playlistData.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
    }
};

const parsePlaylists = (data) => {
    const playlists = data.map((item) => ({
        title: item.name,
        description: item.description,
        cover: item.cover,
        tracks: item.tracks.total,
        owner: item.owner.display_name,
    }));
    return playlists;
};

const createPlaylist = async (accessToken, playlistName) => {
    const userId = await getUsersProfile(accessToken).then((data) => data.id);
    const url = 'https://api.spotify.com/v1/users/' + userId + '/playlists';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: playlistName,
            description: `${playlistName} songs`,
            // Setting public to false in the API hides the playlist from the user's profile, but it's still listed as "public playlist" in the app
            public: false,
        }),
    });
    const playlist = await response.json();
    return playlist.id;
};

const splitArray = (array, size) => {
    const segments = [];
    for (let i = 0; i < array.length; i += size) {
        segments.push(array.slice(i, i + size));
    }
    return segments;
};

const addSongsToPlaylist = async (accessToken, playlistId, songIds) => {
    // 100 songs limit per request
    const segmentedSongIds = splitArray(songIds, 100);
    for (const segment of segmentedSongIds) {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: segment.map((id) => `spotify:track:${id}`),
            }),
        });
    }
};

const parseSongsByDecade = (data) => {
    const songs = data.items.map((item) => ({
        id: item.track.id,
        releaseDate: new Date(item.track.album.release_date).getFullYear(),
    }));
    /* 
    get all the songs id and release date
    create an object of songs by decade
    go through every song
        get the release date in 10 year increments
        if the decade key is not in the object, add it
        push the song id into the decade array
    */
    const songsByDecade = {};
    songs.forEach((song) => {
        const decade = Math.floor(song.releaseDate / 10) * 10;
        if (!songsByDecade[decade]) {
            songsByDecade[decade] = [];
        }
        songsByDecade[decade].push(song.id);
    });

    return songsByDecade;
};

const createPlaylistByDecade = async () => {
    const accessToken = localStorage.getItem('access_token');
    const songs = await getLikedSongs(accessToken);
    const songsByDecade = parseSongsByDecade(songs);

    for (let decade in songsByDecade) {
        const playlistId = await createPlaylist(accessToken, `${decade}s`);
        await addSongsToPlaylist(
            accessToken,
            playlistId,
            songsByDecade[decade],
        );
        console.log(
            `Added ${songsByDecade[decade].length} songs to "${decade}" playlist`,
        );
    }
};
