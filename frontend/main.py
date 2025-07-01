from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, Submission, init_db
import shutil
import os

# Инициализация сервера
app = FastAPI()
init_db()  # ← создаёт students.db и таблицу students

# Разрешение CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Папка для загрузки файлов
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# POST-запрос: приём формы
@app.post("/submit/")
async def submit(
    last_name: str = Form(...),
    first_name: str = Form(...),
    middle_name: str = Form(""),
    group: str = Form(...),
    supervisor: str = Form(...),
    activity: str = Form(...),
    file: UploadFile = File(...),
    comment: str = Form("")
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    submission = Submission(
        last_name=last_name,
        first_name=first_name,
        middle_name=middle_name,
        group=group,
        supervisor=supervisor,
        activity=activity,
        file_name=file.filename,
        comment=comment
    )
    db.add(submission)
    db.commit()
    db.close()

    return {"status": "ok"}

# GET-запрос: получение всех записей
@app.get("/submissions/")
def get_submissions():
    db = SessionLocal()
    all_data = db.query(Submission).all()
    db.close()
    return [
        {
            "last_name": s.last_name,
            "first_name": s.first_name,
            "middle_name": s.middle_name,
            "group": s.group,
            "supervisor": s.supervisor,
            "activity": s.activity,
            "file_name": s.file_name,
            "comment": s.comment
        }
        for s in all_data
    ]