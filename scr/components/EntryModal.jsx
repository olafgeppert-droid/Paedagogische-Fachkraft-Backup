// src/components/EntryModal.jsx
import React, { useState } from 'react';

const EntryModal = ({ onClose, onSave, masterData, student, date, existingEntry }) => {
    const [formData, setFormData] = useState(() => {
        if (existingEntry) {
            // Map old field names to new ones if they exist
            return {
                ...existingEntry,
                subject: existingEntry.subject || existingEntry.topic || '', // New or old
                observations: existingEntry.observations || existingEntry.notes || '', // New or old
                measures: existingEntry.measures || existingEntry.activity || '', // New or old
                erfolg: existingEntry.erfolg || '',
                erfolgRating: existingEntry.erfolgRating || existingEntry.bewertung || '', // New or old
            };
        }
        return {
            subject: '',
            observations: '',
            measures: '',
            erfolg: '',
            erfolgRating: '',
            studentId: student?.id || null,
            date: date || new Date().toISOString().split('T')[0],
        };
    });

    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleCancel = () => {
        const initialFormData = existingEntry ? {
            ...existingEntry,
            subject: existingEntry.subject || existingEntry.topic || '',
            observations: existingEntry.observations || existingEntry.notes || '',
            measures: existingEntry.measures || existingEntry.activity || '',
            erfolg: existingEntry.erfolg || '',
            erfolgRating: existingEntry.erfolgRating || existingEntry.bewertung || '',
        } : {
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
                            <textarea
                                className="form-textarea large"
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

                        {/* Notizen-Vorlagen (wenn vorhanden) */}
                        {masterData.notesTemplates && masterData.notesTemplates.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Notizen-Vorlagen</label>
                                <select
                                    className="form-select"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleChange('observations', (formData.observations ? formData.observations + '\n' : '') + e.target.value);
                                            e.target.value = ''; // Reset select
                                        }
                                    }}
                                >
                                    <option value="">Vorlage auswählen…</option>
                                    {masterData.notesTemplates.map((tpl, idx) => (
                                        <option key={idx} value={tpl}>{tpl}</option>
                                    ))}
                                </select>
                            </div>
                        )}

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
// Styles (optional Inline Styles, falls nicht in CSS) - Beibehalten für Vollständigkeit,
// aber die tatsächlichen Stile kommen aus den CSS-Dateien
// =======================
const modalOverlayStyle = { /* ... */ };
const modalStyle = { /* ... */ };
const headerStyle = { /* ... */ };
const closeButtonStyle = { /* ... */ };
const formGroupStyle = { /* ... */ };
const labelStyle = { /* ... */ };
const inputStyle = { /* ... */ };
const textareaStyle = { /* ... */ };
const selectStyle = { /* ... */ };
const formActionsStyle = { /* ... */ };
const buttonStyle = { /* ... */ };
const buttonPrimaryStyle = { /* ... */ };
const buttonDangerStyle = { /* ... */ };

export default EntryModal;
