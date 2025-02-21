import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import { IoMdHeart } from 'react-icons/io';
import { RiPlayList2Fill } from 'react-icons/ri';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
// @ts-expect-error not typed yet
import { parseSongs, parsePlaylists } from '../modules/utils';
import { Playlist, Song, SpotifyContextType } from '../types';

export interface LibraryProps {
    setActiveView: (view: 'songs' | 'playlists' | null) => void;
    setLikedSongs: (songs: Song[]) => void;
    setPlaylists: (playlists: Playlist[]) => void;
}

export function Library({ setActiveView, setLikedSongs, setPlaylists }: LibraryProps) {
    const { accessToken } = useSpotify() as SpotifyContextType;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLikedSongs = async () => {
        setIsLoading(true);
        try {
            const songs = await SpotifyAPI.getLikedSongs(accessToken, 20);
            const parsedSongs = await parseSongs(songs);
            setLikedSongs(parsedSongs);
            setActiveView('songs');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlaylists = async () => {
        setIsLoading(true);
        try {
            const playlistData = await SpotifyAPI.getPlaylists(accessToken);
            const parsedPlaylists = await parsePlaylists(playlistData);
            setPlaylists(parsedPlaylists);
            setActiveView('playlists');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="my-library">
            <h2>Your Library</h2>
            <div className="buttons">
                <button className="liked-songs-btn btn" onClick={handleLikedSongs} disabled={isLoading}>
                    {isLoading ? (
                        <span className="spinner" />
                    ) : (
                        <span className="btn-text">
                            <IoMdHeart className="icon" />
                            Liked Songs
                        </span>
                    )}
                </button>
                <button className="show-playlists-btn btn" onClick={handlePlaylists} disabled={isLoading}>
                    {isLoading ? (
                        <span className="spinner" />
                    ) : (
                        <span className="btn-text">
                            <RiPlayList2Fill className="icon" />
                            Playlists
                        </span>
                    )}
                </button>
            </div>
        </section>
    );
}
