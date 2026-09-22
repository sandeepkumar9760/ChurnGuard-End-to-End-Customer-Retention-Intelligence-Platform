from pathlib import Path
import logging
import os
import pandas as pd
import skops.io as sio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import CustomerData, PredictionResponse


logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger(__name__)


app = FastAPI(
    title="Telco Customer Churn Prediction API",
    description="Production-style API for predicting customer churn.",
    version="1.0.0"
)


# -----------------------------
# CORS
# -----------------------------

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# -----------------------------
# ML Model
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model"
MODEL_FILE = MODEL_PATH / "model.skops"


model = sio.load(
    MODEL_FILE,
    trusted=[
        "numpy.dtype",
        "sklearn.compose._column_transformer._RemainderColsList",
        "sklearn.tree._tree.Tree",
        "_loss.CyHalfBinomialLoss"
    ]
)


THRESHOLD = float(os.getenv("CHURN_THRESHOLD", "0.35"))


# -----------------------------
# Routes
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "Telco Customer Churn API is running"
    }


@app.get("/health")
def health():

    logger.info("Health check requested")

    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(customer: CustomerData):

    try:

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

        logger.info(
            "Churn prediction generated successfully"
        )

        return {
            "churn_probability": round(float(probability), 4),
            "churn_prediction": prediction,
            "churn_label": "Yes" if prediction == 1 else "No",
            "threshold": THRESHOLD
        }

    except Exception:

        logger.exception(
            "Error while generating churn prediction"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate churn prediction"
        )