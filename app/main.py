import mlflow
import mlflow.sklearn
import pandas as pd

from fastapi import FastAPI
from app.schemas import CustomerData


app = FastAPI(
    title="Telco Customer Churn Prediction API",
    description="Production-style API for predicting customer churn.",
    version="1.0.0"
)


# -----------------------------
# MLflow Model
# -----------------------------

RUN_ID = "baeaa2c3b50d469fb715a2637fb6f642"

MODEL_URI = f"runs:/{RUN_ID}/telco_churn_model"

model = mlflow.sklearn.load_model(MODEL_URI)


# Business decision threshold
THRESHOLD = 0.35


@app.get("/")
def home():

    return {
        "message": "Telco Customer Churn API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/predict")
def predict(customer: CustomerData):

    customer_data = {
        "Gender": customer.Gender,
        "Senior Citizen": customer.Senior_Citizen,
        "Partner": customer.Partner,
        "Dependents": customer.Dependents,
        "Tenure Months": customer.Tenure_Months,
        "Phone Service": customer.Phone_Service,
        "Multiple Lines": customer.Multiple_Lines,
        "Internet Service": customer.Internet_Service,
        "Online Security": customer.Online_Security,
        "Online Backup": customer.Online_Backup,
        "Device Protection": customer.Device_Protection,
        "Tech Support": customer.Tech_Support,
        "Streaming TV": customer.Streaming_TV,
        "Streaming Movies": customer.Streaming_Movies,
        "Contract": customer.Contract,
        "Paperless Billing": customer.Paperless_Billing,
        "Payment Method": customer.Payment_Method,
        "Monthly Charges": customer.Monthly_Charges,
        "Total Charges": customer.Total_Charges
    }

    input_df = pd.DataFrame([customer_data])

    probability = model.predict_proba(input_df)[0, 1]

    prediction = int(probability >= THRESHOLD)

    return {
        "churn_probability": round(float(probability), 4),
        "churn_prediction": prediction,
        "churn_label": "Yes" if prediction == 1 else "No",
        "threshold": THRESHOLD
    }