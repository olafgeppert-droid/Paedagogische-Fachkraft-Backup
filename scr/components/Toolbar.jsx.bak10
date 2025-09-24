import React from 'react';

const Toolbar = ({
    selectedStudent,
    selectedDate,
    onAddStudent,
    onEditStudent,      // Schüler bearbeiten
    onSearchProtocol,   // Protokoll suchen
    onAddEntry,
    onPrint,
    onExport,
    onImport,
    onUndo,
    onRedo,
    canUndo,
    canRedo
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

                {/* Protokoll suchen bleibt immer aktiv */}
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
        </div>
    );
};

export default Toolbar;
