import os
import logging
import numpy as np

logger = logging.getLogger(__name__)
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'proficiency_model.joblib')
_model = None


def _load_model():
    global _model
    if _model is None:
        try:
            import joblib
            _model = joblib.load(MODEL_PATH)
        except FileNotFoundError:
            logger.warning("proficiency_model.joblib not found - run train_model.py. Using heuristic fallback.")
            _model = False
    return _model


def predict_future_score(current_score, lessons_completed, practice_minutes, avg_quiz_score):
    model = _load_model()
    if model:
        features = np.array([[current_score, lessons_completed, practice_minutes, avg_quiz_score]])
        predicted = model.predict(features)[0]
        return round(float(np.clip(predicted, 0, 100)), 1)
    headroom = (100 - current_score) / 100
    improvement = (lessons_completed * 1.2 + practice_minutes * 0.03) * headroom
    return round(min(100, current_score + improvement), 1)