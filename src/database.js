// =======================
// src/database.js
// =======================
import { openDB } from 'idb';

const DB_NAME = 'PedagogicalDocumentationDB';
const DB_VERSION = 1;

// Define object store names
const STUDENTS_STORE = 'students';
const ENTRIES_STORE = 'entries';
const SETTINGS_STORE = 'settings';
const MASTER_DATA_STORE = 'masterData';
const HISTORY_STORE = 'history'; // For undo/redo snapshots

// =======================
// Datenbank-Setup
// =======================
export const setupDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Students store
            if (!db.objectStoreNames.contains(STUDENTS_STORE)) {
                const studentStore = db.createObjectStore(STUDENTS_STORE, { keyPath: 'id', autoIncrement: true });
                studentStore.createIndex('name', 'name');
                studentStore.createIndex('schoolYear', 'schoolYear');
                studentStore.createIndex('school', 'school');
                studentStore.createIndex('className', 'className');
                // Added indexes for student detail fields from StudentModal
                studentStore.createIndex('gender', 'gender');
                studentStore.createIndex('nationality', 'nationality');
                studentStore.createIndex('germanLevel', 'germanLevel');
            }

            // Entries store
            if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
                const entryStore = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id', autoIncrement: true });
                entryStore.createIndex('studentId', 'studentId');
                entryStore.createIndex('date', 'date');
                // New indexes matching EntryModal fields
                entryStore.createIndex('subject', 'subject');
                entryStore.createIndex('observations', 'observations');
                entryStore.createIndex('measures', 'measures');
                entryStore.createIndex('erfolg', 'erfolg');
                entryStore.createIndex('erfolgRating', 'erfolgRating');
                // Keep old indexes for backwards compatibility with existing app.jsx search logic and old data
                entryStore.createIndex('topic', 'topic');
                entryStore.createIndex('activity', 'activity');
                entryStore.createIndex('notes', 'notes');
                entryStore.createIndex('bewertung', 'bewertung');
            }

            // Settings store
            if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
                db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
            }

            // Master Data store
            if (!db.objectStoreNames.contains(MASTER_DATA_STORE)) {
                db.createObjectStore(MASTER_DATA_STORE, { keyPath: 'id' });
            }

            // History store for Undo/Redo snapshots. No indexes needed as we operate on the whole store.
            if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: true });
            }
        }
    });
};

// =======================
// Utility function to get current app state (for history snapshots)
// =======================
const getCurrentAppState = async (db) => {
    const [students, entries, settings, masterData] = await Promise.all([
        db.getAll(STUDENTS_STORE),
        db.getAll(ENTRIES_STORE),
        db.get(SETTINGS_STORE, 1),
        db.get(MASTER_DATA_STORE, 1)
    ]);
    return { students, entries, settings, masterData };
};

// =======================
// Schüler-Funktionen
// =======================
export const getStudents = async (db) => {
    if (!db) return [];
    try {
        return await db.getAll(STUDENTS_STORE);
    } catch (err) {
        console.error('Fehler beim Abrufen der Schüler:', err);
        return [];
    }
};

export const addStudent = async (db, studentData, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    const id = await db.add(STUDENTS_STORE, studentData);
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
    return id; 
};

export const updateStudent = async (db, studentData, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    await db.put(STUDENTS_STORE, studentData);
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
};

export const deleteStudent = async (db, studentId, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    try {
        const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE], 'readwrite');
        const entryStore = tx.objectStore(ENTRIES_STORE);
        const index = entryStore.index('studentId');
        let cursor = await index.openCursor(IDBKeyRange.only(studentId));
        while (cursor) {
            await cursor.delete();
            cursor = await cursor.continue();
        }
        await tx.objectStore(STUDENTS_STORE).delete(studentId);
        await tx.done;
        await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
        return true;
    } catch (err) {
        console.error('Fehler beim Löschen des Schülers:', err);
        return false;
    }
};

// =======================
// Einträge-Funktionen
// =======================
export const getEntriesByStudentId = async (db, studentId) => {
    if (!db) return [];
    try {
        return await db.getAllFromIndex(ENTRIES_STORE, 'studentId', studentId);
    } catch (err) {
        console.error('Fehler beim Abrufen der Einträge nach Schüler:', err);
        return [];
    }
};

export const getEntriesByDate = async (db, date) => {
    if (!db) return [];
    try {
        return await db.getAllFromIndex(ENTRIES_STORE, 'date', date);
    } catch (err) {
        console.error('Fehler beim Abrufen der Einträge nach Datum:', err);
        return [];
    }
};

export const addEntry = async (db, entryData, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    const id = await db.add(ENTRIES_STORE, entryData);
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
    return id;
};

export const updateEntry = async (db, entryData, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    await db.put(ENTRIES_STORE, entryData);
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
};

export const deleteEntry = async (db, entryId, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    await db.delete(ENTRIES_STORE, entryId);
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
};

// =======================
// Einstellungen-Funktionen
// =======================
export const getSettings = async (db) => db.get(SETTINGS_STORE, 1);
export const saveSettings = async (db, settings, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    await db.put(SETTINGS_STORE, { ...settings, id: 1 });
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
};

// =======================
// Master-Daten-Funktionen
// =======================
export const getMasterData = async (db) => db.get(MASTER_DATA_STORE, 1);
export const saveMasterData = async (db, masterData, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    await db.put(MASTER_DATA_STORE, { ...masterData, id: 1 });
    await saveStateForUndo(db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData);
};

// =======================
// Undo/Redo-Funktionen (History managed by App.jsx, but operations on DB)
// =======================
const MAX_HISTORY_STATES = 50; 

// Saves the current state of students, entries, settings, and masterData to the history array.
// This function needs to be called by App.jsx after every state-changing DB operation.
export const saveStateForUndo = async (db, history, historyIndex, setHistory, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    try {
        const currentState = await getCurrentAppState(db);
        currentState.timestamp = new Date().toISOString(); // Add timestamp for debugging

        // Trim history if it's not at the end (e.g., after an undo, then new action)
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentState);

        // Limit history size
        if (newHistory.length > MAX_HISTORY_STATES) {
            newHistory.shift(); // Remove oldest state
            // If we remove an item from the start, the index relative to the start shifts.
            // But since we are always adding to the end and `historyIndex` points to the last valid state,
            // we should re-calculate the `historyIndex` to point to the new last element.
            setHistoryIndex(newHistory.length - 1); 
        } else {
            setHistoryIndex(newHistory.length - 1);
        }
        
        setHistory(newHistory); // Update App.jsx's history state
    } catch (err) {
        console.error('Fehler beim Speichern des Zustands für Undo:', err);
    }
};

// Undoes the last operation by restoring the previous state from history.
export const undo = async (db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    if (historyIndex <= 0 || !db) { // Cannot undo past the first state
        console.warn('Kein vorheriger Zustand zum Rückgängigmachen vorhanden.');
        return;
    }
    try {
        const prevState = history[historyIndex - 1];
        
        // Restore state to IndexedDB
        const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE, SETTINGS_STORE, MASTER_DATA_STORE], 'readwrite');
        await tx.objectStore(STUDENTS_STORE).clear();
        await tx.objectStore(ENTRIES_STORE).clear();
        await tx.objectStore(SETTINGS_STORE).clear();
        await tx.objectStore(MASTER_DATA_STORE).clear();

        for (const s of prevState.students) await tx.objectStore(STUDENTS_STORE).add(s);
        for (const e of prevState.entries) await tx.objectStore(ENTRIES_STORE).add(e);
        if (prevState.settings) await tx.objectStore(SETTINGS_STORE).put(prevState.settings);
        if (prevState.masterData) await tx.objectStore(MASTER_DATA_STORE).put(prevState.masterData);
        await tx.done;

        // Update App.jsx's React state
        if (setStudents) setStudents(prevState.students);
        if (setEntries) setEntries(prevState.entries);
        if (setSettings) setSettings(prevState.settings || { id: 1, theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
        if (setMasterData) setMasterData(prevState.masterData || { id: 1, schoolYears: [], schools: {}, subjects: [], activities: [], notesTemplates: [] });

        setHistoryIndex(historyIndex - 1); // Move history pointer back
    } catch (err) {
        console.error('Fehler beim Undo:', err);
    }
};

// Redoes an undone operation by restoring the next state from history.
export const redo = async (db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    if (historyIndex >= history.length - 1 || !db) { // Cannot redo past the last state
        console.warn('Kein späterer Zustand zum Wiederherstellen vorhanden.');
        return;
    }
    try {
        const nextState = history[historyIndex + 1];

        // Restore state to IndexedDB
        const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE, SETTINGS_STORE, MASTER_DATA_STORE], 'readwrite');
        await tx.objectStore(STUDENTS_STORE).clear();
        await tx.objectStore(ENTRIES_STORE).clear();
        await tx.objectStore(SETTINGS_STORE).clear();
        await tx.objectStore(MASTER_DATA_STORE).clear();

        for (const s of nextState.students) await tx.objectStore(STUDENTS_STORE).add(s);
        for (const e of nextState.entries) await tx.objectStore(ENTRIES_STORE).add(e);
        if (nextState.settings) await tx.objectStore(SETTINGS_STORE).put(nextState.settings);
        if (nextState.masterData) await tx.objectStore(MASTER_DATA_STORE).put(nextState.masterData);
        await tx.done;

        // Update App.jsx's React state
        if (setStudents) setStudents(nextState.students);
        if (setEntries) setEntries(nextState.entries);
        if (setSettings) setSettings(nextState.settings || { id: 1, theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
        if (setMasterData) setMasterData(nextState.masterData || { id: 1, schoolYears: [], schools: {}, subjects: [], activities: [], notesTemplates: [] });

        setHistoryIndex(historyIndex + 1); // Move history pointer forward
    } catch (err) {
        console.error('Fehler beim Redo:', err);
    }
};

// =======================
// Import-Funktion
// =======================
// This function directly interacts with the DB and App.jsx's state setters.
export const importData = async (db, event, setSettings, setMasterData, setStudents, setEntries, setSelectedStudent, setModal) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE, SETTINGS_STORE, MASTER_DATA_STORE, HISTORY_STORE], 'readwrite');
            
            // Clear all data stores, including history
            await tx.objectStore(STUDENTS_STORE).clear();
            await tx.objectStore(ENTRIES_STORE).clear();
            await tx.objectStore(SETTINGS_STORE).clear();
            await tx.objectStore(MASTER_DATA_STORE).clear();
            await tx.objectStore(HISTORY_STORE).clear(); 

            // Add imported data
            for (const s of data.students || []) await tx.objectStore(STUDENTS_STORE).add(s);
            for (const e of data.entries || []) await tx.objectStore(ENTRIES_STORE).add(e);
            if (data.settings) await tx.objectStore(SETTINGS_STORE).put(data.settings);
            if (data.masterData) await tx.objectStore(MASTER_DATA_STORE).put(data.masterData);
            await tx.done;

            // Update App.jsx's React state
            const importedStudents = await db.getAll(STUDENTS_STORE);
            const importedEntries = await db.getAll(ENTRIES_STORE);
            const importedSettings = await db.get(SETTINGS_STORE, 1);
            const importedMasterData = await db.get(MASTER_DATA_STORE, 1);

            if (setSettings) setSettings(importedSettings || { id: 1, theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
            if (setMasterData) setMasterData(importedMasterData || { id: 1, schoolYears: [], schools: {}, subjects: [], activities: [], notesTemplates: [] });
            if (setStudents) setStudents(importedStudents);
            if (setEntries) setEntries(importedEntries);
            if (setSelectedStudent) setSelectedStudent(importedStudents.length > 0 ? importedStudents[0] : null); // Select first student

            // After import, save the new state as the initial history entry
            // Note: This requires App.jsx to re-initialize its history state after import.
            // For simplicity in database.js, we assume App.jsx will handle this.
            // A more robust undo/redo would load history from DB if history store was used internally.
            alert('Daten erfolgreich importiert!');
            if (setModal) setModal(null); // Assuming setModal is passed to close a modal
        } catch (err) {
            console.error('Fehler beim Importieren:', err);
            alert('Fehler beim Importieren: ' + err.message);
        }
    };
    reader.readAsText(file);
};

// =======================
// Beispieldaten & Clear-Funktion
// =======================
export const loadSampleData = async (db, setMasterData, setStudents, setEntries, setSettings, setInitialSelectedStudent, setInitialSelectedDate) => {
    if (!db) return;
    try {
        // Clear all relevant stores including history
        await clearAllData(db, setStudents, setEntries, setSettings, setMasterData);

        const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE, MASTER_DATA_STORE, SETTINGS_STORE], 'readwrite');

        const sampleStudents = [
            { id: 1, name: 'Kevin Mustermann', schoolYear: '2025/2026', school: 'Ostschule', className: '1a', gender: 'männlich', nationality: 'Deutschland', germanLevel: '2', notes: 'Sehr aufmerksamer Schüler' },
            { id: 2, name: 'Anna Beispiel', schoolYear: '2025/2026', school: 'Heinz-Sielmann-Grundschule', className: '2b', gender: 'weiblich', nationality: 'Türkei', germanLevel: '1', notes: 'Braucht Unterstützung in Mathematik' },
            { id: 3, name: 'Lukas Schmidt', schoolYear: '2025/2026', school: 'Ostschule', className: '1b', gender: 'männlich', nationality: 'Ukraine', germanLevel: '3', notes: 'Sehr sozial' }
        ];
        for (const student of sampleStudents) await tx.objectStore(STUDENTS_STORE).add(student);

        // Updated sample entries to use new field names from EntryModal
        const sampleEntries = [
            { id: 1, studentId: 1, date: '2025-09-01', subject: 'Mathematik: Addieren', observations: 'Hat gut mitgemacht', measures: 'Individuelle Förderung', erfolg: 'Verstanden', erfolgRating: 'positiv' },
            { id: 2, studentId: 2, date: '2025-09-01', subject: 'Deutsch: Lesen', observations: 'Brauchte Hilfestellung bei langen Wörtern', measures: 'Zusätzliche Übung', erfolg: 'Leicht verbessert', erfolgRating: 'negativ' },
            { id: 3, studentId: 3, date: '2025-09-02', subject: 'Sachkunde: Pflanzen', observations: 'Sehr interessiert an Naturthemen', measures: 'Freie Projektarbeit', erfolg: 'Eigenständige Präsentation', erfolgRating: 'positiv' },
            { id: 4, studentId: 1, date: '2025-09-03', subject: 'Sport: Ballspiel', observations: 'Viel Energie, aber Teamspiel muss geübt werden', measures: 'Partnertraining', erfolg: '', erfolgRating: '' } 
        ];
        for (const entry of sampleEntries) await tx.objectStore(ENTRIES_STORE).add(entry);

        const defaultMasterData = {
            id: 1,
            schoolYears: ['2025/2026', '2024/2025', '2023/2024'],
            schools: {
                'Ostschule': ['1a', '1b', '2a'],
                'Heinz-Sielmann-Grundschule': ['2b', '3a', '4b']
            },
            subjects: ['Mathematik', 'Deutsch', 'Sachkunde', 'Sport', 'Englisch'],
            activities: ['Hausaufgaben', 'Klassenarbeit', 'Projektarbeit', 'Freiarbeit', 'Gruppenarbeit'], // Kept for consistency, but EntryModal uses 'measures'
            notesTemplates: ['Gut gemacht', 'Weitere Unterstützung nötig', 'Sehr aufmerksam', 'Sehr sozial', 'Zeigt gute Fortschritte', 'Bedarf an spezieller Förderung']
        };
        await tx.objectStore(MASTER_DATA_STORE).put(defaultMasterData);

        const defaultSettings = { id: 1, theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} };
        await tx.objectStore(SETTINGS_STORE).put(defaultSettings);

        await tx.done;

        // Update App.jsx's React state
        if (setMasterData) setMasterData(defaultMasterData);
        const updatedStudents = await db.getAll(STUDENTS_STORE);
        if (setStudents) setStudents(updatedStudents);
        if (setEntries) setEntries(await db.getAll(ENTRIES_STORE));
        if (setSettings) setSettings(defaultSettings);
        if (setInitialSelectedStudent) setInitialSelectedStudent(updatedStudents.length > 0 ? updatedStudents[0] : null);
        if (setInitialSelectedDate) setInitialSelectedDate(new Date().toISOString().split('T')[0]);


        // After loading sample data, save the new state as the initial history entry
        // NOTE: App.jsx needs to re-initialize its history state and index after this call.
        console.log('Beispieldaten erfolgreich geladen. Bitte App.jsx history-State neu initialisieren.');

    } catch (err) {
        console.error('Fehler beim Laden der Beispieldaten:', err);
        throw err; // Re-throw to allow App.jsx to catch
    }
};

export const clearAllData = async (db, setStudents, setEntries, setSettings, setMasterData) => {
    if (!db) return;
    try {
        const tx = db.transaction([STUDENTS_STORE, ENTRIES_STORE, SETTINGS_STORE, MASTER_DATA_STORE, HISTORY_STORE], 'readwrite');
        await tx.objectStore(STUDENTS_STORE).clear();
        await tx.objectStore(ENTRIES_STORE).clear();
        await tx.objectStore(SETTINGS_STORE).clear();
        await tx.objectStore(MASTER_DATA_STORE).clear();
        await tx.objectStore(HISTORY_STORE).clear(); // Clear history as well
        await tx.done;

        // Reset App.jsx's React state
        if (setStudents) setStudents([]);
        if (setEntries) setEntries([]);
        if (setSettings) setSettings({ id: 1, theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} }); // Reset to default
        if (setMasterData) setMasterData({ id: 1, schoolYears: [], schools: {}, subjects: [], activities: [], notesTemplates: [] }); // Reset to empty

        console.log('Alle Daten und History erfolgreich gelöscht.');
    } catch (err) {
        console.error('Fehler beim Löschen aller Daten:', err);
        throw err; // Re-throw to allow App.jsx to catch
    }
};
