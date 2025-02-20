import { Playlist } from '../types';
import { FaSpotify } from 'react-icons/fa6';

interface PlaylistItemProps {
    playlist: Playlist;
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
    return (
        <li>
            <div className="details">
                <div className="info">
                    <p className="title">
                        <a
                            href={`https://open.spotify.com/playlist/${playlist.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotify-link"
                        >
                            {playlist.title}
                            <FaSpotify className="spotify-icon" />
                        </a>
                    </p>
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
