import React, { useState } from 'react';

const EntryModal = ({ entry, student, students, masterData, onSave, onClose }) => {
    const [formData, setFormData] = useState(entry || {
        studentId: student?.id || '',
        subject: '',
        observations: '',
        measures: '',
        erfolg: '',
        erfolgRating: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Kind</label>
                        <select
                            className="form-select"
                            value={formData.studentId}
                            onChange={(e) =>
                                setFormData({ ...formData, studentId: parseInt(e.target.value) })
                            }
                            required
                        >
                            <option value="">Bitte wählen</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Thema</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.subject}
                            onChange={(e) =>
                                setFormData({ ...formData, subject: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Beobachtungen</label>
                        <textarea
                            className="form-textarea"
                            value={formData.observations}
                            onChange={(e) =>
                                setFormData({ ...formData, observations: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Maßnahmen</label>
                        <textarea
                            className="form-textarea"
                            value={formData.measures}
                            onChange={(e) =>
                                setFormData({ ...formData, measures: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Erfolg</label>
                        <textarea
                            className="form-textarea"
                            value={formData.erfolg}
                            onChange={(e) =>
                                setFormData({ ...formData, erfolg: e.target.value })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bewertung</label>
                        <select
                            className="form-select"
                            value={formData.erfolgRating}
                            onChange={(e) =>
                                setFormData({ ...formData, erfolgRating: e.target.value })
                            }
                        >
                            <option value="">Keine Bewertung</option>
                            <option value="positiv">Positiv</option>
                            <option value="negativ">Negativ</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="button button-danger"
                            onClick={onClose}
                        >
                            Abbrechen
                        </button>
                        <button type="submit" className="button button-success">
                            Speichern
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
