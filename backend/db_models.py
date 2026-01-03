from sqlalchemy import Column, Integer, String, Text, Date, Time, ForeignKey, BINARY
from sqlalchemy.orm import relationship
from database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    gender = Column(String)
    dob = Column(Date)
    address = Column(Text)
    # Storing embedding as binary data (serialized numpy array)
    face_embedding = Column(BINARY, nullable=True) 

    attendances = relationship("Attendance", back_populates="member")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    activity_type = Column(String) # e.g., 'Pengajian Mingguan', 'Acara Spesial'
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    material = Column(Text)
    speaker = Column(String)
    place = Column(String)

    attendances = relationship("Attendance", back_populates="activity", cascade="all, delete")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True) # Optional link to specific activity
    timestamp = Column(String) # Storing full ISO format datetime string
    status = Column(String) # 'On Time', 'Late'

    member = relationship("Member", back_populates="attendances")
    activity = relationship("Activity", back_populates="attendances")
