/* app.js – Logik */
const STORAGE_KEY = "familyRing_upd56b";
let people = [];
const undoStack = []; const redoStack = [];
const MAX_UNDO_STEPS = 50; // Begrenzung für Undo-Stack

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* === Utility === */
function saveState(pushUndo=true){
  if(pushUndo) {
    undoStack.push(JSON.stringify(people));
    // Stack auf maximale Größe begrenzen
    if(undoStack.length > MAX_UNDO_STEPS) undoStack.shift();
  }
  redoStack.length = 0;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){ people = JSON.parse(raw); }
  else { people = seedData(); saveState(false); }
  postLoadFixups();
}

function seedData(){
  return [
    {Gen:1, Code:"1", Name:"Olaf Geppert", Birth:"13.01.1965", BirthPlace:"Chemnitz", Gender:"m", ParentCode:"", PartnerCode:"1x", InheritedFrom:"", Note:"Stammvater"},
    {Gen:1, Code:"1x", Name:"Irina Geppert", Birth:"13.01.1970", BirthPlace:"Berlin", Gender:"w", ParentCode:"", PartnerCode:"1", InheritedFrom:"", Note:"Partnerin"},
    {Gen:2, Code:"1A", Name:"Mario Geppert", Birth:"28.04.1995", BirthPlace:"Berlin", Gender:"m", ParentCode:"1", PartnerCode:"1Ax", InheritedFrom:"", Note:"1. Sohn"},
    {Gen:2, Code:"1Ax", Name:"Kim", Birth:"", BirthPlace:"", Gender:"w", ParentCode:"", PartnerCode:"1A", InheritedFrom:"", Note:"Partnerin"},
    {Gen:2, Code:"1B", Name:"Nicolas Geppert", Birth:"04.12.2000", BirthPlace:"Berlin", Gender:"m", ParentCode:"1", PartnerCode:"1Bx", InheritedFrom:"", Note:"2. Sohn"},
    {Gen:2, Code:"1Bx", Name:"Annika", Birth:"", BirthPlace:"", Gender:"w", ParentCode:"", PartnerCode:"1B", InheritedFrom:"", Note:"Partnerin"},
    {Gen:2, Code:"1C", Name:"Julienne Geppert", Birth:"26.09.2002", BirthPlace:"Berlin", Gender:"w", ParentCode:"1", PartnerCode:"1Cx", InheritedFrom:"", Note:"Tochter"},
    {Gen:2, Code:"1Cx", Name:"Jonas", Birth:"", BirthPlace:"", Gender:"m", ParentCode:"", PartnerCode:"1C", InheritedFrom:"", Note:"Partner"},
    {Gen:3, Code:"1C1", Name:"Michael Geppert", Birth:"12.07.2025", BirthPlace:"Hochstätten", Gender:"m", ParentCode:"1C", PartnerCode:"", InheritedFrom:"1", Note:""}
  ];
}

/* Compute Gen if missing (based on code pattern / parent chain) */
function computeGenFromCode(code){
  if(!code) return 1;
  // Partner 'x' does not change generation
  const base = code.replace(/x$/,''); // drop trailing x
  // Gen 1: '1'
  if(base === "1") return 1;
  // direct children: 1A, 1B => Gen 2
  if(/^1[A-Z]$/.test(base)) return 2;
  // grandchildren: 1A1, 1B2, etc. => Gen 3
  if(/^1[A-Z]\d+$/.test(base)) return 3;
  // great-grandchildren: 1A1A, 1A1B, etc. => Gen 4
  if(/^1[A-Z]\d+[A-Z]$/.test(base)) return 4;
  // further generations: count segments
  let generation = 1;
  let current = base;
  
  while (current.length > 0) {
    if (current === "1") break;
    
    // Remove last character and check what type it was
    const lastChar = current.charAt(current.length - 1);
    if (/[A-Z]/.test(lastChar)) {
      generation++;
      current = current.slice(0, -1);
    } else if (/\d/.test(lastChar)) {
      generation++;
      // Remove all trailing digits
      current = current.replace(/\d+$/, '');
    } else {
      break;
    }
  }
  
  return Math.max(1, generation);
}

function postLoadFixups(){
  // Ensure Gen & RingCode are present after import
  for(const p of people){
    // Normalize codes first
    p.Code = normalizePersonCode(p.Code);
    p.ParentCode = normalizePersonCode(p.ParentCode);
    p.PartnerCode = normalizePersonCode(p.PartnerCode);
    p.InheritedFrom = normalizePersonCode(p.InheritedFrom);
    
    // Recompute generation
    p.Gen = computeGenFromCode(p.Code);
  }
  computeRingCodes();
}

/* Ring codes (partners keep own code, inheritance forms chain) */
function computeRingCodes(){
  const byCode = Object.fromEntries(people.map(p=>[p.Code,p]));
  
  // Reset all RingCodes first
  for(const p of people){
    p.RingCode = p.Code;
  }
  
  // Process inheritance chains (max depth to prevent circular references)
  const MAX_DEPTH = 20;
  let changed;
  let iterations = 0;
  
  do {
    changed = false;
    iterations++;
    
    for(const p of people){
      if(p.InheritedFrom && p.InheritedFrom !== ""){
        const donor = byCode[p.InheritedFrom];
        if(donor && donor.RingCode && !donor.RingCode.includes(p.Code)) {
          // Check for circular reference
          if(donor.RingCode.includes("→" + p.Code) || p.Code === donor.InheritedFrom) {
            console.warn("Circular inheritance detected:", p.Code, "->", donor.Code);
            continue;
          }
          
          const newRingCode = donor.RingCode + "→" + p.Code;
          if(p.RingCode !== newRingCode) {
            p.RingCode = newRingCode;
            changed = true;
            }
          }
        }
      }
      
      if(iterations >= MAX_DEPTH) {
        console.warn("Max inheritance depth reached, possible circular reference");
        break;
      }
    } while (changed);
  }

/* Render Table (with filter & highlight) */
function renderTable(){
  computeRingCodes();
  const q = ($("#search").value||"").trim().toLowerCase();
  const tb = $("#peopleTable tbody"); tb.innerHTML="";
  const mark = (txt)=>{
    if(!q) return escapeHtml(String(txt||""));
    const s = String(txt||""); const i = s.toLowerCase().indexOf(q);
    if(i<0) return escapeHtml(s);
    return escapeHtml(s.slice(0,i)) + "<mark>" + escapeHtml(s.slice(i,i+q.length)) + "</mark>" + escapeHtml(s.slice(i+q.length));
  };
  
  // Escape HTML function to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Farben für Generationen (gleiche wie im Stammbaum)
  const genColors = {
    1: "#e8f5e8", 2: "#e3f2fd", 3: "#f3e5f5", 
    4: "#fff3e0", 5: "#e8eaf6", 6: "#f1f8e9", 7: "#ffebee"
  };
  
  // sort: Gen then Code
  people.sort((a,b)=> (a.Gen||0)-(b.Gen||0) || String(a.Code).localeCompare(String(b.Code)));
  for(const p of people){
    const hay = (p.Name||"") + " " + (p.Code||"");
    if(q && hay.toLowerCase().indexOf(q)===-1) continue; // FILTER: hide non-matches
    const tr=document.createElement("tr");
    const cols = ["Gen","Code","RingCode","Name","Birth","BirthPlace","Gender","ParentCode","PartnerCode","InheritedFrom","Note"];
    
    // Hintergrundfarbe basierend auf Generation
    const gen = p.Gen || 1;
    const bgColor = genColors[gen] || "#ffffff";
    tr.style.backgroundColor = bgColor;
    
    cols.forEach(k=>{
      const td=document.createElement("td");
      td.innerHTML = mark(p[k] ?? "");
      tr.appendChild(td);
    });
    tr.addEventListener("dblclick", ()=> openEdit(p.Code));
    tb.appendChild(tr);
  }
}

/* === VERBESSERTE STAMMBAUM-DARSTELLUNG (NACHKOMMENTAFEL) === */
function renderTree() {
    computeRingCodes();
    const el = $("#tree");
    el.innerHTML = "";
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 2400 1400");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    el.appendChild(svg);

    // Farben für Generationen
    const genColors = {
        1: "#e8f5e8", 2: "#e3f2fd", 3: "#f3e5f5", 
        4: "#fff3e0", 5: "#e8eaf6", 6: "#f1f8e9", 7: "#ffebee"
    };

    // Personen nach Generation gruppieren und Partner zusammenfassen
    const byGeneration = {};
    const partnerGroups = new Map(); // Speichert Partner-Gruppen
    
    people.forEach(person => {
        const gen = person.Gen || 1;
        if (!byGeneration[gen]) byGeneration[gen] = [];
        byGeneration[gen].push(person);
        
        // Partner-Gruppen erstellen
        if (person.PartnerCode) {
            const partnerKey = [person.Code, person.PartnerCode].sort().join('-');
            if (!partnerGroups.has(partnerKey)) {
                partnerGroups.set(partnerKey, [person.Code, person.PartnerCode]);
            }
        }
    });

    // Berechne optimale Box-Breite basierend auf Inhalten
    let maxBoxWidth = 180; // Minimale Breite
    people.forEach(person => {
        const name = person.Name || person.Code;
        const code = person.Code;
        const text = `${code} / ${name}`;
        // Geschätzte Textlänge (etwa 8px per Zeichen)
        const estimatedWidth = text.length * 8 + 40; // +40 für Padding
        if (estimatedWidth > maxBoxWidth) {
            maxBoxWidth = Math.min(estimatedWidth, 220); // Maximal 220px
        }
    });

    const boxWidth = maxBoxWidth;
    const boxHeight = 80;
    const partnerGap = 30;
    const verticalSpacing = 180;
    const horizontalSpacing = boxWidth + 60; // Mehr Platz zwischen Boxen

    // Positionen berechnen - Nachkommentafel-Stil
    const positions = new Map();
    const generations = Object.keys(byGeneration).sort((a, b) => a - b);

    // Berechne Layout für jede Generation
    generations.forEach((gen, genIndex) => {
        const persons = byGeneration[gen];
        const y = 120 + genIndex * verticalSpacing;
        
        // Partner zu Gruppen zusammenfassen
        const groupedPersons = [];
        const processed = new Set();
        
        persons.forEach(person => {
            if (processed.has(person.Code)) return;
            
            // Partner finden
            let partnerCodes = [];
            if (person.PartnerCode) {
                const partnerKey = [person.Code, person.PartnerCode].sort().join('-');
                partnerCodes = partnerGroups.get(partnerKey) || [];
            }
            
            if (partnerCodes.length > 0) {
                // Partner-Gruppe
                const partnerGroup = partnerCodes.map(code => 
                    persons.find(p => p.Code === code)
                ).filter(Boolean);
                
                groupedPersons.push(partnerGroup);
                partnerCodes.forEach(code => processed.add(code));
            } else {
                // Einzelperson
                groupedPersons.push([person]);
                processed.add(person.Code);
            }
        });

        // Verteile Gruppen auf mehrere Zeilen falls nötig
        const maxGroupsPerRow = Math.floor(2400 / horizontalSpacing);
        const rows = [];
        
        for (let i = 0; i < groupedPersons.length; i += maxGroupsPerRow) {
            rows.push(groupedPersons.slice(i, i + maxGroupsPerRow));
        }

        // Positioniere jede Zeile der Generation
        rows.forEach((rowGroups, rowIndex) => {
            const rowY = y + (rowIndex * 100); // Zusätzlicher vertikaler Abstand zwischen Zeilen
            const totalGroups = rowGroups.length;
            const totalWidth = totalGroups * horizontalSpacing;
            const startX = (2400 - totalWidth) / 2 + horizontalSpacing / 2;

            rowGroups.forEach((group, groupIndex) => {
                const groupX = startX + groupIndex * horizontalSpacing;
                
                if (group.length === 2) {
                    // Partner nebeneinander mit mehr Abstand
                    const partner1 = group[0];
                    const partner2 = group[1];
                    
                    positions.set(partner1.Code, { 
                        x: groupX - partnerGap/2 - boxWidth/2, 
                        y: rowY, 
                        person: partner1 
                    });
                    
                    positions.set(partner2.Code, { 
                        x: groupX + partnerGap/2 + boxWidth/2, 
                        y: rowY, 
                        person: partner2 
                    });
                } else {
                    // Einzelperson zentriert
                    const person = group[0];
                    positions.set(person.Code, { 
                        x: groupX, 
                        y: rowY, 
                        person: person 
                    });
                }
            });
        });
    });

    // Verbindungslinien zeichnen (zuerst, damit sie hinter den Knoten liegen)
    const connectionsGroup = document.createElementNS(svgNS, "g");
    connectionsGroup.setAttribute("class", "connections");
    svg.appendChild(connectionsGroup);

    // Eltern-Kind-Verbindungen
    people.forEach(person => {
        if (person.ParentCode) {
            const parent = positions.get(person.ParentCode);
            const child = positions.get(person.Code);
            if (parent && child) {
                // Senkrechte Linie von Eltern zu Kind (bis zum unteren Rand der Eltern-Box)
                const verticalLine = document.createElementNS(svgNS, "line");
                verticalLine.setAttribute("x1", parent.x);
                verticalLine.setAttribute("y1", parent.y + boxHeight);
                verticalLine.setAttribute("x2", parent.x);
                verticalLine.setAttribute("y2", child.y - 10);
                verticalLine.setAttribute("stroke", "#6b7280");
                verticalLine.setAttribute("stroke-width", "2");
                connectionsGroup.appendChild(verticalLine);
                
                // Waagerechte Linie zum Kind (bis zum oberen Rand der Kind-Box)
                const horizontalLine = document.createElementNS(svgNS, "line");
                horizontalLine.setAttribute("x1", parent.x);
                horizontalLine.setAttribute("y1", child.y - 10);
                horizontalLine.setAttribute("x2", child.x);
                horizontalLine.setAttribute("y2", child.y - 10);
                horizontalLine.setAttribute("stroke", "#6b7280");
                horizontalLine.setAttribute("stroke-width", "2");
                connectionsGroup.appendChild(horizontalLine);
                
                // Senkrechte Linie von waagerechter Linie bis zur Kind-Box
                const verticalConnector = document.createElementNS(svgNS, "line");
                verticalConnector.setAttribute("x1", child.x);
                verticalConnector.setAttribute("y1", child.y - 10);
                verticalConnector.setAttribute("x2", child.x);
                verticalConnector.setAttribute("y2", child.y);
                verticalConnector.setAttribute("stroke", "#6b7280");
                verticalConnector.setAttribute("stroke-width", "2");
                connectionsGroup.appendChild(verticalConnector);
            }
        }
    });

    // Partner-Verbindungen (waagerechte Linien zwischen Partnern)
    partnerGroups.forEach((partnerCodes) => {
        const partner1 = positions.get(partnerCodes[0]);
        const partner2 = positions.get(partnerCodes[1]);
        
        if (partner1 && partner2 && Math.abs(partner1.y - partner2.y) < 10) {
            // Waagerechte Linie zwischen Partnern (von Rand zu Rand)
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", partner1.x + boxWidth/2);
            line.setAttribute("y1", partner1.y + boxHeight/2);
            line.setAttribute("x2", partner2.x - boxWidth/2);
            line.setAttribute("y2", partner2.y + boxHeight/2);
            line.setAttribute("stroke", "#dc2626");
            line.setAttribute("stroke-width", "3");
            connectionsGroup.appendChild(line);
        }
    });

    // Personen-Boxen zeichnen
    const nodesGroup = document.createElementNS(svgNS, "g");
    nodesGroup.setAttribute("class", "nodes");
    svg.appendChild(nodesGroup);

    positions.forEach((pos, code) => {
        const person = pos.person;
        const gen = person.Gen || 1;
        const color = genColors[gen] || "#f9fafb";

        // Gruppen-Element für jede Person
        const personGroup = document.createElementNS(svgNS, "g");
        personGroup.setAttribute("class", "node");
        personGroup.setAttribute("transform", `translate(${pos.x - boxWidth/2}, ${pos.y})`);
        personGroup.setAttribute("data-code", code);

        // Box-Hintergrund
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("width", boxWidth);
        rect.setAttribute("height", boxHeight);
        rect.setAttribute("rx", "8");
        rect.setAttribute("ry", "8");
        rect.setAttribute("fill", color);
        rect.setAttribute("stroke", "#374151");
        rect.setAttribute("stroke-width", "2");
        personGroup.appendChild(rect);

        // 1. Zeile: Personencode / Vor- und Nachname
        const nameText = document.createElementNS(svgNS, "text");
        nameText.setAttribute("x", boxWidth/2);
        nameText.setAttribute("y", 20);
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("font-size", "12");
        nameText.setAttribute("font-weight", "600");
        nameText.setAttribute("fill", "#111827");
        
        // Namen vollständig anzeigen
        const displayName = person.Name || person.Code;
        // Text kürzen falls zu lang
        const maxLength = Math.floor((boxWidth - 40) / 7); // Geschätzte Zeichenbreite
        const displayText = displayName.length > maxLength ? 
            displayName.substring(0, maxLength - 3) + "..." : displayName;
        nameText.textContent = `${person.Code} / ${displayText}`;
        personGroup.appendChild(nameText);

        // 2. Zeile: Geschlechtszeichen / Generation / Geburtsdatum
        const detailsText = document.createElementNS(svgNS, "text");
        detailsText.setAttribute("x", boxWidth/2);
        detailsText.setAttribute("y", 40);
        detailsText.setAttribute("text-anchor", "middle");
        detailsText.setAttribute("font-size", "11");
        detailsText.setAttribute("fill", "#4b5563");
        
        // Geschlechtssymbol
        let genderSymbol = "";
        if (person.Gender === "m") {
            genderSymbol = "♂";
        } else if (person.Gender === "w") {
            genderSymbol = "♀";
        } else if (person.Gender === "d") {
            genderSymbol = "⚧";
        }
        
        let details = genderSymbol ? `${genderSymbol} / ` : "";
        details += `Gen ${gen}`;
        if (person.Birth) {
            details += ` / ${person.Birth}`;
        }
        detailsText.textContent = details;
        personGroup.appendChild(detailsText);

        // 3. Zeile: Geburtsort (falls vorhanden)
        if (person.BirthPlace) {
            const placeText = document.createElementNS(svgNS, "text");
            placeText.setAttribute("x", boxWidth/2);
            placeText.setAttribute("y", 60);
            placeText.setAttribute("text-anchor", "middle");
            placeText.setAttribute("font-size", "10");
            placeText.setAttribute("fill", "#6b7280");
            
            // Ort kürzen falls zu lang
            const maxPlaceLength = Math.floor((boxWidth - 20) / 6);
            const placeTextShort = person.BirthPlace.length > maxPlaceLength ? 
                person.BirthPlace.substring(0, maxPlaceLength - 3) + "..." : person.BirthPlace;
            placeText.textContent = placeTextShort;
            personGroup.appendChild(placeText);
        }

        // Klick-Event für Bearbeiten
        personGroup.addEventListener("dblclick", () => openEdit(code));
        
        // Hover-Effekte
        personGroup.addEventListener("mouseenter", function() {
            rect.setAttribute("stroke-width", "3");
            rect.setAttribute("filter", "url(#dropShadow)");
        });
        
        personGroup.addEventListener("mouseleave", function() {
            rect.setAttribute("stroke-width", "2");
            rect.setAttribute("filter", "none");
        });

        nodesGroup.appendChild(personGroup);
    });

    // Generationen-Beschriftung hinzufügen
    generations.forEach((gen, genIndex) => {
        const y = 120 + genIndex * verticalSpacing - 30;
        
        const labelText = document.createElementNS(svgNS, "text");
        labelText.setAttribute("x", "80");
        labelText.setAttribute("y", y);
        labelText.setAttribute("font-size", "16");
        labelText.setAttribute("font-weight", "bold");
        labelText.setAttribute("fill", "#374151");
        
        switch(gen) {
            case "1": labelText.textContent = "Stammeltern"; break;
            case "2": labelText.textContent = "Kinder"; break;
            case "3": labelText.textContent = "Enkel"; break;
            case "4": labelText.textContent = "Urenkel"; break;
            default: labelText.textContent = `Generation ${gen}`;
        }
        
        svg.appendChild(labelText);
    });

    // SVG-Filter für Schatten-Effekt
    const defs = document.createElementNS(svgNS, "defs");
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "dropShadow");
    filter.setAttribute("height", "130%");
    
    const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feGaussianBlur.setAttribute("in", "SourceAlpha");
    feGaussianBlur.setAttribute("stdDeviation", "2");
    filter.appendChild(feGaussianBlur);
    
    const feOffset = document.createElementNS(svgNS, "feOffset");
    feOffset.setAttribute("dx", "3");
    feOffset.setAttribute("dy", "3");
    feOffset.setAttribute("result", "offsetblur");
    filter.appendChild(feOffset);
    
    const feFlood = document.createElementNS(svgNS, "feFlood");
    feFlood.setAttribute("flood-color", "rgba(0,0,0,0.2)");
    filter.appendChild(feFlood);
    
    const feComposite = document.createElementNS(svgNS, "feComposite");
    feComposite.setAttribute("in2", "offsetblur");
    feComposite.setAttribute("operator", "in");
    filter.appendChild(feComposite);
    
    const feMerge = document.createElementNS(svgNS, "feMerge");
    const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
    const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feMerge);
    
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Automatische Viewport-Anpassung
    setTimeout(() => adjustTreeViewport(svg), 100);
}

function adjustTreeViewport(svg) {
    try {
        const bbox = svg.getBBox();
        const padding = 100;
        svg.setAttribute("viewBox", 
            `${bbox.x - padding} ${bbox.y - padding} 
             ${bbox.width + 2 * padding} ${bbox.height + 2 * padding}`
        );
    } catch (e) {
        console.log("Viewport-Anpassung nicht möglich:", e);
    }
}

/* Printing only selection */
function printHTML(inner){
  const w = window.open("", "_blank", "noopener,noreferrer");
  if(!w){ alert("Popup-Blocker aktiv. Bitte erlauben."); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Druck</title>
  <style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:12px}
  h1{text-align:center;font-size:20px;margin:12px 0}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px;font-size:12px} th{background:#f4f6f8}
  svg{max-width:100%;height:auto}
  </style></head><body>${inner}</body></html>`);
  w.document.close(); w.focus();
  setTimeout(()=>w.print(), 300);
}

function printTable(){
  const dlg = $("#dlgPrint"); if(dlg.open) dlg.close();
  const el = resolvePrintableEl('#peopleTable');
  elementToPdfBlob(el, 'Tabelle').then(blob => shareOrDownloadPDF(blob, 'tabelle.pdf'));

}
function printTree(){
  const dlg = $("#dlgPrint"); if(dlg.open) dlg.close();
  const el = resolvePrintableEl('#tree');
  elementToPdfBlob(el, 'Stammbaum').then(blob => shareOrDownloadPDF(blob, 'stammbaum.pdf'));

}

/* Export with iOS Share Sheet when available */
async function shareOrDownload(filename, blob){
  const file = new File([blob], filename, {type: blob.type || "application/octet-stream"});
  if(navigator.canShare && navigator.canShare({ files:[file] }) && navigator.share){
    try{
      await navigator.share({ files:[file], title:"Export" });
      return;
    }catch(e){ /* user canceled => fallback to download */ }
  }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
}

function exportJSON(){
  const blob = new Blob([JSON.stringify(people,null,2)],{type:"application/json"});
  shareOrDownload("familie.json", blob);
}
function exportCSV(){
  const cols=["Gen","Code","RingCode","Name","Birth","BirthPlace","Gender","ParentCode","PartnerCode","InheritedFrom","Note"];
  const lines=[cols.join(";")];
  for(const p of people){ lines.push(cols.map(c=> String(p[c]??"").replace(/;/g,",")).join(";")); }
  const blob = new Blob([lines.join("\n")],{type:"text/csv"});
  shareOrDownload("familie.csv", blob);
}

/* CRUD */
function parseDate(d){
  const m = /^([0-3]?\d)\.([01]?\d)\.(\d{4})$/.exec((d||"").trim());
  if(!m) return "";
  return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
}


function normalizePersonCode(code){
  if(!code) return "";
  let s = String(code).trim();
  // Convert all letters to uppercase except trailing 'x'
  if(s.endsWith('x') || s.endsWith('X')) {
    s = s.slice(0, -1).toUpperCase() + 'x';
  } else {
    s = s.toUpperCase();
  }
  return s;
}

function nextChildCode(parent){
  const kids = people.filter(p=>p.ParentCode===parent && p.Code.startsWith(parent));
  const nums = kids.map(k=> {
    const numPart = k.Code.replace(parent, "").replace(/x$/, "");
    return parseInt(numPart, 10);
  }).filter(n=>!isNaN(n));
  let next=1; while(nums.includes(next)) next++;
  return parent + String(next);
}

function openNew(){
  $("#pName").value=""; $("#pBirth").value=""; $("#pPlace").value="";
  $("#pGender").value=""; $("#pParent").value=""; $("#pPartner").value=""; $("#pInherited").value=""; $("#pNote").value="";
  $("#dlgNew").showModal();
}

function addNew(){
  const name=$("#pName").value.trim();
  const birth=$("#pBirth").value.trim();
  const place=$("#pPlace").value.trim();
  const gender=$("#pGender").value;
  const parent=normalizePersonCode($("#pParent").value.trim());
  const partner=normalizePersonCode($("#pPartner").value.trim());
  const inherited=normalizePersonCode($("#pInherited").value.trim());
  const note=$("#pNote").value.trim();

  let gen=1, code="";
  if(parent){
    const parentP = people.find(p=>p.Code===parent);
    gen = parentP ? (parentP.Gen||1)+1 : 2;
    code = nextChildCode(parent);
  }else{
    if(partner==="1"){ code="1x"; gen=1; } else { code="1"; gen=1; }
  }
  const p={Gen:gen, Code:code, Name:name, Birth:birth, BirthPlace:place, Gender:gender, ParentCode:parent, PartnerCode:partner, InheritedFrom:inherited, Note:note};
  people.push(p);
  saveState(); renderTable(); renderTree();
}

let editCode=null;
function openEdit(code){
  const p=people.find(x=>x.Code===code); if(!p) return;
  editCode=code;
  $("#eName").value=p.Name||""; $("#eBirth").value=p.Birth||""; $("#ePlace").value=p.BirthPlace||"";
  $("#eGender").value=p.Gender||""; $("#eParent").value=p.ParentCode||""; $("#ePartner").value=p.PartnerCode||"";
  $("#eInherited").value=p.InheritedFrom||""; $("#eNote").value=p.Note||"";
  $("#dlgEdit").showModal();
}
function saveEditFn(){
  const p=people.find(x=>x.Code===editCode); if(!p) return;
  p.Name=$("#eName").value.trim();
  p.Birth=$("#eBirth").value.trim();
  p.BirthPlace=$("#ePlace").value.trim();
  p.Gender=$("#eGender").value;
  p.ParentCode=normalizePersonCode($("#eParent").value.trim());
  p.PartnerCode=normalizePersonCode($("#ePartner").value.trim());
  p.InheritedFrom=normalizePersonCode($("#eInherited").value.trim());
  p.Note=$("#eNote").value.trim();
  // Recompute gen if parent changed or code pattern changed
  p.Gen = computeGenFromCode(p.Code);
  saveState(); renderTable(); renderTree();
}

function deletePerson(){
  const id = prompt("Bitte Namen oder Personen-Code der zu löschenden Person eingeben:");
  if(!id) return;
  const idx = people.findIndex(p=> p.Code===id || (p.Name||"").toLowerCase()===id.toLowerCase());
  if(idx<0){ alert("Person nicht gefunden."); return; }
  const code = people[idx].Code;
  people.splice(idx,1);
  people.forEach(p=>{
    if(p.ParentCode===code) p.ParentCode="";
    if(p.PartnerCode===code) p.PartnerCode="";
    if(p.InheritedFrom===code) p.InheritedFrom="";
  });
  saveState(); renderTable(); renderTree();
}

/* Import */
function doImport(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      let data;
      if(file.name.toLowerCase().endsWith('.csv')) {
        data = parseCSV(r.result);
      } else {
        data = JSON.parse(r.result);
      }
      
      if(!Array.isArray(data)) throw new Error("Format");
      
      // Validierung der importierten Daten
      const validData = data.filter(item => 
        item && typeof item === 'object' && item.Code && typeof item.Code === 'string'
      );
      
      people = validData;
      postLoadFixups();
      saveState(false);
      renderTable(); renderTree();
    }catch(e){ 
      console.error("Import error:", e);
      alert("Ungültige Datei: " + e.message); 
    }
  };
  r.readAsText(file);
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(';').map(h => h.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim());
    const obj = {};
    
    for (let j = 0; j < headers.length; j++) {
      if (j < values.length) {
        obj[headers[j]] = values[j] || '';
      }
    }
    
    if (obj.Code) {
      result.push(obj);
    }
  }
  return result;
}

/* Events */
function setupEventListeners() {
  $("#btnNew").addEventListener("click", openNew);
  $("#saveNew").addEventListener("click", (e)=>{ e.preventDefault(); addNew(); $("#dlgNew").close(); });
  $("#saveEdit").addEventListener("click", (e)=>{ e.preventDefault(); saveEditFn(); $("#dlgEdit").close(); });
  $("#btnDelete").addEventListener("click", deletePerson);
  $("#btnImport").addEventListener("click", ()=>{ 
    const inp=document.createElement("input"); 
    inp.type="file"; 
    inp.accept=".json,.csv,application/json,text/csv"; 
    inp.onchange=()=>{ if(inp.files[0]) doImport(inp.files[0]); }; 
    inp.click(); 
  });
  $("#btnExport").addEventListener("click", ()=> $("#dlgExport").showModal());
  $("#btnExportJSON").addEventListener("click", exportJSON);
  $("#btnExportCSV").addEventListener("click", exportCSV);
  $("#btnPrint").addEventListener("click", ()=> $("#dlgPrint").showModal());
  $("#btnPrintTable").addEventListener("click", ()=>{ printTable(); $("#dlgPrint").close(); });
  $("#btnPrintTree").addEventListener("click", ()=>{ printTree(); $("#dlgPrint").close(); });
  $("#btnStats").addEventListener("click", ()=>{ updateStats(); $("#dlgStats").showModal(); });
  $("#btnHelp").addEventListener("click", ()=>{ 
    fetch("help.html").then(r=>r.text()).then(html=>{ 
      $("#helpContent").innerHTML=html; 
      $("#dlgHelp").showModal(); 
    }).catch(() => {
      $("#helpContent").innerHTML = "<p>Hilfedatei konnte nicht geladen werden.</p>";
      $("#dlgHelp").showModal();
    });
  });
  $("#btnReset").addEventListener("click", ()=>{ if(confirm("Sollen wirklich alle Personen gelöscht werden?")){ people=[]; saveState(); renderTable(); renderTree(); }});
  $("#btnUndo").addEventListener("click", ()=>{ if(!undoStack.length) return; redoStack.push(JSON.stringify(people)); people=JSON.parse(undoStack.pop()); localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); renderTable(); renderTree(); });
  $("#btnRedo").addEventListener("click", ()=>{ if(!redoStack.length) return; undoStack.push(JSON.stringify(people)); people=JSON.parse(redoStack.pop()); localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); renderTable(); renderTree(); });

  $("#search").addEventListener("input", renderTable);
}

/* Stats */
function updateStats(){
  let total=0,m=0,w=0,d=0; const byGen={};
  for(const p of people){
    total++;
    const g=(p.Gender||"").toLowerCase();
    if(g==="m") m++; else if(g==="w") w++; else if(g==="d") d++;
    byGen[p.Gen] = (byGen[p.Gen]||0)+1;
  }
  let html = `<p>Gesamtanzahl Personen: <b>${total}</b></p>`;
  html += `<p>davon männlich: <b>${m}</b> — weiblich: <b>${w}</b> — divers: <b>${d}</b></p>`;
  html += `<ul>`; Object.keys(byGen).sort((a,b)=>a-b).forEach(k=> html += `<li>Generation ${k}: ${byGen[k]}</li>`); html += `</ul>`;
  $("#statsContent").innerHTML = html;
}

// Event-Listener für Baum-Interaktionen
function setupTreeInteractions() {
    // Zoom-Funktionalität
    let scale = 1;
    const treeContainer = $("#tree");
    
    treeContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.001;
        scale = Math.min(Math.max(0.5, scale), 3);
        treeContainer.style.transform = `scale(${scale})`;
    });

    // Pan-Funktionalität für Touch-Geräte
    let startX, startY, scrollLeft, scrollTop;
    let isDragging = false;

    treeContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.pageX - treeContainer.offsetLeft;
        startY = e.pageY - treeContainer.offsetTop;
        scrollLeft = treeContainer.scrollLeft;
        scrollTop = treeContainer.scrollTop;
    });

    treeContainer.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    treeContainer.addEventListener("mouseup", () => {
        isDragging = false;
    });

    treeContainer.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - treeContainer.offsetLeft;
        const y = e.pageY - treeContainer.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        treeContainer.scrollLeft = scrollLeft - walkX;
        treeContainer.scrollTop = scrollTop - walkY;
    });
}

/* Init */
document.addEventListener('DOMContentLoaded', function() {
    loadState(); 
    setupEventListeners();
    renderTable(); 
    renderTree();

    // Baum-Interaktionen initialisieren
    setTimeout(setupTreeInteractions, 1000);
});

/* === PDF Export (Table or Tree) === */

// Fix: resolve printable element robustly
function resolvePrintableEl(sel, fallbackSel){
  let el = document.querySelector(sel);
  if(!el && fallbackSel) el = document.querySelector(fallbackSel);
  if(!el) { 
    // try to find by common ids/classes
    if(sel.includes('table')) {
      el = document.getElementById('peopleTable') || document.querySelector('table');
    } else if(sel.includes('tree')) {
      el = document.getElementById('tree') || document.querySelector('svg');
    }
  }
  return el;
}

async function elementToPdfBlob(el, title){
  if(!el) {
    console.error("Element for PDF not found:", title);
    alert("Element zum Drucken nicht gefunden.");
    return null;
  }
  
  // Clone to avoid layout shifts
  const clone = el.cloneNode(true);
  const wrapper = document.createElement('div');
  
  // Header with wappen & title - safely
  const titleWrap = document.querySelector('.ribbon .title-wrap');
  if(titleWrap) {
    const header = titleWrap.cloneNode(true);
    header.style.marginBottom = '12px';
    wrapper.appendChild(header);
  } else {
    // Fallback header
    const fallbackHeader = document.createElement('div');
    fallbackHeader.style.textAlign = 'center';
    fallbackHeader.style.marginBottom = '12px';
    fallbackHeader.innerHTML = '<h2>Wappenringe der Familie GEPPERT</h2>';
    wrapper.appendChild(fallbackHeader);
  }
  
  wrapper.appendChild(clone);
  wrapper.style.padding = '16px';
  wrapper.style.background = '#ffffff';
  document.body.appendChild(wrapper);
  
  try {
    // Render to canvas
    const canvas = await html2canvas(wrapper, {scale: 2, backgroundColor: '#ffffff', useCORS: true});
    const img = canvas.toDataURL('image/jpeg', 0.92);

    // Auto orientation
    const { jsPDF } = window.jspdf;
    const orientation = canvas.width > canvas.height ? 'l' : 'p';
    const doc = new jsPDF({orientation, unit:'pt', format:'a4'});
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 24;
    
    // Fit image into page while preserving aspect
    let w = pageW - margin*2;
    let h = canvas.height * (w / canvas.width);
    if(h > pageH - margin*2){ h = pageH - margin*2; w = canvas.width * (h / canvas.height); }
    const x = (pageW - w)/2, y = margin;
    
    doc.addImage(img, 'JPEG', x, y, w, h);
    const blob = doc.output('blob');
    return blob;
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  } finally {
    wrapper.remove();
  }
}

async function shareOrDownloadPDF(blob, filename){
  if(!blob) return;
  
  try{
    const file = new File([blob], filename, {type:'application/pdf'});
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title: 'Wappenringe der Familie GEPPERT' });
      return;
    }
  }catch(e){
    // fall through to download/print fallback
  }
  
  if(isIOS()){
    // iOS fallback: open a print window
    if(filename.includes('tabelle')) { printSection('table'); }
    else { printSection('tree'); }
    return;
  }
  
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

function printSection(what){
  const title = 'Wappenringe der Familie GEPPERT';
  const when = new Date().toLocaleString('de-DE');

  const content = document.createElement('div');
  content.style.padding = '16px';
  
  const h = document.createElement('div');
  h.style.display='flex'; h.style.justifyContent='center'; h.style.alignItems='center'; h.style.gap='12px';
  
  // Try to get wappen images safely
  const wappenImg = document.querySelector('.coa');
  if(wappenImg && wappenImg.src) {
    h.innerHTML = `<img src="${wappenImg.src}" style="height:40px"/><h2 style="margin:0">${title}</h2><img src="${wappenImg.src}" style="height:40px"/>`;
  } else {
    h.innerHTML = `<h2 style="margin:0">${title}</h2>`;
  }
  content.appendChild(h);

  const section = document.createElement('div');
  if(what==='table'){
    const tableWrap = document.querySelector('.table-wrap');
    if(tableWrap) {
      section.innerHTML = tableWrap.innerHTML;
    }
  }else{
    const treeEl = document.getElementById('tree');
    if(treeEl) {
      section.appendChild(treeEl.cloneNode(true));
    }
  }
  content.appendChild(section);

  const f = document.createElement('div');
  f.style.marginTop='12px'; f.style.fontSize='12px'; f.style.textAlign='right'; 
  f.textContent = `Stand: ${when}`;
  content.appendChild(f);

  const win = window.open('', '_blank');
  if(!win){ alert('Popup-Blocker verhindert den Druck. Bitte erlauben.'); return; }
  
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:20px}
      table{width:100%;border-collapse:collapse;margin:10px 0}
      th,td{border:1px solid #ddd;padding:8px;font-size:14px}
      thead th{background:#f1f5f9;font-weight:bold}
      svg{width:100%;height:auto;max-height:600px}
      @media print{
        body{margin:0;padding:10px}
        table{font-size:12px}
      }
    </style>
  </head><body></body></html>`);
  
  win.document.body.appendChild(content);
  
  // wait for images to load
  const imgs = win.document.images;
  let pending = imgs.length;
  
  const go = () => {
    win.focus(); 
    win.print();
  };
  
  if(pending === 0){
    setTimeout(go, 100);
  }else{
    for(const im of imgs){
      im.addEventListener('load', ()=>{ if(--pending===0) setTimeout(go,100); });
      im.addEventListener('error', ()=>{ if(--pending===0) setTimeout(go,100); });
    }
  }
  
  // close after print
  win.addEventListener('afterprint', ()=> setTimeout(()=>win.close(), 200));
}

// Sicherstellen, dass die Version auf iPad sichtbar ist
function ensureVersionVisibility() {
  const versionRibbon = document.getElementById('versionRibbon');
  if (versionRibbon) {
    // Styling direkt anwenden
    versionRibbon.style.position = 'absolute';
    versionRibbon.style.right = '12px';
    versionRibbon.style.bottom = '8px';
    versionRibbon.style.fontSize = '12px';
    versionRibbon.style.color = '#fff';
    versionRibbon.style.opacity = '0.9';
    versionRibbon.style.pointerEvents = 'none';
    versionRibbon.style.textAlign = 'right';
    versionRibbon.style.zIndex = '10';
    versionRibbon.style.display = 'block';
    
    // Für sehr kleine Bildschirme anpassen
    if (window.innerWidth <= 480) {
      versionRibbon.style.position = 'static';
      versionRibbon.style.textAlign = 'center';
      versionRibbon.style.padding = '4px 12px';
      versionRibbon.style.color = '#fff';
      versionRibbon.style.backgroundColor = 'rgba(0,0,0,0.2)';
      versionRibbon.style.marginTop = '4px';
    }
  }
}

// Beim Laden und bei Größenänderungen ausführen
window.addEventListener('load', ensureVersionVisibility);
window.addEventListener('resize', ensureVersionVisibility);
