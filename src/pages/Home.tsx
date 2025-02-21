import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import { Library } from '../components/Library';
import PlaylistCreator from '../components/PlaylistCreator';
import SongItem from '../components/SongItem';
import PlaylistItem from '../components/PlaylistItem';
import Greeting from '../components/Greeting';
import Header from '../components/Header';
import { Song, Playlist, SpotifyContextType } from '../types';
import Footer from '../components/Footer';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
// @ts-expect-error not typed yet
import { parsePlaylists } from '../modules/utils';

const Home = () => {
    const { isAuthenticated, accessToken } = useSpotify() as SpotifyContextType;
    const [activeView, setActiveView] = useState<'songs' | 'playlists' | null>(null);
    const [likedSongs, setLikedSongs] = useState<Song[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handlePlaylistSelect = (playlistId: string) => {
        setSelectedPlaylists((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(playlistId)) {
                newSelection.delete(playlistId);
            } else {
                newSelection.add(playlistId);
            }
            return newSelection;
        });
    };

    const handleDeleteSelected = async () => {
        if (!selectedPlaylists.size) return;

        if (confirm(`Are you sure you want to delete ${selectedPlaylists.size} playlist(s)?`)) {
            setIsDeleting(true);
            try {
                const results = await Promise.allSettled(
                    Array.from(selectedPlaylists).map((id) => SpotifyAPI.deletePlaylist(accessToken, id)),
                );
                console.log(results);

                const playlistData = await SpotifyAPI.getPlaylists(accessToken);
                const parsedPlaylists = await parsePlaylists(playlistData);
                setPlaylists(parsedPlaylists);
                setSelectedPlaylists(new Set());
            } catch (error) {
                console.error('Error deleting selected playlists:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="page">
            <Header />
            <main className={`main-content ${!isAuthenticated ? 'disabled' : ''}`}>
                <Greeting />
                <section className="results-section disabled">
                    <h2>Playlists created</h2>
                    <span className="spinner disabled" />
                    <div className="results-message" />
                </section>
                <section className="my-library-section">
                    <Library setActiveView={setActiveView} setLikedSongs={setLikedSongs} setPlaylists={setPlaylists} />
                    <PlaylistCreator />
                </section>
                <section className="list-container">
                    <div className="list-header">
                        {activeView && <h2>{activeView === 'songs' ? 'Liked Songs' : 'My Playlists'}</h2>}

                        {activeView === 'playlists' && selectedPlaylists.size > 0 && (
                            <button className="delete-btn btn" onClick={handleDeleteSelected} disabled={isDeleting}>
                                Delete selected ({selectedPlaylists.size}){isDeleting && <span className="spinner" />}
                            </button>
                        )}
                    </div>
                    <ul className={activeView === 'playlists' ? 'playlists' : ''}>
                        {activeView === 'songs' && likedSongs.map((song) => <SongItem key={song.id} song={song} />)}
                        {activeView === 'playlists' &&
                            playlists.map((playlist) => (
                                <PlaylistItem
                                    key={playlist.id}
                                    playlist={playlist}
                                    isSelected={selectedPlaylists.has(playlist.id)}
                                    onSelect={() => handlePlaylistSelect(playlist.id)}
                                />
                            ))}
                    </ul>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
