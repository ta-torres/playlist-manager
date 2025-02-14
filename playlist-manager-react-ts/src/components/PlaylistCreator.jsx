import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import SpotifyAPI from '../modules/api';
import { parseSongsByDecade } from '../modules/utils';
import ConfirmationModal from './ConfirmationModal';
import ResultsModal from './ResultsModal';

const PlaylistCreator = () => {
    const { accessToken } = useSpotify();
    const [isLoading, setIsLoading] = useState(false);
    const [playlistsToCreate, setPlaylistsToCreate] = useState(null);
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleCreatePlaylist = async () => {
        setIsLoading(true);
        try {
            const songs = await SpotifyAPI.getLikedSongs(accessToken);
            const decades = parseSongsByDecade(songs);
            setPlaylistsToCreate(decades);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = (results) => {
        setPlaylistsToCreate(null);
        setResults(results);
        setShowResults(true);
    };

    return (
        <section className="create-playlists">
            <h2>Playlists</h2>
            <div className="buttons">
                <button
                    className="create-playlist-btn btn"
                    onClick={handleCreatePlaylist}
                    disabled={isLoading}
                >
                    <span className="btn-text">Create playlists by decade</span>
                    {isLoading && <span className="spinner" />}
                </button>
            </div>

            {playlistsToCreate && (
                <ConfirmationModal
                    playlistsToCreate={playlistsToCreate}
                    onClose={() => setPlaylistsToCreate(null)}
                    onFinish={handleConfirm}
                />
            )}

            {showResults && (
                <ResultsModal
                    results={results}
                    onClose={() => setShowResults(false)}
                />
            )}
        </section>
    );
};

export default PlaylistCreator;
