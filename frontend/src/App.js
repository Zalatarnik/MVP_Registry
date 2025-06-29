import React, { useState } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState(null); // null, 'admin' или 'user'
  const [adminLoggedIn, setAdminLoggedIn] = useState(false); // состояние логина
  const [showMenu, setShowMenu] = useState(false); // показать меню справа вверху

  // обработка входа для администратора
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const login = e.target.login.value;
    const password = e.target.password.value;

    if (login === '1' && password === '1') {
      setAdminLoggedIn(true);
    } else {
      alert('Неверный логин или пароль');
    }
  };

  // верхнее меню с кнопкой выхода
  const topRightMenu = () => (
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

  // экран выбора роли
  const renderInitialScreen = () => (
    <div className="white-box">
      <img src="https://eios.spbgasu.ru/wp-content/uploads/2019/04/spbgasu_300.png" alt="Logo" className="logo" />
      <h1 style={{textAlign: 'center'}}>Выберите вариант входа</h1>
      <div className="button-row">
        <button className="button" onClick={() => setRole('admin')}>Администратор</button>
        <button className="button" onClick={() => setRole('user')}>Пользователь</button>
      </div>
    </div>
  );

   // панель пользователя
  const renderUserForm = () => (
    <div className="form-container">
      {topRightMenu()}
      <h2>Введите информацию</h2>
      <form className="user-form">
        <div className="form-group">
          <label>Фамилия*</label>
          <input placeholder="Введите фамилию" />
        </div>
        <div className="form-group">
          <label>Имя*</label>
          <input placeholder="Введите имя" />
        </div>
        <div className="form-group">
          <label>Отчество*</label>
          <input placeholder="Введите отчество" />
        </div>
        <div className="form-group">
          <label>Название группы*</label>
          <input placeholder="Введите название группы" />
        </div>
        <div className="form-group">
          <label>ФИО руководителя*</label>
          <input placeholder="Введите ФИО руководителя" />
        </div>
        <div className="form-group">
          <label>Название активности / соревнования*</label>
          <input placeholder="Введите название активности" />
        </div>
        <div className="form-group">
          <label>Загрузите файл, подтверждающий участие*</label>
          <input type="file" />
        </div>
        <div className="form-group">
          <label>Комментарий к файлу</label>
          <textarea placeholder="Комментарий"></textarea>
        </div>
        <button className="button" style={{margin: 0}}>Отправить</button>
      </form>
    </div>
  );

  // форма входа администратора
  const renderAdminLogin = () => (
    <div className="admin-login white-box ">
      <img src="https://eios.spbgasu.ru/wp-content/uploads/2019/04/spbgasu_300.png" alt="Logo" className="logo" />
      <h2>Авторизация</h2>
      <form onSubmit={handleAdminLogin}>
        <input name="login" placeholder="Логин" />
        <input name="password" type="password" placeholder="Пароль" />
      
        <button className="button">Войти</button>
        <a href="#" className="help-link">Проблемы со входом?</a>
      </form>
      <button onClick={() => setRole(null)} className="help-link">Назад</button>
      <footer>
        <small>2025 © Санкт-Петербургский государственный архитектурно-строительный университет (СПбГАСУ)</small>
      </footer>
    </div>

  );

  // панель администратора
  const renderAdminPanel = () => (
    <div className="admin-panel">
      {topRightMenu()}
      <h2>Данные пользователей</h2>
      <div className="white-box">
        <table>
          <thead>
            <tr>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Группа</th>
              <th>Руководитель</th>
              <th>Активность</th>
              <th>Файл</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {/* Данные из сервера */}
          </tbody>
        </table>
      </div>
      <button className="button">Сохранить</button>
    </div>
  );
  
  return (
    <div className="app-container">
      {role === null && renderInitialScreen()}
      {role === 'admin' && !adminLoggedIn && renderAdminLogin()}
      {role === 'admin' && adminLoggedIn && renderAdminPanel()}
      {role === 'user' && renderUserForm()}
    </div>
  );
}

export default App;