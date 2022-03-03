from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from auth.access import Access
from utils.database import Database
from .users import Users

access = Access()
db = Database()
users = Users()


class Customers:

    def get_customers(self, request, user_id):
        try:
            if access.check_admin_custom_access(request):
                customers = db.get_data('SELECT * FROM customers WHERE user_id = % s', (user_id,))
                return jsonify(message=customers)
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Get Customers data Failed', error=str(exception)), 500

    def create_customer(self, request):
        try:
            if access.check_admin_access(request):
                columns = ['customer_name', 'account_owner', 'email_address', \
                           'contact_number', 'password', 'address']

                print(columns)
                for col in columns:
                    if col not in request.json:
                        return jsonify(message=col + ' missing'), 400

                request.json['full_name'] = request.json['customer_name']
                request.json['username'] = request.json['customer_name'].replace(' ', '').lower()
                request.json['contact_number'] = request.json['contact_number']
                request.json['role_id'] = 2

                resp, resp_code = users.register(request)

                if resp_code == 200:
                    user_id = resp.json['user_id']
                    account_owner = request.json['account_owner']
                    address = request.json['address']

                    db.execute_sql('INSERT INTO customers VALUES (NULL, % s, % s, % s, % s)',
                                   (user_id, 'Active', account_owner, address))

                    msg = 'Customer successfully registered and added !'
                    return jsonify(message=msg), 200
                else:
                    return resp, resp_code
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Create Customer Failed', error=str(exception)), 500

    def update_customer(self, request):
        try:
            if access.check_admin_custom_access(request):
                columns = ['customer_name', 'status', 'account_owner',
                           'email_address', 'contact_number', 'password', 'address']

                for col in columns:
                    if col not in request.json:
                        return jsonify(message=col + ' missing'), 400

                request.json['full_name'] = request.json['customer_name']
                request.json['username'] = request.json['customer_name'].replace(" ", '').lower()
                request.json['contact_number'] = request.json['contact_number']
                request.json['role_id'] = 2

                resp, resp_code = self.update_customer_basics(request)
                print(resp.json)

                if resp_code == 200:
                    status = request.json['status']
                    address = request.json['address']
                    user_id = resp.json['user_id']

                    db.execute_sql(
                        'UPDATE customers SET  status =% s, address =% s WHERE user_id =% s',
                        (status, address, (user_id,),))
                    msg = 'Customer details successfully updated !'
                    return jsonify(message=msg)
                else:
                    return resp, resp_code
            else:
                return jsonify(message='Not authorized'), 401
        except Exception as exception:
            return jsonify(message='Customer update Failed', error=str(exception)), 500

    def delete_customer(self, request):
        if access.check_admin_access(request):
            db.execute_sql('DELETE FROM customers WHERE id = % s', ((request.json['customer_id'],),))
            # delete relevant projects, users
            return jsonify(message='Customer deleted')
        else:
            return jsonify(message='Not authorized'), 401

    def update_customer_basics(self, request):
        try:
            token = request.headers.get("Authorization")
            user_id = ''
            if not token:
                return jsonify(message='Token is missing!'), 401

            payload, valid_token = access.decode_access_token(token)
            print(payload)

            if 'password' in request.json and 'email_address' in request.json and \
                    'full_name' in request.json and 'contact_number' in request.json and valid_token == 200:

                if payload['role_id'] in [0, 2] or request.json['email_address'] == payload['identity']:
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
            return jsonify(message='Error while udpating customer', error=str(exception)), 500
