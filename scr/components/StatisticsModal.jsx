import React from 'react';

const StatisticsModal = ({ students, entries, onClose }) => {
    const stats = calculateStatistics(students, entries);
    
    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Statistiken</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                
                <div>
                    <h3>Übersicht</h3>
                    <p><strong>Gesamtzahl Schüler:</strong> {stats.totalStudents}</p>
                    <p><strong>Gesamtzahl Einträge:</strong> {stats.totalEntries}</p>
                    <p><strong>Durchschnittliche Einträge pro Schüler:</strong> {stats.totalStudents > 0 ? (stats.totalEntries / stats.totalStudents).toFixed(1) : 0}</p>
                    
                    <h3>Einträge nach Schülern</h3>
                    <p><strong>Schüler mit Einträgen:</strong> {stats.studentsWithEntries}</p>
                    <p><strong>Schüler ohne Einträge:</strong> {stats.studentsWithoutEntries}</p>
                    
                    <h3>Bewertungen</h3>
                    <p><strong>Positive Bewertungen:</strong> {stats.ratings.positiv}</p>
                    <p><strong>Negative Bewertungen:</strong> {stats.ratings.negativ}</p>
                    <p><strong>Keine Bewertung:</strong> {stats.ratings.keine}</p>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="button" onClick={onClose}>Schließen</button>
                </div>
            </div>
        </div>
    );
};

function calculateStatistics(students, entries) {
    const totalStudents = students.length;
    const totalEntries = entries.length;
    
    const studentsWithEntries = new Set(entries.map(entry => entry.studentId)).size;
    const studentsWithoutEntries = totalStudents - studentsWithEntries;
    
    const ratings = {
        positiv: entries.filter(entry => entry.erfolgRating === 'positiv').length,
        negativ: entries.filter(entry => entry.erfolgRating === 'negativ').length,
        keine: entries.filter(entry => !entry.erfolgRating || entry.erfolgRating === '').length
    };
    
    return {
        totalStudents,
        totalEntries,
        studentsWithEntries,
        studentsWithoutEntries,
        ratings
    };
}

// ES-Modul Export
export default StatisticsModal;
