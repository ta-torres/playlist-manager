export interface SpotifyProfile {
    id: string;
    display_name: string;
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    cover: string;
    releaseDate: number;
    duration: {
        minutes: number;
        seconds: number;
    };
}

export interface Playlist {
    id: string;
    title: string;
    description: string;
    cover: string;
    tracks: number;
    owner: string;
}

export interface SpotifyContextType {
    accessToken: string | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export interface LibraryProps {
    setActiveView: (view: 'songs' | 'playlists' | null) => void;
    setLikedSongs: (songs: Song[]) => void;
    setPlaylists: (playlists: Playlist[]) => void;
}

export interface SongItemProps {
    song: Song;
}

export interface PlaylistItemProps {
    playlist: Playlist;
}

export interface ConfirmationModalProps {
    playlistsToCreate: Record<string, string[]>;
    onClose: () => void;
    onFinish: (results: DecadeResults[]) => void;
}

export interface ResultsModalProps {
    results: DecadeResults[];
    onClose: () => void;
}

export interface DecadeResults {
    decade: string;
    count: number;
}

export interface ConfirmationModalProps {
    playlistsToCreate: Record<string, string[]>;
    onClose: () => void;
    onFinish: (results: DecadeResults[]) => void;
}
