from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from db_models import Member, Attendance, Activity
from datetime import date, time, datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class ActivityBase(BaseModel):
    name: str
    activity_type: str
    date: date
    start_time: time
    end_time: time
    material: str
    speaker: str
    place: str

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(ActivityBase):
    pass

import os
from dotenv import load_dotenv

load_dotenv()

@router.post("/login")
def login(data: LoginRequest):
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin")
    
    if data.username == admin_user and data.password == admin_pass:
        return {"status": "success", "token": "admin-mock-token"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_members = db.query(Member).count()
    today_str = date.today().isoformat()
    attendances = db.query(Attendance).filter(Attendance.timestamp.like(f"{today_str}%")).all()
    
    today_count = len(attendances)
    ontime_count = sum(1 for a in attendances if a.status == "On Time")
    late_count = sum(1 for a in attendances if a.status == "Telat")
    
    return {
        "total_members": total_members,
        "today_attendance": today_count,
        "ontime": ontime_count,
        "late": late_count
    }

@router.get("/activities")
def get_activities(db: Session = Depends(get_db)):
    return db.query(Activity).all()

@router.get("/attendance-logs")
@router.get("/attendance-logs")
def get_attendance_logs(activity_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Join with Member to get names, and Join with Activity to get activity details
    query = db.query(Attendance, Member, Activity).\
        join(Member, Attendance.member_id == Member.id).\
        outerjoin(Activity, Attendance.activity_id == Activity.id)

    if activity_id:
        query = query.filter(Attendance.activity_id == activity_id)

    logs = query.order_by(Attendance.timestamp.desc()).limit(50).all()
    
    results = []
    for att, mem, act in logs:
        results.append({
            "id": att.id,
            "name": mem.name,
            "timestamp": att.timestamp,
            "status": att.status,
            "activity_name": act.name if act else "Unknown/Manual",
            "activity_date": act.date if act else None
        })
    return results

@router.get("/attendance-chart")
def get_attendance_chart(db: Session = Depends(get_db)):
    # Get last 7 days stats
    from datetime import timedelta
    today = date.today()
    stats = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.isoformat()
        # Count attendance for this day (simple string match on timestamp)
        # In a real app with huge data, use SQL efficient queries
        count = db.query(Attendance).filter(Attendance.timestamp.like(f"{day_str}%")).count()
        stats.append({
            "date": day.strftime("%d %b"), # e.g. 05 Jan
            "count": count
        })
    
    return stats

@router.post("/activities")
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    db_activity = Activity(
        name=activity.name,
        activity_type=activity.activity_type,
        date=activity.date,
        start_time=activity.start_time,
        end_time=activity.end_time,
        material=activity.material,
        speaker=activity.speaker,
        place=activity.place
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.put("/activities/{activity_id}")
def update_activity(activity_id: int, activity: ActivityUpdate, db: Session = Depends(get_db)):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db_activity.name = activity.name
    db_activity.activity_type = activity.activity_type
    db_activity.date = activity.date
    db_activity.start_time = activity.start_time
    db_activity.end_time = activity.end_time
    db_activity.material = activity.material
    db_activity.speaker = activity.speaker
    db_activity.place = activity.place
    
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"message": "Activity deleted"}

@router.get("/reports")
def get_reports(period: str = "weekly", db: Session = Depends(get_db)):
    from datetime import timedelta
    
    today = date.today()
    if period == "weekly":
        start_date = today - timedelta(days=7)
    elif period == "monthly":
        start_date = today - timedelta(days=30)
    else:
        start_date = today - timedelta(days=7)
        
    # Get activities in range
    activities = db.query(Activity).filter(Activity.date >= start_date).order_by(Activity.date).all()
    
    # Process data
    report_data = []
    total_activities = len(activities)
    total_attendance = 0
    activity_types = set()
    
    for act in activities:
        # Count attendance for this activity
        # Note: We rely on the relationship 'attendances'
        att_count = len(act.attendances)
        total_attendance += att_count
        activity_types.add(act.activity_type)
        
        report_data.append({
            "id": act.id,
            "name": act.name,
            "date": act.date,
            "type": act.activity_type,
            "attendance_count": att_count
        })
        
    return {
        "summary": {
            "total_activities": total_activities,
            "total_attendance": total_attendance,
            "unique_types": len(activity_types),
            "period": period
        },
        "activities": report_data
    }
