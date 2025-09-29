// src/components/EntryModal.jsx
import React, { useState } from 'react';
 
const EntryModal = ({ onClose, onSave, masterData, student, date, existingEntry }) => {
    const [formData, setFormData] = useState(existingEntry || {
        subject: '',
        observations: '',
        measures: '',
        erfolg: '', // Text field for success
        erfolgRating: '', // Select field for rating
        studentId: student?.id || null,
        date: date || new Date().toISOString().split('T')[0],
    });
 
    const [showConfirmClose, setShowConfirmClose] = useState(false);
 
    // Formular absenden
    const handleSubmit = async (e) => { // Made async
        e.preventDefault();
        await onSave(formData); // Await the save operation
        // onClose() is now handled by the parent App.jsx after onSave completes.
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
        // Check if formData has changed from its initial state (existingEntry or default empty)
        // Convert dates to string for comparison, as new Date() might create different objects
        const currentFormDataNormalized = { ...formData, date: formData.date ? new Date(formData.date).toISOString().split('T')[0] : '' };
        const initialFormDataNormalized = { ...initialFormData, date: initialFormData.date ? new Date(initialFormData.date).toISOString().split('T')[0] : '' };
 
        if (JSON.stringify(currentFormDataNormalized) !== JSON.stringify(initialFormDataNormalized)) {
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
 
                        {/* Fach / Thema (als Freitextfeld, ohne Vorbelegung aus Stammdaten) */}
                        <div className="form-group">
                            <label className="form-label">Fach / Thema</label>
                            <input // Geändert von select zu input type="text"
                                type="text"
                                className="form-input"
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                required
                                placeholder="Fach oder Thema eingeben..."
                            />
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
 
                        {/* Notizen-Vorlagen (using masterData.notesTemplates) */}
                        <div className="form-group">
                            <label className="form-label">Notizen-Vorlagen</label>
                            <select
                                className="form-select"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleChange('observations', formData.observations + '\n' + e.target.value);
                                        e.target.value = ''; // Reset select to "Vorlage auswählen"
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
 
export default EntryModal;
