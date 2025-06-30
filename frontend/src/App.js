import React, { useState } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    group: '',
    supervisor: '',
    activity: '',
    file: null,
    comment: ''
  });
  const [errors, setErrors] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Проверка фамилии (русские буквы, пробелы и дефисы)
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    } else if (!/^[А-Яа-яЁё\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Фамилия должна содержать только русские буквы';
    }
    
    // Проверка имени (русские буквы, пробелы и дефисы)
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    } else if (!/^[А-Яа-яЁё\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Имя должно содержать только русские буквы';
    }
    
    // Проверка отчества (необязательное)
    if (formData.middleName.trim() && !/^[А-Яа-яЁё\s-]*$/.test(formData.middleName)) {
      newErrors.middleName = 'Отчество должно содержать только русские буквы';
    }
    
    // Проверка группы (формат ПИб-1 или 2-ПМИб-1)
    if (!formData.group.trim()) {
      newErrors.group = 'Введите название группы';
    } else if (!/^(\d+-)?[А-Яа-яЁё]{2,}-?\d+$/.test(formData.group)) {
      newErrors.group = 'Некорректный формат группы (пример: ПИб-1 или 2-ПМИб-1)';
    }
    
    // Проверка ФИО руководителя
    if (!formData.supervisor.trim()) {
      newErrors.supervisor = 'Введите ФИО руководителя (пример: Иванов Иван Иванович)';
    } else if (!/^[А-Яа-яЁё]+\s[А-Яа-яЁё]+(?:\s[А-Яа-яЁё]+)?$/.test(formData.supervisor)) {
      newErrors.supervisor = 'Введите ФИО в формате "Фамилия Имя Отчество"';
    }
    
    // Проверка названия активности
    if (!formData.activity.trim()) {
      newErrors.activity = 'Введите название активности';
    } else if (formData.activity.trim().length < 3) {
      newErrors.activity = 'Название должно содержать минимум 3 символа';
    }
    
    // Проверка файла
    if (!formData.file) {
      newErrors.file = 'Загрузите файл';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      alert('Форма успешно отправлена!');
      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        group: '',
        supervisor: '',
        activity: '',
        file: null,
        comment: ''
      });
    }
  };

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

  const renderUserForm = () => (
    <div className="form-container">
      {topRightMenu()}
      <h2>Введите информацию</h2>
      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Фамилия*</label>
          <input 
            name="lastName"
            placeholder="Введите фамилию" 
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
        <div className="form-group">
          <label>Имя*</label>
          <input 
            name="firstName"
            placeholder="Введите имя" 
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label>Отчество</label>
          <input 
            name="middleName"
            placeholder="Введите отчество (если имеется)" 
            value={formData.middleName}
            onChange={handleInputChange}
            className={errors.middleName ? 'error' : ''}
          />
          {errors.middleName && <span className="error-message">{errors.middleName}</span>}
        </div>
        <div className="form-group">
          <label>Название группы*</label>
          <input 
            name="group"
            placeholder="Пример: ПИб-1 или 2-ПМИб-1" 
            value={formData.group}
            onChange={handleInputChange}
            className={errors.group ? 'error' : ''}
          />
          {errors.group && <span className="error-message">{errors.group}</span>}
        </div>
        <div className="form-group">
          <label>ФИО руководителя*</label>
          <input 
            name="supervisor"
            placeholder="Пример: Иванов Иван Иванович" 
            value={formData.supervisor}
            onChange={handleInputChange}
            className={errors.supervisor ? 'error' : ''}
          />
          {errors.supervisor && <span className="error-message">{errors.supervisor}</span>}
        </div>
        <div className="form-group">
          <label>Название активности / соревнования*</label>
          <input 
            name="activity"
            placeholder="Введите название активности" 
            value={formData.activity}
            onChange={handleInputChange}
            className={errors.activity ? 'error' : ''}
          />
          {errors.activity && <span className="error-message">{errors.activity}</span>}
        </div>
        <div className="form-group">
          <label>Загрузите файл, подтверждающий участие*</label>
          <input 
            type="file" 
            onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
            className={errors.file ? 'error' : ''}
          />
          {errors.file && <span className="error-message">{errors.file}</span>}
        </div>
        <div className="form-group">
          <label>Комментарий к файлу</label>
          <textarea 
            name="comment"
            placeholder="Комментарий"
            value={formData.comment}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <button className="button" style={{margin: 0}} type="submit">Отправить</button>
      </form>
    </div>
  );

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