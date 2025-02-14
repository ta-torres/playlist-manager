const ResultsModal = ({ results, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Playlists created</h2>
                <div className="results-message">
                    {results.map(({ decade, count }) => (
                        <p key={decade}>
                            Added {count} songs to "{decade}s" playlist
                        </p>
                    ))}
                </div>
                <div className="buttons">
                    <button className="confirm-btn btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsModal;
