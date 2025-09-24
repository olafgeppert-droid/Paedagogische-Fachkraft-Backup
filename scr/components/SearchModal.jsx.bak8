import React, { useState } from 'react';

const SearchModal = ({ onClose, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [rating, setRating] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const criteria = { type: searchType, value: searchType === 'rating' ? rating : searchTerm.trim() };
        onSearch(criteria);
        onClose();
    };

    return (
        <div className="modal-overlay" style={overlayStyle}>
            <div className="modal" style={modalStyle}>
                <header style={headerStyle}>
                    <h2>🔍 Protokoll suchen</h2>
                    <button onClick={onClose} style={closeButtonStyle}>×</button>
                </header>

                <p style={hintStyle}>
                    Für exakte Suche setzen Sie den Suchbegriff in Anführungszeichen, z. B. „Mathematik: Addieren“ findet nur Einträge mit exakt diesem Eintrag.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={formGroupStyle}>
                        <label htmlFor="searchType">Suchkriterium:</label>
                        <select
                            id="searchType"
                            value={searchType}
                            onChange={(e) => { setSearchType(e.target.value); setSearchTerm(''); setRating(''); }}
                            style={selectStyle}
                        >
                            <option value="all">Allgemein</option>
                            <option value="name">Name</option>
                            <option value="topic">Thema</option>
                            <option value="rating">Erfolgsbewertung</option>
                        </select>
                    </div>

                    {searchType !== 'rating' && (
                        <div style={formGroupStyle}>
                            <label htmlFor="searchTerm">Suchbegriff:</label>
                            <input
                                id="searchTerm"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Begriff eingeben..."
                                required
                                style={inputStyle}
                            />
                        </div>
                    )}

                    // In SearchModal.jsx - ersetzen Sie den rating select:
{searchType === 'rating' && (
    <div style={formGroupStyle}>
        <label htmlFor="rating">Erfolgsbewertung:</label>
        <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
            style={selectStyle}
        >
            <option value="">-- auswählen --</option>
            <option value="positiv">positiv (Sehr gut, Gut, Erfolg)</option>
            <option value="negativ">negativ (Schlecht, Probleme, Hilfe)</option>
            <option value="leer">leer (keine Bewertung)</option>
            <option value="sehr gut">Sehr gut</option>
            <option value="gut">Gut</option>
            <option value="schlecht">Schlecht</option>
        </select>
    </div>
)}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={buttonSecondaryStyle}>❌ Abbrechen</button>
                        <button type="submit" style={buttonSuccessStyle}>✔️ OK</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =======================
// Styles (inline)
// =======================
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999
};

const modalStyle = {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
};

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const closeButtonStyle = { fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' };
const formGroupStyle = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const inputStyle = { padding: '0.5rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' };
const selectStyle = { padding: '0.5rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' };
const buttonSecondaryStyle = { padding: '0.5rem 1rem', background: '#ccc', borderRadius: '6px', border: 'none', cursor: 'pointer' };
const buttonSuccessStyle = { padding: '0.5rem 1rem', background: '#4caf50', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' };
const hintStyle = { fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' };

export default SearchModal;
