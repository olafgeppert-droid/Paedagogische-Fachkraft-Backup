import React, { useState, useEffect } from 'react';
 
const Navigation = ({
    isOpen = false,
    setNavOpen = () => {}, // New prop to toggle navigation
    students = [], // Now receives ALL students from App.jsx
    selectedStudent = null,
    selectedDate = '',
    filters = { search: '', schoolYear: '', school: '', className: '' }, // Initial filters passed from App.jsx
    // Korrektur: masterData Standardwerte an neue Struktur anpassen
    masterData = { schoolYears: [], schools: {}, notesTemplates: [] }, // Geändert
    onStudentSelect = () => {},
    onDateSelect = () => {},
    onFilterChange = () => {}, // This now reports ALL local filters up to App.jsx
    onShowStats = () => {},
    onShowSettings = () => {},
    onShowHelp = () => {}
}) => {
    // Internal states for filters managed by Navigation component
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);
    const [localSchoolYear, setLocalSchoolYear] = useState(filters.schoolYear);
    const [localSchool, setLocalSchool] = useState(filters.school);
    const [localClassName, setLocalClassName] = useState(filters.className);
 
    // Sync external filters prop with internal state if it changes externally (e.g., clearAllData, import)
    useEffect(() => {
        setLocalSearchTerm(filters.search);
        setLocalSchoolYear(filters.schoolYear);
        setLocalSchool(filters.school);
        setLocalClassName(filters.className);
    }, [filters]);
 
    // Effect to trigger onFilterChange when any local filter state changes
    useEffect(() => {
        onFilterChange({
            search: localSearchTerm,
            schoolYear: localSchoolYear,
            school: localSchool,
            className: localClassName
        });
    }, [localSearchTerm, localSchoolYear, localSchool, localClassName, onFilterChange]);
 
 
    const clearAllFilters = () => {
        setLocalSearchTerm('');
        setLocalSchoolYear('');
        setLocalSchool('');
        setLocalClassName('');
        onDateSelect(new Date().toISOString().split('T')[0]); // Reset date to today
        onStudentSelect(null); // Deselect any student
    };
 
    // Determine if any filters are active
    const hasActiveFilters =
        localSearchTerm ||
        localSchoolYear ||
        localSchool ||
        localClassName ||
        selectedDate !== new Date().toISOString().split('T')[0] || // Compare to today's date string
        selectedStudent;
 
    // Filter students based on current internal filter states
    const filteredStudents = students.filter(s => {
        const matchesSearch = localSearchTerm === '' ||
            s.name.toLowerCase().includes(localSearchTerm.toLowerCase());
        const matchesSchoolYear = localSchoolYear === '' ||
            s.schoolYear === localSchoolYear;
        const matchesSchool = localSchool === '' ||
            s.school === localSchool;
        const matchesClass = localClassName === '' ||
            s.className === localClassName;
 
        return matchesSearch && matchesSchoolYear && matchesSchool && matchesClass;
    });
 
    const genderEmoji = (gender) => {
        if (!gender) return '👤';
        const g = gender.toString().toLowerCase().trim();
        if (g === 'm' || g === 'männlich' || g === 'male' || g === 'boy') return '👦';
        if (g === 'w' || g === 'weiblich' || g === 'female' || g === 'girl') return '👧';
        if (g === 'd' || g === 'divers' || g === 'non-binary' || g === 'nb') return '🧑';
        return '👤';
    };
 
    return (
        <nav className={`nav ${isOpen ? 'open' : ''}`}>
            <h3>Navigation</h3>
 
            <div className="search-filter">
                <div className="filter-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Schüler suchen..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                </div>
 
                <div className="filter-group">
                    <label className="filter-label">Schuljahr</label>
                    <select
                        className="filter-select"
                        value={localSchoolYear}
                        onChange={(e) => setLocalSchoolYear(e.target.value)}
                    >
                        <option value="">Alle Schuljahre</option>
                        {masterData.schoolYears && masterData.schoolYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
 
                <div className="filter-group">
                    <label className="filter-label">Schule</label>
                    <select
                        className="filter-select"
                        value={localSchool}
                        onChange={(e) => { setLocalSchool(e.target.value); setLocalClassName(''); }} // Reset class when school changes
                    >
                        <option value="">Alle Schulen</option>
                        {masterData.schools && Object.keys(masterData.schools).map((school) => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </select>
                </div>
 
                <div className="filter-group">
                    <label className="filter-label">Klasse</label>
                    <select
                        className="filter-select"
                        value={localClassName}
                        onChange={(e) => setLocalClassName(e.target.value)}
                        disabled={!localSchool}
                    >
                        <option value="">Alle Klassen</option>
                        {localSchool &&
                            masterData.schools[localSchool]?.map((className) => (
                                <option key={className} value={className}>{className}</option>
                            ))}
                    </select>
                </div>
 
                <div className="filter-group">
                    <label className="filter-label">Tag</label>
                    <input
                        type="date"
                        className="filter-select"
                        value={selectedDate}
                        onChange={(e) => onDateSelect(e.target.value)}
                    />
                </div>
 
                {hasActiveFilters && (
                    <button
                        className="button button-warning"
                        onClick={clearAllFilters}
                        style={{ width: '100%', marginTop: '0.3rem', padding: '0.5rem' }}
                    >
                        ❌ Filter löschen
                    </button>
                )}
            </div>
 
            <div className="students-section">
                <div className="section-header">
                    <h4>Kind</h4>
                    <span className="student-count">{filteredStudents.length}</span>
                </div>
 
                {filteredStudents.length === 0 ? (
                    <div className="empty-state">
                        <p>Keine Kinder gefunden</p>
                    </div>
                ) : (
                    <ul className="students-list">
                        {filteredStudents.map((student) => (
                            <li
                                key={student.id}
                                className={`student-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                                onClick={() => onStudentSelect(student)}
                            >
                                <span className="student-avatar">
                                    {genderEmoji(student.gender)}
                                </span>
                                <div className="student-info">
                                    <div className="student-name">{student.name}</div>
                                    <div className="student-details">{student.className}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
 
            <div className="nav-footer">
                <div className="footer-section">
                    <h4>Aktionen</h4>
                    <button className="button button-info" onClick={onShowStats} style={{ padding: '0.6rem' }}>
                        📊 Statistiken
                    </button>
                    <button className="button button-info" onClick={onShowSettings} style={{ padding: '0.6rem' }}>
                        ⚙️ Einstellungen
                    </button>
                    <button className="button button-info" onClick={onShowHelp} style={{ padding: '0.6rem' }}>
                        ❓ Hilfe
                    </button>
                </div>
 
                <div className="app-info">
                    <p>Willkommen! Wählen Sie ein Kind aus der Liste.</p>
                </div>
            </div>
        </nav>
    );
};
 
export default Navigation;
