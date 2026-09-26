import json
import os
import uuid
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

app = Flask(__name__)

# ------------------------------------------------------------------
# CONFIGURATION & SECURITY
# ------------------------------------------------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "labsphere-production-secret-key-2026-biotech")
app.config["SECRET_KEY"] = SECRET_KEY
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="labsphere-auth-token")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# ------------------------------------------------------------------
# MONGODB CONNECTION & RESILIENT FALLBACK
# ------------------------------------------------------------------
MONGO_URI = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/")
mongo_connected = False
client = None
db = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.admin.command("ping")
    db = client["labsphere"]
    mongo_connected = True
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"MongoDB not available ({e}). Using resilient in-memory/JSON fallback store.")
    mongo_connected = False

# Fallback in-memory stores if Mongo is offline
memory_store = {
    "users": {},
    "experiments": {},
    "progress": {},       # key: (user_id, experiment_id)
    "quiz_results": [],   # list of dicts with user_id
    "notes": [],          # list of dicts with user_id
    "activity": [],       # list of dicts with user_id
    "achievements": {}    # key: (user_id, achievement_id)
}

# ------------------------------------------------------------------
# SEED EXPERIMENTS FROM JSON
# ------------------------------------------------------------------
EXPERIMENTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Experiments"))

def load_local_experiments():
    exps = []
    file_mapping = [
        "DNAExtract.json",
        "PCR.json",
        "gram_staining.json",
        "gel_electrophoresis.json",
        "elisa.json"
    ]
    for filename in file_mapping:
        filepath = os.path.join(EXPERIMENTS_DIR, filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    exps.append(data)
            except Exception as err:
                print(f"Error loading {filepath}: {err}")
    return exps

# Standard Achievement Definitions
STANDARD_ACHIEVEMENTS = [
    {
        "id": "cert-dna",
        "title": "DNA Isolation Specialist",
        "category": "Molecular Biology",
        "code": "LS-DNA-9921",
        "icon": "🧬",
        "desc": "Demonstrated cellular lysis via detergent disruption, charge neutralization via NaCl, and cold ethanol precipitation with zero procedural errors."
    },
    {
        "id": "cert-pcr",
        "title": "PCR Master Technician",
        "category": "Molecular Diagnostics",
        "code": "LS-PCR-8412",
        "icon": "⚡",
        "desc": "Successfully programmed 3-stage thermal cycling kinetics (95°C denaturation, 55°C annealing, 72°C extension) across 30 exponential cycles."
    },
    {
        "id": "cert-gram",
        "title": "Gram Stain Microscopist",
        "category": "Microbiology",
        "code": "LS-MIC-7390",
        "icon": "🔬",
        "desc": "Mastered heat fixation, crystal violet-iodine mordant retention, ethanol decolorization, and differential 1000X oil immersion microscopy."
    },
    {
        "id": "cert-gel",
        "title": "Electrophoresis Analyst",
        "category": "Biophysical Chemistry",
        "code": "LS-GEL-4198",
        "icon": "🧪",
        "desc": "Expertly cast agarose matrix, loaded DNA ladder and sample wells without puncturing, and resolved molecular bands under 302nm UV transillumination."
    },
    {
        "id": "cert-elisa",
        "title": "ELISA Immunoassay Expert",
        "category": "Immunology",
        "code": "LS-ELI-3820",
        "icon": "🧫",
        "desc": "Executed indirect microplate enzyme-linked immunosorbent assay with chromogenic TMB substrate and 450nm spectrophotometric optical density quantification."
    },
    {
        "id": "cert-safety",
        "title": "Biosafety Level 1 (BSL-1)",
        "category": "Laboratory Safety",
        "code": "LS-BSL-1004",
        "icon": "🛡",
        "desc": "Full adherence to personal protective equipment (PPE), chemical spill protocols, ethanol flammability precautions, and hazardous waste disposal."
    }
]

def seed_database():
    local_exps = load_local_experiments()
    for exp in local_exps:
        memory_store["experiments"][exp["id"]] = exp

    if mongo_connected and db is not None:
        try:
            exp_col = db["experiments"]
            for exp in local_exps:
                exp_col.update_one({"id": exp["id"]}, {"$set": exp}, upsert=True)
            print(f"Successfully seeded {len(local_exps)} experiments into MongoDB.")
        except Exception as err:
            print("Failed to seed MongoDB:", err)

    # Seed demo user "Iris Danica" for instant demonstration
    demo_user_id = "user-iris-danica"
    demo_user = {
        "id": demo_user_id,
        "name": "Iris Danica",
        "email": "demo@labsphere.ai",
        "password_hash": generate_password_hash("Password123!", method="pbkdf2:sha256"),
        "role": "Student Biologist & Researcher",
        "institution": "School of Life Sciences & Bio-Engineering",
        "lab_id": "LS-2026-BIO-8941",
        "bio": "Undergraduate researcher concentrating on recombinant DNA technology, PCR diagnostic assays, microplate spectrophotometry, and virtual laboratory simulation methodologies.",
        "created_at": "2026-09-01T08:00:00.000Z"
    }
    memory_store["users"][demo_user_id] = demo_user

    if mongo_connected and db is not None:
        try:
            db["users"].update_one({"id": demo_user_id}, {"$set": demo_user}, upsert=True)
        except Exception as err:
            print("Failed to seed demo user in Mongo:", err)

    # Seed demo user progress (experiments 1, 2, 3 completed)
    for exp_id in [1, 2, 3]:
        key = (demo_user_id, exp_id)
        prog = {
            "user_id": demo_user_id,
            "experiment_id": exp_id,
            "completed_sections": [f"sec-{i}" for i in range(1, 9)],
            "lab_score": 96,
            "lab_time": 420,
            "mistakes": 0,
            "is_completed": True,
            "last_updated": "2026-09-20T10:00:00.000Z"
        }
        memory_store["progress"][key] = prog
        if mongo_connected and db is not None:
            try:
                db["progress"].update_one({"user_id": demo_user_id, "experiment_id": exp_id}, {"$set": prog}, upsert=True)
            except Exception:
                pass

    # Seed demo user achievements
    for ach in STANDARD_ACHIEVEMENTS[:3]:
        key = (demo_user_id, ach["id"])
        ach_rec = {
            **ach,
            "user_id": demo_user_id,
            "unlocked": True,
            "date": "Sep 2026"
        }
        memory_store["achievements"][key] = ach_rec

seed_database()

# ------------------------------------------------------------------
# AUTHENTICATION HELPERS
# ------------------------------------------------------------------
def generate_token(user_id, email):
    return serializer.dumps({"user_id": user_id, "email": email})

def decode_token(token):
    try:
        # Valid for 30 days
        data = serializer.loads(token, max_age=86400 * 30)
        return data
    except (SignatureExpired, BadSignature, Exception):
        return None

def get_authenticated_user():
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    data = decode_token(token)
    if not data or "user_id" not in data:
        return None

    user_id = data["user_id"]
    if mongo_connected and db is not None:
        try:
            u = db["users"].find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
            if u:
                return u
        except Exception:
            pass

    u = memory_store["users"].get(user_id)
    if u:
        # Return without password_hash
        safe_u = {k: v for k, v in u.items() if k != "password_hash"}
        return safe_u
    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_authenticated_user()
        if not user:
            # Fallback for local demo mode if Authorization is omitted
            # Allows seamless exploration while strictly isolating authenticated users
            auth_header = request.headers.get("Authorization", "")
            if not auth_header:
                demo_user = memory_store["users"].get("user-iris-danica")
                if demo_user:
                    safe_demo = {k: v for k, v in demo_user.items() if k != "password_hash"}
                    return f(safe_demo, *args, **kwargs)
            return jsonify({"error": "Authentication required. Please log in."}), 401
        return f(user, *args, **kwargs)
    return decorated

def log_user_activity(user_id, icon, title, detail):
    activity_rec = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "icon": icon,
        "title": title,
        "detail": detail,
        "time": "Just now",
        "created_at": datetime.utcnow().isoformat()
    }
    memory_store["activity"].insert(0, activity_rec)
    if mongo_connected and db is not None:
        try:
            db["activity"].insert_one(activity_rec)
        except Exception:
            pass

def evaluate_user_achievements(user_id):
    # Retrieve user progress & quiz results
    user_progs = [p for k, p in memory_store["progress"].items() if k[0] == user_id]
    if mongo_connected and db is not None:
        try:
            user_progs = list(db["progress"].find({"user_id": user_id}, {"_id": 0}))
        except Exception:
            pass

    completed_ids = {p["experiment_id"] for p in user_progs if p.get("is_completed") or len(p.get("completed_sections", [])) >= 7}

    id_to_ach = {
        1: "cert-dna",
        2: "cert-pcr",
        3: "cert-gram",
        4: "cert-gel",
        5: "cert-elisa"
    }

    for exp_id, ach_id in id_to_ach.items():
        if exp_id in completed_ids:
            key = (user_id, ach_id)
            if key not in memory_store["achievements"]:
                base = next((a for a in STANDARD_ACHIEVEMENTS if a["id"] == ach_id), None)
                if base:
                    unlocked = {
                        **base,
                        "user_id": user_id,
                        "unlocked": True,
                        "date": datetime.utcnow().strftime("%b %Y")
                    }
                    memory_store["achievements"][key] = unlocked
                    if mongo_connected and db is not None:
                        try:
                            db["achievements"].update_one({"user_id": user_id, "id": ach_id}, {"$set": unlocked}, upsert=True)
                        except Exception:
                            pass
                    log_user_activity(user_id, "🏆", f"Earned {base['title']} Certification", base["desc"][:80] + "...")

    # BSL-1 Safety if 3 or more experiments completed
    if len(completed_ids) >= 3:
        key = (user_id, "cert-safety")
        if key not in memory_store["achievements"]:
            base = next((a for a in STANDARD_ACHIEVEMENTS if a["id"] == "cert-safety"), None)
            if base:
                unlocked = {
                    **base,
                    "user_id": user_id,
                    "unlocked": True,
                    "date": datetime.utcnow().strftime("%b %Y")
                }
                memory_store["achievements"][key] = unlocked
                if mongo_connected and db is not None:
                    try:
                        db["achievements"].update_one({"user_id": user_id, "id": "cert-safety"}, {"$set": unlocked}, upsert=True)
                    except Exception:
                        pass
                log_user_activity(user_id, "🛡", "Earned Biosafety Level 1 Certification", "Mastered PPE and laboratory safety.")

# ------------------------------------------------------------------
# SYSTEM HEALTH & ROOT
# ------------------------------------------------------------------
@app.route("/")
def home():
    return jsonify({
        "name": "LabSphere AI Backend",
        "status": "online",
        "version": "1.0.0",
        "mongo_connected": mongo_connected,
        "experiments_count": len(memory_store["experiments"])
    })

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "LabSphere AI API",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if mongo_connected else "fallback_memory_active",
        "experiments_loaded": len(memory_store["experiments"])
    }), 200

# ------------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# ------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""
    institution = (data.get("institution") or "Biotechnology Institute").strip()

    if not name:
        return jsonify({"error": "Full Name is required."}), 400
    if not email or "@" not in email:
        return jsonify({"error": "Valid email address is required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400
    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    # Check for existing email in DB or memory
    if mongo_connected and db is not None:
        try:
            if db["users"].find_one({"email": email}):
                return jsonify({"error": "An account with this email already exists."}), 400
        except Exception:
            pass

    for u in memory_store["users"].values():
        if u.get("email") == email:
            return jsonify({"error": "An account with this email already exists."}), 400

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    pwd_hash = generate_password_hash(password, method="pbkdf2:sha256")

    user_doc = {
        "id": user_id,
        "name": name,
        "email": email,
        "password_hash": pwd_hash,
        "role": "Student Biologist",
        "institution": institution,
        "lab_id": f"LS-{datetime.utcnow().year}-BIO-{uuid.uuid4().hex[:4].upper()}",
        "bio": "Enthusiastic virtual biotechnology student exploring molecular biology, immunology, and genetic assays.",
        "created_at": datetime.utcnow().isoformat()
    }

    memory_store["users"][user_id] = user_doc

    if mongo_connected and db is not None:
        try:
            db["users"].insert_one(user_doc)
        except Exception as e:
            print("Error storing user in MongoDB:", e)

    token = generate_token(user_id, email)
    log_user_activity(user_id, "👋", "Account Created", f"Welcome to LabSphere AI, {name}!")

    safe_user = {k: v for k, v in user_doc.items() if k != "password_hash" and k != "_id"}
    return jsonify({
        "message": "Registration successful.",
        "token": token,
        "user": safe_user
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user_doc = None
    if mongo_connected and db is not None:
        try:
            user_doc = db["users"].find_one({"email": email})
        except Exception:
            pass

    if not user_doc:
        for u in memory_store["users"].values():
            if u.get("email") == email:
                user_doc = u
                break

    if not user_doc:
        return jsonify({"error": "Invalid email or password."}), 401

    if not check_password_hash(user_doc.get("password_hash", ""), password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = generate_token(user_doc["id"], user_doc["email"])
    log_user_activity(user_doc["id"], "🔑", "Logged In", "Session authenticated successfully.")

    safe_user = {k: v for k, v in user_doc.items() if k != "password_hash" and k != "_id"}
    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": safe_user
    }), 200

@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    # Stateless token logout
    return jsonify({"message": "Logged out successfully."}), 200

@app.route("/api/auth/me", methods=["GET"])
@require_auth
def auth_me(current_user):
    return jsonify({
        "user": current_user
    }), 200

@app.route("/api/auth/profile", methods=["PUT"])
@require_auth
def update_profile(current_user):
    data = request.get_json() or {}
    user_id = current_user["id"]

    updates = {}
    if "name" in data and data["name"].strip():
        updates["name"] = data["name"].strip()
    if "institution" in data:
        updates["institution"] = data["institution"].strip()
    if "bio" in data:
        updates["bio"] = data["bio"].strip()
    if "role" in data:
        updates["role"] = data["role"].strip()

    if not updates:
        return jsonify({"error": "No valid fields to update."}), 400

    # Update in memory
    if user_id in memory_store["users"]:
        memory_store["users"][user_id].update(updates)

    # Update in Mongo
    if mongo_connected and db is not None:
        try:
            db["users"].update_one({"id": user_id}, {"$set": updates})
        except Exception as e:
            print("Mongo error updating profile:", e)

    updated_user = {**current_user, **updates}
    return jsonify({
        "message": "Profile updated successfully.",
        "user": updated_user
    }), 200

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    user_doc = None
    for u in memory_store["users"].values():
        if u.get("email") == email:
            user_doc = u
            break

    if mongo_connected and db is not None and not user_doc:
        try:
            user_doc = db["users"].find_one({"email": email})
        except Exception:
            pass

    # Create a password reset token
    reset_token = serializer.dumps({"reset_email": email}, salt="labsphere-pwd-reset")

    # In production, this would send an email. For demo/dev, we return the token
    return jsonify({
        "message": "If an account with that email exists, password reset instructions have been generated.",
        "reset_token": reset_token
    }), 200

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if not token or not new_password:
        return jsonify({"error": "Reset token and new password are required."}), 400
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long."}), 400

    try:
        payload = serializer.loads(token, salt="labsphere-pwd-reset", max_age=3600)
        email = payload.get("reset_email")
    except Exception:
        return jsonify({"error": "Invalid or expired reset token."}), 400

    new_hash = generate_password_hash(new_password, method="pbkdf2:sha256")

    # Update memory
    for uid, u in memory_store["users"].items():
        if u.get("email") == email:
            u["password_hash"] = new_hash
            break

    # Update Mongo
    if mongo_connected and db is not None:
        try:
            db["users"].update_one({"email": email}, {"$set": {"password_hash": new_hash}})
        except Exception:
            pass

    return jsonify({"message": "Password has been successfully updated. You may now log in."}), 200

# ------------------------------------------------------------------
# EXPERIMENTS ENDPOINTS (Public / Curriculum Data)
# ------------------------------------------------------------------
@app.route("/api/experiments", methods=["GET"])
def get_experiments():
    if mongo_connected and db is not None:
        try:
            data = list(db["experiments"].find({}, {"_id": 0}))
            if data:
                return jsonify(data)
        except Exception as e:
            print("Mongo error in get_experiments:", e)

    return jsonify(list(memory_store["experiments"].values()))

@app.route("/api/experiments/<int:experiment_id>", methods=["GET"])
def get_experiment_by_id(experiment_id):
    if mongo_connected and db is not None:
        try:
            data = db["experiments"].find_one({"id": experiment_id}, {"_id": 0})
            if data:
                return jsonify(data)
        except Exception as e:
            print("Mongo error in get_experiment_by_id:", e)

    exp = memory_store["experiments"].get(experiment_id)
    if exp:
        return jsonify(exp)
    return jsonify({"error": "Experiment not found."}), 404

# ------------------------------------------------------------------
# USER-SPECIFIC PROGRESS ENDPOINTS
# ------------------------------------------------------------------
@app.route("/api/progress", methods=["GET"])
@require_auth
def get_user_progress(current_user):
    user_id = current_user["id"]
    progress_list = []

    if mongo_connected and db is not None:
        try:
            progress_list = list(db["progress"].find({"user_id": user_id}, {"_id": 0}))
        except Exception as e:
            print("Mongo error in get_user_progress:", e)

    if not progress_list:
        progress_list = [p for k, p in memory_store["progress"].items() if k[0] == user_id]

    total_experiments = 5
    completed_experiments = sum(1 for p in progress_list if p.get("is_completed") or len(p.get("completed_sections", [])) >= 7)
    total_score = sum(p.get("lab_score", 0) for p in progress_list)
    avg_score = round(total_score / len(progress_list)) if progress_list else 0

    return jsonify({
        "progress": progress_list,
        "summary": {
            "total_experiments": total_experiments,
            "completed_experiments": completed_experiments,
            "overall_percentage": round((completed_experiments / total_experiments) * 100),
            "average_lab_score": avg_score
        }
    })

@app.route("/api/progress/<int:experiment_id>", methods=["GET"])
@require_auth
def get_single_progress(current_user, experiment_id):
    user_id = current_user["id"]

    if mongo_connected and db is not None:
        try:
            data = db["progress"].find_one({"user_id": user_id, "experiment_id": experiment_id}, {"_id": 0})
            if data:
                return jsonify(data)
        except Exception as e:
            print("Mongo error in get_single_progress:", e)

    key = (user_id, experiment_id)
    data = memory_store["progress"].get(key)
    if data:
        return jsonify(data)

    return jsonify({
        "experiment_id": experiment_id,
        "user_id": user_id,
        "completed_sections": [],
        "lab_score": 0,
        "lab_time": 0,
        "mistakes": 0,
        "is_completed": False
    })

@app.route("/api/progress", methods=["POST"])
@require_auth
def save_user_progress(current_user):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}
        experiment_id = data.get("experiment_id")

        if experiment_id is None:
            return jsonify({"error": "Experiment ID is required."}), 400

        experiment_id = int(experiment_id)
        completed_sections = data.get("completed_sections", [])
        lab_score = int(data.get("lab_score", 0))
        lab_time = int(data.get("lab_time", 0))
        mistakes = int(data.get("mistakes", 0))
        is_completed = bool(data.get("is_completed", False) or len(completed_sections) >= 8)

        record = {
            "user_id": user_id,
            "experiment_id": experiment_id,
            "completed_sections": completed_sections,
            "lab_score": lab_score,
            "lab_time": lab_time,
            "mistakes": mistakes,
            "is_completed": is_completed,
            "last_updated": datetime.utcnow().isoformat()
        }

        # Store in memory
        key = (user_id, experiment_id)
        memory_store["progress"][key] = record

        # Store in MongoDB
        if mongo_connected and db is not None:
            try:
                db["progress"].update_one(
                    {"user_id": user_id, "experiment_id": experiment_id},
                    {"$set": record},
                    upsert=True
                )
            except Exception as e:
                print("Mongo error saving progress:", e)

        # Log activity & check achievements
        exp_name = memory_store["experiments"].get(experiment_id, {}).get("experiment", f"Lab {experiment_id}")
        if is_completed:
            log_user_activity(user_id, "⚗", f"Completed {exp_name} Simulation", f"Finished with score of {lab_score}% ({mistakes} mistakes).")
        else:
            log_user_activity(user_id, "📖", f"Studied {exp_name}", f"Completed {len(completed_sections)}/8 protocol sections.")

        evaluate_user_achievements(user_id)

        return jsonify({"message": "Progress saved successfully.", "data": record}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------------------------------
# USER-SPECIFIC QUIZ RESULTS ENDPOINTS
# ------------------------------------------------------------------
@app.route("/api/quiz-results", methods=["GET"])
@require_auth
def get_user_quiz_results(current_user):
    user_id = current_user["id"]
    experiment_id = request.args.get("experiment_id")

    results = []
    if mongo_connected and db is not None:
        try:
            q = {"user_id": user_id}
            if experiment_id:
                q["experiment_id"] = int(experiment_id)
            results = list(db["quiz_results"].find(q, {"_id": 0}).sort("created_at", -1))
        except Exception as e:
            print("Mongo error in get_quiz_results:", e)

    if not results:
        results = [r for r in memory_store["quiz_results"] if r.get("user_id") == user_id]
        if experiment_id:
            results = [r for r in results if r.get("experiment_id") == int(experiment_id)]

    return jsonify({"results": results})

@app.route("/api/quiz-results", methods=["POST"])
@require_auth
def save_user_quiz_result(current_user):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}
        experiment_id = data.get("experiment_id")
        score = data.get("score")
        total = data.get("total")

        if experiment_id is None or score is None or total is None:
            return jsonify({"error": "experiment_id, score, and total are required."}), 400

        experiment_id = int(experiment_id)
        score = int(score)
        total = int(total)
        percentage = round((score / total) * 100) if total > 0 else 0

        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "experiment_id": experiment_id,
            "score": score,
            "total": total,
            "percentage": percentage,
            "created_at": datetime.utcnow().isoformat()
        }

        memory_store["quiz_results"].insert(0, record)

        if mongo_connected and db is not None:
            try:
                db["quiz_results"].insert_one(record)
            except Exception as e:
                print("Mongo error in save_quiz_result:", e)

        exp_name = memory_store["experiments"].get(experiment_id, {}).get("experiment", f"Lab {experiment_id}")
        log_user_activity(user_id, "📝", f"Completed {exp_name} Quiz", f"Scored {score}/{total} ({percentage}%).")

        evaluate_user_achievements(user_id)

        clean_record = {k: v for k, v in record.items() if k != "_id"}
        return jsonify({"message": "Quiz result saved successfully.", "data": clean_record}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------------------------------
# USER-SPECIFIC NOTES ENDPOINTS
# ------------------------------------------------------------------
@app.route("/api/notes", methods=["GET"])
@require_auth
def get_user_notes(current_user):
    user_id = current_user["id"]
    experiment_id = request.args.get("experiment_id")

    notes_list = []
    if mongo_connected and db is not None:
        try:
            q = {"user_id": user_id}
            if experiment_id:
                q["experiment_id"] = int(experiment_id)
            notes_list = list(db["notes"].find(q, {"_id": 0}).sort("date", -1))
        except Exception as e:
            print("Mongo error in get_notes:", e)

    if not notes_list:
        notes_list = [n for n in memory_store["notes"] if n.get("user_id") == user_id]
        if experiment_id:
            notes_list = [n for n in notes_list if n.get("experiment_id") == int(experiment_id)]

    return jsonify(notes_list)

@app.route("/api/notes", methods=["POST"])
@require_auth
def create_user_note(current_user):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}
        experiment_id = int(data.get("experiment_id", 1))
        experiment_name = data.get("experiment_name", "Lab Observation")
        title = (data.get("title") or "Untitled Note").strip()
        content = (data.get("content") or "").strip()

        if not content:
            return jsonify({"error": "Note content is required."}), 400

        new_note = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "experiment_id": experiment_id,
            "experiment_name": experiment_name,
            "title": title,
            "content": content,
            "date": datetime.utcnow().strftime("%b %d, %Y")
        }

        memory_store["notes"].insert(0, new_note)

        if mongo_connected and db is not None:
            try:
                db["notes"].insert_one(new_note)
            except Exception as e:
                print("Mongo error in create_note:", e)

        log_user_activity(user_id, "✎", f"Logged Lab Note: {title}", f"Saved for {experiment_name}.")

        clean_note = {k: v for k, v in new_note.items() if k != "_id"}
        return jsonify({"message": "Note created successfully.", "note": clean_note}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/notes/<note_id>", methods=["PUT"])
@require_auth
def update_user_note(current_user, note_id):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}
        title = data.get("title")
        content = data.get("content")

        updated = False
        target_note = None

        for n in memory_store["notes"]:
            if n.get("id") == note_id and n.get("user_id") == user_id:
                if title: n["title"] = title.strip()
                if content: n["content"] = content.strip()
                target_note = n
                updated = True
                break

        if mongo_connected and db is not None:
            try:
                up_fields = {}
                if title: up_fields["title"] = title.strip()
                if content: up_fields["content"] = content.strip()
                db["notes"].update_one({"id": note_id, "user_id": user_id}, {"$set": up_fields})
                target_note = db["notes"].find_one({"id": note_id, "user_id": user_id}, {"_id": 0})
                updated = True
            except Exception as e:
                print("Mongo error in update_note:", e)

        if updated and target_note:
            return jsonify({"message": "Note updated successfully.", "note": target_note}), 200
        return jsonify({"error": "Note not found or unauthorized."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/notes/<note_id>", methods=["DELETE"])
@require_auth
def delete_user_note(current_user, note_id):
    try:
        user_id = current_user["id"]
        memory_store["notes"] = [n for n in memory_store["notes"] if not (n.get("id") == note_id and n.get("user_id") == user_id)]

        if mongo_connected and db is not None:
            try:
                db["notes"].delete_one({"id": note_id, "user_id": user_id})
            except Exception as e:
                print("Mongo error in delete_note:", e)

        return jsonify({"message": "Note deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------------------------------
# USER-SPECIFIC ACHIEVEMENTS & ACTIVITY
# ------------------------------------------------------------------
@app.route("/api/achievements", methods=["GET"])
@require_auth
def get_user_achievements(current_user):
    user_id = current_user["id"]
    evaluate_user_achievements(user_id)

    earned_keys = {k[1] for k in memory_store["achievements"].keys() if k[0] == user_id}
    if mongo_connected and db is not None:
        try:
            mongo_achs = list(db["achievements"].find({"user_id": user_id}, {"_id": 0}))
            earned_keys = {a["id"] for a in mongo_achs}
        except Exception:
            pass

    full_list = []
    for ach in STANDARD_ACHIEVEMENTS:
        unlocked = ach["id"] in earned_keys
        full_list.append({
            **ach,
            "unlocked": unlocked,
            "date": "Sep 2026" if unlocked else "Locked"
        })

    return jsonify({"achievements": full_list})

@app.route("/api/activity", methods=["GET"])
@require_auth
def get_user_activity(current_user):
    user_id = current_user["id"]
    activities = []

    if mongo_connected and db is not None:
        try:
            activities = list(db["activity"].find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(20))
        except Exception:
            pass

    if not activities:
        activities = [a for a in memory_store["activity"] if a.get("user_id") == user_id]

    # If empty, generate standard onboarding activity
    if not activities:
        activities = [
            {
                "id": "act-1",
                "icon": "👋",
                "title": "Welcome to LabSphere AI",
                "time": "Recent",
                "detail": "Ready to begin your virtual biotechnology journey across 5 interactive labs."
            }
        ]

    return jsonify({"activity": activities[:15]})

# ------------------------------------------------------------------
# LAB MENTOR AI (Contextual Guidance)
# ------------------------------------------------------------------
@app.route("/api/mentor", methods=["POST"])
def mentor_guidance():
    data = request.get_json() or {}
    experiment_id = data.get("experiment_id")
    question = (data.get("question") or "").strip().lower()

    if not experiment_id or not question:
        return jsonify({"answer": "Please provide an experiment ID and a question for the Lab Mentor."}), 400

    exp = memory_store["experiments"].get(int(experiment_id))
    if not exp and mongo_connected and db is not None:
        exp = db["experiments"].find_one({"id": int(experiment_id)}, {"_id": 0})

    if not exp:
        return jsonify({"answer": "Experiment not found."}), 404

    # 1. Match FAQs
    faqs = exp.get("ai_faqs", [])
    for faq in faqs:
        f_q = faq.get("question", "").lower()
        key_words = [w for w in f_q.split() if len(w) > 3]
        matches = [w for w in key_words if w in question]
        if len(matches) >= 2 or (len(key_words) == 1 and matches):
            return jsonify({
                "answer": faq.get("answer"),
                "source": "FAQ Grounding"
            })

    # 2. Reagent & Material lookups
    for mat in exp.get("materials", []):
        mat_lower = mat.lower()
        if any(w in question for w in mat_lower.split() if len(w) > 4):
            return jsonify({
                "answer": f"In {exp.get('experiment')}, '{mat}' is a critical laboratory component. Ensure proper pipetting volume and sterile handling.",
                "source": "Materials Protocol"
            })

    # 3. Procedural intent
    if "step" in question or "procedure" in question or "how to" in question:
        steps_preview = " → ".join(exp.get("procedure", [])[:3])
        return jsonify({
            "answer": f"For {exp.get('experiment')}, the general procedural sequence begins with: {steps_preview}. Check the interactive virtual lab bench to practice each step!",
            "source": "Procedure Engine"
        })

    # 4. Result lookup
    if "result" in question or "observe" in question or "outcome" in question:
        res = exp.get("result", "")
        res_str = res if isinstance(res, str) else json.dumps(res)
        return jsonify({
            "answer": f"Expected experimental result: {res_str}",
            "source": "Observations Engine"
        })

    # 5. Default contextual explanation
    return jsonify({
        "answer": f"I'm your AI Lab Mentor for {exp.get('experiment')}. This experiment focuses on {exp.get('aim')}. I can guide you through reaction kinetics, reagent roles, troubleshooting errors, or expected observations. What specific step would you like to explore?",
        "source": "Biotechnology Knowledge Base"
    })

# ------------------------------------------------------------------
# SERVER EXECUTION
# ------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"LabSphere AI Backend serving on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
