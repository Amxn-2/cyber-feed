import json
import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def train_model():
    # File paths
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, 'labeled_data.json')
    model_path = os.path.join(base_dir, 'model.joblib')

    # Load data
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}")
        return

    with open(data_path, 'r') as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    
    if df.empty:
        print("Dataset is empty")
        return

    print(f"Training on {len(df)} samples...")

    # Define model pipeline
    # We use a simple TF-IDF + Logistic Regression which is robust for small text datasets
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )),
        ('clf', LogisticRegression(
            C=1.0,
            class_weight='balanced',
            random_state=42,
            max_iter=1000
        ))
    ])

    # Split data for evaluation (even though dataset is small)
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['severity'], test_size=0.2, random_state=42
    )

    # Train model
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    print("\nModel Evaluation:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved to {model_path}")

if __name__ == "__main__":
    train_model()
