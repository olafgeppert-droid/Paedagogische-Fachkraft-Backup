// src/components/EntryModal.jsx
import React, { useState } from 'react';

const EntryModal = ({ onClose, onSave, masterData, student, date, existingEntry }) => {
    const [formData, setFormData] = useState(existingEntry || {
        subject: '',
        observations: '',
        measures: '',
        erfolg: '',
        erfolgRating: '',
        studentId: student?.id || null,
        date: date || new Date().toISOString().split('T')[0],
    });

    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Formular absenden
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    // Eingabeänderungen
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    // Abbrechen mit Prüfung
    const handleCancel = () => {
        const initialFormData = existingEntry || {
            subject: '',
            observations: '',
            measures: '',
            erfolg: '',
            erfolgRating: '',
            studentId: student?.id || null,
            date: date || new Date().toISOString().split('T')[0],
        };
        if (JSON.stringify(formData) !== JSON.stringify(initialFormData)) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal large">
                <div className="modal-header">
                    <h2>{existingEntry ? 'Eintrag bearbeiten' : 'Neuen Eintrag hinzufügen'}</h2>
                    <button className="modal-close" onClick={handleCancel}>×</button>
                </div>

                {showConfirmClose ? (
                    <div className="confirm-close">
                        <h3>Änderungen verwerfen?</h3>
                        <p>Sie haben Änderungen vorgenommen, die noch nicht gespeichert sind.</p>
                        <div className="form-actions">
                            <button type="button" className="button" onClick={() => setShowConfirmClose(false)}>
                                Zurück
                            </button>
                            <button type="button" className="button button-danger" onClick={onClose}>
                                Verwerfen
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="entry-form">
                        {/* Schüler */}
                        <div className="form-group">
                            <label className="form-label">Schüler</label>
                            <input
                                type="text"
                                className="form-input"
                                value={student?.name || ''}
                                disabled
                            />
                        </div>

                        {/* Datum */}
                        <div className="form-group">
                            <label className="form-label">Datum</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                required
                            />
                        </div>

                        {/* Fach / Thema */}
                        <div className="form-group">
                            <label className="form-label">Fach / Thema</label>
                            <select
                                className="form-select"
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                required
                            >
                                <option value="">Bitte wählen</option>
                                {masterData.subjects && masterData.subjects.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        {/* Beobachtungen */}
                        <div className="form-group">
                            <label className="form-label">Beobachtungen</label>
                            <textarea
                                className="form-textarea"
                                value={formData.observations}
                                onChange={(e) => handleChange('observations', e.target.value)}
                                required
                            />
                        </div>

                        {/* Maßnahmen */}
                        <div className="form-group">
                            <label className="form-label">Maßnahmen</label>
                            <textarea
                                className="form-textarea"
                                value={formData.measures}
                                onChange={(e) => handleChange('measures', e.target.value)}
                                required
                            />
                        </div>

                        {/* Erfolg */}
                        <div className="form-group">
                            <label className="form-label">Erfolg</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.erfolg}
                                onChange={(e) => handleChange('erfolg', e.target.value)}
                            />
                        </div>

                        {/* Erfolgsbewertung */}
                        <div className="form-group">
                            <label className="form-label">Erfolgsbewertung</label>
                            <select
                                className="form-select"
                                value={formData.erfolgRating}
                                onChange={(e) => handleChange('erfolgRating', e.target.value)}
                            >
                                <option value="">Bitte wählen</option>
                                <option value="positiv">positiv</option>
                                <option value="negativ">negativ</option>
                            </select>
                        </div>

                        {/* Notizen-Vorlagen */}
                        <div className="form-group">
                            <label className="form-label">Notizen-Vorlagen</label>
                            <select
                                className="form-select"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleChange('observations', formData.observations + '\n' + e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            >
                                <option value="">Vorlage auswählen…</option>
                                {masterData.notesTemplates && masterData.notesTemplates.map((tpl, idx) => (
                                    <option key={idx} value={tpl}>{tpl}</option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="form-actions">
                            <button type="button" className="button" onClick={handleCancel}>
                                ❌ Abbrechen
                            </button>
                            <button type="submit" className="button button-primary">
                                ✔️ Speichern
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// =======================
// Styles (optional Inline Styles, falls nicht in CSS)
// =======================
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
};

const formGroupStyle = {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
};

const inputStyle = {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

const textareaStyle = {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '80px',
};

const selectStyle = {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
};

const formActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
};

const buttonStyle = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const buttonPrimaryStyle = {
    ...buttonStyle,
    backgroundColor: '#4caf50',
    color: '#fff',
};

const buttonDangerStyle = {
    ...buttonStyle,
    backgroundColor: '#f44336',
    color: '#fff',
};

export default EntryModal;
