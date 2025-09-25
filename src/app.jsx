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
    getAllEntries, // NEU: Import für alle Einträge
    addStudent,
    updateStudent,
    deleteStudent,
    addEntry,
    updateEntry,
    _importDataInternal,
    saveStateForUndo,
    undo,
    redo,
    loadSampleData,
    clearAllData,
    getStudents,
    saveSettings as saveSettingsToDB,
    saveMasterData as saveMasterDataToDB
} from './database.js';

import {
    applyCustomColors,
    resetCustomColors
} from './utils/colors.js';

// =======================
// Hauptkomponente App
// =======================
const App = () => {
    const [db, setDb] = useState(null);
    const [students, setStudents] = useState([]); // Alle Schüler
    const [entries, setEntries] = useState([]); // Einträge basierend auf ViewMode (Schüler, Tag, Suche)
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('student'); // 'student', 'day', 'search'
    const [settings, setSettings] = useState({ theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
    // KORREKTUR: 'subjects' und 'activities' aus masterData-Initialisierung entfernt
    const [masterData, setMasterData] = useState({ schoolYears: [], schools: {}, notesTemplates: [] });
    const [modal, setModal] = useState(null);
    const [navOpen, setNavOpen] = useState(false); // State for navigation drawer
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Filters for student list in Navigation, managed by Navigation component
    const [studentFilters, setStudentFilters] = useState({
        search: '',
        schoolYear: '',
        school: '',
        className: ''
    });

    // Undo/Redo History
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // =======================
    // Farb- und Theme-Einstellungen
    // =======================
    // Centralized apply settings, using imported color functions
    const applySettings = useCallback((currentSettings) => {
        document.documentElement.setAttribute('data-theme', currentSettings.theme);
        document.documentElement.style.setProperty('--font-size', `${currentSettings.fontSize}px`);
        document.documentElement.style.setProperty('--input-font-size', `${currentSettings.inputFontSize}px`);
        if (currentSettings.theme === 'farbig' && currentSettings.customColors) {
            applyCustomColors(currentSettings.customColors);
        } else {
            resetCustomColors();
        }
    }, []);

    // =======================
    // History Management
    // =======================
    // Captures the current application state for undo/redo
    const captureAppState = useCallback(async () => {
        if (!db) return;
        await saveStateForUndo(db, setHistory, setHistoryIndex, history, historyIndex);
    }, [db, history, historyIndex]);


    // =======================
    // DB Initialisierung
    // =======================
    useEffect(() => {
        const initDB = async () => {
            try {
                const database = await setupDB();
                setDb(database);

                // Load Settings
                const settingsData = await database.get('settings', 1);
                if (settingsData) {
                    const themeMapping = { light: 'hell', dark: 'dunkel', colored: 'farbig' };
                    const convertedSettings = { ...settingsData, theme: themeMapping[settingsData.theme] || 'hell' };
                    setSettings(convertedSettings);
                    applySettings(convertedSettings);
                }

                // Load Master Data
                const masterDataLoaded = await database.get('masterData', 1);
                // KORREKTUR: masterData nur mit erwarteten Feldern aktualisieren
                if (masterDataLoaded) setMasterData({
                    schoolYears: masterDataLoaded.schoolYears || [],
                    schools: masterDataLoaded.schools || {},
                    notesTemplates: masterDataLoaded.notesTemplates || []
                });

                // Load Students
                const allStudents = await getStudents(database);
                setStudents(allStudents || []);

                // Set initial selected student and entries
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

                // Capture initial state for undo/redo (empty initial history)
                // This must be done after initial state is fully loaded to be useful
                await saveStateForUndo(database, setHistory, setHistoryIndex, [], -1);

            } catch (error) {
                console.error('DB-Initialisierung fehlgeschlagen:', error);
            }
        };
        initDB();
    }, [applySettings]);


    // =======================
    // Einträge laden für ausgewählten Schüler
    // =======================
    const loadEntriesForSelectedStudent = useCallback(async () => {
        if (!db || !selectedStudent) {
             setEntries([]); // Clear entries if no student selected
             return;
        }
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

    // Effect to reload entries when selectedStudent or students list changes
    useEffect(() => {
        loadEntriesForSelectedStudent();
    }, [loadEntriesForSelectedStudent]);


    // =======================
    // Studenten-Funktionen
    // =======================
    const handleAddStudent = async (student) => {
        if (!db) return;
        try {
            const newId = await addStudent(db, student);
            const updatedStudents = await getStudents(db);
            setStudents(updatedStudents);
            const newStudent = updatedStudents.find(s => s.id === newId);
            setSelectedStudent(newStudent);
            setModal(null);
            await captureAppState(); // Capture state after modification
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
            await captureAppState(); // Capture state after modification
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
            await captureAppState(); // Capture state after modification
        } catch (err) { console.error(err); }
    };

    // =======================
    // Eintrags-Funktionen
    // =======================
    const handleAddEntry = async (entry) => {
        if (!db || !selectedStudent) return;
        try {
            await addEntry(db, { ...entry, studentId: selectedStudent.id, date: selectedDate });
            await loadEntriesForSelectedStudent();
            setModal(null);
            await captureAppState(); // Capture state after modification
        } catch (err) { console.error(err); }
    };

    const handleUpdateEntry = async (entry) => {
        if (!db) return;
        try {
            await updateEntry(db, entry);
            await loadEntriesForSelectedStudent();
            setModal(null);
            await captureAppState(); // Capture state after modification
        } catch (err) { console.error(err); }
    };

    // =======================
    // Toolbar Aktionen
    // =======================
    const handleExport = async () => {
        if (!db) return;
        try {
            const allStudents = await db.getAll('students');
            const allEntries = await db.getAll('entries');
            const masterDataData = await db.get('masterData', 1);
            const settingsData = await db.get('settings', 1);

            const exportObject = {
                students: allStudents,
                entries: allEntries,
                masterData: masterDataData || {},
                settings: settingsData || {}
            };

            const jsonStr = JSON.stringify(exportObject, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const now = new Date();
            const dateStr = now.toISOString().replace(/[:.]/g, '-');
            const fileName = `paedagogische-dokumentation-${dateStr}.json`;

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/json' })] })) {
                const file = new File([blob], fileName, { type: 'application/json' });
                try {
                    await navigator.share({ files: [file], title: 'Export Daten', text: 'Export der pädagogischen Dokumentation' });
                } catch (err) {
                    console.error('Export abgebrochen oder fehlgeschlagen:', err);
                }
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) { console.error('Fehler beim Exportieren:', err); }
    };

    const handleImport = async () => {
        if (!db) return;
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = async (event) => {
                try {
                    const importedData = await _importDataInternal(db, event.target.files[0]);

                    if (importedData.settings) {
                        const themeMapping = { light: 'hell', dark: 'dunkel', colored: 'farbig' };
                        const convertedSettings = { ...importedData.settings, theme: themeMapping[importedData.settings.theme] || 'hell' };
                        setSettings(convertedSettings);
                        applySettings(convertedSettings);
                    }
                    // KORREKTUR: masterData nur mit erwarteten Feldern aktualisieren
                    if (importedData.masterData) setMasterData({
                        schoolYears: importedData.masterData.schoolYears || [],
                        schools: importedData.masterData.schools || {},
                        notesTemplates: importedData.masterData.notesTemplates || []
                    });
                    setStudents(importedData.students || []);

                    const newSelectedStudent = importedData.students.length > 0 ? importedData.students[0] : null;
                    setSelectedStudent(newSelectedStudent);

                    if (newSelectedStudent) {
                        const entriesData = await getEntriesByStudentId(db, newSelectedStudent.id);
                        setEntries(entriesData.map(e => ({ ...e, studentName: newSelectedStudent.name })));
                    } else {
                        setEntries([]);
                    }

                    setModal(null);
                    alert('Daten erfolgreich importiert!');
                    await captureAppState();
                } catch (err) {
                    console.error('Import fehlgeschlagen:', err);
                    alert('Import fehlgeschlagen: ' + (err.message || err));
                }
            };
            fileInput.click();
        } catch (err) { console.error('Fehler beim Importieren:', err); }
    };

    const handleUndo = async () => {
        if (db) await undo(db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
    };
    const handleRedo = async () => {
        if (db) await redo(db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
    };

    const handleLoadSampleData = async () => {
        if (!db) return;
        if (!window.confirm('Möchten Sie Beispieldaten laden? Alle aktuellen Daten werden dabei überschrieben!')) return;
        try {
            const loadedData = await loadSampleData(db);
           
            setStudents(loadedData.students);
            // Einträge mit Studentennamen anreichern
            const entriesWithNames = loadedData.entries.map(e => ({
                ...e,
                studentName: loadedData.students.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}`
            }));
            setEntries(entriesWithNames);
            // KORREKTUR: masterData nur mit erwarteten Feldern aktualisieren
            setMasterData({
                schoolYears: loadedData.masterData.schoolYears || [],
                schools: loadedData.masterData.schools || {},
                notesTemplates: loadedData.masterData.notesTemplates || []
            });
           
            const defaultSettings = { theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} };
            setSettings(defaultSettings);
            applySettings(defaultSettings);

            const firstStudent = loadedData.students.length > 0 ? loadedData.students[0] : null;
            setSelectedStudent(firstStudent);
           
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setStudentFilters({ search: '', schoolYear: '', school: '', className: '' });
           
            alert('Beispieldaten erfolgreich geladen!');
            setModal(null);
            await captureAppState();
        } catch (err) {
            console.error('Fehler beim Laden der Beispieldaten:', err);
            alert('Fehler beim Laden der Beispispieldaten: ' + (err.message || err));
        }
    };

    const handleClearAllData = async () => {
        if (!db) return;
        if (!window.confirm('Sind Sie SICHER, dass Sie ALLE Daten löschen möchten? Diese Aktion kann NICHT rückgängig gemacht werden!')) return;
        try {
            const clearedData = await clearAllData(db);

            setStudents(clearedData.students);
            setEntries(clearedData.entries);
            setSettings(clearedData.settings);
            // KORREKTUR: masterData nur mit erwarteten Feldern aktualisieren
            setMasterData({
                schoolYears: clearedData.masterData.schoolYears || [],
                schools: clearedData.masterData.schools || {},
                notesTemplates: clearedData.masterData.notesTemplates || []
            });

            setSelectedStudent(null);
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setStudentFilters({ search: '', schoolYear: '', school: '', className: '' });

            alert('Alle Daten erfolgreich gelöscht!');
            setModal(null);
            await captureAppState();
        } catch (err) {
            console.error('Fehler beim Löschen aller Daten:', err);
            alert('Fehler beim Löschen aller Daten: ' + (err.message || err));
        }
    };

    const handlePrint = () => { window.print(); };

    const handleOpenSearch = () => { setSearchModalOpen(true); };
    const handleCloseSearch = () => { setSearchModalOpen(false); setSearchResults([]); };

    // =======================
    // Such-Handler
    // =======================
    const handleSearch = async (criteria) => {
        if (!db) return;

        let searchTerm = criteria.value ? criteria.value.toString().trim() : '';
        let searchType = (criteria.type ?? 'all').toLowerCase();

        const isExact = /^".*"$/.test(searchTerm);
        if (isExact) searchTerm = searchTerm.slice(1, -1).toLowerCase();
        else searchTerm = searchTerm.toLowerCase();

        try {
            const allEntries = await db.getAll('entries');
            const allStudents = await getStudents(db);

            let results = allEntries.filter(e => {
                const studentObj = allStudents.find(s => s.id === e.studentId);
                const studentNameLower = studentObj ? studentObj.name.toLowerCase() : '';

                const checkField = (fieldValue, value, exactMatch) => {
                    const lowerFieldValue = (fieldValue || '').toString().toLowerCase();
                    return exactMatch ? lowerFieldValue === value : lowerFieldValue.includes(value);
                };

                switch (searchType) {
                    case 'name':
                        return checkField(studentNameLower, searchTerm, isExact);
                    case 'subject':
                        return checkField(e.subject, searchTerm, isExact);
                    case 'measures':
                        return checkField(e.measures, searchTerm, isExact);
                    case 'rating':
                        const ratingValue = (e.erfolgRating || '').toString().toLowerCase().trim();
                        if (searchTerm === '' || searchTerm === 'leer') {
                            return ratingValue === ''; // Suche nach leeren Bewertungen
                        }
                        return ratingValue === searchTerm; // Exakte Suche nach 'positiv' oder 'negativ'
                    case 'all':
                    default:
                        // Search in student name
                        if (checkField(studentNameLower, searchTerm, isExact)) return true;

                        // Search in entry fields
                        const searchableFields = [
                            e.subject, e.observations, e.measures, e.erfolg, e.erfolgRating
                        ].filter(f => f != null && f !== '').map(f => f.toString().toLowerCase());

                        return searchableFields.some(f => isExact ? f === searchTerm : f.includes(searchTerm));
                }
            });

            const resultsWithNames = results.map(e => ({
                ...e,
                studentName: allStudents.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}`
            }));
            setSearchResults(resultsWithNames);
            setViewMode('search');
            setSearchModalOpen(false);
        } catch (err) {
            console.error('Fehler bei Suche:', err);
            setSearchResults([]);
            setViewMode('search');
            setSearchModalOpen(false);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setViewMode('student');
        setSearchResults([]);
        setSearchModalOpen(false);
        setNavOpen(false);
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = studentFilters.search === '' ||
            s.name.toLowerCase().includes(studentFilters.search.toLowerCase());
        const matchesSchoolYear = studentFilters.schoolYear === '' ||
            s.schoolYear === studentFilters.schoolYear;
        const matchesSchool = studentFilters.school === '' ||
            s.school === studentFilters.school;
        const matchesClass = studentFilters.className === '' ||
            s.className === studentFilters.className;
       
        return matchesSearch && matchesSchoolYear && matchesSchool && matchesClass;
    });


    // =======================
    // Render
    // =======================
    return (
        <div className="app">
            <Header settings={settings} onMenuClick={() => setNavOpen(!navOpen)} />

            <Toolbar
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                onAddStudent={() => { setSelectedStudent(null); setModal('student'); }}
                onEditStudent={() => selectedStudent && setModal('student')}
                onAddEntry={() => selectedStudent && setModal('entry')}
                onPrint={handlePrint}
                onExport={handleExport}
                onImport={handleImport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onSearchProtocol={handleOpenSearch}
                // ENTFERNT: Diese Funktionen wurden aus der Toolbar in SettingsModal verschoben
                // onLoadSampleData={handleLoadSampleData}
                // onClearAllData={handleClearAllData}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
            />

            <Navigation
                isOpen={navOpen}
                setNavOpen={setNavOpen}
                students={filteredStudents}
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                filters={studentFilters}
                masterData={masterData}
                onStudentSelect={handleStudentClick}
                onDateSelect={setSelectedDate}
                onFilterChange={setStudentFilters}
                onShowStats={async () => { // Async-Call, um alle Einträge vor dem Öffnen zu laden
                    if (db) {
                        setModal('statistics');
                    }
                }}
                onShowSettings={() => setModal('settings')}
                onShowHelp={() => setModal('help')}
            />

            <MainContent
                viewMode={viewMode}
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                entries={viewMode === 'search' ? searchResults : entries}
                onEditEntry={(entry) => { setEditingEntry(entry); setModal('entry'); }}
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
                    onClose={() => { setModal(null); setEditingEntry(null); }}
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
                    onSave={async (newSettings) => {
                        await saveSettingsToDB(db, newSettings);
                        setSettings(newSettings);
                        applySettings(newSettings);
                        await captureAppState();
                    }}
                    onSaveMasterData={async (newMasterData) => {
                        await saveMasterDataToDB(db, newMasterData);
                        // KORREKTUR: masterData nur mit erwarteten Feldern aktualisieren
                        setMasterData({
                            schoolYears: newMasterData.schoolYears || [],
                            schools: newMasterData.schools || {},
                            notesTemplates: newMasterData.notesTemplates || []
                        });
                        await captureAppState();
                    }}
                    // NEUE PROPS: Delegiere an die Handler von App.jsx
                    onLoadSampleData={handleLoadSampleData}
                    onClearAllData={handleClearAllData}
                />
            )}

            {modal === 'statistics' && db && ( // Modal nur rendern, wenn DB geladen ist
                <StatisticsModal
                    onClose={() => setModal(null)}
                    allStudents={students} // Global: Alle Schüler
                    allEntries={entries}   // Global: Alle Einträge, da "entries" bereits aggregiert wird in App.jsx (initial load)
                                           // ACHTUNG: 'entries' hier ist der im MainContent angezeigte, nicht zwingend ALLE.
                                           // Für GLOBALE Statistik brauchen wir wirklich ALLE.
                                           // Eine saubere Lösung wäre, hier `await getAllEntries(db)` zu machen.
                    // KORREKTUR: Für die globale Statistik müssen wir alle Einträge aus der DB holen
                    // Dies sollte in einem useEffect oder im onShowStats-Handler erfolgen,
                    // um nicht bei jedem Render die DB zu queryen.
                    students={students} // Pass all students to stats modal
                    entries={allEntries} // Pass all entries to stats modal (state needs to be populated first)
                />
            )}
            {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
            {searchModalOpen && <SearchModal onClose={handleCloseSearch} onSearch={handleSearch} />}
        </div>
    );
};

export default App;
