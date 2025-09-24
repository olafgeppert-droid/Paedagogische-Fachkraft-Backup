// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import Toolbar from './components/Toolbar.jsx';
import Navigation from './components/Navigation.jsx';
import MainContent from './components/MainContent.jsx';
import StudentModal from './components/StudentModal.jsx';
import EntryModal from './components/EntryModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import StatisticsModal from './components/StatisticsModal.jsx';
import HelpModal from './components/HelpModal.jsx';
import SearchModal from './components/SearchModal.jsx';
import {
    setupDB,
    getEntriesByStudentId,
    addStudent,
    updateStudent,
    deleteStudent,
    addEntry,
    updateEntry,
    exportData,
    importData,
    undo,
    redo,
    loadSampleData,
    clearAllData,
    getStudents
} from './database.js';

// =======================
// Farb-Hilfsfunktionen
// =======================
const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
};

const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
};

// =======================
// Hauptkomponente App
// =======================
const App = () => {
    const [db, setDb] = useState(null);
    const [students, setStudents] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('student');
    const [settings, setSettings] = useState({ theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
    const [masterData, setMasterData] = useState({ schoolYears: [], schools: {}, subjects: [], activities: [], notesTemplates: [] });
    const [modal, setModal] = useState(null);
    const [navOpen, setNavOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [, forceUpdate] = useState(0);
    const triggerRender = () => forceUpdate(prev => prev + 1);

    // =======================
    // Farb- und Theme-Einstellungen
    // =======================
    const applyCustomColors = useCallback((colors) => {
        const root = document.documentElement;
        root.style.setProperty('--sidebar-bg', colors.navigation || '#fed7aa');
        root.style.setProperty('--primary-color', colors.header || '#dc2626');
        root.style.setProperty('--secondary-color', colors.header ? darkenColor(colors.header, 20) : '#b91c1c');
        root.style.setProperty('--toolbar-bg-custom', colors.toolbar || '#f8fafc');
        root.style.setProperty('--background-color', colors.windowBackground || '#fef7ed');
        root.style.setProperty('--card-bg', colors.windowBackground ? lightenColor(colors.windowBackground, 10) : '#ffffff');
        root.style.setProperty('--modal-bg-custom', colors.windowBackground || '#ffffff');
        document.documentElement.classList.add('custom-colors-applied');
    }, []);

    const resetCustomColors = useCallback(() => {
        const root = document.documentElement;
        root.style.removeProperty('--sidebar-bg');
        root.style.removeProperty('--primary-color');
        root.style.removeProperty('--secondary-color');
        root.style.removeProperty('--toolbar-bg-custom');
        root.style.removeProperty('--background-color');
        root.style.removeProperty('--card-bg');
        root.style.removeProperty('--modal-bg-custom');
        document.documentElement.classList.remove('custom-colors-applied');
    }, []);

    const applySettings = useCallback((settings) => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
        document.documentElement.style.setProperty('--input-font-size', `${settings.inputFontSize}px`);
        if (settings.theme === 'farbig' && settings.customColors) applyCustomColors(settings.customColors);
        else resetCustomColors();
    }, [applyCustomColors, resetCustomColors]);

    // =======================
    // DB Initialisierung
    // =======================
    useEffect(() => {
        const initDB = async () => {
            try {
                const database = await setupDB();
                setDb(database);
                console.log('DB initialized:', database);

                const settingsData = await database.get('settings', 1);
                if (settingsData) {
                    const themeMapping = { light: 'hell', dark: 'dunkel', colored: 'farbig' };
                    const convertedSettings = { ...settingsData, theme: themeMapping[settingsData.theme] || 'hell' };
                    setSettings(convertedSettings);
                    applySettings(convertedSettings);
                }

                const masterDataLoaded = await database.get('masterData', 1);
                if (masterDataLoaded) setMasterData(masterDataLoaded);

                const allStudents = await getStudents(database);
                setStudents(allStudents || []);

                if (allStudents && allStudents.length > 0) {
                    const firstStudent = allStudents[0];
                    setSelectedStudent(firstStudent);
                    const entriesData = await getEntriesByStudentId(database, firstStudent.id);
                    const entriesWithNames = entriesData.map(e => ({
                        ...e,
                        studentName: allStudents.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}`
                    }));
                    setEntries(entriesWithNames || []);
                }
            } catch (error) {
                console.error('DB-Initialisierung fehlgeschlagen:', error);
            }
        };
        initDB();
    }, [applySettings]);

    // =======================
    // Einträge laden
    // =======================
    const loadEntries = useCallback(async () => {
        if (!db || !selectedStudent) return;
        try {
            const entriesData = await getEntriesByStudentId(db, selectedStudent.id);
            const entriesWithNames = entriesData.map(e => ({
                ...e,
                studentName: students.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}`
            }));
            setEntries(entriesWithNames || []);
        } catch (error) {
            console.error('Fehler beim Laden der Einträge:', error);
        }
    }, [db, selectedStudent, students]);

    useEffect(() => { loadEntries(); }, [loadEntries]);

    // =======================
    // Studenten-Funktionen
    // =======================
    const handleAddStudent = async (student) => {
        if (!db) return;
        try {
            const id = await addStudent(db, student);
            const updatedStudents = await getStudents(db);
            setStudents(updatedStudents);
            const newStudent = updatedStudents.find(s => s.id === id);
            setSelectedStudent(newStudent);
            // nach dem Hinzufügen das Modal schließen (oder du willst direkt öffnen)
            setModal(null);
        } catch (err) { console.error(err); }
    };

    const handleUpdateStudent = async (student) => {
        if (!db) return;
        try {
            await updateStudent(db, student);
            const updatedStudents = await getStudents(db);
            setStudents(updatedStudents);
            const updatedStudent = updatedStudents.find(s => s.id === student.id);
            setSelectedStudent(updatedStudent);
            setModal(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteStudent = async (id) => {
        if (!db) return;
        try {
            await deleteStudent(db, id);
            const updatedStudents = await getStudents(db);
            setStudents(updatedStudents);
            setSelectedStudent(updatedStudents.length > 0 ? updatedStudents[0] : null);
            if (updatedStudents.length === 0) setEntries([]);
            setModal(null);
        } catch (err) { console.error(err); }
    };

    // =======================
    // Eintrags-Funktionen
    // =======================
    const handleAddEntry = async (entry) => {
        if (!db || !selectedStudent) return;
        try {
            await addEntry(db, { ...entry, studentId: selectedStudent.id, date: selectedDate });
            await loadEntries();
            setModal(null);
        } catch (err) { console.error(err); }
    };

    const handleUpdateEntry = async (entry) => {
        if (!db) return;
        try {
            await updateEntry(db, entry);
            await loadEntries();
            setModal(null);
        } catch (err) { console.error(err); }
    };
  // =======================
// Toolbar-Aktionen + weitere Handler
// =======================
    const handleExport = async () => {
        if (db) {
            try {
                await exportData(db);
            } catch (err) {
                console.error('Fehler beim Exportieren:', err);
            }
        }
    };

    const handleImport = async () => {
        if (!db) return;
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = async (event) => {
                // Database.importData erwartet das Event (mit target.files), so übergeben wir es direkt
                try {
                    await importData(db, event, setSettings, setMasterData, setStudents, setModal);
                    const updatedStudents = await getStudents(db);
                    setStudents(updatedStudents);
                    setSelectedStudent(updatedStudents.length > 0 ? updatedStudents[0] : null);
                    await loadEntries();
                } catch (err) {
                    console.error('Import fehlgeschlagen:', err);
                }
            };
            fileInput.click();
        } catch (err) {
            console.error('Fehler beim Importieren:', err);
        }
    };

    const handleUndo = async () => { /* falls implementiert */ };
    const handleRedo = async () => { /* falls implementiert */ };

    const handleLoadSampleData = async () => {
        if (!db) return;
        try {
            await loadSampleData(db, setMasterData, setStudents, setEntries);
        } catch (err) {
            console.error('Fehler beim Laden der Beispieldaten:', err);
        }
    };

    const handleClearAllData = async () => {
        if (!db) return;
        if (window.confirm('Sind Sie sicher, dass Sie alle Daten löschen möchten?')) {
            try {
                await clearAllData(db, setStudents, setEntries, setSettings, setMasterData);
                setSelectedStudent(null);
                setSelectedDate(new Date().toISOString().split('T')[0]);
            } catch (err) {
                console.error('Fehler beim Löschen aller Daten:', err);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // =======================
    // Such-Handler (SearchModal Ergebnis verarbeiten)
    // =======================
    const handleSearch = async (criteria) => {
        if (!db) return;
        let searchTerm = '';
        let searchType = 'all';
        if (typeof criteria === 'string') searchTerm = criteria.trim();
        else { searchTerm = (criteria.value ?? '').toString().trim(); searchType = (criteria.type ?? 'all').toLowerCase(); }

        const isExact = /^".*"$/.test(searchTerm);
        if (isExact) searchTerm = searchTerm.slice(1, -1).toLowerCase();
        else searchTerm = searchTerm.toLowerCase();

        try {
            const allEntries = await db.getAll('entries');
            let results = allEntries.filter(e => {
                const topicField = (e.topic || e.activity || '').toString().toLowerCase();
                const ratingField = (e.bewertung || '').toString().toLowerCase().trim();
                const studentObj = students.find(s => s.id === e.studentId);
                switch (searchType) {
                    case 'topic':
                    case 'thema':
                        return isExact ? topicField === searchTerm : topicField.includes(searchTerm);
                    case 'rating':
                    case 'bewertung':
                        if (searchTerm === '' || searchTerm === 'leer') return ratingField === '';
                        return ratingField === searchTerm;
                    case 'name':
                        return studentObj && studentObj.name.toLowerCase().includes(searchTerm);
                    case 'all':
                    default:
                        const searchableFields = [e.topic, e.activity, e.bewertung, e.notes, e.thema].filter(f => f != null).map(f => f.toString().toLowerCase());
                        if (studentObj && studentObj.name.toLowerCase().includes(searchTerm)) return true;
                        return searchableFields.some(f => isExact ? f === searchTerm : f.includes(searchTerm));
                }
            });
            results = results.map(e => ({ ...e, studentName: students.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}` }));
            setSearchResults(results);
            setViewMode('search');
            setSearchModalOpen(false);
        } catch (err) {
            console.error('Fehler bei Suche:', err);
            setSearchResults([]);
            setViewMode('search');
            setSearchModalOpen(false);
        }
    };

    // =======================
    // Navigation-Handler
    // =======================
    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        // kein Modal öffnen — Auswahl genügt
    };

    const handleEditStudent = () => {
        if (selectedStudent) setModal('student');
    };

    const handleOpenSearch = () => {
        setSearchModalOpen(true);
    };

    // =======================
    // Render
    // =======================
    return (
        <div className="app">
            <Header settings={settings} />

            <Toolbar
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                onExport={handleExport}
                onImport={handleImport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onLoadSampleData={handleLoadSampleData}
                onClearAllData={handleClearAllData}
                onSearchProtocol={handleOpenSearch}
                onOpenSearch={handleOpenSearch} // kompatibel falls Toolbar uses this prop
                onAddStudent={() => {
                    // öffne Modal für neuen Schüler (StudentModal zeigt leeres Formular)
                    setSelectedStudent(null);
                    setModal('student');
                }}
                onAddEntry={() => {
                    setEditingEntry(null);
                    setModal('entry');
                }}
                onPrint={handlePrint}
                onEditStudent={handleEditStudent}
            />

            <Navigation
                isOpen={navOpen}
                setNavOpen={setNavOpen}
                students={students}
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                filters={{ search: '' }}
                masterData={masterData}
                onStudentSelect={handleStudentClick}
                onDateSelect={setSelectedDate}
                onFilterChange={() => {}}
                onShowStats={() => setModal('statistics')}
                onShowSettings={() => setModal('settings')}
                onShowHelp={() => setModal('help')}
            />

            <MainContent
                viewMode={viewMode}
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                entries={viewMode === 'search' ? searchResults : entries}
                onEditEntry={(entry) => {
                    setEditingEntry(entry);
                    setModal('entry');
                }}
            />

            {modal === 'student' && (
                <StudentModal
                    student={selectedStudent}
                    masterData={masterData}
                    onClose={() => setModal(null)}
                    onSave={selectedStudent ? handleUpdateStudent : handleAddStudent}
                    onDelete={handleDeleteStudent}
                />
            )}

            {modal === 'entry' && (
                <EntryModal
                    existingEntry={editingEntry}
                    student={selectedStudent}
                    date={selectedDate}
                    masterData={masterData}
                    onClose={() => {
                        setModal(null);
                        setEditingEntry(null);
                    }}
                    onSave={async (entry) => {
                        if (editingEntry) await handleUpdateEntry(entry);
                        else await handleAddEntry(entry);
                        setEditingEntry(null);
                        setModal(null);
                    }}
                />
            )}

            {modal === 'settings' && (
                <SettingsModal
                    settings={settings}
                    masterData={masterData}
                    onClose={() => setModal(null)}
                    onSave={(newSettings) => {
                        setSettings(newSettings);
                        applySettings(newSettings);
                    }}
                    onSaveMasterData={(md) => {
                        setMasterData(md);
                    }}
                    setStudents={setStudents}
                    setEntries={setEntries}
                    setSelectedStudent={setSelectedStudent}
                    setSettings={setSettings}
                />
            )}

            {modal === 'statistics' && (
                <StatisticsModal
                    onClose={() => setModal(null)}
                    students={students}
                    entries={entries}
                />
            )}

            {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}

            {searchModalOpen && (
                <SearchModal
                    onClose={() => setSearchModalOpen(false)}
                    onSearch={handleSearch}
                />
            )}
        </div>
    );
};

export default App;
