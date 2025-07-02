import React from 'react';

export default function InitialScreen({ setRole }) {
  return (
    <div className="white-box">
      <img src="https://eios.spbgasu.ru/wp-content/uploads/2019/04/spbgasu_300.png" alt="Logo" className="logo" />
      <h1 style={{textAlign: 'center'}}>Выберите вариант входа</h1>
      <div className="button-row">
        <button className="button" onClick={() => setRole('admin')}>Администратор</button>
        <button className="button" onClick={() => setRole('user')}>Пользователь</button>
      </div>
    </div>
  );
}