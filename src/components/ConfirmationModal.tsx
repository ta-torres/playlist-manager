import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
import { SpotifyContextType, DecadeResults } from '../types';

interface ConfirmationModalProps {
    playlistsToCreate: Record<string, string[]>;
    onClose: () => void;
    onFinish: (results: DecadeResults[]) => void;
    groupingType: 'decade' | 'year';
}

const ConfirmationModal = ({ playlistsToCreate, onClose, onFinish, groupingType }: ConfirmationModalProps) => {
    const { accessToken } = useSpotify() as SpotifyContextType;
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [currentProgress, setCurrentProgress] = useState<DecadeResults[]>([]);

    const getPlaylistName = (key: string) => {
        return groupingType === 'decade' ? `${key}s` : key;
    };

    const handleConfirm = async () => {
        setIsCreating(true);
        const creationResults = [];

        for (const key in playlistsToCreate) {
            try {
                const playlistName = getPlaylistName(key);
                const playlistId = await SpotifyAPI.createPlaylist(accessToken, playlistName);
                await SpotifyAPI.addSongsToPlaylist(accessToken, playlistId, playlistsToCreate[key]);

                const result = {
                    decade: key,
                    count: playlistsToCreate[key].length,
                };
                creationResults.push(result);
                setCurrentProgress((prev) => [...prev, result]);
            } catch (error) {
                console.error(`Error creating playlist for ${key}:`, error);
            }
        }

        setIsCreating(false);
        onFinish(creationResults);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                {!isCreating ? (
                    <>
                        <h2 className="modal-title">The following playlists will be created</h2>
                        <div className="confirmation-message">
                            {Object.entries(playlistsToCreate).map(([key, songs]) => (
                                <p key={key}>
                                    "{getPlaylistName(key)}" with {songs.length} songs
                                </p>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="modal-title">Creating playlists...</h2>
                        <div className="confirmation-message">
                            {currentProgress.map(({ decade, count }) => (
                                <p key={decade}>
                                    Added {count} songs to "{getPlaylistName(decade)}" playlist
                                </p>
                            ))}
                            {isCreating && <span className="spinner" />}
                        </div>
                    </>
                )}
                <div className="buttons">
                    {!isCreating && (
                        <>
                            <button className="confirm-btn btn" onClick={handleConfirm} disabled={isCreating}>
                                Confirm
                            </button>
                            <button className="cancel-btn btn" onClick={onClose} disabled={isCreating}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
