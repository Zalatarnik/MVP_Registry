from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, Submission, init_db
from fastapi import Body
import shutil
import os

app = FastAPI()

# Настройка CORS для фронтенда на локалхосте
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание папки для файлов, если ещё не создана
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Инициализация базы данных
init_db()

#приём формs
@app.post("/submit/")
async def receive_submission(
    last_name: str = Form(...),
    first_name: str = Form(...),
    middle_name: str = Form(""),
    student_id: str = Form(...), 
    group: str = Form(...),
    supervisor: str = Form(...),
    activity: str = Form(...),
    event_status: str = Form(...),
    organizer: str = Form(...),
    location: str = Form(...),
    event_date: str = Form(...),
    file: UploadFile = File(...),
    comment: str = Form("")
):
    # Сохраняем файл на диск
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при сохранении файла: {str(e)}")

    # Запись данных в базу
    db = SessionLocal()
    try:
        new_entry = Submission(
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            student_id=student_id,
            group=group,
            supervisor=supervisor,
            activity=activity,
            event_status=event_status,
            organizer=organizer,
            location=location,
            event_date=event_date,
            file_name=file.filename,
            comment=comment,
            status="pending"
        )
        db.add(new_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка записи в базу: {str(e)}")
    finally:
        db.close()

    return {"status": "ok", "message": "Форма успешно сохранена"}


# получение всех записей
@app.get("/submissions/")
def list_submissions():
    db = SessionLocal()
    try:
        entries = db.query(Submission).all()
        return [
            {
                "id": s.id,
                "last_name": s.last_name,
                "first_name": s.first_name,
                "middle_name": s.middle_name,
                "student_id": s.student_id,
                "group": s.group,
                "supervisor": s.supervisor,
                "activity": s.activity,
                "event_status": s.event_status,
                "organizer": s.organizer,
                "location": s.location,
                "event_date": s.event_date,
                "file_name": s.file_name,
                "comment": s.comment,
                "status": s.status
            }
            for s in entries
        ]
    finally:
        db.close()

@app.post("/confirm/")
def confirm_submissions(ids: list[int] = Body(...)):
    db = SessionLocal()
    try:
        db.query(Submission).filter(Submission.id.in_(ids)).update({"status": "confirmed"}, synchronize_session=False)
        db.commit()
        return {"status": "ok", "message": "Записи подтверждены"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/delete/")
def delete_submissions(ids: list[int] = Body(...)):
    db = SessionLocal()
    try:
        db.query(Submission).filter(Submission.id.in_(ids)).delete(synchronize_session=False)
        db.commit()
        return {"status": "ok", "message": "Записи удалены"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()