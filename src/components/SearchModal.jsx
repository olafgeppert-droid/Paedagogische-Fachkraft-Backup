// src/components/SearchModal.jsx
import React, { useState } from 'react';
 
const SearchModal = ({ onClose, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [rating, setRating] = useState('');
 
    const handleSubmit = (e) => {
        e.preventDefault();
 
        const safeValue = searchType === 'rating' ? (rating || '') : (searchTerm || '').trim();
 
        const criteria = {
            type: searchType || 'all',
            value: safeValue
        };
 
        if (criteria.type === 'all' || criteria.value.length > 0) {
            onSearch(criteria);
        } else if (criteria.type === 'rating' && (criteria.value === '' || criteria.value === 'leer')) {
             onSearch(criteria); // Allow searching for empty rating
        } else {
            // For other types, if value is empty, do not search
            // (onSearch handler in App.jsx also checks for !term.trim())
        }
 
        // 🔑 Wichtig: Modal nach Suche schließen
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
                    Für exakte Suche setzen Sie den Suchbegriff in Anführungszeichen, z. B. „Mathematik" findet nur Einträge mit exakt diesem Begriff.
                </p>
 
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={formGroupStyle}>
                        <label htmlFor="searchType">Suchkriterium:</label>
                        <select
                            id="searchType"
                            value={searchType}
                            onChange={(e) => {
                                setSearchType(e.target.value || 'all');
                                setSearchTerm('');
                                setRating('');
                            }}
                            style={selectStyle}
                        >
                            <option value="all">Allgemein (alle Felder)</option>
                            <option value="name">Schüler-Name</option>
                            <option value="topic">Thema/Aktivität</option>
                            <option value="rating">Erfolgsbewertung</option>
                        </select>
                    </div>
 
                    {searchType !== 'rating' && (
                        <div style={formGroupStyle}>
                            <label htmlFor="searchTerm">
                                {searchType === 'name' ? 'Schüler-Name:' :
                                 searchType === 'topic' ? 'Thema/Aktivität:' : 'Suchbegriff:'}
                            </label>
                            <input
                                id="searchTerm"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value || '')}
                                placeholder={
                                    searchType === 'name' ? 'Schülername eingeben...' :
                                    searchType === 'topic' ? 'Thema oder Aktivität eingeben...' :
                                    'Suchbegriff eingeben...'
                                }
                                style={inputStyle}
                            />
                        </div>
                    )}
 
                    {searchType === 'rating' && (
                        <div style={formGroupStyle}>
                            <label htmlFor="rating">Erfolgsbewertung:</label>
                            <select
                                id="rating"
                                value={rating}
                                onChange={(e) => setRating(e.target.value || '')}
                                style={selectStyle}
                            >
                                <option value="">-- Bewertung auswählen --</option>
                                <option value="positiv">positiv</option>
                                <option value="negativ">negativ</option>
                                <option value="leer">leer (keine Bewertung)</option> {/* Explicit option for empty */}
                            </select>
                        </div>
                    )}
 
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={buttonSecondaryStyle}>❌ Abbrechen</button>
                        <button type="submit" style={buttonSuccessStyle}>🔍 Suchen</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
 
// =======================
// Styles (inline) - kept as-is from user's provided SearchModal.jsx
// =======================
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999
};
 
const modalStyle = {
    backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '450px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
};
 
const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem'
};
 
const closeButtonStyle = {
    fontSize: '1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#666'
};
 
const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};
 
const inputStyle = {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
};
 
const selectStyle = {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
};
 
const buttonSecondaryStyle = {
    padding: '0.75rem 1.5rem',
    background: '#f0f0f0',
    borderRadius: '6px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontSize: '1rem'
};
 
const buttonSuccessStyle = {
    padding: '0.75rem 1.5rem',
    background: '#4caf50',
    color: '#fff',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
};
 
const hintStyle = {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '1rem',
    fontStyle: 'italic',
    lineHeight: '1.4'
};
 
export default SearchModal;
