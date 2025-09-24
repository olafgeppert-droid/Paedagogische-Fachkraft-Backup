import React from 'react';

const Navigation = ({
    isOpen = false,
    students = [],
    selectedStudent = null,
    selectedDate = '',
    filters = { search: '', schoolYear: '', school: '', className: '' },
    masterData = { schoolYears: [], schools: {} },
    onStudentSelect = () => {},
    onDateSelect = () => {},
    onFilterChange = () => {},
    onShowStats = () => {},
    onShowSettings = () => {},
    onShowHelp = () => {}
}) => {
    const [searchTerm, setSearchTerm] = React.useState(filters.search);
    const [localFilters, setLocalFilters] = React.useState(filters);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onFilterChange({ ...localFilters, search: value });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...localFilters, [filterType]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            search: '',
            schoolYear: '',
            school: '',
            className: ''
        };
        setSearchTerm('');
        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters);
        onDateSelect(''); // Leert auch das Datumsfeld
        onStudentSelect(null); // Deselektiert das Kind
    };

    const hasActiveFilters =
        localFilters.search || 
        localFilters.schoolYear || 
        localFilters.school || 
        localFilters.className || 
        selectedDate ||
        selectedStudent;

    return (
        <nav className={`nav ${isOpen ? 'open' : ''}`}>
            <h3>Navigation</h3>

            <div className="search-filter">
                <div className="filter-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Schüler suchen..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">Schuljahr</label>
                    <select
                        className="filter-select"
                        value={localFilters.schoolYear}
                        onChange={(e) => handleFilterChange('schoolYear', e.target.value)}
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
                        value={localFilters.school}
                        onChange={(e) => handleFilterChange('school', e.target.value)}
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
                        value={localFilters.className}
                        onChange={(e) => handleFilterChange('className', e.target.value)}
                        disabled={!localFilters.school}
                    >
                        <option value="">Alle Klassen</option>
                        {localFilters.school &&
                            masterData.schools[localFilters.school]?.map((className) => (
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
                    <span className="student-count">{students.length}</span>
                </div>

                {students.length === 0 ? (
                    <div className="empty-state">
                        <p>Keine Kinder gefunden</p>
                    </div>
                ) : (
                    <ul className="students-list">
                        {students.map((student) => (
                            <li
                                key={student.id}
                                className={`student-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                                onClick={() => onStudentSelect(student)}
                            >
                                <span className="student-avatar">
                                    {student.gender === 'w'
                                        ? '👧'
                                        : student.gender === 'm'
                                            ? '👦'
                                            : '👤'}
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
