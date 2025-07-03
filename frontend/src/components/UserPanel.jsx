import React from 'react';

export default function UserPanel({ TopMenu, formData, setFormData, errors, setErrors, validateForm, handleSubmit }) {
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

  return (
    <div className="form-container">
      {TopMenu}
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
            className='filter-select'>
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
          <label>Организатор*</label>
          <input
            name="organizer"
            placeholder="Введите организатора"
            value={formData.organizer}
            onChange={handleInputChange}
            className={errors.organizer ? 'error' : ''}
          />
          {errors.organizer && <span className="error-message">{errors.organizer}</span>}
        </div>

        <div className="form-group">
          <label>Место проведения*</label>
          <input
            name="location"
            placeholder="Введите место проведения"
            value={formData.location}
            onChange={handleInputChange}
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label>Дата проведения*</label>
          <input
            name="event_date"
            type="date"
            value={formData.event_date}
            onChange={handleInputChange}
            className={errors.event_date ? 'error' : ''}
          />
          {errors.event_date && <span className="error-message">{errors.event_date}</span>}
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
}