import { Playlist } from '../types';

interface PlaylistItemProps {
    playlist: Playlist;
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
    return (
        <li>
            <div className="details">
                <div className="info">
                    <p className="title">{playlist.title}</p>
                    <p className="description">{playlist.description}</p>
                </div>
            </div>
            <div className="stats">
                <p className="stat-1">{playlist.tracks}</p>
                <p className="stat-2">{playlist.owner}</p>
            </div>
        </li>
    );
}

export default PlaylistItem;
