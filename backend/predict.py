import numpy as np
from PIL import Image
import io
import os
import tensorflow as tf
from datetime import datetime

# ── Model path ────────────────────────────────────────────────────────────────
MODEL_PATH = "pothole_model.h5"

# ── Load (or build) model ─────────────────────────────────────────────────────
def build_model():
    """
    MobileNetV2-based binary classifier.
    Output: 1 neuron (sigmoid) → 0 = no pothole, 1 = pothole
    """
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # freeze pretrained weights

    model = tf.keras.Sequential([
        base,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(1, activation="sigmoid"),  # binary output
    ])

    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


def load_model():
    if os.path.exists(MODEL_PATH):
        print(f"[INFO] Loading saved model from {MODEL_PATH}")
        return tf.keras.models.load_model(MODEL_PATH)
    else:
        print("[WARN] No saved model found — using untrained base model.")
        print("[WARN] Train the model first using train.py for accurate predictions.")
        return build_model()


# Load once at startup
model = load_model()


# ── Preprocessing ─────────────────────────────────────────────────────────────
def preprocess(file) -> np.ndarray:
    """Read uploaded file, resize to 224×224, normalise to [0,1]."""
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)   # shape: (1, 224, 224, 3)


# ── Public API ────────────────────────────────────────────────────────────────
def save_image(file) -> str:
    """
    Save uploaded image to uploads directory and return the filename.
    Returns the saved image filename.
    """
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    
    # Generate unique filename with timestamp
    ext = os.path.splitext(file.filename)[1]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
    filename = f"{timestamp}{file.filename}"
    filepath = os.path.join(uploads_dir, filename)
    
    # Save the file
    file.save(filepath)
    return filename


def predict_pothole(file) -> dict:
    """
    Returns:
        { "detected": bool, "confidence": float (0-100), "image_name": str }
    """
    # Save image first
    image_name = save_image(file)
    
    # Reset file pointer for prediction
    file.seek(0)
    
    img = preprocess(file)
    raw = float(model.predict(img, verbose=0)[0][0])   # sigmoid output 0-1

    detected   = raw >= 0.5
    confidence = round(raw * 100 if detected else (1 - raw) * 100, 2)

    return {
        "detected":   detected,
        "confidence": confidence,
        "raw_score":  round(raw, 4),   # useful for debugging
        "image_name": image_name,
    }
