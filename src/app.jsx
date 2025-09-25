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
    _importDataInternal, // Renamed to avoid confusion with App.jsx specific import handler
    saveStateForUndo, // Now imported for history management
    undo,             // Now imported for history management
    redo,             // Now imported for history management
    loadSampleData,   // Now imported to manage sample data loading logic
    clearAllData,     // Now imported to manage clear all data logic
    getStudents,
    saveSettings as saveSettingsToDB,     // Import DB-specific save for settings
    saveMasterData as saveMasterDataToDB  // Import DB-specific save for master data
} from './database.js';
 
import {
    applyCustomColors,
    resetCustomColors
} from './utils/colors.js'; // Import from new colors utility
 
// =======================
// Hauptkomponente App
// =======================
const App = () => {
    const [db, setDb] = useState(null);
    const [students, setStudents] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('student'); // 'student', 'day', 'search'
    const [settings, setSettings] = useState({ theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
    // Korrektur: masterData sollte keine 'subjects' und 'activities' mehr enthalten, da sie nicht als Dropdowns verwendet werden.
    const [masterData, setMasterData] = useState({ schoolYears: [], schools: {}, notesTemplates: [] }); // Geändert
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
    }, []); // Dependencies removed as color functions are now imported
 
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
                // Korrektur: Stellen Sie sicher, dass masterData die erwartete Struktur hat, auch wenn alte DB-Einträge 'subjects'/'activities' enthalten.
                setMasterData({
                    schoolYears: masterDataLoaded?.schoolYears || [],
                    schools: masterDataLoaded?.schools || {},
                    notesTemplates: masterDataLoaded?.notesTemplates || []
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
    }, [applySettings]); // `applySettings` is a useCallback, so it's stable
 
 
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
            const dateStr = now.toISOString().replace(/[:.]/g, '-'); // Use /[:.]/g to replace both colon and dot
            const fileName = `paedagogische-dokumentation-${dateStr}.json`;
 
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/json' })] })) {
                const file = new File([blob], fileName, { type: 'application/json' });
                try {
                    await navigator.share({ files: [file], title: 'Export Daten', text: 'Export der pädagogischen Dokumentation' });
                } catch (err) {
                    // User dismissed share dialog or it failed
                    console.error('Export abgebrochen oder fehlgeschlagen:', err);
                }
            } else {
                // Fallback for browsers without Web Share API or if it fails
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
 
                    // Update local React states from imported data
                    if (importedData.settings) {
                        const themeMapping = { light: 'hell', dark: 'dunkel', colored: 'farbig' };
                        const convertedSettings = { ...importedData.settings, theme: themeMapping[importedData.settings.theme] || 'hell' };
                        setSettings(convertedSettings);
                        applySettings(convertedSettings); // Re-apply theme
                    }
                    // Korrektur: masterData an neue Struktur anpassen
                    if (importedData.masterData) setMasterData({
                        schoolYears: importedData.masterData.schoolYears || [],
                        schools: importedData.masterData.schools || {},
                        notesTemplates: importedData.masterData.notesTemplates || []
                    });
                    setStudents(importedData.students || []);
 
                    // Select the first student if available, or null
                    const newSelectedStudent = importedData.students.length > 0 ? importedData.students[0] : null;
                    setSelectedStudent(newSelectedStudent);
 
                    // Load entries for the newly selected student (or clear if none)
                    if (newSelectedStudent) {
                        const entriesData = await getEntriesByStudentId(db, newSelectedStudent.id);
                        setEntries(entriesData.map(e => ({ ...e, studentName: newSelectedStudent.name })));
                    } else {
                        setEntries([]);
                    }
 
                    setModal(null);
                    alert('Daten erfolgreich importiert!');
                    await captureAppState(); // Capture state after import
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
            const loadedData = await loadSampleData(db); // Call DB function to load data
           
            // Update App.jsx states with loaded data
            setStudents(loadedData.students);
            setEntries(loadedData.entries);
            // Korrektur: masterData an neue Struktur anpassen
            setMasterData({
                schoolYears: loadedData.masterData.schoolYears || [],
                schools: loadedData.masterData.schools || {},
                notesTemplates: loadedData.masterData.notesTemplates || []
            });
           
            // Reset settings to default for sample data or specific sample settings
            const defaultSettings = { theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} };
            setSettings(defaultSettings);
            applySettings(defaultSettings);
 
            const firstStudent = loadedData.students.length > 0 ? loadedData.students[0] : null;
            setSelectedStudent(firstStudent);
           
            setSelectedDate(new Date().toISOString().split('T')[0]); // Reset date to today
            setStudentFilters({ search: '', schoolYear: '', school: '', className: '' }); // Reset student filters
           
            alert('Beispieldaten erfolgreich geladen!');
            setModal(null); // Close any open modal
            await captureAppState(); // Capture state after loading sample data
        } catch (err) {
            console.error('Fehler beim Laden der Beispieldaten:', err);
            alert('Fehler beim Laden der Beispieldaten: ' + (err.message || err));
        }
    };
 
    const handleClearAllData = async () => {
        if (!db) return;
        if (!window.confirm('Sind Sie SICHER, dass Sie ALLE Daten löschen möchten? Diese Aktion kann NICHT rückgängig gemacht werden!')) return;
        try {
            const clearedData = await clearAllData(db); // Call DB function to clear data
 
            // Update App.jsx states
            setStudents(clearedData.students);
            setEntries(clearedData.entries);
            setSettings(clearedData.settings);
            // Korrektur: masterData an neue Struktur anpassen
            setMasterData({
                schoolYears: clearedData.masterData.schoolYears || [],
                schools: clearedData.masterData.schools || {},
                notesTemplates: clearedData.masterData.notesTemplates || []
            });
 
            setSelectedStudent(null);
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setStudentFilters({ search: '', schoolYear: '', school: '', className: '' }); // Reset student filters
 
            alert('Alle Daten erfolgreich gelöscht!');
            setModal(null); // Close any open modal
            await captureAppState(); // Capture state after clearing all data
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
            const allStudents = await getStudents(db); // Fetch all students once
 
            let results = allEntries.filter(e => {
                const studentObj = allStudents.find(s => s.id === e.studentId);
                const studentNameLower = studentObj ? studentObj.name.toLowerCase() : '';
 
                // Helper function to check a field (or its old equivalents) for match
                // Korrektur: 'oldField1' und 'oldField2' sind nun optional und 'activity' wird nicht mehr für 'subject' gesucht
                const checkField = (newField, oldField1, oldField2, value, exactMatch) => {
                    const fieldValue1 = (e[newField] || '').toString().toLowerCase();
                    const match1 = exactMatch ? fieldValue1 === value : fieldValue1.includes(value);
                    if (match1) return true;

                    if (oldField1) {
                        const fieldValue2 = (e[oldField1] || '').toString().toLowerCase();
                        const match2 = exactMatch ? fieldValue2 === value : fieldValue2.includes(value);
                        if (match2) return true;
                    }
                    if (oldField2) {
                        const fieldValue3 = (e[oldField2] || '').toString().toLowerCase();
                        const match3 = exactMatch ? fieldValue3 === value : fieldValue3.includes(value);
                        if (match3) return true;
                    }
                    return false;
                };
 
                switch (searchType) {
                    case 'subject': // Korrektur: 'topic' wurde zu 'subject' in SearchModal
                        // Korrektur: Nur 'subject' und alte 'topic' werden gesucht, 'activity' hier entfernt
                        return checkField('subject', 'topic', null, searchTerm, isExact);
                    case 'rating':
                    case 'bewertung':
                        const ratingValue = (e.erfolgRating || e.bewertung || '').toString().toLowerCase().trim();
                        if (searchTerm === 'leer') { // Suche nach explizit leerer Bewertung
                            return ratingValue === '';
                        } else if (searchTerm === '') { // Wenn "Bitte wählen" ausgewählt ist, alle Einträge anzeigen
                            return true;
                        }
                        return ratingValue === searchTerm; // Suche nach 'positiv' oder 'negativ'
                    case 'measures': // Korrektur: Neuer Suchtyp für Maßnahmen
                        return checkField('measures', 'activity', null, searchTerm, isExact); // 'activity' als alte Bezeichnung für 'measures'
                    case 'name':
                        return studentNameLower.includes(searchTerm);
                    case 'all':
                    default:
                        // Search all relevant fields (new and old)
                        const searchableFields = [
                            e.subject, e.topic, // Fach / Thema, alter topic
                            e.observations, e.notes,      // Beobachtungen, alte Notes
                            e.measures, e.activity,       // Maßnahmen, alte activity
                            e.erfolg,                     // Erfolg (text)
                            e.erfolgRating, e.bewertung   // Erfolgsbewertung, alte Bewertung
                        ].filter(f => f != null && f !== '').map(f => f.toString().toLowerCase());
 
                        if (studentNameLower.includes(searchTerm)) return true; // Always check student name
                        return searchableFields.some(f => isExact ? f === searchTerm : f.includes(searchTerm));
                }
            });
 
            // Attach student names to results
            const resultsWithNames = results.map(e => ({
                ...e,
                studentName: allStudents.find(s => s.id === e.studentId)?.name || `Schüler ${e.studentId}`
            }));
            setSearchResults(resultsWithNames);
            setViewMode('search');
            setSearchModalOpen(false); // Close search modal after search
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
        setSearchResults([]); // Clear search results when selecting a student
        setSearchModalOpen(false); // Ensure search modal is closed
        setNavOpen(false); // Close navigation on student select
    };
 
    // Filter students based on navigation filters
    const filteredStudents = students.filter(s => {
        const matchesSearch = studentFilters.search === '' ||
            s.name.toLowerCase().includes(studentFilters.search.toLowerCase());
        const matchesSchoolYear = studentFilters.schoolYear === '' ||
            s.schoolYear === studentFilters.schoolYear;
        const matchesSchool = studentFilters.school === '' ||
            s.school === studentFilters.school;
        const matchesClass = studentFilters.className === '' ||
            s.className === studentFilters.className; // If no class selected, match all classes
       
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
                onAddStudent={() => { setSelectedStudent(null); setModal('student'); }} // always "Add new student"
                onEditStudent={() => selectedStudent && setModal('student')} // editing possible
                onAddEntry={() => selectedStudent && setModal('entry')} // Add entry only if student is selected
                onPrint={handlePrint}
                onExport={handleExport}
                onImport={handleImport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onSearchProtocol={handleOpenSearch} // always active
                onLoadSampleData={handleLoadSampleData}
                onClearAllData={handleClearAllData}
                canUndo={historyIndex > 0} // Can undo if not at the beginning of history
                canRedo={historyIndex < history.length - 1} // Can redo if not at the end of history
            />
 
            <Navigation
                isOpen={navOpen}
                setNavOpen={setNavOpen} // Pass setter to toggle navigation
                students={filteredStudents} // Pass already filtered students
                selectedStudent={selectedStudent}
                selectedDate={selectedDate}
                filters={studentFilters} // Pass current student filters
                masterData={masterData}
                onStudentSelect={handleStudentClick}
                onDateSelect={setSelectedDate}
                onFilterChange={setStudentFilters} // Callback to update filters in App.jsx
                onShowStats={() => setModal('statistics')}
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
                    masterData={masterData} // Pass masterData to EntryModal for notesTemplates
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
                        await saveSettingsToDB(db, newSettings); // Persist to DB
                        setSettings(newSettings); // Update App.jsx state
                        applySettings(newSettings); // Apply to UI
                        await captureAppState(); // Capture state after saving settings
                    }}
                    onSaveMasterData={async (newMasterData) => {
                        // Korrektur: Stellen Sie sicher, dass nur die erlaubten Masterdaten gespeichert werden
                        const filteredMasterData = {
                            schoolYears: newMasterData.schoolYears || [],
                            schools: newMasterData.schools || {},
                            notesTemplates: newMasterData.notesTemplates || []
                        };
                        await saveMasterDataToDB(db, filteredMasterData); // Persist to DB
                        setMasterData(filteredMasterData); // Update App.jsx state
                        await captureAppState(); // Capture state after saving master data
                    }}
                    setStudents={setStudents}
                    setEntries={setEntries}
                    setSelectedStudent={setSelectedStudent}
                    setSettings={setSettings}
                    onCaptureState={captureAppState} // Pass captureAppState for sample/clear data actions
                />
            )}
 
            {modal === 'statistics' && <StatisticsModal onClose={() => setModal(null)} students={students} entries={entries} />}
            {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
            {searchModalOpen && <SearchModal onClose={handleCloseSearch} onSearch={handleSearch} />}
        </div>
    );
};
 
export default App;
