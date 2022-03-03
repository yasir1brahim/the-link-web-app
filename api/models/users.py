import re

from flask import jsonify
from flask_mail import Message
from werkzeug.security import check_password_hash, generate_password_hash

from app import mail
from auth.access import Access
from utils.database import Database

access = Access()
db = Database()


class Users:

    def login(self, request):
        try:
            msg = ''
            response_code = 200
            if request.is_json and 'email_address' in request.json and 'password' in request.json:
                email_address = request.json['email_address'].lower()
                password = request.json['password']
                try:
                    account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email_address,))[0]
                except IndexError:
                    return jsonify(message='User not regisetred'), 401

                print(account)
                role_id = account['role_id']
                user_id = account['id']

                if account and role_id in [0, 2]:
                    if check_password_hash(account['password'], password):
                        access_token = access.encode_access_token(email_address, user_id, role_id)
                        msg = 'Logged in successfully !'
                        return jsonify(message=msg, access_token=access_token)
                    else:
                        response_code = 401
                        msg = 'Incorrect Password !'
                else:
                    response_code = 401
                    msg = 'Incorrect username / password !'

        except Exception as exception:
            return jsonify(message='Login Failed', error=str(exception)), 500

        return jsonify(message=msg), response_code

    def logout(self, request):
        try:
            token = request.headers.get("Authorization")
            if not token:
                return jsonify(message='Token is missing!'), 401

            payload, valid_token = access.decode_access_token(token)

            if valid_token == 200:
                msg, status = access.delete_token(payload['access_token'])
                return jsonify(message=msg), status
            else:
                return jsonify(message=payload), valid_token
        except Exception as exception:
            return jsonify(message='Logout Failed', error=str(exception)), 500

    def register(self, request):
        try:
            msg = ''
            response_code = 200
            if request.method == 'POST' and 'username' in request.json and 'password' in request.json \
                    and 'email_address' in request.json and 'full_name' in request.json:
                username = request.json['username'].lower()
                password = generate_password_hash(
                    method='pbkdf2:sha512:150000', password=request.json['password']
                )
                email_address = request.json['email_address'].lower()
                fullname = request.json['full_name']
                role_id = 6

                account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email_address,))

                if account:
                    msg = 'Account already exists !'
                    response_code = 409
                elif not re.match(r'[^@]+@[^@]+\.[^@]+', email_address):
                    response_code = 500
                    msg = 'Invalid email address !'
                elif not re.match(r'[A-Za-z0-9]+', username):
                    response_code = 400
                    msg = 'name must contain only characters and numbers !'
                else:

                    if '@link' in email_address:
                        role_id = 0
                    elif 'role_id' not in request.json:
                        pass
                    else:
                        role_id = request.json['role_id']

                    if 'contact_number' not in request.json:
                        contact_number = 'NULL'
                    else:
                        contact_number = request.json['contact_number']

                    db.execute_sql('INSERT INTO users VALUES (NULL, % s, % s, % s, % s, % s, % s)',
                                   (fullname, username, email_address, password, role_id, contact_number))

                    return self.get_user_id(email_address)

            elif request.method == 'POST':
                response_code = 400
                msg = 'Please fill out the form !'
            return jsonify(message=msg), response_code

        except Exception as exception:
            return jsonify(message='Register Failed', error=str(exception)), 500

    def execute_update(self, request, payload):
        try:
            resp_code = 500
            username = request.json['username'].lower()
            password = generate_password_hash(
                method='pbkdf2:sha512:150000', password=request.json['password']
            )
            email_address = request.json['email_address'].lower()
            full_name = request.json['full_name']
            account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email_address,))[0]

            if account:
                role_id = account['role_id']
                user_id = account['id']
                db.execute_sql(
                    'UPDATE users SET  username =% s, password =% s, email_address =% s, full_name =% s, '
                    'role_id =% s WHERE id =% s',
                    (username, password, email_address, full_name, role_id, (user_id,),))

                msg = 'You have successfully updated deatils!'
                resp_code = 200

            else:
                msg = 'Record does not exist !'
                resp_code = 500

            return jsonify(message=msg), resp_code
        except Exception as exception:
            return jsonify(message='Update Failed', error=str(exception)), 500

    def get_user_id(self, email_address):
        try:
            user_id = ''
            try:
                account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email_address,))
                user_id = account[0]['id']
                msg = 'User Registered'
                response_code = 200
            except:
                msg = 'User not created'
                response_code = 500
            return jsonify(message=msg, user_id=user_id), response_code
        except Exception as exception:
            return jsonify(message='Error getting user id', error=str(exception)), 500

    def update(self, request):
        try:
            token = request.headers.get("Authorization")
            if not token:
                return jsonify(message='Token is missing!'), 401

            payload, valid_token = access.decode_access_token(token)

            print(request.json)
            print(payload)

            if 'username' in request.json and 'password' in request.json and 'email_address' in request.json \
                    and 'full_name' in request.json and valid_token == 200:
                if payload['role_id'] == 0:
                    return self.execute_update(request, payload)
                elif request.json['email_address'] == payload['identity']:
                    return self.execute_update(request, payload)
                else:
                    return jsonify(message='Unauthorised'), 401
            else:
                return jsonify(message='Details missing'), 400
        except Exception as exception:
            return jsonify(message='Error while updating user', error=str(exception)), 500

    def reset_password(self, email):
        try:
            email = email.lower()
            account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email,))[0]
            if account:
                msg = Message("You can reset password here <redirect to reset_page>", sender="admin@link.com",
                              recipients=[email])
                msg.body = "Reset password details"
                mail.send(msg)
                return jsonify(message="Password sent to " + email)
            else:
                return jsonify(message=email + " is not registered user"), 401
        except Exception as exception:
            return jsonify(message='Password Reset Failed', error=str(exception)), 500
