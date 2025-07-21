# import pandas as pd
# from sklearn.ensemble import IsolationForest
# import json

# def load_data(filepath):
#     with open(filepath, 'r') as f:
#         raw_logs = json.load(f)

#     df = pd.DataFrame(raw_logs)

#     # Convert timestamp to datetime and extract features
#     df['timestamp'] = pd.to_datetime(df['timestamp'])
#     df['hour'] = df['timestamp'].dt.hour
#     df['success'] = df['success'].astype(int)

#     # Use email instead of username
#     df['email'] = df['email'].astype(str)

#     # Convert userId to numeric codes
#     df['user_code'] = df['userId'].astype('category').cat.codes

#     features = df[['hour', 'success', 'user_code']]
#     return df, features

import pandas as pd
import json
import os
from sklearn.ensemble import IsolationForest

def load_data(relative_path):
    # Resolve absolute path from current file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(current_dir, "..", relative_path)

    with open(full_path, 'r') as f:
        raw_logs = json.load(f)

    df = pd.DataFrame(raw_logs)

    # Convert timestamp to datetime and extract features
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['success'] = df['success'].astype(int)

    # Use email field for tracking
    df['email'] = df['email'].astype(str)

    # Convert userId to numeric code
    df['user_code'] = df['userId'].astype('category').cat.codes

    features = df[['hour', 'success', 'user_code']]
    return df, features