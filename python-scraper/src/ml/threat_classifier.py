import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

class ThreatClassifier:
    def __init__(self, model_path=None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), 'model.joblib')
        self.pipeline = None
        self.load_model()

    def load_model(self):
        """Load the trained model pipeline from disk"""
        if os.path.exists(self.model_path):
            try:
                self.pipeline = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model: {e}")
                self.pipeline = None

    def predict(self, text):
        """Predict severity and confidence for a given text"""
        if not self.pipeline:
            # Fallback to a very simple heuristic if model is not trained
            return self._heuristic_predict(text)

        try:
            prediction = self.pipeline.predict([text])[0]
            probabilities = self.pipeline.predict_proba([text])[0]
            confidence = float(np.max(probabilities)) * 100
            
            return {
                "severity": prediction,
                "confidence": round(confidence, 2)
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._heuristic_predict(text)

    def _heuristic_predict(self, text):
        """Fallback prediction logic when ML model is unavailable"""
        text = text.lower()
        if any(word in text for word in ['critical', 'zero-day', 'emergency', 'immediate', 'breach']):
            return {"severity": "Critical", "confidence": 50.0}
        elif any(word in text for word in ['high', 'severe', 'ransomware', 'malware']):
            return {"severity": "High", "confidence": 50.0}
        elif any(word in text for word in ['medium', 'moderate', 'vulnerability']):
            return {"severity": "Medium", "confidence": 50.0}
        else:
            return {"severity": "Low", "confidence": 50.0}

if __name__ == "__main__":
    # Quick test
    classifier = ThreatClassifier()
    test_text = "Urgent: Critical vulnerability in all versions of the software allow full system access"
    result = classifier.predict(test_text)
    print(f"Text: {test_text}")
    print(f"Result: {result}")
