import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score, cross_validate
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, classification_report, ConfusionMatrixDisplay

FEATURE_COLUMNS = ['culture', 'adventure', 'nature', 'beaches', 'nightlife',
                   'cuisine', 'wellness', 'urban', 'seclusion', 'budget', 'duration']


def evaluate_classifier(path='data/training_data.csv'):
    df = pd.read_csv(path)
    X = df[FEATURE_COLUMNS]
    y = df['traveler_type']

    print(f"Date: {len(df)} randuri, {y.nunique()} clase\n")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, average='macro', zero_division=0)
    recall = recall_score(y_test, predictions, average='macro')
    f1 = f1_score(y_test, predictions, average='macro')

    print("TRAIN/TEST SPLIT (80/20)")
    print(f"Accuracy = {accuracy:.3f}")
    print(f"Precizie macro = {precision:.3f}")
    print(f"Recall macro = {recall:.3f}")
    print(f"F1 macro = {f1:.3f}\n")

    scoring=['accuracy', 'precision_macro', 'recall_macro', 'f1_macro']
    cv_results = cross_validate(model, X, y, cv=5, scoring=scoring)
    print("5-FOLD CROSS-VALIDATION")
    for s in scoring:
        vals = cv_results['test_'+s]
        print(f"{s} = {vals.mean():.3f} (+/- {vals.std():.3f})")

    print(classification_report(y_test, predictions, zero_division=0))

    fig, ax = plt.subplots(figsize=(14, 12))
    ConfusionMatrixDisplay.from_estimator(
        model, X_test, y_test, ax=ax, xticks_rotation=90, colorbar=False, cmap='Blues'
    )
    ax.set_title("Matrice de confuzie: Clasificare tip calator")
    plt.tight_layout()
    plt.savefig('classifier_evaluation.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("Grafic salvat: classifier_evaluation.png")

    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(X_train, y_train)
    dt_pred = dt.predict(X_test)

    dt_acc = accuracy_score(y_test, dt_pred)
    dt_f1 = f1_score(y_test, dt_pred, average='macro')
    dt_cv = cross_val_score(dt, X, y, cv=5).mean()
    rf_cv = cross_val_score(model, X, y, cv=5).mean()

    print(" COMPARATIE: Arbore de decizie vs Random Forest")
    print(f"{'Metrica':<18}{'Arbore':<12}{'RandomForest'}")
    print(f"{'Accuracy 80/20':<18}{dt_acc:<12.3f}{accuracy:.3f}")
    print(f"{'F1 macro':<18}{dt_f1:<12.3f}{f1:.3f}")
    print(f"{'CV 5-fold':<18}{dt_cv:<12.3f}{rf_cv:.3f}")


if __name__ == "__main__":
    evaluate_classifier()