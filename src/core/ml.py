from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class RecommendationSystem:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.user_interests = {}
        self.user_vectors = {}

    def add_user_interests(self, user_id, interests):
        self.user_interests[user_id] = interests
        self._update_vectors()

    def _update_vectors(self):
        interests_list = list(self.user_interests.values())
        vectors = self.vectorizer.fit_transform(interests_list)
        for i, user_id in enumerate(self.user_interests.keys()):
            self.user_vectors[user_id] = vectors[i]

    def get_recommendations(self, user_id, top_n=5):
        if user_id not in self.user_vectors:
            return []

        user_vector = self.user_vectors[user_id]
        similarities = {}

        for other_id, other_vector in self.user_vectors.items():
            if other_id != user_id:
                similarity = cosine_similarity(user_vector, other_vector)[0][0]
                similarities[other_id] = similarity

        sorted_similarities = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
        return [user for user, _ in sorted_similarities[:top_n]]

# Example usage
rec_system = RecommendationSystem()
rec_system.add_user_interests(1, "machine learning artificial intelligence data science")
rec_system.add_user_interests(2, "web development javascript python react")
rec_system.add_user_interests(3, "artificial intelligence neural networks deep learning")

recommendations = rec_system.get_recommendations(1, top_n=2)
print(f"Recommendations for user 1: {recommendations}")
