from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./students.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Submission(Base):
    __tablename__ = "students" 
    id = Column(Integer, primary_key=True, index=True)
    last_name = Column(String)
    first_name = Column(String)
    middle_name = Column(String)
    student_id = Column(String)
    group = Column(String)
    supervisor = Column(String)
    activity = Column(String)
    event_status = Column(String)
    organizer = Column(String)
    location = Column(String)
    event_date = Column(String)
    file_name = Column(String)
    comment = Column(String)
    status = Column(String, default='pending')


def init_db():
    Base.metadata.create_all(bind=engine)