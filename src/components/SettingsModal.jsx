import React, { useState, useEffect } from 'react';
// Removed setupDB, loadSampleData, clearAllData imports
 
const SettingsModal = ({
    settings,
    masterData,
    onClose,
    onSave,
    onSaveMasterData,
    onLoadSampleData, // New prop: App.jsx's handler
    onClearAllData    // New prop: App.jsx's handler
    // Removed setStudents, setEntries, setSelectedStudent, setSettings, onCaptureState
}) => {
    // =======================
    // Form-State
    // =======================
    const [formData, setFormData] = useState(settings || {
        theme: 'hell',
        fontSize: 16,
        inputFontSize: 16,
        customColors: {}
    });
 
    const [masterFormData, setMasterFormData] = useState({
        schoolYears: masterData?.schoolYears || [],
        schools: masterData?.schools || {},
        subjects: masterData?.subjects || [],
        activities: masterData?.activities || [],
        notesTemplates: masterData?.notesTemplates || []
    });
 
    const [showMasterDataModal, setShowMasterDataModal] = useState(false);
 
    const [customColors, setCustomColors] = useState(settings?.customColors && Object.keys(settings.customColors).length > 0 ? settings.customColors : {
        navigation: '#fed7aa',
        toolbar: '#f8fafc',
        header: '#dc2626',
        windowBackground: '#fef7ed'
    });
 
    useEffect(() => {
        setFormData(settings);
        if (settings?.customColors) {
            setCustomColors(settings.customColors);
        }
    }, [settings]);
 
    useEffect(() => {
        setMasterFormData(masterData);
    }, [masterData]);
 
 
    // =======================
    // Handlers
    // =======================
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({ ...formData, customColors });
        onClose();
    };
 
    const handleMasterDataSubmit = async (e) => {
        e.preventDefault();
        await onSaveMasterData(masterFormData);
        setShowMasterDataModal(false);
    };
 
    const resetToDefault = async () => {
        const defaultSettings = {
            theme: 'hell',
            fontSize: 16,
            inputFontSize: 16,
            customColors: {
                navigation: '#fed7aa',
                toolbar: '#f8fafc',
                header: '#dc2626',
                windowBackground: '#fef7ed'
            }
        };
        setFormData(defaultSettings);
        setCustomColors(defaultSettings.customColors);
 
        await onSave(defaultSettings);
    };
 
    // =======================
    // Stammdaten-Handling (CRUD for master data items)
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
        if (newSchool && newSchool.trim()) {
            if (!masterFormData.schools[newSchool]) {
                setMasterFormData(prev => ({
                    ...prev,
                    schools: { ...prev.schools, [newSchool]: [] }
                }));
            } else {
                alert('Diese Schule existiert bereits!');
            }
        } else if (newSchool) {
            alert('Schulname darf nicht leer sein.');
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
        if (newClass && newClass.trim()) {
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
        } else if (newClass) {
            alert('Klassenname darf nicht leer sein.');
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
    // Beispieldaten & Alle Daten löschen (Now calls App.jsx handlers)
    // =======================
    const handleLoadSampleDataClick = async () => {
        // App.jsx will handle confirmation, DB call, state updates, and history capture
        onLoadSampleData();
        onClose(); // Close modal after action is triggered
    };
 
    const handleClearAllDataClick = async () => {
        // App.jsx will handle confirmation, DB call, state updates, and history capture
        onClearAllData();
        onClose(); // Close modal after action is triggered
    };
 
    // =======================
    // JSX Return
    // =======================
    return (
        <>
            {/* Haupt-Einstellungen Modal */}
            <div className="modal-overlay">
                <div className="modal settings-modal">
                    <div className="modal-header">
                        <h2>⚙️ Einstellungen</h2>
                        <button className="modal-close" onClick={onClose} aria-label="Schließen">✖️</button>
                    </div>
 
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            {/* Theme Section */}
                            <div className="settings-section">
                                <h3>🎨 Farbschema</h3>
                                <div className="form-group">
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
                                                            aria-label={`Farbe für ${color.label}`}
                                                        />
                                                        <span className="color-value">{customColors[color.key]}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
 
                            {/* Schriftgrößen Section */}
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
                                                className="slider"
                                            />
                                            <div className="slider-scale">
                                                <span style={{fontSize: '12px'}}>A</span>
                                                <span style={{fontSize: '16px'}}>A</span>
                                                <span style={{fontSize: '20px'}}>A</span>
                                                <span style={{fontSize: '24px'}}>A</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
 
                            {/* Stammdaten Section */}
                            <div className="settings-section">
                                <h3>📊 Stammdaten</h3>
                                <div className="master-data-card">
                                    <p>Verwalten Sie Schuljahre, Schulen und Klassen, Fächer und Vorlagen.</p>
                                    <button
                                        type="button"
                                        className="button button-primary"
                                        onClick={() => setShowMasterDataModal(true)}
                                    >
                                        📋 Stammdaten verwalten
                                    </button>
                                </div>
                                {/* Removed Beispieldaten laden & Alle Daten löschen buttons from here */}
                            </div>
 
                            {/* Modal Actions */}
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-secondary button-back-to-main"
                                    onClick={resetToDefault}
                                >
                                    🔄 Standard
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
                            <h2>📊 Stammdaten verwalten</h2>
                            <button className="modal-close" onClick={() => setShowMasterDataModal(false)} aria-label="Schließen">✖️</button>
                        </div>
 
                        <div className="modal-content">
                            <form onSubmit={handleMasterDataSubmit}>
                                {/* Schuljahre Section */}
                                <div className="data-section">
                                    <h3>📅 Schuljahre</h3>
                                    <p className="section-description">Z.B. 2025/2026</p>
 
                                    <div className="data-list">
                                        {masterFormData.schoolYears && masterFormData.schoolYears.map(year => (
                                            <div key={year} className="data-item">
                                                <span className="item-text">{year}</span>
                                                <button
                                                    type="button"
                                                    className="button button-danger button-icon"
                                                    onClick={() => removeSchoolYear(year)}
                                                    title="Schuljahr löschen"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="button button-outline" onClick={addSchoolYear}>
                                        ➕ Schuljahr hinzufügen
                                    </button>
                                </div>
 
                                <div className="divider"></div>
 
                                {/* Schulen und Klassen Section */}
                                <div className="data-section">
                                    <h3>🏫 Schulen und Klassen</h3>
 
                                    <button type="button" className="button button-outline" onClick={addSchool}>
                                        ➕ Neue Schule hinzufügen
                                    </button>
 
                                    <div className="schools-list">
                                        {masterFormData.schools && Object.entries(masterFormData.schools).map(([school, classes]) => (
                                            <div key={school} className="school-card">
                                                <div className="school-header">
                                                    <h4>{school}</h4>
                                                    <button
                                                        type="button"
                                                        className="button button-danger button-icon"
                                                        onClick={() => removeSchool(school)}
                                                        title="Schule löschen"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
 
                                                <p className="classes-title">Klassen für "{school}"</p>
                                                <div className="classes-list">
                                                    {classes && classes.map(className => (
                                                        <div key={className} className="class-item">
                                                            <span className="item-text">{className}</span>
                                                            <button
                                                                type="button"
                                                                className="button button-danger button-icon"
                                                                onClick={() => removeClass(school, className)}
                                                                title="Klasse löschen"
                                                            >
                                                                ❌
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="button button-outline button-small"
                                                    onClick={() => addClass(school)}
                                                >
                                                    ➕ Klasse hinzufügen
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
 
                                <div className="divider"></div>
 
                                <div className="data-section">
                                    <h3>📚 Fächer / Themen</h3>
                                    <div className="data-list">
                                        {masterFormData.subjects.map((item, index) => (
                                            <div key={index} className="data-item">
                                                <span className="item-text">{item}</span>
                                                <button
                                                    type="button"
                                                    className="button button-danger button-icon"
                                                    onClick={() => setMasterFormData(prev => ({ ...prev, subjects: prev.subjects.filter((_, i) => i !== index) }))}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="button button-outline"
                                        onClick={() => {
                                            const newItem = prompt('Neues Fach/Thema hinzufügen:');
                                            if (newItem && newItem.trim() && !masterFormData.subjects.includes(newItem)) {
                                                setMasterFormData(prev => ({
                                                    ...prev,
                                                    subjects: [...prev.subjects, newItem].sort()
                                                }));
                                            } else if (newItem) {
                                                alert('Eingabe ungültig oder Fach/Thema existiert bereits.');
                                            }
                                        }}
                                    >
                                        ➕ Fach/Thema hinzufügen
                                    </button>
                                </div>
 
                                <div className="divider"></div>
 
                                <div className="data-section">
                                    <h3>🎯 Aktivitäten</h3>
                                    <div className="data-list">
                                        {masterFormData.activities.map((item, index) => (
                                            <div key={index} className="data-item">
                                                <span className="item-text">{item}</span>
                                                <button
                                                    type="button"
                                                    className="button button-danger button-icon"
                                                    onClick={() => setMasterFormData(prev => ({ ...prev, activities: prev.activities.filter((_, i) => i !== index) }))}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="button button-outline"
                                        onClick={() => {
                                            const newItem = prompt('Neue Aktivität hinzufügen:');
                                            if (newItem && newItem.trim() && !masterFormData.activities.includes(newItem)) {
                                                setMasterFormData(prev => ({
                                                    ...prev,
                                                    activities: [...prev.activities, newItem].sort()
                                                }));
                                            } else if (newItem) {
                                                alert('Eingabe ungültig oder Aktivität existiert bereits.');
                                            }
                                        }}
                                    >
                                        ➕ Aktivität hinzufügen
                                    </button>
                                </div>
 
                                <div className="divider"></div>
 
                                <div className="data-section">
                                    <h3>🗒️ Notizvorlagen</h3>
                                    <div className="data-list">
                                        {masterFormData.notesTemplates.map((item, index) => (
                                            <div key={index} className="data-item">
                                                <span className="item-text">{item}</span>
                                                <button
                                                    type="button"
                                                    className="button button-danger button-icon"
                                                    onClick={() => setMasterFormData(prev => ({ ...prev, notesTemplates: prev.notesTemplates.filter((_, i) => i !== index) }))}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="button button-outline"
                                        onClick={() => {
                                            const newItem = prompt('Neue Notizvorlage hinzufügen:');
                                            if (newItem && newItem.trim() && !masterFormData.notesTemplates.includes(newItem)) {
                                                setMasterFormData(prev => ({
                                                    ...prev,
                                                    notesTemplates: [...prev.notesTemplates, newItem].sort()
                                                }));
                                            } else if (newItem) {
                                                alert('Eingabe ungültig oder Vorlage existiert bereits.');
                                            }
                                        }}
                                    >
                                        ➕ Vorlage hinzufügen
                                    </button>
                                </div>
 
                                <div className="divider"></div> {/* Added divider for separation */}
                                <div className="settings-action-buttons" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                    <button type="button" className="button button-warning" onClick={handleLoadSampleDataClick}>
                                        📂 Beispieldaten laden
                                    </button>
                                    <button type="button" className="button button-danger" onClick={handleClearAllDataClick}>
                                        🗑️ Alle Daten löschen
                                    </button>
                                </div>
 
                                <div className="modal-actions">
                                    <button type="button" className="button button-outline" onClick={() => setShowMasterDataModal(false)}>
                                        ❌ Schließen
                                    </button>
                                    <button type="submit" className="button button-primary">
                                        ✅ Änderungen übernehmen
                                    </button>
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
