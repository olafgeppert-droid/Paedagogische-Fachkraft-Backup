import React from 'react';

// Erweitert die calculateStatistics Funktion für detailliertere Auswertungen
function calculateStatistics(allStudents, allEntries) {
    const totalStudents = allStudents.length;
    const totalEntries = allEntries.length;
    
    // Protokolle pro Schüler ID zählen
    const entryCountPerStudentId = allEntries.reduce((acc, entry) => {
        acc[entry.studentId] = (acc[entry.studentId] || 0) + 1;
        return acc;
    }, {});

    const studentsWithEntries = Object.keys(entryCountPerStudentId).length;
    const studentsWithoutEntries = totalStudents - studentsWithEntries;
    
    const ratings = {
        positiv: allEntries.filter(entry => entry.erfolgRating === 'positiv').length,
        negativ: allEntries.filter(entry => entry.erfolgRating === 'negativ').length,
        keine: allEntries.filter(entry => !entry.erfolgRating || entry.erfolgRating === '').length
    };

    // Statistiken nach Schuljahr, Schule, Klasse, Geschlecht, Nationalität, Deutschkenntnissen
    const entriesBySchoolYear = {};
    const entriesBySchool = {};
    const entriesByClassName = {};
    const entriesBySubject = {};
    const studentsByGender = {};
    const studentsByNationality = {};
    const studentsByGermanLevel = {};

    allEntries.forEach(entry => {
        const student = allStudents.find(s => s.id === entry.studentId);
        if (student) {
            entriesBySchoolYear[student.schoolYear] = (entriesBySchoolYear[student.schoolYear] || 0) + 1;
            entriesBySchool[student.school] = (entriesBySchool[student.school] || 0) + 1;
            entriesByClassName[`${student.school} - ${student.className}`] = (entriesByClassName[`${student.school} - ${student.className}`] || 0) + 1;
        }
        entriesBySubject[entry.subject] = (entriesBySubject[entry.subject] || 0) + 1;
    });

    allStudents.forEach(student => {
        studentsByGender[student.gender] = (studentsByGender[student.gender] || 0) + 1;
        studentsByNationality[student.nationality] = (studentsByNationality[student.nationality] || 0) + 1;
        studentsByGermanLevel[student.germanLevel] = (studentsByGermanLevel[student.germanLevel] || 0) + 1;
    });

    // Top 5 der aktivsten Schüler
    const sortedStudentsByEntryCount = Object.entries(entryCountPerStudentId)
        .map(([studentId, count]) => {
            const student = allStudents.find(s => s.id === parseInt(studentId));
            return { name: student ? student.name : `Unbekannter Schüler ${studentId}`, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Top 5 der häufigsten Fächer/Themen
    const sortedSubjects = Object.entries(entriesBySubject)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);
    
    return {
        totalStudents,
        totalEntries,
        averageEntriesPerStudent: totalStudents > 0 ? (totalEntries / totalStudents).toFixed(1) : 0,
        studentsWithEntries,
        studentsWithoutEntries,
        ratings,
        entriesBySchoolYear,
        entriesBySchool,
        entriesByClassName,
        studentsByGender,
        studentsByNationality,
        studentsByGermanLevel,
        sortedStudentsByEntryCount,
        sortedSubjects
    };
}


const StatisticsModal = ({ allStudents, allEntries, onClose }) => { // Akzeptiert alle Studenten und Protokolle
    const stats = calculateStatistics(allStudents, allEntries);
    
    // Hilfsfunktion zum Rendern von Listen mit Prozentangaben
    const renderListWithPercentage = (data, totalCount) => {
        if (Object.keys(data).length === 0) return <p>Keine Daten vorhanden.</p>;
        return (
            <ul>
                {Object.entries(data).sort((a,b) => b[1] - a[1]).map(([key, count]) => (
                    <li key={key}>
                        <strong>{key || 'Unbekannt'}:</strong> {count} ({((count / totalCount) * 100).toFixed(1)}%)
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '700px', width: '90%' }}>
                <div className="modal-header">
                    <h2>📊 Statistiken</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <div style={{ padding: '1rem', maxHeight: '70vh', overflowY: 'auto', lineHeight: '1.5' }}>
                    <h3>Gesamtübersicht</h3>
                    <p><strong>Gesamtzahl Schüler:</strong> {stats.totalStudents}</p>
                    <p><strong>Gesamtzahl Protokolle:</strong> {stats.totalEntries}</p>
                    <p><strong>Durchschnittliche Protokolle pro Schüler:</strong> {stats.averageEntriesPerStudent}</p>
                    <hr/>

                    <h3>Schülerstatus</h3>
                    <p><strong>Schüler mit Protokolle:</strong> {stats.studentsWithEntries}</p>
                    <p><strong>Schüler ohne Protokolle:</strong> {stats.studentsWithoutEntries}</p>
                    <hr/>

                    <h3>Protokolle nach Schuljahr</h3>
                    {renderListWithPercentage(stats.entriesBySchoolYear, stats.totalEntries)}
                    <hr/>

                    <h3>Protokolle nach Schule</h3>
                    {renderListWithPercentage(stats.entriesBySchool, stats.totalEntries)}
                    <hr/>

                    <h3>Protokolle nach Klasse</h3>
                    {renderListWithPercentage(stats.entriesByClassName, stats.totalEntries)}
                    <hr/>

                    <h3>Verteilung der Schüler nach Geschlecht</h3>
                    {renderListWithPercentage(stats.studentsByGender, stats.totalStudents)}
                    <hr/>

                    <h3>Verteilung der Schüler nach Nationalität</h3>
                    {renderListWithPercentage(stats.studentsByNationality, stats.totalStudents)}
                    <hr/>

                    <h3>Verteilung der Schüler nach Deutschkenntnissen</h3>
                    {renderListWithPercentage(stats.studentsByGermanLevel, stats.totalStudents)}
                    <hr/>

                    <h3>Häufigste Fächer / Themen (Top 5)</h3>
                    {stats.sortedSubjects.length === 0 ? <p>Keine Daten vorhanden.</p> : (
                        <ul>
                            {stats.sortedSubjects.map(([subject, count]) => (
                                <li key={subject}>
                                    <strong>{subject || 'Ohne Angabe'}:</strong> {count} Protokolle ({((count / stats.totalEntries) * 100).toFixed(1)}%)
                                </li>
                            ))}
                        </ul>
                    )}
                    <hr/>

                    <h3>Erfolgsbewertungen</h3>
                    <ul>
                        <li><strong>Positive Bewertungen:</strong> {stats.ratings.positiv} ({((stats.ratings.positiv / stats.totalEntries) * 100).toFixed(1)}%)</li>
                        <li><strong>Negative Bewertungen:</strong> {stats.ratings.negativ} ({((stats.ratings.negativ / stats.totalEntries) * 100).toFixed(1)}%)</li>
                        <li><strong>Keine Bewertung:</strong> {stats.ratings.keine} ({((stats.ratings.keine / stats.totalEntries) * 100).toFixed(1)}%)</li>
                    </ul>
                    <hr/>

                    <h3>Aktivste Schüler (Top 5 nach Protokollen)</h3>
                    {stats.sortedStudentsByEntryCount.length === 0 ? <p>Keine Daten vorhanden.</p> : (
                        <ul>
                            {stats.sortedStudentsByEntryCount.map(item => (
                                <li key={item.name}>
                                    <strong>{item.name}:</strong> {item.count} Protokolle
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className="form-actions">
                    <button type="button" className="button" onClick={onClose}>Schließen</button>
                </div>
            </div>
        </div>
    );
};

export default StatisticsModal;
