// src/components/HelpModal.jsx
import React from 'react';
import { appVersion } from '../version.js';

const HelpModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '900px', width: '90%' }}>
                <div className="modal-header">
                    <h2>❓ Hilfe zur Anwendung</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div style={{ padding: '1rem', maxHeight: '70vh', overflowY: 'auto', lineHeight: '1.5' }}>
                    <p>Willkommen zur ausführlichen Hilfe für die <strong>pädagogische Dokumentations-App</strong>! 🎓 Hier erfahren Sie Schritt für Schritt, wie Sie Schüler verwalten, Einträge bearbeiten, Daten sichern, suchen und filtern können.</p>
                    <br />
                    <br />

                    <h3>👥 1. Schülerverwaltung</h3>
                    <p>In der Navigationsleiste sehen Sie alle Schüler. Sie können neue Schüler hinzufügen, bestehende bearbeiten oder löschen.</p>

                    <ul>
                        <li><strong>Schüler hinzufügen:</strong> Toolbar → „👥 Neuer Schüler“. Geben Sie Name, Geschlecht, Schule, Klasse und optional Notizen ein. Nach dem Speichern erscheint der Schüler sofort in der Liste.</li>

                        <li><strong>Schüler bearbeiten:</strong> Wählen Sie einen Schüler aus → „✏️ Schüler bearbeiten“. Ändern Sie die gewünschten Angaben und speichern.</li>

                        <li><strong>Schüler löschen:</strong> Im Bearbeitungsdialog auf „❌ Löschen“. Alle zugehörigen Einträge werden ebenfalls entfernt. Vorsicht!</li>

                        <li><strong>Filter & Suche:</strong> Oben in der Navigation finden Sie ein Suchfeld 🔍 und mehrere Dropdowns für Schuljahr, Schule und Klasse.</li>
                    </ul>

                    <p><strong>Beispiele für Filter-Kombinationen:</strong></p>
                    <ul>
                        <li>Suchfeld: <code>Anna</code> → zeigt alle Schüler, deren Name „Anna“ enthält.</li>
                        <li>Dropdown Schuljahr: <code>2024/2025</code> → zeigt nur Schüler dieses Jahrgangs.</li>
                        <li>Dropdown Schule + Klasse: z.B. Schule „Grundschule A“ und Klasse „3b“ → zeigt nur Schüler aus dieser Klasse.</li>
                        <li>Kombination Suche + Dropdowns: Suchbegriff „Anna“ + Schuljahr „2024/2025“ → zeigt Anna aus dem gewählten Jahr.</li>
                        <li>Datumsauswahl 📅: Filtert Einträge nach dem ausgewählten Tag, zeigt aber Schülerliste unverändert.</li>
                        <li>„❌ Filter löschen“ → setzt alle Filter zurück und zeigt alle Schüler.</li>
                        <br />
                        <br />
                    </ul>

                    <h3>📝 2. Einträge verwalten</h3>
                    <p>Jeder Schüler kann mehrere Einträge haben. Einträge können Beobachtungen, Aktivitäten, Bewertungen oder Notizen sein.</p>

                    <ul>
                        <li><strong>Neuer Eintrag:</strong> Toolbar → „📝 Eintrag hinzufügen“. Wählen Sie Schüler, Datum, Thema, Aktivität, Bewertung und Notizen aus.</li>
                        <li><strong>Eintrag bearbeiten:</strong> Klicken Sie auf einen Eintrag → „🔧 Eintrag bearbeiten“.</li>
                        <li><strong>Eintrag löschen:</strong> Nur im Bearbeitungsdialog über „❌ Löschen“ möglich.</li>
                        <li><strong>Datum filtern:</strong> Wählen Sie oben in der Navigation ein Datum, um nur Einträge dieses Tages anzuzeigen.</li>
                    </ul>

                    <p><strong>Besonderheiten beim Filtern von Einträgen:</strong></p>
                    <ul>
                        <li>Filtern nach Schüler + Datum → zeigt nur Einträge des gewählten Schülers am gewählten Tag.</li>
                        <li>Filtern nach Schüler + Thema → zeigt nur Einträge dieses Schülers mit dem gewählten Thema.</li>
                        <li>Alle Filter kombinierbar: Schüler, Datum, Schuljahr, Schule, Klasse, Thema/Projekt.</li>
                        <li>Suchfeld in Toolbar öffnet zusätzlich eine Volltextsuche über alle Einträge und Schüler.</li>
                        <br />
                        <br />
                    </ul>

                    <h3>🔎 3. Suche & erweiterte Filter</h3>
                    <p>Die Suche ist mächtig und kann nach unterschiedlichen Kriterien arbeiten.</p>

                    <ul>
                        <li><strong>Suchdialog öffnen:</strong> Toolbar → „🔍 Protokoll suchen“.</li>
                        <li><strong>Suchbegriffe:</strong>
                            <ul>
                                <li>Thema/Projekt</li>
                                <li>Aktivität</li>
                                <li>Bewertung</li>
                                <li>Notizen</li>
                                <li>Schülername</li>
                            </ul>
                        </li>
                        <li><strong>Exakte Suche:</strong> Mit Anführungszeichen: <code>"Mathematik"</code> → nur exakte Treffer.</li>
                        <li><strong>Alle Felder durchsuchen:</strong> Auswahl „Alle Felder“ durchsucht Thema, Aktivität, Notizen, Bewertung und Schülername.</li>
                    </ul>

                    <p><strong>Beispiele für Such- und Filter-Kombinationen:</strong></p>
                    <ul>
                        <li>Suchbegriff „Anna“ + Filter Name → zeigt nur Einträge von Anna.</li>
                        <li>Suchbegriff „Experiment“ + Filter Aktivität → zeigt alle Experiment-Einträge.</li>
                        <li>Exakte Suche „Mathematik“ → nur Einträge mit exakt diesem Thema.</li>
                        <li>Kombination Suchbegriff + Datum → zeigt Treffer nur an dem gewählten Tag.</li>
                        <li>Filter Schüler + Suchbegriff + Klasse → sehr gezielte Eingrenzung möglich.</li>
                        <br />
                        <br />
                    </ul>

                    <h3>💾 4. Datenmanagement</h3>
                    <ul>
                        <li><strong>Exportieren:</strong> Toolbar → „💾 Exportieren“. Erstellt eine JSON-Datei aller Daten. Auf iOS/Android öffnet sich der Teilen-Dialog.</li>
                        <li><strong>Importieren:</strong> Toolbar → „📥 Importieren“. Wählen Sie eine Sicherungsdatei aus.</li>
                        <li><strong>Drucken:</strong> Toolbar → „🖨️ Drucken“. Druckt die aktuelle Ansicht (z.B. alle Einträge eines Schülers).</li>
                        <li><strong>Beispieldaten laden:</strong> Toolbar → „📂 Beispieldaten“. Nützlich für Testzwecke.</li>
                        <li><strong>Alle Daten löschen:</strong> Toolbar → „❌ Alle Daten löschen“. Sicherheitsabfrage schützt vor versehentlichem Löschen.</li>
                        <br />
                        <br />
                    </ul>

                    <h3>⚙️ 5. Einstellungen</h3>
                    <ul>
                        <li>Farbschema: hell 🌞, dunkel 🌙 oder kontrastreich 🎨</li>
                        <li>Schriftgröße anpassen: für Standardtext und Eingabefelder</li>
                        <li>Stammdaten verwalten: Schuljahre, Schulen, Klassen, Aktivitäten, Notizvorlagen</li>
                        <li>Alle Einstellungen werden automatisch gespeichert</li>
                        <br />
                        <br />
                    </ul>

                    <h3>📊 6. Statistiken</h3>
                    <p>Statistiken geben Ihnen eine Übersicht zu Schülern, Klassen, Aktivitäten und Bewertungen.</p>
                    <ul>
                        <li>Button 📊 „Statistiken“ in Toolbar oder Navigation</li>
                        <li>Filter aus Navigation wirken direkt auf die Diagramme</li>
                        <li>Diagramme visualisieren Einträge nach Thema, Bewertung, Aktivität oder Schüler</li>
                        <li>Interaktiv: Klicken auf eine Kategorie, um Detailinformationen zu sehen</li>
                        <br />
                        <br />
                    </ul>

                    <h3>🖐️ 7. Hilfe & Support</h3>
                    <ul>
                        <li>Button ❓ „Hilfe“ öffnet dieses Fenster jederzeit</li>
                        <li>Dialoge schließen über × oben rechts oder „✔️ Verstanden“-Button</li>
                        <li>Software-Version wird am unteren Rand angezeigt: {appVersion}</li>
                        <br />
                        <br />
                    </ul>

                    <p>Mit dieser Hilfe können Sie nun alle Funktionen optimal nutzen, Schüler und Einträge gezielt suchen, filtern und verwalten, sowie Daten sichern und analysieren.</p>
                </div>

                <div className="form-actions" style={{ marginTop: '1rem' }}>
                    <button type="button" className="button button-success" onClick={onClose}>
                        ✔️ Verstanden
                    </button>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    Version {appVersion}
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
