import React, { useState } from 'react';
import { setupDB, loadSampleData, clearAllData } from '../database';

const SettingsModal = ({
    settings,
    masterData,
    onSave,
    onSaveMasterData,
    onClose,
    setStudents,
    setEntries,
    setSelectedStudent,
    setSettings
}) => {
    const [formData, setFormData] = useState(settings || {
        theme: 'hell',
        fontSize: 16,
        inputFontSize: 16
    });

    const [masterFormData, setMasterFormData] = useState({
        schoolYears: masterData?.schoolYears || [],
        schools: masterData?.schools || {},
        subjects: masterData?.subjects || [],
        activities: masterData?.activities || [],
        notesTemplates: masterData?.notesTemplates || []
    });

    const [showMasterDataModal, setShowMasterDataModal] = useState(false);

    const [customColors, setCustomColors] = useState({
        navigation: '#3498db',
        toolbar: '#2ecc71',
        header: '#e74c3c',
        windowBackground: '#f39c12'
    });

    // =======================
    // Handlers
    // =======================
    const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, customColors });
    onClose(); // <-- Modal schließen nach Übernehmen
    };

    const handleMasterDataSubmit = (e) => {
        e.preventDefault();
        if (onSaveMasterData) {
            onSaveMasterData({
                schoolYears: masterFormData.schoolYears,
                schools: masterFormData.schools,
                subjects: masterFormData.subjects,
                activities: masterFormData.activities,
                notesTemplates: masterFormData.notesTemplates
            });
        }
        setShowMasterDataModal(false);
    };

    const resetToDefault = () => {
        setFormData({
            theme: 'hell',
            fontSize: 16,
            inputFontSize: 16
        });
        setCustomColors({
            navigation: '#3498db',
            toolbar: '#2ecc71',
            header: '#e74c3c',
            windowBackground: '#f39c12'
        });
        setTimeout(() => onClose(), 300);
    };

    // =======================
    // Stammdaten-Handling
    // =======================
    const addSchoolYear = () => {
        const newYear = prompt('Neues Schuljahr hinzufügen (Format: YYYY/YYYY):', '2025/2026');
        if (newYear && /^\d{4}\/\d{4}$/.test(newYear)) {
            if (!masterFormData.schoolYears.includes(newYear)) {
                setMasterFormData(prev => ({
                    ...prev,
                    schoolYears: [...prev.schoolYears, newYear].sort((a, b) => a.localeCompare(b))
                }));
            } else {
                alert('Dieses Schuljahr existiert bereits!');
            }
        } else if (newYear) {
            alert('Ungültiges Format. Bitte "YYYY/YYYY" eingeben.');
        }
    };

    const removeSchoolYear = (year) => {
        setMasterFormData(prev => ({
            ...prev,
            schoolYears: prev.schoolYears.filter(y => y !== year)
        }));
    };

    const addSchool = () => {
        const newSchool = prompt('Neue Schule hinzufügen:');
        if (newSchool && !masterFormData.schools[newSchool]) {
            setMasterFormData(prev => ({
                ...prev,
                schools: { ...prev.schools, [newSchool]: [] }
            }));
        } else if (newSchool) {
            alert('Diese Schule existiert bereits!');
        }
    };

    const removeSchool = (school) => {
        setMasterFormData(prev => {
            const newSchools = { ...prev.schools };
            delete newSchools[school];
            return { ...prev, schools: newSchools };
        });
    };

    const addClass = (school) => {
        const newClass = prompt('Neue Klasse hinzufügen:', 'Klasse 1a');
        if (newClass) {
            setMasterFormData(prev => {
                const currentClasses = prev.schools[school] || [];
                if (!currentClasses.includes(newClass)) {
                    return {
                        ...prev,
                        schools: {
                            ...prev.schools,
                            [school]: [...currentClasses, newClass].sort((a, b) => a.localeCompare(b))
                        }
                    };
                } else {
                    alert('Diese Klasse existiert bereits!');
                    return prev;
                }
            });
        }
    };

    const removeClass = (school, className) => {
        setMasterFormData(prev => ({
            ...prev,
            schools: {
                ...prev.schools,
                [school]: prev.schools[school].filter(c => c !== className)
            }
        }));
    };

    // =======================
    // Beispieldaten & Alle Daten löschen
    // =======================
    const handleLoadSampleData = async () => {
        if (!window.confirm('Beispieldaten laden? Alle vorhandenen Daten werden überschrieben!')) return;

        try {
            const db = await setupDB();
            await loadSampleData(db, (data) => {
                if (onSaveMasterData) onSaveMasterData(data);
            }, setStudents, setEntries);
            onClose();
            alert('Beispieldaten erfolgreich geladen! Bitte Browser-Seite ggf. neu laden.');
        } catch (error) {
            console.error('Fehler beim Laden der Beispieldaten:', error);
            alert('Fehler beim Laden der Beispieldaten: ' + (error.message || error));
        }
    };

    const handleClearAllData = async () => {
        if (!window.confirm('Alle Daten löschen? Diese Aktion ist endgültig!')) return;

        try {
            const db = await setupDB();
            await clearAllData(db, setStudents, setEntries, setSettings, onSaveMasterData);
            if (setSelectedStudent) setSelectedStudent(null);
            onClose();
        } catch (error) {
            console.error('Fehler beim Löschen aller Daten:', error);
            alert('Fehler beim Löschen aller Daten: ' + (error.message || error));
        }
    };

    // =======================
    // JSX Return
    // =======================
    return (
        <>
            <div className="modal-overlay">
                <div className="modal settings-modal">
                    <div className="modal-header">
                        <h2>⚙️ Einstellungen</h2>
                        <button className="modal-close" onClick={onClose} aria-label="Schließen">✖️</button>
                    </div>
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            {/* Farbschema */}
                            <div className="settings-section">
                                <h3>🎨 Farbschema</h3>
                                <div className="theme-grid">
                                    {['hell','dunkel','farbig'].map(theme => (
                                        <div
                                            key={theme}
                                            className={`theme-card ${formData.theme === theme ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, theme })}
                                        >
                                            <div className={`theme-preview ${theme}-theme-preview`}>
                                                <div className="preview-header"></div>
                                                <div className="preview-toolbar"></div>
                                                <div className="preview-content"></div>
                                            </div>
                                            <div className="theme-info">
                                                <span className="radio-checkmark">
                                                    {theme === 'hell' ? '☀️' : theme === 'dunkel' ? '🌙' : '🌈'}
                                                </span>
                                                <span>{theme === 'hell' ? 'Standard (Hell)' : theme === 'dunkel' ? 'Dunkel' : 'Farbig'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {formData.theme === 'farbig' && (
                                    <div className="color-customization">
                                        <h4>🎨 Benutzerdefinierte Farben</h4>
                                        <div className="color-grid">
                                            {[
                                                { label: 'Navigation', key: 'navigation' },
                                                { label: 'Werkzeugleiste', key: 'toolbar' },
                                                { label: 'Header', key: 'header' },
                                                { label: 'Fenster-Hintergrund', key: 'windowBackground' }
                                            ].map(color => (
                                                <div key={color.key} className="color-item">
                                                    <label>{color.label}</label>
                                                    <div className="color-input-group">
                                                        <input
                                                            type="color"
                                                            value={customColors[color.key]}
                                                            onChange={(e) => setCustomColors(prev => ({ ...prev, [color.key]: e.target.value }))}
                                                            className="color-picker"
                                                        />
                                                        <span className="color-value">{customColors[color.key]}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Schriftgrößen */}
                            <div className="settings-section">
                                <h3>📝 Schriftgrößen</h3>
                                <div className="slider-group">
                                    {[
                                        { label: 'Labels', value: formData.fontSize, key: 'fontSize' },
                                        { label: 'Eingabefelder', value: formData.inputFontSize, key: 'inputFontSize' }
                                    ].map(slider => (
                                        <div key={slider.key} className="slider-item">
                                            <label className="slider-label">
                                                <span className="label-text">Schriftgröße {slider.label}</span>
                                                <span className="label-size">{slider.value}px</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="12"
                                                max="24"
                                                value={slider.value}
                                                onChange={(e) => setFormData(prev => ({ ...prev, [slider.key]: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stammdaten */}
                            <div className="settings-section">
                                <h3>📊 Stammdaten</h3>
                                <button type="button" className="button button-primary" onClick={() => setShowMasterDataModal(true)}>
                                    📋 Stammdaten verwalten
                                </button>
                                <div className="settings-action-buttons" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                    <button type="button" className="button button-warning" onClick={handleLoadSampleData}>
                                        📂 Beispieldaten laden
                                    </button>
                                    <button type="button" className="button button-danger" onClick={handleClearAllData}>
                                        🗑️ Alle Daten löschen
                                    </button>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="modal-actions">
                                <button type="button" className="button button-secondary" onClick={resetToDefault}>
                                    🔄 Standardeinstellungen
                                </button>
                                <div className="action-group">
                                    <button type="button" className="button button-outline" onClick={onClose}>
                                        ❌ Abbrechen
                                    </button>
                                    <button type="submit" className="button button-primary">
                                        ✅ Übernehmen
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Stammdaten Modal */}
            {showMasterDataModal && (
                <div className="modal-overlay">
                    <div className="modal masterdata-modal">
                        <div className="modal-header">
                            <h2>🗂️ Stammdaten verwalten</h2>
                            <button className="modal-close" onClick={() => setShowMasterDataModal(false)}>✖️</button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleMasterDataSubmit}>
                                <div className="masterdata-container">
                                    <div className="masterdata-column">
                                        <h4>Schuljahre</h4>
                                        <ul>
                                            {masterFormData.schoolYears.map(y => (
                                                <li key={y}>
                                                    {y} <button type="button" onClick={() => removeSchoolYear(y)}>✖️</button>
                                                </li>
                                            ))}
                                        </ul>
                                        <button type="button" className="button button-small" onClick={addSchoolYear}>➕ Schuljahr</button>
                                    </div>

                                    <div className="masterdata-column">
                                        <h4>Schulen & Klassen</h4>
                                        {Object.keys(masterFormData.schools).map(school => (
                                            <div key={school} className="school-card">
                                                <div className="school-header">
                                                    <h4>{school}</h4>
                                                    <button type="button" onClick={() => removeSchool(school)}>✖️</button>
                                                </div>
                                                <div className="classes-list">
                                                    {masterFormData.schools[school].map(cls => (
                                                        <div key={cls} className="class-item">
                                                            <span>{cls}</span>
                                                            <button type="button" onClick={() => removeClass(school, cls)}>✖️</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button type="button" className="button button-small" onClick={() => addClass(school)}>➕ Klasse</button>
                                            </div>
                                        ))}
                                        <button type="button" className="button button-small" onClick={addSchool}>➕ Schule</button>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="button button-outline" onClick={() => setShowMasterDataModal(false)}>❌ Abbrechen</button>
                                    <button type="submit" className="button button-primary">✅ Speichern</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsModal;
