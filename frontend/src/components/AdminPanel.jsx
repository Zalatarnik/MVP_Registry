import React from 'react';

export default function AdminPanel({
  TopMenu,
  pendingFilter, setPendingFilter,
  confirmedFilter, setConfirmedFilter,
  selectedPending, setSelectedPending,
  selectedConfirmed, setSelectedConfirmed,
  pendingPage, setPendingPage,
  confirmedPage, setConfirmedPage,
  itemsPerPage,
  filteredPending, filteredConfirmed,
  paginatedPending, paginatedConfirmed,
  totalPendingPages, totalConfirmedPages
}) {
  return (
    <div className="admin-panel">
    {TopMenu}
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
}