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

// Einstellungen anwenden - AKTUALISIERT FÜR NEUES THEME-SYSTEM
const applySettings = (settings) => {
    // THEME-NAMEN KONVERTIEREN: light -> hell, dark -> dunkel, colored -> farbig
    const themeMapping = {
        'light': 'hell',
        'dark': 'dunkel', 
        'colored': 'farbig'
    };
    
    const germanTheme = themeMapping[settings.theme] || 'hell';
    document.documentElement.setAttribute('data-theme', germanTheme);
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--input-font-size', `${settings.inputFontSize}px`);
    
    // Benutzerdefinierte Farben für farbiges Theme anwenden
    if (settings.theme === 'colored' && settings.customColors) {
        applyCustomColors(settings.customColors);
    } else {
        resetCustomColors();
    }
};

// Funktion zum Anwenden benutzerdefinierter Farben
const applyCustomColors = (colors) => {
    const root = document.documentElement;
    
    // SPEZIFISCHE FARBZUWESUNGEN:
    // Navigation -> linkes Navigationsmenü
    root.style.setProperty('--sidebar-bg', colors.navigation || '#fed7aa');
    
    // Header -> Kopfbereich
    root.style.setProperty('--primary-color', colors.header || '#dc2626');
    root.style.setProperty('--secondary-color', colors.header ? darkenColor(colors.header, 20) : '#b91c1c');
    
    // Werkzeugleiste -> Toolbar
    root.style.setProperty('--toolbar-bg-custom', colors.toolbar || '#f8fafc');
    
    // Fenster-Hintergrund -> Hauptinhalt und Dialoge
    root.style.setProperty('--background-color', colors.protocol || '#fef7ed');
    root.style.setProperty('--card-bg', colors.protocol ? lightenColor(colors.protocol, 10) : '#ffffff');
    root.style.setProperty('--modal-bg-custom', colors.protocol || '#ffffff');
    
    // Für das farbige Theme spezifische Anpassungen
    document.documentElement.classList.add('custom-colors-applied');
};

// Funktion zum Zurücksetzen der benutzerdefinierten Farben
const resetCustomColors = () => {
    const root = document.documentElement;
    // Entferne alle benutzerdefinierten Farbüberschreibungen
    root.style.removeProperty('--sidebar-bg');
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--toolbar-bg-custom');
    root.style.removeProperty('--background-color');
    root.style.removeProperty('--card-bg');
    root.style.removeProperty('--modal-bg-custom');
    
    document.documentElement.classList.remove('custom-colors-applied');
};

// Hilfsfunktion zum Aufhellen von Farben
const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
};

// Hilfsfunktion zum Abdunkeln von Farben
const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
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
    calculateStatistics,
    applyCustomColors,
    resetCustomColors,
    lightenColor,
    darkenColor
};
