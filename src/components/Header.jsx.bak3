import React from 'react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        {/* Hier steht Ihr bestehender Header-Inhalt */}
        <h1>Dokumentation pädagogische Arbeit - Irina Geppert</h1>
        {/* Navigation oder andere Elemente */}
      </div>
      
      <div className="header-right">
        <div className="header-date">{currentDate}</div>
        <div className="header-version">Version 1.6.0</div>
      </div>
    </header>
  );
};

export default Header;
