import numpy as np
import cv2
from mtcnn import MTCNN
import tensorflow as tf
import os

class FaceRecognitionService:
    def __init__(self, model_path="./models/mobilefacenet.tflite"):
        self.detector = MTCNN()
        self.output_size = (112, 112)
        self.model_path = model_path
        self.interpreter = None
        
        # Load TFLite model
        if os.path.exists(self.model_path):
            try:
                self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
                self.interpreter.allocate_tensors()
                
                # Get input and output details
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                print(f"Loaded TFLite model from {self.model_path}")
            except Exception as e:
                print(f"Error loading TFLite model: {e}")
                self.interpreter = None
        else:
            print(f"Warning: Model file {self.model_path} not found. Embeddings will be random.")

    def detect_faces(self, image_np):
        """
        Detect faces in an image using MTCNN.
        Returns a list of dicts with 'box' and 'keypoints'.
        """
        # MTCNN expects RGB
        if image_np.shape[2] == 4:
            image_np = image_np[:, :, :3]
        
        results = self.detector.detect_faces(image_np)
        return results

    def align_face(self, image_np, keypoints):
        """
        Align face using affine transformation based on eye centers.
        """
        left_eye = keypoints['left_eye']
        right_eye = keypoints['right_eye']
        
        # Calculate angle
        dY = right_eye[1] - left_eye[1]
        dX = right_eye[0] - left_eye[0]
        angle = np.degrees(np.arctan2(dY, dX)) - 180

        # Calculate center
        # Force cast to int (native python type) because OpenCV can be picky about numpy.int64 in tuples
        eye_center = (int((left_eye[0] + right_eye[0]) // 2), int((left_eye[1] + right_eye[1]) // 2))

        # Get rotation matrix
        M = cv2.getRotationMatrix2D(eye_center, angle, 1.0)
        
        # Apply affine transformation
        (h, w) = image_np.shape[:2]
        aligned = cv2.warpAffine(image_np, M, (w, h), flags=cv2.INTER_CUBIC)
        
        return aligned

    def crop_and_resize(self, image_np, box):
        """
        Crop the face and resize to 112x112.
        """
        x, y, w, h = box
        x = max(0, x)
        y = max(0, y)
        face_img = image_np[y:y+h, x:x+w]
        
        # Resize to 112x112
        face_img = cv2.resize(face_img, self.output_size)
        
        # Preprocessing for MobileFaceNet (usually -1 to 1 or 0 to 1)
        # Assuming model expects float32 in range [-1, 1]
        face_img = (face_img - 127.5) / 128.0
        return face_img.astype(np.float32)

    def get_embedding(self, face_img):
        """
        Get 192-dim embedding using TFLite interpreter.
        """
        if self.interpreter is None:
            return np.random.rand(192).astype(np.float32) # Mock for now if model missing
        
        # Expand dims to represent batch size 1
        # Check input shape from details
        input_shape = self.input_details[0]['shape']
        # face_img shape is (112, 112, 3), need (1, 112, 112, 3)
        face_input = np.expand_dims(face_img, axis=0)
        
        # Set tensor
        self.interpreter.set_tensor(self.input_details[0]['index'], face_input)
        
        # Run inference
        self.interpreter.invoke()
        
        # Get result
        embedding = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
        
        # Normalize embedding to unit length
        norm = np.linalg.norm(embedding)
        if norm == 0:
            return embedding
        return embedding / norm

    def calculate_similarity(self, embed1, embed2):
        return np.dot(embed1, embed2) / (np.linalg.norm(embed1) * np.linalg.norm(embed2))
