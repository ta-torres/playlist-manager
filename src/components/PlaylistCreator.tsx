import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
// @ts-expect-error not typed yet
import { parseSongsByDecade, parseSongsByYear, parseSongs } from '../modules/utils';
import ConfirmationModal from './ConfirmationModal';
import ResultsModal from './ResultsModal';
import YearSelectionModal from './YearSelectionModal';
import { SpotifyContextType, DecadeResults, Song } from '../types';

const PlaylistCreator = () => {
    const { accessToken } = useSpotify() as SpotifyContextType;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [playlistsToCreate, setPlaylistsToCreate] = useState<Record<string, string[]> | null>(null);
    const [results, setResults] = useState<DecadeResults[] | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [showYearSelection, setShowYearSelection] = useState<boolean>(false);
    const [songs, setSongs] = useState<Song[]>([]);

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

    const handleCreateYearPlaylist = async () => {
        setIsLoading(true);
        try {
            const songsData = await SpotifyAPI.getLikedSongs(accessToken);
            const parsedSongs = await parseSongs(songsData);
            setSongs(parsedSongs);
            setShowYearSelection(true);
        } finally {
            setIsLoading(false);
        }
    };
    const handleYearSelection = (selectedYears: number[]) => {
        const yearPlaylists = parseSongsByYear(songs, selectedYears);
        setPlaylistsToCreate(yearPlaylists);
        setShowYearSelection(false);
    };

    const handleConfirm = (results: DecadeResults[]) => {
        setPlaylistsToCreate(null);
        setResults(results);
        setShowResults(true);
    };

    return (
        <section className="create-playlists">
            <h2>Playlists</h2>
            <div className="buttons">
                <button className="create-playlist-btn btn" onClick={handleCreatePlaylist} disabled={isLoading}>
                    <span className="btn-text">Create playlists by decade</span>
                    {isLoading && <span className="spinner" />}
                </button>
                <button className="create-playlist-btn btn" onClick={handleCreateYearPlaylist} disabled={isLoading}>
                    <span className="btn-text">Create playlists by year</span>
                    {isLoading && <span className="spinner" />}
                </button>
            </div>

            {showYearSelection && (
                <YearSelectionModal
                    onClose={() => setShowYearSelection(false)}
                    onConfirm={handleYearSelection}
                    availableYears={Array.from(new Set(songs.map((song) => song.releaseDate))).sort()}
                    playlistSongsCounter={songs.reduce((total, song) => {
                        total[song.releaseDate] = (total[song.releaseDate] || 0) + 1;
                        return total;
                    }, {} as Record<number, number>)}
                />
            )}

            {playlistsToCreate && (
                <ConfirmationModal
                    playlistsToCreate={playlistsToCreate}
                    onClose={() => setPlaylistsToCreate(null)}
                    onFinish={handleConfirm}
                />
            )}

            {showResults && <ResultsModal results={results as DecadeResults[]} onClose={() => setShowResults(false)} />}
        </section>
    );
};

export default PlaylistCreator;
