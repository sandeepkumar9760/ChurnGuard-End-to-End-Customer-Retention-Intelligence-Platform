# 🛡️ ChurnGuard — End-to-End Customer Retention Intelligence Platform

> An end-to-end machine learning and API platform for telecom churn prediction, model explainability, experiment tracking, and containerized inference.

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![MLflow](https://img.shields.io/badge/MLflow-3.16.1-0194E2?logo=mlflow&logoColor=white)](https://mlflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Skops](https://img.shields.io/badge/Model%20Serialization-Skops-purple)](https://skops.readthedocs.io/)
[![Pytest](https://img.shields.io/badge/Tests-Pytest-0A9EDC?logo=pytest&logoColor=white)](https://pytest.org/)

---

## 🎯 Overview

**ChurnGuard** is a production-style customer churn prediction platform built around a supervised binary classification workflow.

The project takes telecom customer data through the complete ML lifecycle:

**Data → EDA → Preprocessing → Model Comparison → Hyperparameter Tuning → Threshold Optimization → SHAP Explainability → MLflow Tracking → Model Serialization → FastAPI → Docker → Integration Testing**

The inference service exposes a validated HTTP API that returns both a churn probability and a binary decision based on a configurable classification threshold.

---

## 💼 Business Problem

Customer churn is a major business challenge in the telecom industry. ChurnGuard estimates whether a customer's historical profile resembles customers who churned.

### Prediction objective

> **Given a customer's demographic, service, contract, tenure, and billing information, estimate the probability that the customer will churn.**

### API output

- **Churn probability**
- **Binary churn prediction**
- **Churn label**
- **Decision threshold**

> The model is a predictive risk signal. It does not establish causal relationships and is not an automated retention-decision system.

---

# 🏗️ End-to-End Architecture

```text
                         ┌──────────────────────────┐
                         │     Telecom Dataset      │
                         │       7,043 rows         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ EDA + Data Cleaning      │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ Feature Selection &      │
                         │ Preprocessing             │
                         └────────────┬─────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
                 ▼                    ▼                    ▼
          Logistic Regression   Random Forest      Gradient Boosting
                 │                    │                    │
                 └────────────────────┼────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ Cross-Validation &       │
                         │ Model Evaluation         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ Hyperparameter Tuning    │
                         │ RandomizedSearchCV       │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ Threshold Optimization   │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ SHAP Explainability      │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ MLflow Experiment        │
                         │ Tracking                  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │ model/model.skops        │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                  ┌─────────────────────────────────────────┐
                  │              FastAPI Service             │
                  │                                         │
                  │  GET  /                                 │
                  │  GET  /health                           │
                  │  POST /predict                          │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                         ┌──────────────────────────┐
                         │ Docker Container         │
                         │                          │
                         │ Healthcheck              │
                         │ Pinned Dependencies      │
                         │ Environment Config       │
                         └──────────────────────────┘
```

---

# 📊 Dataset

The project uses a telecom customer churn dataset containing **7,043 customer records**.

### Target

| Value | Meaning |
|---|---|
| `No` | Customer did not churn |
| `Yes` | Customer churned |

Approximate target distribution:

| Class | Share |
|---|---:|
| No Churn | 73.5% |
| Churn | 26.5% |

### Feature groups

**Customer profile**

- Gender
- Senior Citizen
- Partner
- Dependents

**Services**

- Phone Service
- Multiple Lines
- Internet Service
- Online Security
- Online Backup
- Device Protection
- Tech Support
- Streaming TV
- Streaming Movies

**Contract & billing**

- Contract
- Paperless Billing
- Payment Method
- Monthly Charges
- Total Charges

**Relationship**

- Tenure Months

---

# 🧹 Data Cleaning

The `Total Charges` column contained **11 blank values**.

Those records had zero tenure and no churn. The field was converted to numeric and the resulting missing values were filled with `0`.

```python
df["Total Charges"] = pd.to_numeric(
    df["Total Charges"],
    errors="coerce"
)

df["Total Charges"] = df["Total Charges"].fillna(0)
```

---

# 🔎 Exploratory Data Analysis

### Churn vs Tenure

Observed churn rates by tenure group:

| Tenure Group | Observed Churn Rate |
|---|---:|
| 0–6 months | 52.94% |
| 7–12 months | 35.89% |
| 13–24 months | 28.71% |
| 25–48 months | 20.39% |
| 49–72 months | 9.51% |

The EDA also found higher observed churn among month-to-month customers across the evaluated tenure groups.

> These are observational associations in the dataset and should not be interpreted as causal effects.

---

# 🧪 Feature Selection

The baseline model uses 19 features.

The following fields were excluded from the baseline:

```text
CustomerID
Count
Country
State
City
Zip Code
Lat Long
Latitude
Longitude
Churn Value
Churn Score
Churn Reason
Tenure Group
```

`CLTV` was also excluded from the first baseline because its calculation and timing relative to prediction required additional investigation.

### Final model features

```text
Gender
Senior Citizen
Partner
Dependents
Tenure Months
Phone Service
Multiple Lines
Internet Service
Online Security
Online Backup
Device Protection
Tech Support
Streaming TV
Streaming Movies
Contract
Paperless Billing
Payment Method
Monthly Charges
Total Charges
```

---

# ⚙️ Preprocessing

The model uses a Scikit-learn `ColumnTransformer`.

### Numerical pipeline

```python
numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])
```

### Categorical pipeline

```python
categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])
```

Preprocessing is bundled into the trained pipeline so that training and inference use the same transformations.

---

# 🧠 Model Development

Three classifiers were evaluated:

- Logistic Regression
- Random Forest
- Gradient Boosting

A stratified 80/20 split produced:

- **Training:** 5,634 records
- **Testing:** 1,409 records

---

# 📈 Model Performance

Five-fold stratified cross-validation on the training set:

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|---:|
| Logistic Regression | 0.812 | 0.666 | 0.582 | 0.621 | 0.859 | 0.680 |
| Random Forest | — | — | — | — | 0.833 | 0.624 |
| Gradient Boosting | 0.808 | 0.674 | 0.539 | 0.599 | **0.864** | **0.689** |

Gradient Boosting was selected for further tuning based on the cross-validation results for the ranking metrics used in this project.

---

# 🎛️ Hyperparameter Tuning

`RandomizedSearchCV` was used to tune Gradient Boosting.

### Selected configuration

```text
n_estimators      = 100
learning_rate     = 0.05
max_depth         = 3
min_samples_split = 2
min_samples_leaf  = 2
subsample         = 0.8
```

### Results

```text
Best CV ROC-AUC : 0.8648
Test ROC-AUC    : 0.8549
```

---

# 🎚️ Classification Threshold Optimization

The default threshold of `0.50` was not assumed to be optimal.

Multiple thresholds were evaluated to understand the precision-recall trade-off.

At a threshold of **0.35**, the held-out test set produced:

| Metric | Value |
|---|---:|
| Precision | 0.575 |
| Recall | 0.719 |
| F1 | 0.639 |

Predicted churn at this threshold:

```text
468 / 1,409 test customers
```

The threshold is configurable through:

```text
CHURN_THRESHOLD=0.35
```

This makes the decision threshold a deployment/business parameter rather than a hard-coded model property.

---

# 🔬 SHAP Explainability

SHAP was used to inspect model behavior and feature contributions.

Important feature groups included:

```text
Contract
Tenure Months
Dependents
Internet Service
Online Security
Monthly Charges
Payment Method
Tech Support
Total Charges
```

Important transformed features included:

```text
Contract_Month-to-month
Tenure Months
Internet Service_Fiber optic
Online Security_No
Monthly Charges
Payment Method_Electronic check
Tech Support_No
```

> SHAP values explain model output and represent learned associations; they do not establish causal relationships.

---

# 📌 MLflow Experiment Tracking

MLflow was used to track the model development lifecycle.

Tracked information includes:

- model type
- hyperparameters
- cross-validation metrics
- test metrics
- classification threshold
- trained model artifact

The production service loads the serialized model directly and does not require the MLflow tracking database at inference time.

---

# 📦 Model Serialization

The final model is stored as a Skops artifact:

```text
model/
└── model.skops
```

The artifact was trained with:

```text
scikit-learn==1.6.1
```

The production environment pins the same Scikit-learn version to maintain compatibility with the serialized model.

---

# 🚀 FastAPI Inference API

The model is exposed through FastAPI with Pydantic request validation.

## Endpoints

### `GET /`

Returns a basic API status message.

### `GET /health`

Returns application and model health.

Example:

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### `POST /predict`

Accepts customer attributes and returns churn probability and classification.

---

# 📨 Prediction Example

### Request

```json
{
  "Gender": "Male",
  "Senior_Citizen": "No",
  "Partner": "No",
  "Dependents": "No",
  "Tenure_Months": 2,
  "Phone_Service": "Yes",
  "Multiple_Lines": "No",
  "Internet_Service": "Fiber optic",
  "Online_Security": "No",
  "Online_Backup": "No",
  "Device_Protection": "No",
  "Tech_Support": "No",
  "Streaming_TV": "No",
  "Streaming_Movies": "No",
  "Contract": "Month-to-month",
  "Paperless_Billing": "Yes",
  "Payment_Method": "Electronic check",
  "Monthly_Charges": 70.0,
  "Total_Charges": 140.0
}
```

### Response

```json
{
  "churn_probability": 0.6799,
  "churn_prediction": 1,
  "churn_label": "Yes",
  "threshold": 0.35
}
```

---

# ✅ Validation

Pydantic validates categorical and numerical inputs before prediction.

### Contract values

```text
Month-to-month
One year
Two year
```

### Numerical constraints

- `0 <= Tenure_Months <= 72`
- `Monthly_Charges >= 0`
- `Total_Charges >= 0`

Invalid requests return:

```text
HTTP 422 Unprocessable Entity
```

---

# 🐳 Docker

The inference service is containerized with Docker.

## Build

```bash
docker build -t telco-churn-api .
```

## Run — PowerShell

```powershell
docker run -d `
    --name telco-churn-api-container `
    -p 8000:8000 `
    -e CHURN_THRESHOLD=0.35 `
    telco-churn-api
```

## Run — Linux / macOS

```bash
docker run -d \
    --name telco-churn-api-container \
    -p 8000:8000 \
    -e CHURN_THRESHOLD=0.35 \
    telco-churn-api
```

Check the container:

```bash
docker ps
```

Expected status:

```text
Up ... (healthy)
```

---

# ❤️ Docker Healthcheck

The Docker image performs a healthcheck against:

```text
GET /health
```

Configuration:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
```

This verifies that the API is responding inside the running container.

---

# 🧪 Testing

The repository contains both application-level and container-level tests.

### Application tests

```text
tests/test_api.py
```

These cover:

- health endpoint
- root endpoint
- valid prediction
- invalid payment method
- invalid contract
- invalid numerical values

Run:

```bash
pytest tests/test_api.py -v
```

### Container integration tests

```text
tests/test_container_api.py
```

These tests send real HTTP requests to the running Docker container and validate:

- health status
- prediction endpoint
- probability range
- prediction value
- churn label
- configured threshold

Run:

```bash
pytest tests/test_container_api.py -v
```

---

# 📁 Project Structure

```text
ChurnGuard-End-to-End-Customer-Retention-Intelligence-Platform/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── schemas.py
│
├── data/
│
├── model/
│   ├── MLmodel
│   ├── model.skops
│   ├── conda.yaml
│   ├── python_env.yaml
│   ├── registered_model_meta
│   └── requirements.txt
│
├── notebooks/
│   └── 01_Telco_churn.ipynb
│
├── tests/
│   ├── __init__.py
│   ├── test_api.py
│   └── test_container_api.py
│
├── .dockerignore
├── Dockerfile
├── requirements.txt
└── README.md
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn 1.6.1 |
| Explainability | SHAP |
| Experiment Tracking | MLflow |
| Model Serialization | Skops |
| API | FastAPI |
| Validation | Pydantic |
| Server | Uvicorn |
| Testing | Pytest, Requests |
| Containerization | Docker |

---

# 🔁 Reproducible ML Workflow

```text
Data
 ↓
EDA
 ↓
Data Cleaning
 ↓
Feature Selection
 ↓
Train/Test Split
 ↓
Preprocessing Pipeline
 ↓
Model Comparison
 ↓
Cross-Validation
 ↓
Hyperparameter Tuning
 ↓
Threshold Evaluation
 ↓
SHAP Explainability
 ↓
MLflow Tracking
 ↓
Skops Model Artifact
 ↓
FastAPI
 ↓
Docker
 ↓
Healthcheck
 ↓
Integration Tests
```

---

# 🔐 Reproducibility & Engineering Considerations

A key deployment issue encountered during development was model/runtime compatibility.

The serialized model was created with **Scikit-learn 1.6.1**. Loading the artifact with a different Scikit-learn version caused deserialization incompatibility.

The production environment therefore pins:

```text
scikit-learn==1.6.1
```

The API also loads the local `model.skops` artifact directly rather than requiring the original Windows-specific MLflow tracking path.

---

# ⚠️ Limitations

This repository demonstrates a production-style ML inference workflow, but additional controls would be required for a long-running production system.

Considerations include:

- model performance can change as customer behavior changes
- historical associations do not establish causality
- threshold selection depends on business costs and intervention capacity
- production deployments require model and data monitoring
- customer-level data should be handled according to applicable privacy and governance requirements
- automated retraining and model promotion are not yet implemented

---

# 🚧 Future Roadmap

- [ ] GitHub Actions CI/CD
- [ ] Cloud deployment
- [ ] Model registry and automated promotion
- [ ] Data drift monitoring
- [ ] Model performance monitoring
- [ ] Prediction logging
- [ ] Automated retraining
- [ ] Prometheus metrics
- [ ] Centralized logging
- [ ] API authentication
- [ ] Rate limiting
- [ ] Customer-risk dashboard
- [ ] Batch inference pipeline
- [ ] Automated retention workflow integration

---

# 👨‍💻 Author

**Sandeep Kumar**

B.Tech CSE — Decision Science & Machine Learning

### Areas of Interest

- Machine Learning
- ML Engineering
- Data Science
- Backend Development
- Production ML Systems

---

## ⭐ Project Highlights

- End-to-end churn prediction workflow
- 7,043 telecom customer records
- Multiple-model evaluation
- 5-fold stratified cross-validation
- Gradient Boosting hyperparameter optimization
- Decision-threshold optimization
- SHAP explainability
- MLflow experiment tracking
- Portable Skops model artifact
- FastAPI inference service
- Pydantic validation
- Docker containerization
- Pinned model-serving dependencies
- Docker healthcheck
- Environment-based threshold configuration
- Application-level API tests
- Docker container integration tests

---

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.
