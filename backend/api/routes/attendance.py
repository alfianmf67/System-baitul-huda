from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from db_models import Member, Attendance, Activity
from services.face_recognition import FaceRecognitionService
from datetime import datetime
import numpy as np
import cv2
import pickle

router = APIRouter()
face_service = FaceRecognitionService()

@router.delete("/today")
def delete_today_attendance(db: Session = Depends(get_db)):
    today_str = datetime.now().date().isoformat()
    # Delete all attendance records for today
    num_deleted = db.query(Attendance).filter(
        Attendance.timestamp.like(f"{today_str}%")
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"message": f"Berhasil menghapus {num_deleted} data kehadiran hari ini."}

@router.get("/today-activity")
def get_today_activity(db: Session = Depends(get_db)):
    today = datetime.now().date()
    # Find activity for today. 
    # If multiple, pick the one closest to now (not implemented yet, just taking first)
    activity = db.query(Activity).filter(Activity.date == today).first()
    if not activity:
        return None
    return activity

@router.post("/clock-in")
async def clock_in(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    faces = face_service.detect_faces(img)
    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")
    
    target_face = max(faces, key=lambda f: f['box'][2] * f['box'][3])
    aligned = face_service.align_face(img, target_face['keypoints'])
    processed_face = face_service.crop_and_resize(aligned, target_face['box'])
    embedding = face_service.get_embedding(processed_face)

    # Compare with all members
    members = db.query(Member).all()
    best_match = None
    max_similarity = 0.0
    threshold = 0.65

    for member in members:
        if member.face_embedding:
            member_embedding = pickle.loads(member.face_embedding)
            similarity = face_service.calculate_similarity(embedding, member_embedding)
            if similarity > max_similarity:
                max_similarity = similarity
                best_match = member
    
    if max_similarity >= threshold and best_match:
        # Check for duplication today
        now = datetime.now()
        today_date = now.date()
        today_str = today_date.isoformat()
        
        # Check based on member_id and date substring in timestamp
        existing_attendance = db.query(Attendance).filter(
            Attendance.member_id == best_match.id,
            Attendance.timestamp.like(f"{today_str}%")
        ).first()

        if existing_attendance:
            return {
                "status": "error",
                "message": "Mohon maaf anda sudah melakukan absensi",
                "member_name": best_match.name
            }
        
        # Calculate Status based on Activity
        # today_date = now.date() # Already defined above
        activity = db.query(Activity).filter(Activity.date == today_date).first()
        
        status = "Hadir" # Default if no activity
        activity_id = None
        
        if activity:
            activity_id = activity.id
            # Combine date and time to proper datetime objects for comparison
            # Note: start_time is datetime.time
            start_dt = datetime.combine(today_date, activity.start_time)
            
            # Logic: +/- 5 mins window around start time is "On Time"
            # However, typically coming early is also "On Time".
            # User rule: "kurang lebih 5 menit sebelum dan setelah... makan on time"
            # "lebih dari 5 menit setelah... telat"
            # Strict interpretation:
            # -5 min <= (now - start) <= +5 min -> On Time
            # (now - start) > +5 min -> Late
            # What if (now - start) < -5 min (Too early)? 
            # I will assume "On Time" effectively means <= Start + 5 mins.
            
            diff_minutes = (now - start_dt).total_seconds() / 60
            
            if diff_minutes > 5:
                status = "Telat"
            else:
                status = "On Time"
        else:
            # Fallback if no activity found for today
             status = "On Time"

        new_attendance = Attendance(
            member_id=best_match.id,
            activity_id=activity_id,
            timestamp=now.isoformat(),
            status=status
        )
        db.add(new_attendance)
        db.commit()
        return {
            "status": "success",
            "member_id": best_match.id,
            "name": best_match.name,
            "similarity": float(max_similarity),
            "timestamp": new_attendance.timestamp,
            "attendance_status": status,
            "activity_name": activity.name if activity else None
        }
    else:
        raise HTTPException(status_code=401, detail="Face not recognized or similarity too low")
