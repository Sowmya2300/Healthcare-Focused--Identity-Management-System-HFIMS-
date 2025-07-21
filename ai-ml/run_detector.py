# from model.anomaly_detector import load_data
# from sklearn.ensemble import IsolationForest

# def detect_anomalies(filepath):
#     df, features = load_data(filepath)

#     model = IsolationForest(contamination=0.1, random_state=42)
#     df['anomaly'] = model.fit_predict(features)

#     anomalies = df[df['anomaly'] == -1]

#     print("🔍 Anomalies Detected:\n")
#     if anomalies.empty:
#         print("✅ No anomalies detected.")
#     else:
#         print(anomalies[['email', 'timestamp', 'role', 'success']])

# if __name__ == "__main__":
#     detect_anomalies("data/login_logs.json")


# from model.anomaly_detector import load_data
# from sklearn.ensemble import IsolationForest
# import json
# import os

# current_dir = os.path.dirname(os.path.abspath(__file__))
# data_path = os.path.join(current_dir, "../data/login_logs.json")

# def detect_anomalies():
#     df, features = load_data(data_path)
#     model = IsolationForest(contamination=0.1, random_state=42)
#     df['anomaly'] = model.fit_predict(features)
#     anomalies = df[df['anomaly'] == -1]

#     result = anomalies[['email', 'timestamp', 'role', 'success']].to_dict(orient='records')
#     print(json.dumps(result, indent=2))

# if __name__ == "__main__":
#     detect_anomalies()

from model.anomaly_detector import load_data
from sklearn.ensemble import IsolationForest
import json

def detect_anomalies():
    df, features = load_data("data/login_logs.json")  # only relative path

    model = IsolationForest(contamination=0.1, random_state=42)
    df['anomaly'] = model.fit_predict(features)

    anomalies = df[df['anomaly'] == -1]

    # Convert timestamp to string for JSON serialization
    anomalies['timestamp'] = anomalies['timestamp'].astype(str)
    # Include index as a field
    anomalies = anomalies.reset_index()
    result = anomalies[['index', 'email', 'timestamp', 'role', 'success']].to_dict(orient='records')
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    detect_anomalies()