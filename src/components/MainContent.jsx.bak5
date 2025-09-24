import React from 'react';

const MainContent = ({ viewMode, selectedStudent, selectedDate, entries, onEditEntry }) => {
    if (viewMode === 'student' && selectedStudent) {
        return (
            <div className="main">
                <h2>Protokolle für {selectedStudent.name}</h2>
                {entries.length === 0 ? (
                    <div className="welcome-screen centered">
                        <p>Keine Einträge für dieses Kind.</p>
                    </div>
                ) : (
                    <div className="entries-container">
                        {entries.map((entry) => (
                            <EntryCard
                                key={entry.id}
                                entry={entry}
                                student={selectedStudent}
                                onEdit={() => onEditEntry(entry)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    } else if (viewMode === 'day' && selectedDate) {
        const entriesByStudent = {};
        entries.forEach((entry) => {
            if (!entriesByStudent[entry.studentId]) {
                entriesByStudent[entry.studentId] = [];
            }
            entriesByStudent[entry.studentId].push(entry);
        });

        return (
            <div className="main">
                <h2>Einträge für {new Date(selectedDate).toLocaleDateString('de-DE')}</h2>
                {Object.keys(entriesByStudent).length === 0 ? (
                    <div className="welcome-screen centered">
                        <p>Keine Einträge für dieses Datum.</p>
                    </div>
                ) : (
                    <div className="entries-container">
                        {Object.entries(entriesByStudent).map(([studentId, studentEntries]) => (
                            <div key={studentId} className="student-entries-group">
                                <h3>{studentEntries[0].studentName || `Schüler ${studentId}`}</h3>
                                {studentEntries.map((entry) => (
                                    <EntryCard
                                        key={entry.id}
                                        entry={entry}
                                        onEdit={() => onEditEntry(entry)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className="main">
                <div className="welcome-screen centered">
                    <h2>Willkommen!</h2>
                    <p>
                        Wählen Sie links ein Kind aus der Liste, um die Protokolle anzuzeigen,
                        oder wählen Sie einen Tag, um alle Einträge für diesen Tag zu sehen.
                    </p>
                </div>
            </div>
        );
    }
};

const EntryCard = ({ entry, student, onEdit }) => {
    const studentName = student?.name || entry.studentName || `Schüler ${entry.studentId}`;

    return (
        <div className="entry-card">
            <div className="entry-header">
                <span className="entry-subject">{entry.subject}</span>
                <span className="entry-date">{new Date(entry.date).toLocaleDateString('de-DE')}</span>
            </div>
            <p><strong>Schüler:</strong> {studentName}</p>
            <p><strong>Beobachtungen:</strong> {entry.observations}</p>
            <p><strong>Maßnahmen:</strong> {entry.measures}</p>
            {entry.erfolg && <p><strong>Erfolg:</strong> {entry.erfolg}</p>}
            {entry.erfolgRating && <p><strong>Bewertung:</strong> {entry.erfolgRating}</p>}
            <button className="button button-3d" onClick={onEdit}>Bearbeiten</button>
        </div>
    );
};

export default MainContent;
