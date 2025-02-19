import { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
import { SpotifyContextType, ConfirmationModalProps, DecadeResults } from '../types';

const ConfirmationModal = ({ playlistsToCreate, onClose, onFinish }: ConfirmationModalProps) => {
    const { accessToken } = useSpotify() as SpotifyContextType;
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [currentProgress, setCurrentProgress] = useState<DecadeResults[]>([]);

    const handleConfirm = async () => {
        setIsCreating(true);
        const creationResults = [];

        for (const decade in playlistsToCreate) {
            try {
                const playlistId = await SpotifyAPI.createPlaylist(accessToken, `${decade}s`);
                await SpotifyAPI.addSongsToPlaylist(accessToken, playlistId, playlistsToCreate[decade]);

                const result = {
                    decade,
                    count: playlistsToCreate[decade].length,
                };
                creationResults.push(result);
                setCurrentProgress((prev) => [...prev, result]);
            } catch (error) {
                console.error(`Error creating playlist for ${decade}:`, error);
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
                            {Object.entries(playlistsToCreate).map(([decade, songs]) => (
                                <p key={decade}>
                                    "{decade}s" with {songs.length} songs
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
                                    Added {count} songs to "{decade}s" playlist
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
