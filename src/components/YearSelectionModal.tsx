import { useState } from 'react';

interface YearSelectionModalProps {
    onClose: () => void;
    onConfirm: (selectedYears: number[]) => void;
    availableYears: number[];
}

const YearSelectionModal = ({ onClose, onConfirm, availableYears }: YearSelectionModalProps) => {
    const [selectedYears, setSelectedYears] = useState<number[]>([]);

    const handleYearToggle = (year: number) => {
        setSelectedYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]));
    };

    const handleSubmit = () => {
        if (selectedYears.length > 0) {
            onConfirm(selectedYears);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Select Years for Playlists</h2>
                <div className="year-selection">
                    {availableYears.map((year) => (
                        <label key={year} className="year-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedYears.includes(year)}
                                onChange={() => handleYearToggle(year)}
                            />
                            {year}
                        </label>
                    ))}
                </div>
                <div className="buttons">
                    <button className="confirm-btn btn" onClick={handleSubmit} disabled={selectedYears.length === 0}>
                        Create Playlists
                    </button>
                    <button className="cancel-btn btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YearSelectionModal;
