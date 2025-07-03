import React, { useState, useEffect } from 'react';
import './App.css';
import InitialScreen from './components/InitialScreen';
import AdminLogin from './components/AdminLogin';
import TopMenu from './components/TopMenu';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import useSubmissions from './hooks/useSubmissions';

function App() {
  const [role, setRole] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Загрузка списка администраторов из корневой папки проекта
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/admins.json');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные администраторов');
        }
        const data = await response.json();
        const adminsArray = Object.values(data);
        setAdmins(adminsArray);
        console.log('Администраторы загружены:', adminsArray);
      } catch (error) {
        console.error('Ошибка при загрузке администраторов:', error);
        alert('Ошибка при загрузке данных администраторов. Проверьте консоль для подробностей.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const login = e.target.login.value.trim();
    const password = e.target.password.value.trim();

    console.log('Попытка входа с данными:', { login, password });
    console.log('Доступные администраторы:', admins);

    const foundAdmin = admins.find(admin => {
      const loginMatch = admin.login === login;
      const passwordMatch = admin.password === password;
      
      console.log(`Сравниваю: 
        Логин: "${admin.login}" === "${login}" -> ${loginMatch}
        Пароль: "${admin.password}" === "${password}" -> ${passwordMatch}
      `);

      return loginMatch && passwordMatch;
    });

    if (foundAdmin) {
      setAdminLoggedIn(true);
      setCurrentAdmin(foundAdmin);
      console.log('Успешный вход! Данные администратора:', foundAdmin);
    } else {
      console.error('Ошибка входа. Не найдено совпадений.');
      alert('Ошибка: Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setCurrentAdmin(null);
    setRole(null);
    console.log('Выход из системы выполнен');
  };

  const {
    formData, setFormData,
    errors, setErrors,
    submissions, setSubmissions,
    selectedPending, setSelectedPending,
    selectedConfirmed, setSelectedConfirmed,
    pendingFilter, setPendingFilter,
    confirmedFilter, setConfirmedFilter,
    pendingPage, setPendingPage,
    confirmedPage, setConfirmedPage,
    itemsPerPage,
    filteredPending, filteredConfirmed,
    paginatedPending, paginatedConfirmed,
    totalPendingPages, totalConfirmedPages,
    validateForm, handleSubmit, reloadSubmissions,
    confirmSubmissions, deleteSubmissions, exportToExcel   
  } = useSubmissions();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка данных администраторов...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {role === null && <InitialScreen setRole={setRole} />}
      
      {role === 'admin' && !adminLoggedIn && (
        <AdminLogin 
          handleAdminLogin={handleAdminLogin} 
          setRole={setRole} 
        />
      )}
      
      {role === 'admin' && adminLoggedIn && (
        <>
          <TopMenu 
            showMenu={showMenu} 
            setShowMenu={setShowMenu} 
            setRole={setRole} 
            setAdminLoggedIn={handleLogout}
            adminName={currentAdmin?.fio}
          />
          <AdminPanel
            submissions={submissions}
            pendingFilter={pendingFilter}
            setPendingFilter={setPendingFilter}
            confirmedFilter={confirmedFilter}
            setConfirmedFilter={setConfirmedFilter}
            selectedPending={selectedPending}
            setSelectedPending={setSelectedPending}
            selectedConfirmed={selectedConfirmed}
            setSelectedConfirmed={setSelectedConfirmed}
            pendingPage={pendingPage}
            setPendingPage={setPendingPage}
            confirmedPage={confirmedPage}
            setConfirmedPage={setConfirmedPage}
            itemsPerPage={itemsPerPage}
            filteredPending={filteredPending}
            filteredConfirmed={filteredConfirmed}
            paginatedPending={paginatedPending}
            paginatedConfirmed={paginatedConfirmed}
            totalPendingPages={totalPendingPages}
            totalConfirmedPages={totalConfirmedPages}
            confirmSubmissions={confirmSubmissions}
            deleteSubmissions={deleteSubmissions}
            exportToExcel={exportToExcel}
          />
        </>
      )}
      
      {role === 'user' && (
        <>
          <TopMenu 
            showMenu={showMenu} 
            setShowMenu={setShowMenu} 
            setRole={setRole} 
            setAdminLoggedIn={handleLogout}
          />
          <UserPanel
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            validateForm={validateForm}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}

export default App;