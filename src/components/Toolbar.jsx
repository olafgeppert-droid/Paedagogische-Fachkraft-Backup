import React from 'react';

const Toolbar = ({
    students,
    selectedStudent,
    onAddStudent,
    onEditStudent,
    onSearchProtocol,
    onAddEntry,
    onPrint,
    onExport,
    onImport,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    // onLoadSampleData, // ENTFERNT: Nicht mehr direkt in Toolbar
    // onClearAllData    // ENTFERNT: Nicht mehr direkt in Toolbar
}) => {
    return (
        <div className="toolbar">
            {/* Erste Zeile: Schüler- und Protokollfunktionen */}
            <div className="toolbar-row">
                <button
                    className="button"
                    onClick={onAddStudent}
                    title="Neuen Schüler hinzufügen"
                >
                    👥 Neuer Schüler
                </button>

                <button
                    className="button"
                    onClick={onEditStudent}
                    title="Ausgewählten Schüler bearbeiten"
                    disabled={!selectedStudent}
                >
                    ✏️ Schüler bearbeiten
                </button>

                <button
                    className="button"
                    onClick={onAddEntry}
                    title="Neues Protokoll anlegen"
                    disabled={!selectedStudent}
                >
                    📝 Protokoll anlegen
                </button>

                <button
                    className="button"
                    onClick={onSearchProtocol}
                    title="Protokoll suchen"
                >
                    🔍 Protokoll suchen
                </button>
            </div>

            {/* Zweite Zeile: Datenmanagement-Funktionen */}
            <div className="toolbar-row">
                <button
                    className="button"
                    onClick={onPrint}
                    title="Drucken"
                    disabled={!selectedStudent}
                >
                    🖨️ Drucken
                </button>

                <button
                    className="button"
                    onClick={onExport}
                    title="Daten exportieren / Teilen"
                >
                    💾 Export / Teilen
                </button>

                <button
                    className="button"
                    onClick={onImport}
                    title="Daten importieren"
                >
                    📥 Import
                </button>

                <button
                    className="button"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Rückgängig"
                >
                    ↩️ Rückgängig
                </button>

                <button
                    className="button"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Wiederherstellen"
                >
                    ↪️ Wiederherstellen
                </button>
            </div>

            {/* Dritte Zeile: Globale Datenaktionen (ENTFERNT, WURDE NACH SETTINGS VERSCHOBEN) */}
            {/*
            <div className="toolbar-row">
                <button
                    className="button button-warning"
                    onClick={onLoadSampleData}
                    title="Beispieldaten laden (überschreibt alle Daten)"
                >
                    📂 Beispieldaten
                </button>
                <button
                    className="button button-danger"
                    onClick={onClearAllData}
                    title="ALLE Daten löschen (endgültig!)"
                >
                    🗑️ Alle Daten löschen
                </button>
            </div>
            */}
        </div>
    );
};

export default Toolbar;
