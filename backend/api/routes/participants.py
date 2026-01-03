from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from db_models import Member
from services.face_recognition import FaceRecognitionService
import numpy as np
import cv2
import pickle

from datetime import datetime

router = APIRouter()
face_service = FaceRecognitionService() # Initialize service

@router.post("/enroll")
async def enroll_participant(
    name: str = Form(...),
    gender: str = Form(...),
    dob: str = Form(...),
    address: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Process images (expecting 3)
    embeddings = []
    
    for file in files:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect and align
        faces = face_service.detect_faces(img)
        if not faces:
            continue # Skip if no face found, or raise error?
            
        # Take the largest face
        # In a real scenario, we should ensure only one face is present
        target_face = max(faces, key=lambda f: f['box'][2] * f['box'][3])
        
        # Align (simplified call for now, assume align_face does logic)
        # Note: My align_face in service needs 'keypoints'
        aligned = face_service.align_face(img, target_face['keypoints'])
        
        # Crop and resize
        # Box is x, y, w, h. The aligned image might change coordinates.
        # Ideally alignment producing a standard size is better.
        # Let's trust the service's internal logic or improve it.
        # Use crop_and_resize on the aligned image? 
        # Actually standard pipeline: Detect -> Align -> Crop/Resize -> Embed
        
        # For this prototype:
        processed_face = face_service.crop_and_resize(aligned, target_face['box']) 
        
        embedding = face_service.get_embedding(processed_face)
        embeddings.append(embedding)

    if not embeddings:
        raise HTTPException(status_code=400, detail="No valid faces detected in images")

    # Average the embeddings for better robust representation
    avg_embedding = np.mean(embeddings, axis=0)
    
    # Store in DB
    # Convert dob string (YYYY-MM-DD) to Python date object
    try:
        dob_date = datetime.strptime(dob, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    new_member = Member(
        name=name,
        gender=gender,
        dob=dob_date, 
        address=address,
        face_embedding=pickle.dumps(avg_embedding)
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return {"message": "Participant enrolled successfully", "id": new_member.id}

@router.get("/")
def get_participants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = db.query(Member).offset(skip).limit(limit).all()
    # Don't return binary embedding
    results = []
    for m in members:
        results.append({
            "id": m.id,
            "name": m.name,
            "gender": m.gender,
            "dob": m.dob,
            "address": m.address
        })
    return results

@router.put("/{participant_id}")
async def update_participant(
    participant_id: int,
    name: str = Form(...),
    gender: str = Form(...),
    dob: str = Form(...),
    address: str = Form(...),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == participant_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    try:
        member.dob = datetime.strptime(dob, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    member.name = name
    member.gender = gender
    member.address = address
    
    db.commit()
    return {"message": "Participant updated successfully"}

@router.delete("/{participant_id}")
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == participant_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    db.delete(member)
    db.commit()
    return {"message": "Participant deleted successfully"}
