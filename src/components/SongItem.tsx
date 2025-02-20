import { Song } from '../types';
import { FaSpotify } from 'react-icons/fa6';

interface SongItemProps {
    song: Song;
}

export function SongItem({ song }: SongItemProps) {
    return (
        <li>
            <div className="details">
                <div className="cover">
                    <a
                        href={`https://open.spotify.com/track/${song.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Spotify"
                    >
                        <img src={song.cover} width={64} height={64} alt={`${song.title} cover`} />
                    </a>
                </div>
                <div className="info">
                    <p className="title">
                        <a
                            href={`https://open.spotify.com/track/${song.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spotify-link"
                        >
                            {song.title}
                            <FaSpotify className="spotify-icon" />
                        </a>
                    </p>
                    <p className="description">{song.artist}</p>
                </div>
            </div>
            <div className="stats">
                <p className="stat-1">
                    {song.duration.minutes}:{song.duration.seconds}
                </p>
                <p className="stat-2">{song.releaseDate}</p>
            </div>
        </li>
    );
}

export default SongItem;
