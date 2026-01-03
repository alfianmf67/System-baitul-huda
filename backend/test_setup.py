import os
import numpy as np
import tensorflow as tf
from mtcnn import MTCNN
import cv2

def test_backend():
    print("Testing Backend Dependencies...")
    
    # 1. Test MTCNN
    print("Initializing MTCNN...")
    try:
        detector = MTCNN()
        print("MTCNN Initialized successfully.")
    except Exception as e:
        print(f"FAILED to initialize MTCNN: {e}")
        return

    # 2. Test TFLite Model
    model_path = os.path.join(os.path.dirname(__file__), "models", "mobilefacenet.tflite")
    print(f"Loading TFLite model from {model_path}...")
    
    if not os.path.exists(model_path):
        print(f"FAILED: Model file not found at {model_path}")
        return

    try:
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print("TFLite Model loaded successfully.")
        print(f"Input shape: {input_details[0]['shape']}")
        print(f"Output shape: {output_details[0]['shape']}")
    except Exception as e:
        print(f"FAILED to load TFLite model: {e}")
        return

    print("\nALL CHECKS PASSED. The backend code logic seems fine.")
    print("If the server crashes, try running WITHOUT --reload.")

if __name__ == "__main__":
    test_backend()
