# Pothole Detection – Flask Backend

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. (If you have a dataset) Train the model
python train.py

# 3. Start the server
python app.py
```

Server runs at `http://127.0.0.1:5000`

---

## API

### POST /predict
Upload an image and get a prediction.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "detected": true,
  "confidence": 92.4,
  "raw_score": 0.924
}
```

- `detected` — `true` if pothole found, `false` otherwise  
- `confidence` — how confident the model is (0–100%)  
- `raw_score` — raw sigmoid output (useful for debugging)

### GET /health
Returns `{ "status": "ok" }` — confirms server is up.

---

## Dataset Structure (for training)

```
dataset/
├── train/
│   ├── pothole/        ← road images WITH potholes
│   └── no_pothole/     ← road images WITHOUT potholes
└── val/
    ├── pothole/
    └── no_pothole/
```

### Where to get datasets
- [Kaggle – Pothole Detection](https://www.kaggle.com/datasets/atulyakumar98/pothole-detection-dataset)
- [Roboflow – Pothole datasets](https://universe.roboflow.com/search?q=pothole)

---

## Notes

- If no `pothole_model.h5` is found, the server starts with an **untrained** MobileNetV2 base — predictions will be random until you train.
- After training, the model auto-saves as `pothole_model.h5` and is loaded on next startup.
- The model uses **MobileNetV2** pretrained on ImageNet as a feature extractor, with a custom classification head on top.
