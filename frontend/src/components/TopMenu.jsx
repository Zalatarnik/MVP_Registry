import React from 'react';
import '../App.css';

export default function TopMenu({ showMenu, setShowMenu, setRole, setAdminLoggedIn }) {
  return (
    <div className="top-menu">
      <button onClick={() => setShowMenu(!showMenu)} className="button">☰</button>
      {showMenu && (
        <div className="dropdown">
          <div className="dropdown-item">Общая информация</div>
          <div className="dropdown-item" onClick={() => {
            setRole(null);
            setAdminLoggedIn(false);
            setShowMenu(false);
          }}>Выход</div>
        </div>
      )}
    </div>
  );
}