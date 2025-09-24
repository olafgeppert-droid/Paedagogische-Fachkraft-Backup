// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';

// CSS-Imports
import '../styles/theme-variables.css';
import '../styles/layout-base.css';
import '../styles/components-3d.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root-Element mit id 'root' nicht gefunden. Überprüfe die index.html (id='root').");
}
const root = createRoot(container);
root.render(<App />);
