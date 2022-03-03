**Python Installation**
- Install python

**Install Virtual Env package for local**

- Linux/Mac: `python3 -m pip install --user virtualenv`
- Windows: `py -m pip install --user virtualenv`

**Create Virtual Env**:

- Linux/Mac: `python3 -m venv env`
- Windows: `py -m venv env`

**Activate Virtual Env**

- Linux/Mac: `source env/bin/activate`
- Windows: `.\env\Scripts\activate`

**Install all packages**

Upgrade pip: `python3 -m pip install --user --upgrade pip`

`pip install -r requirements.txt`

**Leaving the virtual environment**

`deactivate`

**Create secrete key**

`pipenv run python -c 'import os; print(os.urandom(64))' > secret_key.txt`