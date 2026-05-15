from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from predict import predict_pothole
from datetime import datetime
from functools import wraps
import jwt
import json
import os

app = Flask(__name__)
CORS(app)

SECRET_KEY = "supersecretadminkey"

MARKERS_FILE = "markers.json"
REPORTS_FILE = "reports.json"


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def load_json(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def generate_report_id(reports):
    date_str = datetime.now().strftime("%Y%m%d")

    today_prefix = f"RPT-{date_str}-"

    today_count = sum(
        1
        for r in reports
        if r["report_id"].startswith(today_prefix)
    )

    return f"{today_prefix}{str(today_count + 1).zfill(3)}"


# ─────────────────────────────────────────────────────────────
# JWT AUTH
# ─────────────────────────────────────────────────────────────

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = None

        auth_header = request.headers.get("Authorization")

        if auth_header:
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "error": "Token missing"
            }), 401

        try:
            jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

        except:
            return jsonify({
                "error": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated


# ─────────────────────────────────────────────────────────────
# ADMIN LOGIN
# ─────────────────────────────────────────────────────────────

@app.route("/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "admin123":

        token = jwt.encode(
            {"username": username},
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "success": True,
            "token": token
        })

    return jsonify({
        "success": False
    }), 401


# ─────────────────────────────────────────────────────────────
# PREDICT
# ─────────────────────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "Empty filename"
        }), 400

    try:
        result = predict_pothole(file)
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] {e}")

        return jsonify({
            "error": str(e)
        }), 500


# ─────────────────────────────────────────────────────────────
# MARKERS
# ─────────────────────────────────────────────────────────────

@app.route("/markers", methods=["GET"])
def get_markers():
    return jsonify(load_json(MARKERS_FILE))


@app.route("/markers", methods=["POST"])
def add_marker():

    markers = load_json(MARKERS_FILE)

    data = request.get_json()

    new_marker = {
        "id": len(markers) + 1,
        "lat": data["lat"],
        "lng": data["lng"],
        "severity": data["severity"],
        "confidence": data["confidence"],
        "timestamp": data.get(
            "timestamp",
            datetime.now().isoformat()
        ),
        "report_id": data.get("report_id", ""),
        "image_name": data.get("image_name", ""),
    }

    markers.append(new_marker)

    save_json(MARKERS_FILE, markers)

    return jsonify(new_marker), 201


# ─────────────────────────────────────────────────────────────
# REPORTS
# ─────────────────────────────────────────────────────────────

@app.route("/reports", methods=["GET"])
def get_all_reports():

    reports = load_json(REPORTS_FILE)

    return jsonify(list(reversed(reports)))


@app.route("/reports", methods=["POST"])
def create_report():

    reports = load_json(REPORTS_FILE)

    data = request.get_json()

    report_id = generate_report_id(reports)

    new_report = {
        "report_id": report_id,
        "lat": data["lat"],
        "lng": data["lng"],
        "severity": data["severity"],
        "confidence": data["confidence"],
        "timestamp": data.get(
            "timestamp",
            datetime.now().isoformat()
        ),
        "notes": data.get("notes", ""),
        "image_name": data.get("image_name", ""),
    }

    reports.append(new_report)

    save_json(REPORTS_FILE, reports)

    return jsonify(new_report), 201


@app.route("/reports/<report_id>", methods=["GET"])
def get_report(report_id):

    reports = load_json(REPORTS_FILE)

    match = next(
        (
            r
            for r in reports
            if r["report_id"].upper()
            == report_id.upper()
        ),
        None,
    )

    if match:
        return jsonify(match)

    return jsonify({
        "error": f"Report '{report_id}' not found"
    }), 404


# ─────────────────────────────────────────────────────────────
# UPDATE REPORT (ADMIN ONLY)
# ─────────────────────────────────────────────────────────────

@app.route("/reports/<report_id>", methods=["PUT"])
@token_required
def update_report(report_id):

    reports = load_json(REPORTS_FILE)

    data = request.get_json()

    for report in reports:

        if report["report_id"].upper() == report_id.upper():

            report["severity"] = data.get(
                "severity",
                report["severity"]
            )

            report["notes"] = data.get(
                "notes",
                report["notes"]
            )

            save_json(REPORTS_FILE, reports)

            return jsonify(report)

    return jsonify({
        "error": "Report not found"
    }), 404


# ─────────────────────────────────────────────────────────────
# DELETE REPORT + MARKER (ADMIN ONLY)
# ─────────────────────────────────────────────────────────────

@app.route("/reports/<report_id>", methods=["DELETE"])
@token_required
def delete_report(report_id):

    # LOAD REPORTS
    reports = load_json(REPORTS_FILE)

    # REMOVE REPORT
    updated_reports = [

        r
        for r in reports

        if r["report_id"].upper()
        != report_id.upper()
    ]

    # REPORT NOT FOUND
    if len(updated_reports) == len(reports):

        return jsonify({
            "error": "Report not found"
        }), 404

    # SAVE UPDATED REPORTS
    save_json(
        REPORTS_FILE,
        updated_reports
    )

    # LOAD MARKERS
    markers = load_json(
        MARKERS_FILE
    )

    # REMOVE RELATED MARKER
    updated_markers = [

        m
        for m in markers

        if m.get(
            "report_id",
            ""
        ).upper()
        != report_id.upper()
    ]

    # SAVE UPDATED MARKERS
    save_json(
        MARKERS_FILE,
        updated_markers
    )

    return jsonify({
        "deleted": report_id
    }), 200


# ─────────────────────────────────────────────────────────────
# IMAGES
# ─────────────────────────────────────────────────────────────

@app.route("/uploads/<filename>", methods=["GET"])
def get_image(filename):

    try:
        return send_file(
            os.path.join("uploads", filename),
            mimetype="image/jpeg"
        )

    except:
        return jsonify({
            "error": "Image not found"
        }), 404


# ─────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok"
    })


# ─────────────────────────────────────────────────────────────
# START SERVER
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)