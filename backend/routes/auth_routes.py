
import os
import re
import jwt
import secrets
import hashlib
import smtplib
import logging
import time
import sqlite3

from pathlib import Path
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from urllib.parse import urlencode

from dotenv import load_dotenv
from pwdlib import PasswordHash

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from database.db import get_connection


# ==========================================
# ENVIRONMENT CONFIGURATION
# ==========================================

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

router = APIRouter(prefix="/auth", tags=["Authentication"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ==========================================
# SECURITY CONFIGURATION
# ==========================================

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is missing. Add it to your backend/.env file."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
RESET_TOKEN_EXPIRE_MINUTES = 15

password_hash = PasswordHash.recommended()
security = HTTPBearer()


# ==========================================
# EMAIL CONFIGURATION
# ==========================================

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


# ==========================================
# PROFILE PICTURE CONFIGURATION
# ==========================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

PROFILE_UPLOAD_DIR = BACKEND_DIR / "uploads" / "profiles"

PROFILE_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png"
}

MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024


# ==========================================
# REQUEST MODELS
# ==========================================

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str):
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_user_by_email(email: str):

    with get_connection() as connection:

        return connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()


def hash_reset_token(token: str):

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def send_reset_email(email: str, token: str):

    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP email configuration is missing."
        )

    reset_url = (
        f"{FRONTEND_URL}/reset-password?"
        f"{urlencode({'token': token})}"
    )

    message = EmailMessage()

    message["Subject"] = (
        "Reset Your AI Resume Analyzer Password"
    )

    message["From"] = SMTP_EMAIL
    message["To"] = email

    message.set_content(
        f"""
Hello,

We received a request to reset your AI Resume Analyzer password.

Click the link below to create a new password:

{reset_url}

This link expires in 15 minutes and can only be used once.

If you did not request this password reset, you can ignore this email.

Regards,
AI Resume Analyzer Team
"""
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT,
        timeout=20
    ) as server:

        server.starttls()

        server.login(
            SMTP_EMAIL,
            SMTP_PASSWORD.replace(" ", "")
        )

        server.send_message(message)


def delete_old_profile_picture(old_picture: str):
    """Safely delete an old profile picture."""

    if not old_picture:
        return

    try:
        old_filename = Path(old_picture).name
        old_path = PROFILE_UPLOAD_DIR / old_filename

        if old_path.exists() and old_path.is_file():
            old_path.unlink()

    except OSError:
        logger.exception("Could not delete old profile picture")


# ==========================================
# REGISTER
# ==========================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(data: RegisterRequest):

    name = data.name.strip()
    email = data.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(
            400,
            "Please enter a valid name."
        )

    if not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        email
    ):
        raise HTTPException(
            400,
            "Invalid email address."
        )

    if get_user_by_email(email):
        raise HTTPException(
            409,
            "Email already registered."
        )

    hashed_password = hash_password(data.password)

    try:

        with get_connection() as connection:

            cursor = connection.execute(
                """
                INSERT INTO users (name, email, password_hash)
                VALUES (?, ?, ?)
                """,
                (name, email, hashed_password)
            )

            user_id = cursor.lastrowid

    except sqlite3.IntegrityError:

        raise HTTPException(
            409,
            "Email already registered."
        )

    except Exception:

        logger.exception("Registration failed")

        raise HTTPException(
            500,
            "Registration failed."
        )

    token = create_access_token(user_id)

    return {
        "message": "Registration successful!",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "profile_picture": None
        }
    }


# ==========================================
# LOGIN WITH PERFORMANCE MEASUREMENT
# ==========================================

@router.post("/login")
def login(data: LoginRequest):

    total_start = time.perf_counter()

    email = data.email.strip().lower()

    db_start = time.perf_counter()

    user = get_user_by_email(email)

    db_time = time.perf_counter() - db_start

    verify_start = time.perf_counter()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    password_valid = verify_password(
        data.password,
        user["password_hash"]
    )

    verify_time = time.perf_counter() - verify_start

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token_start = time.perf_counter()

    token = create_access_token(user["id"])

    token_time = time.perf_counter() - token_start

    total_time = time.perf_counter() - total_start

    logger.info(
        "LOGIN PERFORMANCE | DB: %.3fs | Password: %.3fs | "
        "Token: %.3fs | Total: %.3fs",
        db_time,
        verify_time,
        token_time,
        total_time
    )

    return {
        "message": "Login successful!",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "profile_picture": user["profile_picture"]
        }
    }


# ==========================================
# GET CURRENT USER
# ==========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        user_id = int(user_id)

    except (jwt.InvalidTokenError, ValueError, TypeError):

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    with get_connection() as connection:

        user = connection.execute(
            """
            SELECT id, name, email, profile_picture
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()

    if not user:

        raise HTTPException(
            401,
            "User not found."
        )

    return dict(user)


# ==========================================
# CURRENT USER API
# ==========================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "user": current_user
    }


# ==========================================
# UPDATE USER PROFILE
# ==========================================

@router.put("/profile")
def update_profile(
    data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):

    name = data.name.strip()
    email = data.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid name."
        )

    if not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        email
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid email address."
        )

    with get_connection() as connection:

        existing_user = connection.execute(
            """
            SELECT id
            FROM users
            WHERE email = ? AND id != ?
            """,
            (email, current_user["id"])
        ).fetchone()

        if existing_user:

            raise HTTPException(
                status_code=409,
                detail="This email address is already registered."
            )

        connection.execute(
            """
            UPDATE users
            SET name = ?, email = ?
            WHERE id = ?
            """,
            (
                name,
                email,
                current_user["id"]
            )
        )

    return {
        "message": "Profile updated successfully.",
        "user": {
            **current_user,
            "name": name,
            "email": email
        }
    }


# ==========================================
# UPLOAD PROFILE PICTURE
# ==========================================

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):

    try:

        if file.content_type not in ALLOWED_IMAGE_TYPES:

            raise HTTPException(
                status_code=400,
                detail="Only JPG, JPEG and PNG images are allowed."
            )

        image_data = await file.read(
            MAX_PROFILE_IMAGE_SIZE + 1
        )

        if not image_data:

            raise HTTPException(
                status_code=400,
                detail="Please select an image."
            )

        if len(image_data) > MAX_PROFILE_IMAGE_SIZE:

            raise HTTPException(
                status_code=400,
                detail="Image size must not exceed 5 MB."
            )

        is_jpeg = image_data.startswith(b"\xff\xd8\xff")
        is_png = image_data.startswith(b"\x89PNG\r\n\x1a\n")

        extension = ALLOWED_IMAGE_TYPES[file.content_type]

        if not (
            (extension == ".jpg" and is_jpeg)
            or (extension == ".png" and is_png)
        ):

            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid JPG or PNG image."
            )

        user_id = current_user["id"]

        filename = (
            f"user_{user_id}_{secrets.token_hex(8)}{extension}"
        )

        file_path = PROFILE_UPLOAD_DIR / filename

        old_picture = current_user.get("profile_picture")

        relative_path = f"/uploads/profiles/{filename}"

        with open(file_path, "wb") as image_file:
            image_file.write(image_data)

        try:

            with get_connection() as connection:

                connection.execute(
                    """
                    UPDATE users
                    SET profile_picture = ?
                    WHERE id = ?
                    """,
                    (relative_path, user_id)
                )

        except Exception:

            if file_path.exists():
                file_path.unlink()

            raise

        delete_old_profile_picture(old_picture)

        return {
            "message": "Profile picture uploaded successfully.",
            "profile_picture": relative_path
        }

    except HTTPException:
        raise

    except Exception:

        logger.exception("Profile picture upload failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to upload profile picture."
        )

    finally:
        await file.close()


# ==========================================
# DELETE PROFILE PICTURE
# ==========================================

@router.delete("/profile-picture")
def delete_profile_picture(
    current_user: dict = Depends(get_current_user)
):

    old_picture = current_user.get("profile_picture")

    if not old_picture:

        raise HTTPException(
            status_code=404,
            detail="No profile picture found."
        )

    with get_connection() as connection:

        connection.execute(
            """
            UPDATE users
            SET profile_picture = NULL
            WHERE id = ?
            """,
            (current_user["id"],)
        )

    delete_old_profile_picture(old_picture)

    return {
        "message": "Profile picture deleted successfully."
    }


# ==========================================
# CHANGE PASSWORD
# ==========================================

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):

    with get_connection() as connection:

        user = connection.execute(
            """
            SELECT password_hash
            FROM users
            WHERE id = ?
            """,
            (current_user["id"],)
        ).fetchone()

        if not user or not verify_password(
            data.current_password,
            user["password_hash"]
        ):

            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect."
            )

        if data.current_password == data.new_password:

            raise HTTPException(
                status_code=400,
                detail=(
                    "New password must be different "
                    "from current password."
                )
            )

        new_hashed_password = hash_password(
            data.new_password
        )

        connection.execute(
            """
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            """,
            (
                new_hashed_password,
                current_user["id"]
            )
        )

        connection.execute(
            """
            UPDATE password_reset_tokens
            SET used_at = ?
            WHERE user_id = ? AND used_at IS NULL
            """,
            (
                datetime.now(timezone.utc).isoformat(),
                current_user["id"]
            )
        )

    return {
        "message": (
            "Password changed successfully. "
            "Please log in again."
        )
    }


# ==========================================
# FORGOT PASSWORD
# ==========================================

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):

    email = data.email.strip().lower()

    generic_message = (
        "If an account exists with this email, "
        "a password reset link will be sent."
    )

    if not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        email
    ):

        return {
            "message": generic_message
        }

    user = get_user_by_email(email)

    if not user:

        return {
            "message": generic_message
        }

    reset_token = secrets.token_urlsafe(32)

    token_hash = hash_reset_token(reset_token)

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    ).isoformat()

    try:

        with get_connection() as connection:

            connection.execute(
                """
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE user_id = ? AND used_at IS NULL
                """,
                (
                    datetime.now(timezone.utc).isoformat(),
                    user["id"]
                )
            )

            connection.execute(
                """
                INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
                VALUES (?, ?, ?)
                """,
                (
                    user["id"],
                    token_hash,
                    expires_at
                )
            )

        send_reset_email(
            email,
            reset_token
        )

    except Exception:

        logger.exception(
            "Password reset email could not be sent"
        )

        with get_connection() as connection:

            connection.execute(
                """
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE token_hash = ?
                """,
                (
                    datetime.now(timezone.utc).isoformat(),
                    token_hash
                )
            )

    return {
        "message": generic_message
    }


# ==========================================
# RESET PASSWORD
# ==========================================

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):

    token_hash = hash_reset_token(data.token)

    now = datetime.now(timezone.utc)

    with get_connection() as connection:

        reset_record = connection.execute(
            """
            SELECT id, user_id, expires_at, used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
            """,
            (token_hash,)
        ).fetchone()

        if not reset_record:

            raise HTTPException(
                400,
                "Invalid or expired password reset link."
            )

        if reset_record["used_at"] is not None:

            raise HTTPException(
                400,
                "This password reset link has already been used."
            )

        expiry = datetime.fromisoformat(
            reset_record["expires_at"]
        )

        if expiry <= now:

            raise HTTPException(
                400,
                "Password reset link has expired. Request a new one."
            )

        new_hashed_password = hash_password(
            data.new_password
        )

        connection.execute(
            """
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            """,
            (
                new_hashed_password,
                reset_record["user_id"]
            )
        )

        connection.execute(
            """
            UPDATE password_reset_tokens
            SET used_at = ?
            WHERE user_id = ? AND used_at IS NULL
            """,
            (
                now.isoformat(),
                reset_record["user_id"]
            )
        )

    return {
        "message": (
            "Password reset successful. Please log in."
        )
    }
