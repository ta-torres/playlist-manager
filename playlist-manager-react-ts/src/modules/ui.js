import '../index.css';

import SpotifyAuth from './auth.js';
import SpotifyAPI from './api.js';
import { parseSongs, parsePlaylists, parseSongsByDecade } from './utils.js';

const initializeApp = () => {
    /*     const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', () => SpotifyAuth.redirectToSpotify()); */
    if (SpotifyAuth.isTokenValid()) bindUserEvents();
    /* if (window.location.search.includes('code='))
        SpotifyAuth.handleRedirectCallback(); */
};

const bindUserEvents = () => {
    const loginSection = document.querySelector('.login');
    const mainContent = document.querySelector('.main-content');
    const likedSongsBtn = document.querySelector('.liked-songs-btn');
    const showPlaylistsBtn = document.querySelector('.show-playlists-btn');
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');

    likedSongsBtn.addEventListener('click', async () => showLikedSongs());
    showPlaylistsBtn.addEventListener('click', async () => showPlaylists());
    createPlaylistBtn.addEventListener('click', async () => {
        enableLoadingBtn(true, createPlaylistBtn);
        await createPlaylistByDecade();
        enableLoadingBtn(false, createPlaylistBtn);
    });

    mainContent.classList.remove('disabled');
    loginSection.classList.add('disabled');

    const accessToken = localStorage.getItem('access_token');
    SpotifyAPI.getUsersProfile(accessToken).then((profile) => {
        const loginMessage = document.querySelector('.login-message');
        loginMessage.textContent = `Welcome ${profile.display_name}!`;
    });
};

const showLikedSongs = async () => {
    disableButtons(true);
    const listContainer = document.querySelector('.list-container ul');
    listContainer.classList.remove('playlists');
    listContainer.textContent = '';
    const songs = await SpotifyAPI.getLikedSongs(
        localStorage.getItem('access_token'),
        20,
    );
    const parsedSongs = await parseSongs(songs);
    for (let song of parsedSongs) {
        const songItem = createSongItem(song);
        listContainer.appendChild(songItem);
    }
    disableButtons(false);
};

const showPlaylists = async () => {
    disableButtons(true);
    const listContainer = document.querySelector('.list-container ul');
    listContainer.classList.add('playlists');
    listContainer.textContent = '';
    const playlists = await SpotifyAPI.getPlaylists(
        localStorage.getItem('access_token'),
    );
    const parsedPlaylists = await parsePlaylists(playlists);
    for (let playlist of parsedPlaylists) {
        const playlistItem = createPlaylistItem(playlist);
        listContainer.appendChild(playlistItem);
    }
    disableButtons(false);
};

const createPlaylistByDecade = async () => {
    const accessToken = localStorage.getItem('access_token');
    const songs = await SpotifyAPI.getLikedSongs(accessToken);
    const songsByDecade = parseSongsByDecade(songs);

    toggleSection('results', false);

    const confirmationSection = document.querySelector('.confirmation-section');
    if (confirmationSection) confirmationSection.remove();
    const section = document.createElement('section');
    section.className = 'confirmation-section';
    section.innerHTML = `
        <h2>The following playlists will be created</h2>
        <div class="confirmation-message"></div>
        <button class="confirm-btn btn">Confirm</button>
        <button class="cancel-btn btn">Cancel</button>
    `;
    const loginMessage = document.querySelector('.login-message');
    loginMessage.insertAdjacentElement('afterend', section);

    const confirmationMessage = section.querySelector('.confirmation-message');
    let confirmationText = '';

    for (let decade in songsByDecade) {
        confirmationText += `<p>"${decade}s" with ${songsByDecade[decade].length} songs</p>`;
    }
    confirmationMessage.innerHTML = confirmationText;

    const confirmBtn = section.querySelector('.confirm-btn');
    const cancelBtn = section.querySelector('.cancel-btn');

    confirmBtn.addEventListener(
        'click',
        async () => {
            section.remove();
            toggleSection('results', true);
            const spinner = document.querySelector('.spinner');
            spinner.classList.remove('disabled');

            const resultsMessage = document.querySelector('.results-message');
            let resultsText = '';

            for (let decade in songsByDecade) {
                const playlistId = await SpotifyAPI.createPlaylist(
                    accessToken,
                    `${decade}s`,
                );
                await SpotifyAPI.addSongsToPlaylist(
                    accessToken,
                    playlistId,
                    songsByDecade[decade],
                );
                console.log(
                    `Added ${songsByDecade[decade].length} songs to "${decade}" playlist`,
                );
                resultsText += `<p>Added ${songsByDecade[decade].length} songs to "${decade}" playlist.</p>`;
                resultsMessage.innerHTML = resultsText;
            }
            spinner.classList.add('disabled');
        },
        { once: true },
    );

    cancelBtn.addEventListener(
        'click',
        () => {
            section.remove();
        },
        { once: true },
    );
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

const toggleSection = (section, isVisible) => {
    const sectionElement = document.querySelector(`.${section}-section`);
    if (isVisible) sectionElement.classList.remove('disabled');
    else sectionElement.classList.add('disabled');
};

const enableLoadingBtn = (isLoading, currentBtn) => {
    currentBtn.disabled = isLoading;
    currentBtn.querySelector('.spinner').classList.toggle('disabled');
};

const disableButtons = (isDisabled) => {
    const buttons = document.querySelectorAll('.main-content .buttons button');
    buttons.forEach((button) => {
        button.disabled = isDisabled;
    });
};

export { initializeApp };
