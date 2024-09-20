import re

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_username(username):
    return len(username) >= 3 and len(username) <= 20 and username.isalnum()

def validate_message_content(content):
    return len(content) > 0 and len(content) <= 500  # Adjust max length as needed
