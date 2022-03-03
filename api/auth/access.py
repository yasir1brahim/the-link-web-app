from datetime import datetime, timezone, timedelta
from flask import current_app

import jwt
from utils.database import Database

db = Database()


class Access:

    @staticmethod
    def encode_access_token(email_address, user_id, role_id):
        # now = datetime.now(timezone.utc)
        now = datetime.now()
        token_age_h = current_app.config.get("TOKEN_EXPIRE_HOURS")
        token_age_m = current_app.config.get("TOKEN_EXPIRE_MINUTES")
        expires = now + timedelta(hours=token_age_h, minutes=token_age_m)
        payload = dict(exp=expires, iat=now, identity=email_address, user_id=user_id, role_id=role_id)
        key = current_app.config.get("SECRET_KEY")
        token = jwt.encode(payload, key, algorithm="HS256")
        db.execute_sql('INSERT INTO auth VALUES (% s, % s)',
                       (token, expires))
        return token

    @staticmethod
    def decode_access_token(access_token):
        if isinstance(access_token, bytes):
            access_token = access_token.decode("ascii")

        if access_token.startswith("Bearer "):
            split = access_token.split("Bearer")
            access_token = split[1].strip()

        try:
            key = current_app.config.get("SECRET_KEY")
            payload = jwt.decode(access_token, key, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            error = "Access token expired. Please log in again."
            return error, 401
        except jwt.InvalidTokenError:
            error = "Invalid token. Please log in again."
            return error, 400

        token_auth = db.get_data('SELECT * FROM auth WHERE token = % s', (access_token,))

        if token_auth and len(token_auth) == 1:
            user_dict = dict(
                exp=payload["exp"],
                iat=payload["iat"],
                identity=payload['identity'],
                user_id=payload["user_id"],
                role_id=payload["role_id"],
                access_token=access_token
            )
            return user_dict, 200
        elif len(token_auth) > 1:
            error = "Invalid token. Please log in again."
            return error, 400
        else:
            error = "Invalid token. Please log in again."
            return error, 400

    @staticmethod
    def check_validity(token):
        token_auth = db.get_data('SELECT * FROM auth WHERE token = % s', (token,))
        if token_auth and len(token_auth) == 1:
            return True
        elif len(token_auth) > 1:
            return False
        else:
            return False

    @staticmethod
    def delete_token(token):
        try:
            token_auth = db.execute_sql('DELETE FROM auth WHERE token = % s', (token,))
            if token_auth is None:
                return 'redirect to /login', 302
            else:
                return 'Token not found', 401

        except Exception:
            print(Exception)
            return False

    def check_admin_access(self, request):
        token = request.headers.get("Authorization")

        if not token:
            return False

        self.payload, valid_token = self.decode_access_token(token)

        if valid_token == 200 and self.payload['role_id'] == 0:
            return True
        else:
            return False

    def check_admin_custom_access(self, request):
        token = request.headers.get("Authorization")
        if not token:
            return False

        self.payload, valid_token = self.decode_access_token(token)

        if valid_token == 200 and self.payload['role_id'] in [0, 2]:
            return True
        else:
            return False
