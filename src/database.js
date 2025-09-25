// src/database.js
import { openDB } from 'idb';
 
// =======================
// Datenbank-Setup
// =======================
export const setupDB = async () => {
    return openDB('PedagogicalDocumentationDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('students')) {
                const store = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                store.createIndex('name', 'name');
                store.createIndex('schoolYear', 'schoolYear');
                store.createIndex('school', 'school');
                store.createIndex('className', 'className');
            }
 
            if (!db.objectStoreNames.contains('entries')) {
                const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                store.createIndex('studentId', 'studentId');
                store.createIndex('date', 'date');
                // Added new indexes for search optimization
                store.createIndex('subject', 'subject');
                store.createIndex('observations', 'observations');
                store.createIndex('measures', 'measures');
                store.createIndex('erfolg', 'erfolg');
                store.createIndex('erfolgRating', 'erfolgRating');
            }
 
            if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('masterData')) db.createObjectStore('masterData', { keyPath: 'id' });
            // History store is handled by React state, not IndexedDB for simplicity here.
            // If persistent undo/redo is needed, a 'history' store would be added here.
        }
    });
};
 
// =======================
// Schüler-Funktionen
// =======================
export const addStudent = async (db, studentData) => {
    const id = await db.add('students', studentData);
    return { ...studentData, id };
};
 
export const updateStudent = async (db, studentData) => {
    await db.put('students', studentData);
};
 
export const deleteStudent = async (db, studentId) => {
    try {
        const tx = db.transaction(['students', 'entries'], 'readwrite');
        const entryStore = tx.objectStore('entries');
        const index = entryStore.index('studentId');
        let cursor = await index.openCursor(IDBKeyRange.only(studentId));
        while (cursor) {
            await cursor.delete();
            cursor = await cursor.continue();
        }
        await tx.objectStore('students').delete(studentId);
        await tx.done;
        return true;
    } catch (err) {
        console.error('Fehler beim Löschen des Schülers:', err);
        return false;
    }
};
 
// =======================
// Studenten abrufen
// =======================
export const getStudents = async (db) => {
    if (!db) return [];
    try {
        return await db.getAll('students');
    } catch (err) {
        console.error('Fehler beim Abrufen der Schüler:', err);
        return [];
    }
};
 
// =======================
// Einträge-Funktionen
// =======================
export const getEntriesByStudentId = async (db, studentId) => {
    if (!db) return [];
    try {
        return await db.getAllFromIndex('entries', 'studentId', studentId);
    } catch (err) {
        console.error('Fehler beim Abrufen der Einträge nach Schüler:', err);
        return [];
    }
};

// NEU: Funktion zum Abrufen ALLER Einträge
export const getAllEntries = async (db) => {
    if (!db) return [];
    try {
        return await db.getAll('entries');
    } catch (err) {
        console.error('Fehler beim Abrufen aller Einträge:', err);
        return [];
    }
};
 
export const getEntriesByDate = async (db, date) => {
    if (!db) return [];
    try {
        return await db.getAllFromIndex('entries', 'date', date);
    } catch (err) {
        console.error('Fehler beim Abrufen der Einträge nach Datum:', err);
        return [];
    }
};
 
export const addEntry = async (db, entryData) => {
    const id = await db.add('entries', entryData);
    return { ...entryData, id };
};
 
export const updateEntry = async (db, entryData) => {
    await db.put('entries', entryData);
};
 
export const deleteEntry = async (db, entryId) => {
    await db.delete('entries', entryId);
};
 
// =======================
// Einstellungen-Funktionen
// =======================
export const getSettings = async (db) => db.get('settings', 1);
export const saveSettings = async (db, settings) => db.put('settings', { ...settings, id: 1 });
 
// =======================
// Master-Daten-Funktionen
// =======================
export const getMasterData = async (db) => db.get('masterData', 1);
export const saveMasterData = async (db, masterData) => db.put('masterData', { ...masterData, id: 1 });
 
// =======================
// Undo/Redo-Funktionen (React state based history management)
// App.jsx will call saveStateForUndo and manage history array.
// undo/redo here are utility functions to restore DB state based on a history item.
// =======================
export const saveStateForUndo = async (db, setHistory, setHistoryIndex, currentHistory, currentHistoryIndex) => {
    try {
        const [students, entries, settings, masterData] = await Promise.all([
            db.getAll('students'),
            db.getAll('entries'),
            db.get('settings', 1),
            db.get('masterData', 1)
        ]);
        const currentState = { students, entries, settings, masterData, timestamp: new Date().toISOString() };
        const newHistory = currentHistory.slice(0, currentHistoryIndex + 1);
        newHistory.push(currentState);
        if (newHistory.length > 50) newHistory.shift(); // Limit history size
 
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    } catch (err) {
        console.error('Fehler beim Speichern des Zustands für Undo:', err);
    }
};
 
export const undo = async (db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    if (historyIndex <= 0 || !db) return;
    try {
        const prevState = history[historyIndex - 1];
        const tx = db.transaction(['students','entries','settings','masterData'], 'readwrite');
        await tx.objectStore('students').clear();
        await tx.objectStore('entries').clear();
        await tx.objectStore('settings').clear();
        await tx.objectStore('masterData').clear();
       
        // Restore previous state items
        for (const s of prevState.students) await tx.objectStore('students').add(s);
        for (const e of prevState.entries) await tx.objectStore('entries').add(e);
        if (prevState.settings) await tx.objectStore('settings').put(prevState.settings);
        // Korrektur: masterData an neue Struktur anpassen
        if (prevState.masterData) await tx.objectStore('masterData').put({
            id: 1, // Stellen Sie sicher, dass die ID für masterData 1 ist
            schoolYears: prevState.masterData.schoolYears || [],
            schools: prevState.masterData.schools || {},
            notesTemplates: prevState.masterData.notesTemplates || []
        });
        await tx.done;
 
        // Update React states in App.jsx
        setStudents(prevState.students || []);
        setEntries(prevState.entries || []);
        setSettings(prevState.settings || { theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
        // Korrektur: masterData an neue Struktur anpassen
        setMasterData({
            schoolYears: prevState.masterData?.schoolYears || [],
            schools: prevState.masterData?.schools || {},
            notesTemplates: prevState.masterData?.notesTemplates || []
        });
       
        setHistoryIndex(historyIndex - 1);
    } catch (err) {
        console.error('Fehler beim Undo:', err);
    }
};
 
export const redo = async (db, history, historyIndex, setHistoryIndex, setStudents, setEntries, setSettings, setMasterData) => {
    if (historyIndex >= history.length - 1 || !db) return;
    try {
        const nextState = history[historyIndex + 1];
        const tx = db.transaction(['students','entries','settings','masterData'], 'readwrite');
        await tx.objectStore('students').clear();
        await tx.objectStore('entries').clear();
        await tx.objectStore('settings').clear();
        await tx.objectStore('masterData').clear();
       
        for (const s of nextState.students) await tx.objectStore('students').add(s);
        for (const e of nextState.entries) await tx.objectStore('entries').add(e);
        if (nextState.settings) await tx.objectStore('settings').put(nextState.settings);
        // Korrektur: masterData an neue Struktur anpassen
        if (nextState.masterData) await tx.objectStore('masterData').put({
            id: 1, // Stellen Sie sicher, dass die ID für masterData 1 ist
            schoolYears: nextState.masterData.schoolYears || [],
            schools: nextState.masterData.schools || {},
            notesTemplates: nextState.masterData.notesTemplates || []
        });
        await tx.done;
 
        // Update React states in App.jsx
        setStudents(nextState.students || []);
        setEntries(nextState.entries || []);
        setSettings(nextState.settings || { theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} });
        // Korrektur: masterData an neue Struktur anpassen
        setMasterData({
            schoolYears: nextState.masterData?.schoolYears || [],
            schools: nextState.masterData?.schools || {},
            notesTemplates: nextState.masterData?.notesTemplates || []
        });
       
        setHistoryIndex(historyIndex + 1);
    } catch (err) {
        console.error('Fehler beim Redo:', err);
    }
};
 
// =======================
// Export / Import (Internal utility for App.jsx to use)
// =======================
export const _importDataInternal = async (db, file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file selected.');
            return;
        }
 
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const tx = db.transaction(['students','entries','settings','masterData'], 'readwrite');
               
                await tx.objectStore('students').clear();
                for (const s of data.students) await tx.objectStore('students').add(s);
               
                await tx.objectStore('entries').clear();
                for (const e of data.entries) await tx.objectStore('entries').add(e);
               
                await tx.objectStore('settings').clear();
                if (data.settings) await tx.objectStore('settings').put(data.settings);
               
                await tx.objectStore('masterData').clear();
                // Korrektur: Stellen Sie sicher, dass nur die erlaubten Masterdaten importiert werden
                if (data.masterData) await tx.objectStore('masterData').put({
                    id: 1,
                    schoolYears: data.masterData.schoolYears || [],
                    schools: data.masterData.schools || {},
                    notesTemplates: data.masterData.notesTemplates || []
                });
               
                await tx.done;
 
                resolve(data); // Return the imported data for App.jsx to update states
            } catch (err) {
                console.error('Fehler beim Importieren:', err);
                reject('Import fehlgeschlagen: ' + (err.message || err));
            }
        };
        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsText(file);
    });
};
 
// =======================
// Beispieldaten & Clear-Funktion (Now just updates DB, App.jsx handles state and history)
// =======================
export const loadSampleData = async (db) => {
    if (!db) return;
    try {
        const tx = db.transaction(['students','entries','settings','masterData'], 'readwrite');
        await tx.objectStore('students').clear();
        await tx.objectStore('entries').clear();
        await tx.objectStore('masterData').clear();
 
        // Korrektur: Sample Students mit fehlenden Feldern ergänzt
        const sampleStudents = [
            { id: 1, name: 'Kevin Mustermann', schoolYear: '2025/2026', school: 'Ostschule', className: '1a', gender: 'männlich', nationality: 'Deutschland', germanLevel: '2 - Gut', notes: 'Sehr aufmerksamer Schüler, zeigt großes Interesse an neuen Themen.' },
            { id: 2, name: 'Anna Beispiel', schoolYear: '2025/2026', school: 'Heinz-Sielmann-Grundschule', className: '2b', gender: 'weiblich', nationality: 'Türkei', germanLevel: '1 - Sehr gut', notes: 'Braucht Unterstützung in Mathematik, ist aber sehr motiviert.' },
            { id: 3, name: 'Lukas Schmidt', schoolYear: '2025/2026', school: 'Ostschule', className: '1b', gender: 'männlich', nationality: 'Ukraine', germanLevel: '4 - Ausreichend', notes: 'Zeigt gute Fortschritte in Deutsch, benötigt jedoch noch gezielte Förderung in Grammatik.' },
            { id: 4, name: 'Maria Müller', schoolYear: '2024/2025', school: 'Westschule', className: '3a', gender: 'weiblich', nationality: 'Syrien', germanLevel: '3 - Befriedigend', notes: 'Integration in die Klasse läuft gut, besonders aktiv im Kunstunterricht.' },
            { id: 5, name: 'Omar Al-Hassan', schoolYear: '2024/2025', school: 'Nord-Grundschule', className: '4b', gender: 'männlich', nationality: 'Afghanistan', germanLevel: '5 - Mangelhaft', notes: 'Sprachliche Barriere erschwert die Teilnahme, sucht aber aktiv Kontakt zu Mitschülern.' }
        ];
        for (const student of sampleStudents) await tx.objectStore('students').put(student);
 
        const sampleEntries = [
            { id: 1, studentId: 1, date: '2025-09-01', subject: 'Mathematik', observations: 'Hat gut mitgemacht', measures: 'Individuelle Förderung', erfolg: 'Gut verstanden', erfolgRating: 'positiv' },
            { id: 2, studentId: 2, date: '2025-09-01', subject: 'Deutsch', observations: 'Brauchte Hilfestellung', measures: 'Zusätzliche Erklärungen', erfolg: 'Teilweise verstanden', erfolgRating: 'negativ' },
            { id: 3, studentId: 3, date: '2025-09-02', subject: 'Sachkunde', observations: 'Sehr interessiert', measures: 'Vertiefende Aufgaben', erfolg: 'Hervorragende Mitarbeit', erfolgRating: 'positiv' },
            { id: 4, studentId: 1, date: '2025-09-03', subject: 'Sport', observations: 'Viel Energie', measures: 'Mehr Bewegungsmöglichkeiten', erfolg: 'Gut ausgepowert', erfolgRating: '' }, // Beispieldaten für leere Erfolgsbewertung
            { id: 5, studentId: 4, date: '2024-10-15', subject: 'Kunst', observations: 'Hat ein kreatives Bild gemalt.', measures: 'Lob und Ermutigung, Bild im Klassenzimmer ausstellen.', erfolg: 'Stolz auf die eigene Leistung.', erfolgRating: 'positiv' },
            { id: 6, studentId: 5, date: '2024-11-05', subject: 'Deutsch', observations: 'Schwierigkeiten beim Verständnis von Aufgabenstellungen.', measures: 'Aufgabenstellungen vereinfachen und visuell unterstützen.', erfolg: 'Leichte Verbesserung, benötigt weitere Unterstützung.', erfolgRating: 'negativ' }
        ];
        for (const entry of sampleEntries) await tx.objectStore('entries').put(entry);
 
        // Korrektur: 'subjects' und 'activities' aus den defaultMasterData entfernt
        const defaultMasterData = {
            id: 1,
            schoolYears: ['2025/2026', '2024/2025', '2023/2024'],
            schools: {
                'Ostschule': ['1a','1b','2a'],
                'Heinz-Sielmann-Grundschule': ['2b','3c'],
                'Westschule': ['3a', '3b'],
                'Nord-Grundschule': ['4a', '4b']
            },
            notesTemplates: ['Schnelle Auffassungsgabe', 'Braucht mehr Übung', 'Zeigt gute Teamfähigkeit', 'Konzentriert sich gut']
        };
        await tx.objectStore('masterData').put(defaultMasterData);
        await tx.done;
 
        return { students: sampleStudents, entries: sampleEntries, masterData: defaultMasterData }; // Return loaded data
    } catch (err) {
        console.error('Fehler beim Laden der Beispieldaten:', err);
        throw err; // Propagate error
    }
};
 
export const clearAllData = async (db) => {
    if (!db) return;
    try {
        const tx = db.transaction(['students','entries','settings','masterData'], 'readwrite');
        await tx.objectStore('students').clear();
        await tx.objectStore('entries').clear();
        await tx.objectStore('settings').clear();
        await tx.objectStore('masterData').clear();
        await tx.done;
 
        // Return empty data structures for App.jsx to update states
        // Korrektur: 'subjects' und 'activities' aus dem masterData-Reset entfernt
        return {
            students: [],
            entries: [],
            settings: { theme: 'hell', fontSize: 16, inputFontSize: 16, customColors: {} },
            masterData: { schoolYears: [], schools: {}, notesTemplates: [] }
        };
    } catch (err) {
        console.error('Fehler beim Löschen aller Daten:', err);
        throw err; // Propagate error
    }
};
