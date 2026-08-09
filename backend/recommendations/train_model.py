"""
Trains a Random Forest Regressor on SYNTHETIC data (no real learner history
exists yet - this is documented and should be replaced with real data later).
Run once: python recommendations/train_model.py
"""
import os
import sys
import numpy as np
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'literacy_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib


def generate_synthetic_data(n_samples=2000, seed=42):
    rng = np.random.default_rng(seed)
    current_score = rng.uniform(10, 90, n_samples)
    lessons_completed = rng.integers(0, 20, n_samples)
    practice_minutes = rng.uniform(0, 300, n_samples)
    avg_quiz_score = rng.uniform(30, 100, n_samples)
    headroom = (100 - current_score) / 100
    improvement = (lessons_completed * 1.2 + practice_minutes * 0.03 + (avg_quiz_score - 50) * 0.15) * headroom
    noise = rng.normal(0, 4, n_samples)
    predicted_score = np.clip(current_score + improvement + noise, 0, 100)
    X = np.column_stack([current_score, lessons_completed, practice_minutes, avg_quiz_score])
    return X, predicted_score


def main():
    print("Generating synthetic training data...")
    X, y = generate_synthetic_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"Trained. MAE on synthetic test set: {mae:.2f} points")
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'proficiency_model.joblib')
    joblib.dump(model, model_path)
    print(f"Saved to {model_path}")


if __name__ == '__main__':
    main()