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

                    <h3>👥 1. Schülerverwaltung</h3>
                    <p>Die linke Navigationsleiste zeigt Ihnen eine Liste aller erfassten Schüler an. Sie können diese Liste nach verschiedenen Kriterien filtern und suchen.</p>

                    <ul>
                        <li><strong>Schüler hinzufügen:</strong> Klicken Sie in der Toolbar (oben im Hauptbereich) auf den Button „👥 Neuer Schüler“. Es öffnet sich ein Dialog, in dem Sie Name, Geschlecht, Schuljahr, Schule, Klasse, Herkunft/Nationalität, Deutschkenntnisse und optional Notizen eingeben können. Nach dem Speichern erscheint der Schüler sofort in der Navigationsliste.</li>
                        <li><strong>Schüler bearbeiten:</strong> Wählen Sie einen Schüler in der Navigationsleiste aus, sodass dessen Protokolle im Hauptbereich angezeigt werden. Klicken Sie dann in der Toolbar auf „✏️ Schüler bearbeiten“. Im geöffneten Dialog können Sie alle Angaben ändern und speichern.</li>
                        <li><strong>Schüler löschen:</strong> Öffnen Sie den Bearbeitungsdialog für einen Schüler (siehe oben). Dort finden Sie einen „❌ Löschen“-Button. Beachten Sie, dass beim Löschen eines Schülers auch <strong>alle zugehörigen Protokolleinträge unwiderruflich entfernt werden</strong>. Eine Sicherheitsabfrage schützt vor versehentlichem Löschen.</li>
                    </ul>

                    <h4>Filtern der Schülerliste (in der Navigation):</h4>
                    <p>In der Navigationsleiste finden Sie oberhalb der Schülerliste diverse Filteroptionen:</p>
                    <ul>
                        <li><strong>Suchfeld 🔍:</strong> Geben Sie hier einen Namen oder einen Teil davon ein, um die Schülerliste entsprechend zu filtern. Die Suche ist nicht case-sensitiv.</li>
                        <li><strong>Dropdown "Schuljahr":</strong> Wählen Sie ein spezifisches Schuljahr aus, um nur Schüler anzuzeigen, die diesem Schuljahr zugeordnet sind.</li>
                        <li><strong>Dropdown "Schule":</strong> Wählen Sie eine bestimmte Schule aus. Die Klassen-Dropdown-Liste wird sich dann automatisch anpassen.</li>
                        <li><strong>Dropdown "Klasse":</strong> Wenn eine Schule ausgewählt ist, können Sie hier zusätzlich eine spezifische Klasse filtern.</li>
                        <li><strong>Dropdown "Tag" 📅:</strong> Dieses Datum filtert die im Hauptbereich angezeigten Protokolle, beeinflusst aber nicht die Schülerliste in der Navigation. Es wird für die "Tagesansicht" im Hauptinhalt verwendet.</li>
                        <li><strong>„❌ Filter löschen“:</strong> Setzt alle aktiven Filter in der Navigationsleiste (Suchfeld, Schuljahr, Schule, Klasse und Tag) zurück und zeigt wieder alle Schüler an. Auch die Auswahl eines Schülers wird zurückgesetzt.</li>
                    </ul>

                    <p><strong>Beispiele für Filter-Kombinationen in der Navigation:</strong></p>
                    <ul>
                        <li><strong>Name suchen:</strong> Tippen Sie `Anna` in das Suchfeld → Es werden alle Schüler angezeigt, deren Name "Anna" enthält.</li>
                        <li><strong>Schuljahr filtern:</strong> Wählen Sie `2024/2025` aus dem "Schuljahr"-Dropdown → Nur Schüler aus diesem Jahrgang werden gelistet.</li>
                        <li><strong>Schule & Klasse filtern:</strong> Wählen Sie `Grundschule A` aus "Schule" und dann `3b` aus "Klasse" → Nur Schüler aus der Klasse 3b der Grundschule A werden angezeigt.</li>
                        <li><strong>Kombinierte Suche:</strong> Geben Sie `Mario` ins Suchfeld ein und wählen Sie `2025/2026` als Schuljahr → Es werden alle Schüler namens Mario im Schuljahr 2025/2026 angezeigt.</li>
                    </ul>
                    <br />

                    <h3>📝 2. Protokolleinträge verwalten</h3>
                    <p>Für jeden Schüler können detaillierte Protokolleinträge erstellt und verwaltet werden. Diese sind chronologisch nach Datum sortiert.</p>

                    <ul>
                        <li><strong>Neuer Eintrag:</strong> Wählen Sie zunächst einen Schüler in der Navigationsleiste aus. Klicken Sie dann in der Toolbar auf „📝 Protokoll anlegen“. Ein Dialog öffnet sich, in dem Sie Datum, Fach / Thema, Beobachtungen, Maßnahmen, Erfolgsbeschreibung, Erfolgsbewertung („positiv“, „negativ“) und Notizvorlagen auswählen/eingeben können.</li>
                        <li><strong>Eintrag bearbeiten:</strong> Klicken Sie im Hauptbereich auf die Karte eines bestehenden Eintrags. Es öffnet sich ein Bearbeitungsdialog, in dem Sie alle Felder des Eintrags anpassen können.</li>
                        <li><strong>Eintrag löschen:</strong> Das Löschen eines Eintrags ist nur über den Bearbeitungsdialog möglich. Klicken Sie auf „❌ Löschen“ und bestätigen Sie die Sicherheitsabfrage.</li>
                    </ul>

                    <h4>Ansichten und Datum filtern:</h4>
                    <p>Der Hauptbereich kann Einträge auf zwei Arten anzeigen:</p>
                    <ul>
                        <li><strong>Schüleransicht:</strong> Wenn ein Schüler in der Navigationsleiste ausgewählt ist, sehen Sie alle Protokolleinträge, die diesem Schüler zugeordnet sind, chronologisch absteigend sortiert.</li>
                        <li><strong>Tagesansicht:</strong> Wählen Sie ein Datum im "Tag"-Dropdown in der Navigationsleiste. Der Hauptbereich zeigt dann alle Protokolleinträge aller Schüler an, die an diesem spezifischen Datum erstellt wurden, gruppiert nach Schülern.</li>
                    </ul>
                    <br />

                    <h3>🔎 3. Suche & erweiterte Filter für Protokolle</h3>
                    <p>Die erweiterte Suchfunktion in der Toolbar ermöglicht eine leistungsstarke Volltextsuche über alle Protokolleinträge und Schüler.</p>

                    <ul>
                        <li><strong>Suchdialog öffnen:</strong> Klicken Sie in der Toolbar auf „🔍 Protokoll suchen“.</li>
                        <li><strong>Suchbegriffe:</strong> Sie können nach Wörtern und Phrasen in folgenden Feldern suchen:
                            <ul>
                                <li><strong>Schüler-Name:</strong> Name des Kindes.</li>
                                <li><strong>Fach / Thema:</strong> Das im Protokoll angegebene Fach oder Thema.</li>
                                <li><strong>Maßnahmen:</strong> Beschriebene Maßnahmen.</li>
                                <li><strong>Erfolg:</strong> Die Freitext-Beschreibung des Erfolgs.</li>
                                <li><strong>Erfolgsbewertung:</strong> Die Auswahl "positiv", "negativ" oder "leer" (für Einträge ohne spezifische Bewertung).</li>
                                <li><strong>Beobachtungen / Notizen:</strong> Die detaillierten Beobachtungen.</li>
                            </ul>
                        </li>
                        <li><strong>Exakte Suche:</strong> Wenn Sie einen Suchbegriff in Anführungszeichen setzen (z.B. <code>"Mathematik"</code> oder <code>"Gut verstanden"</code>), sucht die App nach exakt dieser Phrase. Ohne Anführungszeichen werden Teiltreffer gefunden.</li>
                        <li><strong>Allgemeine Suche:</strong> Die Auswahl „Allgemein (alle Felder)“ durchsucht alle oben genannten Felder auf den eingegebenen Suchbegriff.</li>
                    </ul>

                    <p><strong>Beispiele für Such- und Filter-Kombinationen:</strong></p>
                    <ul>
                        <li><strong>Suche nach Schüler-Name:</strong> Wählen Sie „Schüler-Name“ als Kriterium und geben Sie <code>Kevin</code> ein. Es werden alle Einträge angezeigt, die mit Kevin Mustermann verknüpft sind.</li>
                        <li><strong>Suche nach Fach / Thema:</strong> Wählen Sie „Fach / Thema“ und geben Sie <code>Sport</code> ein. Es werden alle Einträge gefunden, in denen "Sport" als Fach/Thema vermerkt ist.</li>
                        <li><strong>Exakte Suche nach Maßnahmen:</strong> Wählen Sie „Maßnahmen“ und geben Sie <code>"Individuelle Förderung"</code> ein. Es werden nur Einträge mit genau dieser Maßnahmen-Phrase gefunden.</li>
                        <li><strong>Suche nach Erfolgsbewertung:</strong> Wählen Sie „Erfolgsbewertung“ und dann <code>positiv</code>. Es werden alle Einträge mit einer positiven Bewertung gelistet. Wählen Sie <code>leer</code>, um alle Einträge ohne explizite Erfolgsbewertung zu finden.</li>
                        <li><strong>Kombination Suche + Datum:</strong> Sie können das "Tag"-Dropdown in der Navigation nutzen, um Suchergebnisse zusätzlich auf einen bestimmten Tag einzugrenzen.</li>
                        <li><strong>Volltextsuche in allen Feldern:</strong> Wählen Sie „Allgemein (alle Felder)“ und geben Sie <code>Mathematik gut</code> ein. Die Suche findet Einträge, die sowohl „Mathematik“ als auch „gut“ (in Beobachtungen, Erfolgsbeschreibung, etc.) enthalten.</li>
                    </ul>
                    <p>Die Suchergebnisse werden im Hauptbereich unter der Ansicht "Suchergebnisse" dargestellt und können wie gewohnt bearbeitet werden.</p>
                    <br />

                    <h3>💾 4. Datenmanagement</h3>
                    <p>Die App speichert alle Daten lokal in Ihrem Browser (IndexedDB), sodass keine externe Serververbindung benötigt wird. Für die Datensicherung stehen Ihnen folgende Funktionen zur Verfügung:</p>

                    <ul>
                        <li><strong>Exportieren:</strong> Klicken Sie in der Toolbar auf „💾 Export / Teilen“. Eine JSON-Datei mit allen Schülern, Protokolleinträgen, Stammdaten und Einstellungen wird erstellt und zum Download angeboten. Auf Mobilgeräten öffnet sich oft ein Teilen-Dialog, über den Sie die Datei direkt speichern oder versenden können. Es ist dringend empfohlen, regelmäßig Exporte zur Datensicherung durchzuführen!</li>
                        <li><strong>Importieren:</strong> Klicken Sie in der Toolbar auf „📥 Import“. Wählen Sie eine zuvor exportierte JSON-Sicherungsdatei aus. Alle Daten in der App werden durch die Inhalte der Importdatei <strong>überschrieben</strong>.</li>
                        <li><strong>Drucken:</strong> Klicken Sie in der Toolbar auf „🖨️ Drucken“. Die aktuell im Hauptbereich angezeigte Ansicht (z.B. alle Protokolle eines Schülers oder alle Einträge eines Tages) wird für den Druck aufbereitet.</li>
                    </ul>
                    <br />

                    <h3>⚙️ 5. Einstellungen</h3>
                    <p>Über den „⚙️ Einstellungen“-Button in der Navigation können Sie verschiedene Anpassungen an der App vornehmen:</p>
                    <ul>
                        <li><strong>Farbschema:</strong> Wählen Sie zwischen einem hellen 🌞, dunklen 🌙 oder farbigen 🌈 Design. Beim farbigen Schema können Sie die Hauptfarben individuell anpassen.</li>
                        <li><strong>Schriftgröße anpassen:</strong> Passen Sie die Schriftgröße für den Standardtext und für Eingabefelder an Ihre Vorlieben an.</li>
                        <li><strong>Stammdaten verwalten:</strong> Klicken Sie auf „📋 Stammdaten verwalten“, um Schuljahre, Schulen, Klassen und Notizvorlagen hinzuzufügen, zu bearbeiten oder zu entfernen. Dies sind die Dropdown-Optionen, die in den Formularen verwendet werden.</li>
                        <li><strong>Beispieldaten laden:</strong> Dieser Button ist im Stammdaten-Bereich der Einstellungen zu finden. Er lädt vorbereitete Testdaten in die Anwendung und <strong>überschreibt dabei alle vorhandenen Daten</strong>. Nützlich zum Ausprobieren der App.</li>
                        <li><strong>Alle Daten löschen:</strong> Dieser Button ist ebenfalls im Stammdaten-Bereich der Einstellungen. Er löscht <strong>alle Daten</strong> (Schüler, Einträge, Stammdaten, Einstellungen) aus der App. Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden. Eine Sicherheitsabfrage schützt vor versehentlichem Löschen.</li>
                        <li>Alle Einstellungen werden automatisch im Browser gespeichert und beim nächsten Start der App wiederhergestellt.</li>
                    </ul>
                    <br />

                    <h3>📊 6. Statistiken</h3>
                    <p>Über den „📊 Statistiken“-Button in der Navigation erhalten Sie eine detaillierte Übersicht über Ihre erfassten Daten.</p>
                    <p>Die Statistiken umfassen:</p>
                    <ul>
                        <li>Gesamtanzahl Schüler und Protokolleinträge, sowie den Durchschnitt der Einträge pro Schüler.</li>
                        <li>Übersichten zu Schülern mit und ohne Einträgen.</li>
                        <li>Verteilung der Protokolleinträge nach Schuljahr, Schule und Klasse.</li>
                        <li>Aufschlüsselung der Schüler nach Geschlecht, Nationalität und Deutschkenntnissen.</li>
                        <li>Die Top 5 der am häufigsten verwendeten Fächer / Themen.</li>
                        <li>Eine detaillierte Aufschlüsselung der positiven, negativen und fehlenden Erfolgsbewertungen.</li>
                        <li>Die Top 5 der Schüler mit den meisten Protokolleinträgen.</li>
                    </ul>
                    <p>Diese Übersichten helfen Ihnen, Trends zu erkennen und einen schnellen Überblick über Ihre Dokumentation zu erhalten.</p>
                    <br />

                    <h3>🖐️ 7. Hilfe & Support</h3>
                    <ul>
                        <li>Der Button „❓ Hilfe“ in der Navigation öffnet dieses Fenster jederzeit.</li>
                        <li>Dialoge und Modals können über das „×“ oben rechts oder über einen „✔️ Verstanden“ / „Schließen“-Button beendet werden.</li>
                        <li>Die aktuell genutzte Software-Version wird am oberen rechten Rand des Headers und am unteren Rand dieses Hilfefensters angezeigt: {appVersion}.</li>
                    </ul>
                    <br />
                    <p>Wir hoffen, diese detaillierte Anleitung hilft Ihnen, alle Funktionen der pädagogischen Dokumentations-App optimal zu nutzen!</p>
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
