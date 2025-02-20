import { Song } from '../types';

interface SongItemProps {
    song: Song;
}

export function SongItem({ song }: SongItemProps) {
    return (
        <li>
            <div className="details">
                <div className="cover">
                    <img src={song.cover} width={64} height={64} alt={`${song.title} cover`} />
                </div>
                <div className="info">
                    <p className="title">{song.title}</p>
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
