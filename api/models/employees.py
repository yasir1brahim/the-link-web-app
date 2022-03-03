import re

from flask import jsonify
from werkzeug.security import generate_password_hash

from auth.access import Access
from utils.database import Database
from .users import Users

access = Access()
db = Database()
users = Users()


class Employees:

    def get_employees(self, request, customer_id):
        try:
            if access.check_admin_custom_access(request):
                employees = db.get_data('SELECT * FROM employees_view WHERE customer_id = % s', (customer_id,))
                for employee in employees:
                    employee['projects'] = employee['projects'].replace(', ', '')
                return jsonify(message=employees), 200
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Get Employees data failed', error=str(exception)), 500

    def create_employee(self, request):
        try:
            msg = ''
            if access.check_admin_custom_access(request):
                columns = ['full_name', 'email_address', 'contact_number', 'projects']

                for col in columns:
                    if col not in request.json:
                        return jsonify(message=col + ' missing'), 400

                request.json['password'] = 'Test@123'
                request.json['username'] = request.json['full_name'].replace(' ', '').lower()
                request.json['role_id'] = 6

                resp, resp_code = users.register(request)

                if resp_code == 200:
                    msg = 'Employee Created !'
                    user_id = resp.json['user_id']
                    projects = request.json['projects']
                    for project in projects:
                        db.execute_sql('INSERT INTO employee_project_map VALUES (% s, % s)',
                                       (user_id, project))

                    msg = 'Employee Created and linked to the project'

                return jsonify(message=msg), 200
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Employee Create Failed', error=str(exception)), 500

    def update_employee(self, request):
        try:
            msg = ''
            if access.check_admin_custom_access(request):
                columns = ['full_name', 'email_address', 'contact_number', 'projects']

                for col in columns:
                    if col not in request.json:
                        return jsonify(message=col + ' missing'), 400

                request.json['password'] = 'Test@123'
                request.json['username'] = request.json['full_name'].replace(' ', '').lower()
                request.json['role_id'] = 6

                resp, resp_code = self.update_employee_basics(request)

                if resp_code == 200:
                    msg = 'Employee Basic Details Updated !'
                    user_id = resp.json['user_id']
                    projects = request.json['projects']

                    proj_resp = db.get_data('SELECT * FROM employee_project_map WHERE user_id = % s', (user_id,))
                    existing_projects = []
                    for proj in proj_resp:
                        existing_projects.append(proj['project_id'])

                    new_projects = list(set(projects) - set(list(existing_projects)))

                    for project in new_projects:
                        db.execute_sql('INSERT INTO employee_project_map VALUES (% s, % s)',
                                       (user_id, project))

                    deleted_projects = list(set(existing_projects) - set(list(projects)))

                    for project in deleted_projects:
                        db.execute_sql('DELETE FROM employee_project_map WHERE user_id = % s and project_id = % s',
                                       (user_id, project,))

                    msg = 'Employee details updated'
                    return jsonify(message=msg), 200
                else:
                    return jsonify(message='Basic Update Failed'), 500
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Employee Update Failed', error=str(exception)), 500

    def delete_employee(self, request):
        try:
            if access.check_admin_custom_access(request):
                user_id = request.json['employee_id']

                users_resp = db.get_data('SELECT * FROM users WHERE id = % s', (user_id,))

                if users_resp and users_resp[0]['role_id'] == 6:
                    db.execute_sql('DELETE FROM employee_project_map WHERE user_id = % s ', (user_id,))

                    db.execute_sql('DELETE FROM users WHERE id = % s ', (user_id,))

                    return jsonify(message='Employee deleted and removed from related projects'), 200
                else:
                    return jsonify(message='Incorrect user deletion, check role'), 500
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Employee Delete Failed', error=str(exception)), 500

    def update_employee_basics(self, request):
        try:
            token = request.headers.get("Authorization")
            user_id = ''
            if not token:
                return jsonify(message='Token is missing!'), 401

            payload, valid_token = access.decode_access_token(token)
            print(payload)

            if 'password' in request.json and 'email_address' in request.json and \
                    'full_name' in request.json and 'contact_number' in request.json and valid_token == 200:

                if payload['role_id'] in [0, 2]:
                    password = generate_password_hash(
                        method='pbkdf2:sha512:150000', password=request.json['password']
                    )

                    email_address = request.json['email_address'].lower()
                    full_name = request.json['full_name']
                    contact_number = request.json['contact_number']

                    account = db.get_data('SELECT * FROM users WHERE email_address = % s', (email_address,))[0]

                    if account:
                        user_id = account['id']
                        db.execute_sql(
                            'UPDATE users SET password =% s, email_address =% s, full_name =% s, contact_number =% s WHERE id =% s',
                            (password, email_address, full_name, contact_number, (user_id,),))

                        msg = 'You have successfully updated deatils!'
                        resp_code = 200

                    else:
                        msg = 'Something went wrong !'
                        resp_code = 500
                else:
                    msg = 'Unauthorised'
                    resp_code = 401

                return jsonify(message=msg, user_id=user_id), resp_code

            else:
                return jsonify(message='Fields missing', user_id=user_id), 400
        except Exception as exception:
            return jsonify(message='Error while udpating employee basics', error=str(exception)), 500
