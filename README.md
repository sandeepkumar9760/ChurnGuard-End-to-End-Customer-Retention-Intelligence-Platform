# 🛡️ ChurnGuard — End-to-End Customer Retention Intelligence Platform

> An end-to-end machine learning and API platform for telecom churn prediction, model explainability, experiment tracking, containerized inference, automated testing, and cloud deployment.

[![Python](https://img.shields.io/badge/Python-3.13.5-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![MLflow](https://img.shields.io/badge/MLflow-3.16.1-0194E2?logo=mlflow&logoColor=white)](https://mlflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)
[![Skops](https://img.shields.io/badge/Model%20Serialization-Skops-purple)](https://skops.readthedocs.io/)
[![Pytest](https://img.shields.io/badge/Tests-Pytest-0A9EDC?logo=pytest&logoColor=white)](https://pytest.org/)

## 🚀 Live Deployment

**Production Frontend:** https://churnguard-indol.vercel.app

**Production API:** https://churnguard-api-mqod.onrender.com/

**Interactive Swagger documentation:** https://churnguard-api-mqod.onrender.com/docs

**Health check:** https://churnguard-api-mqod.onrender.com/health

The production service is deployed as a Render Web Service and loads the versioned `model/model.skops` artifact directly at application startup. The React/Vite frontend is deployed separately on Vercel and communicates with the API over HTTPS.

---

## 🎯 Overview

**ChurnGuard** is a production-style customer churn prediction platform built around a supervised binary classification workflow.

The project takes telecom customer data through the complete ML lifecycle:

**Data → EDA → Preprocessing → Model Comparison → Hyperparameter Tuning → Threshold Evaluation → SHAP Explainability → MLflow Tracking → Model Serialization → FastAPI → PostgreSQL → React/Vite Frontend → Docker → Automated Testing → Vercel + Render Deployment**

The inference service exposes a validated HTTP API that returns both a churn probability and a binary decision based on a configurable classification threshold.

> The model is a predictive risk signal. It does not establish causal relationships and is not an automated retention-decision system.

---

# 💼 Business Problem

Customer churn is a major business challenge in the telecom industry. ChurnGuard estimates whether a customer's historical profile resembles customers who churned.

### Prediction objective

> **Given a customer's demographic, service, contract, tenure, and billing information, estimate the probability that the customer will churn.**

### API output

- Churn probability
- Binary churn prediction
- Churn label
- Decision threshold

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
                    │ Preprocessing            │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Model Comparison + CV    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Tuning + Threshold       │
                    │ Evaluation + SHAP        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ MLflow + model.skops     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
             ┌─────────────────────────────────────┐
             │            FastAPI Backend           │
             │ /predict /predictions /analytics    │
             │ /health                              │
             └───────────────┬─────────────────────┘
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
        ┌──────────────────┐    ┌──────────────────┐
        │    PostgreSQL    │    │ Docker / Render  │
        │ Persistent data  │    │ API deployment   │
        └──────────────────┘    └──────────────────┘
                 ▲
                 │ HTTPS
                 │
        ┌────────┴─────────────┐
        │ React + TypeScript   │
        │ Vite / Vercel       │
        └─────────────────────┘
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

The baseline model uses **19 features**.

Excluded from the baseline:

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

Preprocessing is bundled into the trained pipeline so training and inference use the same transformations.

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

Gradient Boosting was selected for further tuning based on the cross-validation ranking metrics used in this project.

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

# 🎚️ Classification Threshold

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

Threshold selection is a deployment/business parameter and should be revisited when intervention costs, capacity, or class prevalence change.

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

MLflow was used during model development to track:

- model type
- hyperparameters
- cross-validation metrics
- test metrics
- classification threshold
- trained model artifact

The production service loads the serialized model directly and does **not** require the MLflow tracking database at inference time.

---

# 📦 Model Serialization

The final model is stored as:

```text
model/
└── model.skops
```

The artifact uses:

```text
scikit-learn==1.6.1
numpy==2.1.3
pandas==2.2.3
scipy==1.15.3
skops==0.15.0
```

The production environment pins these core ML dependencies to maintain compatibility with the serialized artifact.

---

# 🗄️ Production Persistence & Analytics

Prediction results are persisted in PostgreSQL through SQLAlchemy.

### Persisted prediction data

Each record stores:

- customer input profile as JSON
- churn probability
- binary churn prediction
- churn label
- decision threshold
- contract
- tenure
- monthly charges
- creation timestamp

### Backend data APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/predictions` | Latest persisted prediction history |
| GET | `/analytics` | Aggregate prediction analytics |

The frontend uses these backend APIs as the source of truth for the **Customers** and **Analytics** workspaces. Browser `localStorage` is not used as the primary prediction store.

The initial database schema is created from SQLAlchemy metadata at application startup. Alembic migrations are planned as a future hardening step.

---

# 🚀 FastAPI Inference API

The model is exposed through FastAPI with Pydantic request validation.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API status |
| GET | `/health` | Application, model, and database health |
| POST | `/predict` | Churn prediction and persistence |
| GET | `/predictions` | Persisted prediction history |
| GET | `/analytics` | Prediction analytics |

### `GET /health`

Example:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_connected": true,
  "persistence_enabled": true
}
```

### `POST /predict`

Accepts customer attributes and returns churn probability and classification.

---

# 📨 Prediction Example

The API schema uses Python-style field names for JSON requests.

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

### Response shape

```json
{
  "churn_probability": 0.6799,
  "churn_prediction": 1,
  "churn_label": "Yes",
  "threshold": 0.35
}
```

The exact probability depends on the supplied customer features.

---

# 🖥️ Production Frontend

The project includes a responsive React + TypeScript + Vite frontend deployed on Vercel.

**Live application:** https://churnguard-indol.vercel.app

### Frontend capabilities

- Customer churn prediction form
- Production API health indicator
- Churn probability visualization
- Configurable decision-threshold display
- Risk classification
- PostgreSQL-backed prediction history
- Customers workspace
- Analytics workspace
- Contract distribution analytics
- Recent prediction activity
- Loading and API error states
- Responsive layout

### Frontend stack

```text
React 19
TypeScript
Vite
Recharts
Lucide React
```

The production API URL is configured through:

```text
VITE_API_BASE_URL=https://churnguard-api-mqod.onrender.com
```

---

# 🌐 Production Deployment

ChurnGuard uses separate production deployments for the frontend and backend.

### Frontend — Vercel

```text
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Live frontend: https://churnguard-indol.vercel.app

### Backend — Render

ChurnGuard is deployed on **Render** as a Python Web Service.

### Production configuration

```text
Build:
pip install -r requirements.txt

Start:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

Health Check:
/health

Environment:
CHURN_THRESHOLD=0.35
```

### Production API

**Base URL:** https://churnguard-api-mqod.onrender.com/

**Swagger:** https://churnguard-api-mqod.onrender.com/docs

**Health:** https://churnguard-api-mqod.onrender.com/health

Render automatically rebuilds the service from the connected GitHub `main` branch when new commits are pushed.

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

The Docker image includes a healthcheck against `GET /health`.

---

# 🧪 Testing

The repository contains **9 automated tests** across application and container-level test suites.

### Application tests

```text
tests/test_api.py
```

Coverage includes:

- health endpoint
- root endpoint
- valid prediction
- invalid payment method
- invalid contract
- negative monthly charges
- negative total charges

Run:

```bash
pytest tests/test_api.py -v
```

### Container integration tests

```text
tests/test_container_api.py
```

These send real HTTP requests to the running Docker container and validate:

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

### Current validation status

```text
9 / 9 tests passing
```

---

# 📁 Project Structure

```text
ChurnGuard-End-to-End-Customer-Retention-Intelligence-Platform/
│
├── app/
│   ├── __init__.py
│   ├── db.py
│   ├── main.py
│   └── schemas.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── model/
├── notebooks/
├── tests/
├── .dockerignore
├── .gitignore
├── .python-version
├── Dockerfile
├── requirements.txt
└── README.md
```

---
# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.13.5 |
| Data Processing | Pandas 2.2.3, NumPy 2.1.3 |
| Machine Learning | Scikit-learn 1.6.1 |
| Explainability | SHAP |
| Experiment Tracking | MLflow 3.16.1 |
| Model Serialization | Skops 0.15.0 |
| API | FastAPI 0.141.1 |
| Validation | Pydantic 2.13.5 |
| Server | Uvicorn 0.53.0 |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0.43 |
| Database Driver | Psycopg 3.2.9 |
| Frontend | React 19 + TypeScript |
| Frontend Build | Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Pytest |
| Containerization | Docker |
| Cloud Deployment | Vercel + Render |

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
 ↓
Render Deployment
```

---

# 🔐 Reproducibility & Engineering Considerations

A key deployment issue encountered during development was model/runtime compatibility.

The serialized model was created with **Scikit-learn 1.6.1**. Loading the artifact with a different Scikit-learn version caused deserialization incompatibility.

The production environment therefore pins the core model-serving dependencies.

The API loads the local `model/model.skops` artifact directly rather than requiring the original Windows-specific MLflow tracking path.

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
- database migrations are not yet implemented
- the current API does not include authentication or rate limiting

---

# 🚧 Future Roadmap

- [ ] GitHub Actions CI/CD
- [ ] Automated model registry and promotion
- [ ] Data drift monitoring
- [ ] Model performance monitoring
- [x] PostgreSQL prediction persistence
- [x] Persistent customer prediction history
- [x] Production analytics API
- [x] React/Vite customer-risk dashboard
- [x] Vercel frontend deployment
- [ ] Alembic database migrations
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
- Decision-threshold evaluation
- SHAP explainability
- MLflow experiment tracking
- Portable Skops model artifact
- FastAPI inference service
- Pydantic validation
- Docker containerization
- Render production API deployment
- Vercel production frontend deployment
- PostgreSQL prediction persistence
- Backend-driven analytics
- Persistent customer prediction history
- Pinned model-serving dependencies
- Docker healthcheck
- Environment-based threshold configuration
- 9 automated tests
- Container integration testing

---

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.
