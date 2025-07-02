import React from 'react';

export default function AdminLogin({ handleAdminLogin, setRole }) {
  return (
    <div className="admin-login white-box">
      <img src="https://eios.spbgasu.ru/wp-content/uploads/2019/04/spbgasu_300.png" alt="Logo" className="logo" />
      <h2>Авторизация</h2>
      <form onSubmit={handleAdminLogin}>
        <input name="login" placeholder="Логин" />
        <input name="password" type="password" placeholder="Пароль" />
        <button className="button">Войти</button>
        <a href="#!" className="help-link">Проблемы со входом?</a>
      </form>
      <button onClick={() => setRole(null)} className="help-link">Назад</button>
      <footer>
        <small>2025 © Санкт-Петербургский государственный архитектурно-строительный университет (СПбГАСУ)</small>
      </footer>
    </div>
  );
}