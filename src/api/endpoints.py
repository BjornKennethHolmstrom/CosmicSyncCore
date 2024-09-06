from flask import Flask, jsonify, request
from src.core.database import Session, User
from src.core.ml import RecommendationSystem

app = Flask(__name__)
rec_system = RecommendationSystem()

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    session = Session()
    new_user = User(username=data['username'], email=data['email'])
    session.add(new_user)
    session.commit()
    user_id = new_user.id
    session.close()
    return jsonify({"message": "User created successfully", "user_id": user_id}), 201

@app.route('/users', methods=['GET'])
def get_users():
    session = Session()
    users = session.query(User).all()
    session.close()
    return jsonify([{"id": user.id, "username": user.username, "email": user.email} for user in users])

@app.route('/users/<int:user_id>/interests', methods=['POST'])
def add_user_interests(user_id):
    data = request.json
    interests = data.get('interests', '')
    rec_system.add_user_interests(user_id, interests)
    return jsonify({"message": "Interests added successfully"}), 200

@app.route('/users/<int:user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    top_n = request.args.get('top_n', default=5, type=int)
    recommendations = rec_system.get_recommendations(user_id, top_n=top_n)
    return jsonify({"recommendations": recommendations}), 200

if __name__ == '__main__':
    app.run(debug=True)
