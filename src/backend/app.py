from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from flask_cors import CORS
from functools import wraps
import base64
import asyncio
import random
import threading

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

MINIMUM_APP_VERSION = "1.2.0"


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
    app.config["SECRET_KEY"] = "secret123"
    app.config["JWT_SECRET_KEY"] = "secret1234"

    CORS(
        app,
        resources={r"*": {"origins": ["*"]}},
        allow_headers=["Authorization", "Content-Type", "app-version"],
        methods=["GET", "POST", "OPTIONS"],
        max_age=86400,
    )

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()

    def check_app_version(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            app_version = request.headers.get("app-version")
            if (
                not app_version
                or compare_versions(app_version, MINIMUM_APP_VERSION) < 0
            ):
                return (
                    jsonify({"message": "Please update your client application."}),
                    426,
                )
            return f(*args, **kwargs)

        return decorated_function

    def compare_versions(version1, version2):
        v1 = list(map(int, version1.split(".")))
        v2 = list(map(int, version2.split(".")))
        return (v1 > v2) - (v1 < v2)  # Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal

    @app.route("/")
    def index():
        return jsonify({"status": 200})

    @app.route("/register", methods=["POST"])
    @check_app_version
    def register():
        data = request.get_json()
        user = User.query.filter_by(username=data["username"]).first()
        if user:
            return jsonify({"message": "Username already exists"}), 400
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode(
            "utf-8"
        )
        new_user = User(username=data["username"], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity={"username": new_user.username})
        return (
            jsonify({"message": "User registered successfully", "token": access_token}),
            201,
        )

    @app.route("/login", methods=["POST"])
    @check_app_version
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data["username"]).first()
        if user and bcrypt.check_password_hash(user.password, data["password"]):
            access_token = create_access_token(identity={"username": user.username})
            return jsonify({"token": access_token}), 200
        return jsonify({"message": "Invalid credentials"}), 401

    @app.route("/user", methods=["GET"])
    @jwt_required()
    @check_app_version
    def user():
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user["username"]).first()
        if user:
            decrypted_motto = (
                base64.b64decode(user.motto).decode() if user.motto else None
            )
            user_data = {
                "id": user.id,
                "username": user.username,
                "motto": decrypted_motto,
            }
            return jsonify(user_data), 200
        return jsonify({"message": "User not found"}), 404

    @app.route("/upload", methods=["POST"])
    @jwt_required()
    def upload():
        if "audio" not in request.files:
            return jsonify({"message": "No audio file provided"}), 400
        audio_file = request.files["audio"]

        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user["username"]).first()
        if user:
            result = process_transcription(audio_file)
            encrypted_motto = base64.b64encode(result.encode()).decode()
            user.motto = encrypted_motto
            db.session.commit()
            return (
                jsonify(
                    {
                        "message": "Audio uploaded and processed successfully",
                        "motto": result,
                    }
                ),
                200,
            )
        return jsonify({"message": "User not found"}), 404

    def process_transcription(audio_file):
        # Simulate a delay for the transcription service
        delay = random.randint(5, 15)
        asyncio.run(asyncio.sleep(delay))
        transcription = mock_transcription_service(audio_file)
        return transcription

    def mock_transcription_service(audio_file):
        # For simplicity, let's assume the audio is always successfully transcribed to "Hello, this is a mock transcription."
        return "Hello, this is a mock transcription."

    return app


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    motto = db.Column(db.String(500), nullable=True)  # Adding a motto field


if __name__ == "__main__":
    app = create_app()
    app.run(port=3002, debug=True)
