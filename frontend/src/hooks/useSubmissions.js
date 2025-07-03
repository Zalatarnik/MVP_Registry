import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; 

export default function useSubmissions() {
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
    organizer: '',
    location: '',
    event_date: '',
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
  const itemsPerPage = 5;

  useEffect(() => {
    reloadSubmissions();
  }, []);

  const reloadSubmissions = () => {
    fetch("http://localhost:8000/submissions/")
      .then(res => res.json())
      .then(data => setSubmissions(data));
  };

  const confirmSubmissions = (ids) => {
  fetch("http://localhost:8000/confirm/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids)
  })
    .then(res => res.json())
    .then(() => {
      reloadSubmissions();
      setSelectedPending([]); // сбросить выбор
    });
};

const deleteSubmissions = (ids) => {
  fetch("http://localhost:8000/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids)
  })
    .then(res => res.json())
    .then(() => {
      reloadSubmissions();
      setSelectedPending([]);
    });
};

  const exportToExcel = (entries, fileName = "export.xlsx") => {
    if (entries.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }

   
  const formatted = entries.map((entry) => ({
    "Фамилия": entry.last_name,
    "Имя": entry.first_name,
    "Отчество": entry.middle_name,
    "Студенческий": entry.student_id,
    "Группа": entry.group,
    "Руководитель": entry.supervisor,
    "Активность": entry.activity,
    "Статус мероприятия": entry.event_status,
    "Организатор": entry.organizer,
    "Место": entry.location,
    "Дата": entry.event_date,
    "Файл": entry.file_name
    ? { f: `=HYPERLINK("http://localhost:8000/files/${entry.file_name}", "${entry.file_name}")` }
    : "",
    "Комментарий": entry.comment
  }));
  const worksheet = XLSX.utils.json_to_sheet(formatted);

    const maxLengths = formatted.reduce((acc, row) => {
      Object.keys(row).forEach((key, colIdx) => {
        const cellValue = typeof row[key] === 'object' ? row[key].f : row[key];
        const len = cellValue ? cellValue.toString().length : 0;
        acc[colIdx] = Math.max(acc[colIdx] || 10, len);
      });
      return acc;
    }, []);
    worksheet['!cols'] = maxLengths.map(len => ({ width: len + 5 }));

    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, "Данные");

    XLSX.writeFile(workbook, fileName);
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

    // Проверка организатора мероприятия
    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Введите организатора';
    }

    // Проверка места провидения мероприятия
    if (!formData.location.trim()) {
      newErrors.location = 'Введите место проведения';
    }

    // Проверка даты провидения мероприятия
    if (!formData.event_date.trim()) {
      newErrors.event_date = 'Выберите дату проведения';
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
    if (!validateForm()) return;

    const formPayload = new FormData();
    formPayload.append("last_name", formData.lastName);
    formPayload.append("first_name", formData.firstName);
    formPayload.append("middle_name", formData.middleName);
    formPayload.append("student_id", formData.studentID);
    formPayload.append("group", formData.group);
    formPayload.append("supervisor", formData.supervisor);
    formPayload.append("activity", formData.activity);
    formPayload.append("event_status", formData.eventStatus);
    formPayload.append("organizer", formData.organizer);
    formPayload.append("location", formData.location);
    formPayload.append("event_date", formData.event_date);
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
          studentID: '',
          group: '',
          supervisor: '',
          activity: '',
          eventStatus: '',
          organizer: '',
          location: '',
          event_date: '',
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

  // Фильтрация и сортировка 1 таблицы
  const filteredPending = submissions
  .filter(s => s.status === 'pending')
  .filter(s =>
    s.last_name.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
    s.supervisor.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
    s.group.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
    s.activity.toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
    String(s.student_id).toLowerCase().includes(pendingFilter.search.toLowerCase()) ||
    s.organizer.toLowerCase().includes(pendingFilter.search.toLowerCase())
  )
  .filter(s => {
    if (pendingFilter.sort === "intra" && s.event_status !== "внутривузовский") return false;
    if (pendingFilter.sort === "region" && s.event_status !== "региональный") return false;
    if (pendingFilter.sort === "city" && s.event_status !== "городской") return false;
    if (pendingFilter.sort === "national" && s.event_status !== "всероссийский") return false;
    if (pendingFilter.sort === "international" && s.event_status !== "международный") return false;
    return true;
  })
  .sort((a, b) => {
    if (pendingFilter.sort === 'alpha') {
      return a.last_name.localeCompare(b.last_name);
    } else if (pendingFilter.sort === 'recent') {
      return b.id - a.id;
    }
    return 0;
  });

  // Пагинация таблицы
  const totalPendingPages = Math.ceil(filteredPending.length / itemsPerPage);
  const paginatedPending = filteredPending.slice(
    (pendingPage - 1) * itemsPerPage,
    pendingPage * itemsPerPage
  );

  // Фильтрация и сортировка 2 таблицы
  const filteredConfirmed = submissions
  .filter(s => s.status === 'confirmed')
  .filter(s =>
    s.last_name.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
    s.supervisor.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
    s.group.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
    s.activity.toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
    String(s.student_id).toLowerCase().includes(confirmedFilter.search.toLowerCase()) ||
    s.organizer.toLowerCase().includes(confirmedFilter.search.toLowerCase())
  )
  .filter(s => {
    if (confirmedFilter.sort === "intra" && s.event_status !== "внутривузовский") return false;
    if (confirmedFilter.sort === "region" && s.event_status !== "региональный") return false;
    if (confirmedFilter.sort === "city" && s.event_status !== "городской") return false;
    if (confirmedFilter.sort === "national" && s.event_status !== "всероссийский") return false;
    if (confirmedFilter.sort === "international" && s.event_status !== "международный") return false;
    return true;
  })
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

  return {
    formData, setFormData, errors, setErrors,
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
  };
}