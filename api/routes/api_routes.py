from flask import Blueprint, request

api_routes = Blueprint('api_routes', __name__)

from models.users import Users
from models.customers import Customers
from models.projects import Projects
from models.employees import Employees

users = Users()
customers = Customers()
projects = Projects()
employees = Employees()


@api_routes.route('/')
@api_routes.route('/login', methods=['POST'])
def login_user():
    return users.login(request)


@api_routes.route('/logout')
def logout_user():
    return users.logout(request)


@api_routes.route('/register', methods=['POST'])
def register_user():
    return users.register(request)


@api_routes.route("/update", methods=['PUT'])
def update_user():
    return users.update(request)


@api_routes.route('/reset_password/<string:email>', methods=['GET'])
def reset_password_user(email: str):
    return users.reset_password(email)


@api_routes.route('/createCustomer', methods=["POST"])
def create_customer():
    return customers.create_customer(request)


@api_routes.route('/customers/<int:user_id>', methods=["GET"])
def get_customers(user_id: int):
    return customers.get_customers(request, user_id)


@api_routes.route('/updateCustomer', methods=["PUT"])
def update_customer():
    return customers.update_customer(request)


# @api_routes.route('/deleteCustomer', methods=["DELETE"])
# def delete_customer():
#     return customers.delete_customer(request)


@api_routes.route('/createProject', methods=["POST"])
def create_project():
    return projects.create_project(request)


@api_routes.route('/projects/<int:customer_id>', methods=["GET"])
def get_projects(customer_id: int):
    return projects.get_projects(request, customer_id)


@api_routes.route('/updateProject', methods=["PUT"])
def update_project():
    return projects.update_project(request)


# @api_routes.route('/deleteProject', methods=["DELETE"])
# def delete_project():
#     return projects.delete_project(request)

@api_routes.route('/createEmployee', methods=["POST"])
def create_employee():
    return employees.create_employee(request)


@api_routes.route('/employees/<int:project_id>', methods=["GET"])
def get_employees(project_id: int):
    return employees.get_employees(request, project_id)


@api_routes.route('/updateEmployee', methods=["PUT"])
def update_employee():
    return employees.update_employee(request)


@api_routes.route('/deleteEmployee', methods=["DELETE"])
def delete_employee():
    return employees.delete_employee(request)
