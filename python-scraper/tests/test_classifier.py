import unittest
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.ml.threat_classifier import ThreatClassifier

class TestThreatClassifier(unittest.TestCase):
    def setUp(self):
        self.classifier = ThreatClassifier()

    def test_critical_prediction(self):
        text = "CRITICAL: Zero-day exploit detected in core infrastructure allowing full remote code execution."
        result = self.classifier.predict(text)
        self.assertEqual(result["severity"], "Critical")

    def test_low_prediction(self):
        text = "Routine maintenance scheduled for the internal documentation portal."
        result = self.classifier.predict(text)
        # Low or Medium is acceptable for routine news
        self.assertIn(result["severity"], ["Low", "Medium"])

    def test_confidence_range(self):
        text = "Phishing attack targeting bank employees."
        result = self.classifier.predict(text)
        self.assertGreaterEqual(result["confidence"], 0.0)
        self.assertLessEqual(result["confidence"], 100.0)

if __name__ == '__main__':
    unittest.main()
