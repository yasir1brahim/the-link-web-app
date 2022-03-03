from flask import jsonify

from auth.access import Access
from utils.database import Database
from .users import Users

access = Access()
db = Database()
users = Users()


class Projects:

    def check_access(self, request):
        token = request.headers.get("Authorization")
        if not token:
            return False

        self.payload, valid_token = access.decode_access_token(token)

        if valid_token == 200 and self.payload['role_id'] == 0:
            return True
        else:
            return False

    def get_projects(self, request, customer_id):
        if self.check_access(request):
            projects = db.get_data('SELECT * FROM projects WHERE customer_id = % s', (customer_id,))
            return jsonify(message=projects)
        else:
            return jsonify(message='Not authorized'), 401

    def create_project(self, request):
        if self.check_access(request):
            columns = ['customer_id', 'project_name', 'lead_contact', 'start_date', 'end_date']

            for col in columns:
                if col not in request.json:
                    return jsonify(message=col + ' missing'), 400

            project_name = request.json['project_name']
            lead_contact = request.json['lead_contact']
            start_date = request.json['start_date']
            end_date = request.json['end_date']
            customer_id = request.json['customer_id']

            resp = db.get_data('SELECT * from status where status = % s', (request.json['status'],))

            if resp:
                status_id = resp[0]['id']
                db.execute_sql('INSERT INTO projects VALUES (NULL, % s, % s, % s, % s, % s, % s)',
                               (project_name, status_id, lead_contact, start_date, end_date, customer_id))
                msg = 'Project added !'
                resp_code = 200
            else:
                msg = 'Invalid Status'
                resp_code = 500
            return jsonify(message=msg), resp_code
        else:
            return jsonify(message='Not authorized'), 401

    def update_project(self, request):
        if self.check_access(request):
            columns = ['project_name', 'lead_contact', 'start_date', 'end_date']

            for col in columns:
                if col not in request.json:
                    return jsonify(message=col + ' missing'), 400

            project_name = request.json['project_name']
            lead_contact = request.json['lead_contact']
            start_date = request.json['start_date']
            end_date = request.json['end_date']
            project_id = request.json['id']

            db.execute_sql(
                'UPDATE projects SET  project_name =% s, status = NULL, lead_contact =% s, '
                'start_date =% s, end_date =% s WHERE id =% s',
                (project_name, lead_contact, start_date, end_date, (project_id,),))
            msg = 'You have successfully updated details!'
            return jsonify(message=msg)
        else:
            return jsonify(message='Not authorized'), 401

    def delete_project(self, request):
        if self.check_access(request):
            db.execute_sql('DELETE FROM projects WHERE id = % s', ((request.json['id'],),))
            return jsonify(message='Customer deleted')
        else:
            return jsonify(message='Not authorized'), 401
