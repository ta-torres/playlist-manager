import { splitArray } from './utils.js';

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

const getLikedSongs = async (accessToken, limit) => {
    let url = 'https://api.spotify.com/v1/me/tracks' + (limit ? '?limit=' + limit : '?limit=50');
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

const getPlaylists = async (accessToken) => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const playlistData = await response.json();
        return playlistData.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
    }
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

const SpotifyAPI = {
    getUsersProfile,
    getLikedSongs,
    getPlaylists,
    createPlaylist,
    addSongsToPlaylist,
};

export default SpotifyAPI;
