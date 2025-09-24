// Schüler filtern
const filterStudents = (students, filters) => {
    return students.filter(student => {
        const matchesSearch = filters.search === '' || 
            student.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesSchoolYear = filters.schoolYear === '' || 
            student.schoolYear === filters.schoolYear;
        const matchesSchool = filters.school === '' || 
            student.school === filters.school;
        const matchesClass = filters.className === '' || 
            student.className === filters.className;
        
        return matchesSearch && matchesSchoolYear && matchesSchool && matchesClass;
    });
};

// Einstellungen anwenden
const applySettings = (settings) => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--input-font-size', `${settings.inputFontSize}px`);
};

// Eintrag speichern
const saveEntry = async (db, entryData, entries, setEntries, setModal) => {
    if (!db) return;
    
    try {
        if (entryData.id) {
            // Vorhandenen Eintrag aktualisieren
            await db.put('entries', entryData);
            setEntries(entries.map(e => e.id === entryData.id ? entryData : e));
        } else {
            // Neuen Eintrag hinzufügen
            const id = await db.add('entries', entryData);
            const newEntry = { ...entryData, id };
            setEntries([...entries, newEntry]);
        }
        
        setModal(null);
    } catch (error) {
        console.error('Fehler beim Speichern des Eintrags:', error);
    }
};

// Einstellungen speichern (Helper-Version)
const saveSettingsHelper = async (db, newSettings, setSettings, setModal) => {
    if (!db) return;
    
    try {
        await db.put('settings', { ...newSettings, id: 1 });
        setSettings(newSettings);
        
        // UI anpassen
        applySettings(newSettings);
        
        setModal(null);
    } catch (error) {
        console.error('Fehler beim Speichern der Einstellungen:', error);
    }
};

// Master-Daten speichern (Helper-Version)
const saveMasterDataHelper = async (db, newMasterData, setMasterData) => {
    if (!db) return;
    
    try {
        await db.put('masterData', { ...newMasterData, id: 1 });
        setMasterData(newMasterData);
    } catch (error) {
        console.error('Fehler beim Speichern der Master-Daten:', error);
    }
};

// Statistiken berechnen
const calculateStatistics = (students, entries) => {
    const totalStudents = students.length;
    const totalEntries = entries.length;
    
    const entriesByStudent = {};
    entries.forEach(entry => {
        if (!entriesByStudent[entry.studentId]) {
            entriesByStudent[entry.studentId] = 0;
        }
        entriesByStudent[entry.studentId]++;
    });
    
    const studentsWithEntries = Object.keys(entriesByStudent).length;
    const studentsWithoutEntries = totalStudents - studentsWithEntries;
    
    const ratings = {
        positiv: 0,
        negativ: 0,
        keine: 0
    };
    
    entries.forEach(entry => {
        if (entry.erfolgRating === 'positiv') {
            ratings.positiv++;
        } else if (entry.erfolgRating === 'negativ') {
            ratings.negativ++;
        } else {
            ratings.keine++;
        }
    });
    
    return {
        totalStudents,
        totalEntries,
        studentsWithEntries,
        studentsWithoutEntries,
        ratings
    };
};

// Globale Registrierung aller Funktionen
window.helpers = {
    filterStudents,
    applySettings,
    saveEntry,
    saveSettingsHelper,
    saveMasterDataHelper,
    calculateStatistics
};
