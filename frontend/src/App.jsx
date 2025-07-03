import React, { useState } from 'react';
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

  return (
    <div className="app-container">
      {role === null && <InitialScreen setRole={setRole} />}
      {role === 'admin' && !adminLoggedIn && 
        <AdminLogin handleAdminLogin={handleAdminLogin} setRole={setRole} />}
      {role === 'admin' && adminLoggedIn && 
        <AdminPanel
          TopMenu={<TopMenu showMenu={showMenu} setShowMenu={setShowMenu} setRole={setRole} setAdminLoggedIn={setAdminLoggedIn} />}
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
        />}
      {role === 'user' &&
        <UserPanel
          TopMenu={<TopMenu showMenu={showMenu} setShowMenu={setShowMenu} setRole={setRole} setAdminLoggedIn={setAdminLoggedIn} />}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          validateForm={validateForm}
          handleSubmit={handleSubmit}
        />}
    </div>
  );
}

export default App;