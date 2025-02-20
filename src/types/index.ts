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
    isLoading: boolean;
}

export interface DecadeResults {
    decade: string;
    count: number;
}
