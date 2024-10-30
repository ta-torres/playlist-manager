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

const splitArray = (array, size) => {
    const segments = [];
    for (let i = 0; i < array.length; i += size) {
        segments.push(array.slice(i, i + size));
    }
    return segments;
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

export { parseSongs, parsePlaylists, splitArray, parseSongsByDecade };
