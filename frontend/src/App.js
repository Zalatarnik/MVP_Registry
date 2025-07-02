import React, { useState, useEffect} from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    studentID: '',
    group: '',
    supervisor: '',
    activity: '',
    eventStatus: '',
    file: null,
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [submissions, setSubmissions] = useState([]);

  const [pendingFilter, setPendingFilter] = useState({ search: '', sort: '' });
  const [confirmedFilter, setConfirmedFilter] = useState({ search: '', sort: '' });
  const [selectedPending, setSelectedPending] = useState([]);
  const [selectedConfirmed, setSelectedConfirmed] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [confirmedPage, setConfirmedPage] = useState(1);

  const itemsPerPage = 5; // сколько записей на странице

  // Фильтрация и сортировка первой таблицы
  const filteredPending = submissions
    .filter(s => s.status === 'pending')
    .filter(s =>
      s.last_name.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
      s.group.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
      s.activity.toLowerCase().includes(pendingFilter.search.toLowerCase())
    )
    .sort((a, b) => {
      if (pendingFilter.sort === 'alpha') {
        return a.last_name.localeCompare(b.last_name);
      } else if (pendingFilter.sort === 'recent') {
        // Можно заменить на реальное поле created_at
        return b.id - a.id; // по убыванию ID
      }
      return 0;
    });

  // Пагинация первой таблицы
  const totalPendingPages = Math.ceil(filteredPending.length / itemsPerPage);
  const paginatedPending = filteredPending.slice(
    (pendingPage - 1) * itemsPerPage,
    pendingPage * itemsPerPage
  );

  // Аналогично для второй таблицы
  const filteredConfirmed = submissions
    .filter(s => s.status === 'confirmed')
    .filter(s =>
      s.last_name.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
      s.group.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
      s.activity.toLowerCase().includes(confirmedFilter.search.toLowerCase())
    )
    .sort((a, b) => {
      if (confirmedFilter.sort === 'alpha') {
        return a.last_name.localeCompare(b.last_name);
      } else if (confirmedFilter.sort === 'recent') {
        return b.id - a.id;
      }
      return 0;
    });

  const totalConfirmedPages = Math.ceil(filteredConfirmed.length / itemsPerPage);
  const paginatedConfirmed = filteredConfirmed.slice(
    (confirmedPage - 1) * itemsPerPage,
    confirmedPage * itemsPerPage
  );

  // при входе в админ - загрузка данные с сервера
  useEffect(() => {
    fetch("http://localhost:8000/submissions/")
      .then(res => res.json())
      .then(data => setSubmissions(data));
  }, []);


  const handleAdminLogin = (e) => {
    e.preventDefault();
    const login = e.target.login.value;
    const password = e.target.password.value;

    // TODO: Нужно занести логику авторизации и сделать безопасноц
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

  // валидация на панели пользователь 
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

    // Проверка студенческого (только цифры)
    if (!formData.studentID.trim()) {
      newErrors.studentID = 'Введите номер студенческого билета';
    } else if (!/^\d+$/.test(formData.studentID)) {
      newErrors.studentID = 'Номер студенческого должен содержать только цифры';
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
    
    // Проверка статуса мероприятия
    if (!formData.eventStatus.trim()) {
      newErrors.eventStatus = 'Выберите статус мероприятия';
    }

    // Проверка файла
    if (!formData.file) {
      newErrors.file = 'Загрузите файл';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // отправка в бэк
  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      console.log("Форма не прошла валидацию");
      return;
    }

    console.log("file in formData:", formData.file);

    // создание FormData и передача на сервер
    const formPayload = new FormData();
    formPayload.append("last_name", formData.lastName);
    formPayload.append("first_name", formData.firstName);
    formPayload.append("middle_name", formData.middleName);
    formPayload.append("student_id", formData.studentID);
    formPayload.append("group", formData.group);
    formPayload.append("supervisor", formData.supervisor);
    formPayload.append("activity", formData.activity);
    formPayload.append("event_status", formData.eventStatus);
    formPayload.append("file", formData.file); 
    formPayload.append("comment", formData.comment);

    console.log("Отправка формы на сервер...");

    fetch("http://localhost:8000/submit/", {
      method: "POST",
      body: formPayload
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Ошибка сервера");
        }
        return res.json();
      })
      .then(() => {
        alert("Форма успешно отправлена!");
        setFormData({
          lastName: '',
          firstName: '',
          middleName: '',
          group: '',
          supervisor: '',
          activity: '',
          eventStatus: '',
          file: null,
          comment: ''
        });

        // Загрузка обновлённого списка (админка)
        fetch("http://localhost:8000/submissions/")
          .then(res => res.json())
          .then(data => setSubmissions(data));
      })
      .catch((error) => {
        console.error("Ошибка при отправке формы:", error);
        alert("Ошибка при отправке формы");
      });
  };

  // Верхнее правое выподающее меню на панели пользователь и админ
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

  // --------------------------------------------------------- Панели------------------------------------------------------------------------

  // Первый экран с выбором роли
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

  // Экран пользователя с вводом данных 
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
          <label>Номер студенческого*</label>
          <input 
            name="studentID"
            placeholder="Введите номер студенческого" 
            value={formData.studentID}
            onChange={handleInputChange}
            className={errors.studentID ? 'error' : ''}
          />
          {errors.studentID && <span className="error-message">{errors.studentID}</span>}
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
          <label>Статус мероприятия*</label>
          <select
            name="eventStatus"
            value={formData.eventStatus || ''}
            onChange={handleInputChange}
            className='filter-select'
          >
            <option value="">-- Выберите статус --</option>
            <option value="внутривузовский">Внутривузовский</option>
            <option value="региональный">Региональный</option>
            <option value="городской">Городской</option>
            <option value="всероссийский">Всероссийский</option>
            <option value="международный">Международный</option>
          </select>
          {errors.eventStatus && <span className="error-message">{errors.eventStatus}</span>}
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

  // Экран авторизации админа
  const renderAdminLogin = () => (
    <div className="admin-login white-box ">
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

  // Экран админа с таблицами данных о студентах
  const renderAdminPanel = () => (
    <div className="admin-panel">
      {topRightMenu()}

      <h2>Ожидают подтверждения</h2>

      {/* Фильтр */}
      <div className='filter-row'>
        <input
          type="text"
          placeholder="Поиск..."
          value={pendingFilter.search}
          onChange={(e) =>
            setPendingFilter({ ...pendingFilter, search: e.target.value })
          }
          className='filter-input'
        />
        <select
          value={pendingFilter.sort}
          onChange={(e) =>
            setPendingFilter({ ...pendingFilter, sort: e.target.value })
          }
          className='filter-input'
        >
          <option value="">Без сортировки</option>
          <option value="alpha">По алфавиту (ФИО)</option>
          <option value="recent">Недавние</option>
        </select>
      </div>

      {/* Первая таблица */}
      <div className="white-box">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Студенческий</th>
              <th>Группа</th>
              <th>Руководитель</th>
              <th>Активность</th>
              <th>Статус</th>
              <th>Файл</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPending.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPending.includes(entry.id)}
                    onChange={() => {
                      if (selectedPending.includes(entry.id)) {
                        setSelectedPending(
                          selectedPending.filter((id) => id !== entry.id)
                        );
                      } else {
                        setSelectedPending([...selectedPending, entry.id]);
                      }
                    }}
                  />
                </td>
                <td>{entry.last_name}</td>
                <td>{entry.first_name}</td>
                <td>{entry.middle_name}</td>
                <td>{entry.student_id}</td>
                <td>{entry.group}</td>
                <td>{entry.supervisor}</td>
                <td>{entry.activity}</td>
                <td>{entry.event_status}</td>
                <td>{entry.file_name}</td>
                <td>{entry.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Пагинация */}
        <div style={{ marginTop: '10px' }}>
          Страница:
          {[...Array(totalPendingPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => setPendingPage(page + 1)}
              className={pendingPage === page + 1 ? 'button' : ''}
            >
              {page + 1}
            </button>
          ))}
        </div>
      </div>


      {/* Кнопки под таблицей */}
      <div className='button-row-outside'
        >
          <button
            className="button"
            onClick={() => {
              const allIds = filteredPending.map((entry) => entry.id);
              setSelectedPending(allIds);
            }}
          >
            Подтвердить всех
          </button>
          <button className="button">Подтвердить выбранных</button>
          <button className="button">Сохранить выбранных</button>
          <button className="button">Сохранить всех</button>
        </div>


      
      {/* Вторая таблица */}
      <h2 style={{ marginTop: '40px' }}>Данные пользователей</h2>

      {/* Фильтр */}
      <div className="filter-row">
        <input
          type="text"
          placeholder="Поиск..."
          value={confirmedFilter.search}
          onChange={(e) =>
            setConfirmedFilter({ ...confirmedFilter, search: e.target.value })
          }
          className="filter-input"
        />
        <select
          value={confirmedFilter.sort}
          onChange={(e) =>
            setConfirmedFilter({ ...confirmedFilter, sort: e.target.value })
          }
          className="filter-select"
        >
          <option value="">Без сортировки</option>
          <option value="alpha">По алфавиту (Фамилия)</option>
          <option value="recent">Недавние</option>
        </select>
      </div>

      <div className="white-box">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Студенческий</th>
              <th>Группа</th>
              <th>Руководитель</th>
              <th>Активность</th>
              <th>Статус</th>
              <th>Файл</th>
              <th>Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {paginatedConfirmed.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedConfirmed.includes(entry.id)}
                    onChange={() => {
                      if (selectedConfirmed.includes(entry.id)) {
                        setSelectedConfirmed(
                          selectedConfirmed.filter((id) => id !== entry.id)
                        );
                      } else {
                        setSelectedConfirmed([...selectedConfirmed, entry.id]);
                      }
                    }}
                  />
                </td>
                <td>{entry.last_name}</td>
                <td>{entry.first_name}</td>
                <td>{entry.middle_name}</td>
                <td>{entry.student_id}</td>
                <td>{entry.group}</td>
                <td>{entry.supervisor}</td>
                <td>{entry.activity}</td>
                <td>{entry.event_status}</td>
                <td>{entry.file_name}</td>
                <td>{entry.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Пагинация второй */}
        <div style={{ marginTop: '10px' }}>
          Страница:
          {[...Array(totalConfirmedPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => setConfirmedPage(page + 1)}
              className={confirmedPage === page + 1 ? 'button' : ''}
            >
              {page + 1}
            </button>
          ))}
        </div>

        
      </div>

      {/* Кнопки под таблицей */}
      <div className='button-row-outside'>
        <button className="button">Сохранить<br /> выбранных</button>

        <button
           className="button"
           onClick={() => {
             const allIds = filteredConfirmed.map((entry) => entry.id);
            setSelectedConfirmed(allIds);
          }}>
           Сохранить<br />  всех
         </button>

      </div>

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