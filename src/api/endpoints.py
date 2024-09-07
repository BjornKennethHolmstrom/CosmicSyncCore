from flask import Flask, jsonify, request
from src.core.database import Session, User, add_message, get_recent_messages
from src.core.p2p import P2PNode
import asyncio

app = Flask(__name__)
p2p_node = P2PNode()

def start_p2p_node():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(p2p_node.start())

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": str(error)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": str(error)}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal Server Error", "message": str(error)}), 500

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    if not data or 'username' not in data or 'email' not in data:
        abort(400, description="Missing username or email")
    
    session = Session()
    try:
        new_user = User(username=data['username'], email=data['email'])
        session.add(new_user)
        session.commit()
        user_id = new_user.id
        return jsonify({"message": "User created successfully", "user_id": user_id}), 201
    except IntegrityError:
        session.rollback()
        abort(400, description="Username or email already exists")
    finally:
        session.close()

@app.route('/users', methods=['GET'])
def get_users():
    session = Session()
    users = session.query(User).all()
    session.close()
    return jsonify([{"id": user.id, "username": user.username, "email": user.email} for user in users])

@app.route('/messages', methods=['POST'])
def post_message():
    data = request.json
    add_message(data['content'], data['user_id'])
    asyncio.run(p2p_node.publish_message(data['content']))
    return jsonify({"message": "Message posted successfully"}), 201

@app.route('/messages', methods=['GET'])
def get_messages():
    messages = get_recent_messages()
    return jsonify([{"id": msg.id, "content": msg.content, "timestamp": str(msg.timestamp), "user_id": msg.user_id} for msg in messages])

if __name__ == '__main__':
    app.run(debug=True)
