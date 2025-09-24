import React from 'react';
import { appVersion } from '../version.js';
 
const Header = ({ onMenuClick }) => { // Added onMenuClick prop
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
 
  return (
    <header className="header">
      <button className="hamburger-menu" onClick={onMenuClick}> {/* Bind click handler */}
        ☰
      </button>
     
      <div className="header-center">
        <h1 className="header-title">Dokumentation pädagogische Arbeit - Irina Geppert</h1>
      </div>
     
      <div className="header-right">
        <div className="header-date">{currentDate}</div>
        <div className="header-version">Version {appVersion}</div>
      </div>
    </header>
  );
};
 
export default Header;
