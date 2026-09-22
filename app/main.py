from pathlib import Path
import logging
import os

import pandas as pd
import skops.io as sio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.db import Prediction, SessionLocal, initialize_database
from app.schemas import AnalyticsResponse, CustomerData, PredictionRecord, PredictionResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Telco Customer Churn Prediction API",
    description="Production-style API for predicting customer churn.",
    version="1.1.0",
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
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

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_FILE = BASE_DIR / "model" / "model.skops"

model = sio.load(
    MODEL_FILE,
    trusted=[
        "numpy.dtype",
        "sklearn.compose._column_transformer._RemainderColsList",
        "sklearn.tree._tree.Tree",
        "_loss.CyHalfBinomialLoss",
    ],
)

THRESHOLD = float(os.getenv("CHURN_THRESHOLD", "0.35"))


@app.on_event("startup")
def startup():
    try:
        if initialize_database():
            logger.info("Database initialized successfully")
        else:
            logger.warning("DATABASE_URL is not configured; persistence is disabled")
    except Exception:
        logger.exception("Database initialization failed")


@app.get("/")
def home():
    return {"message": "Telco Customer Churn API is running"}


@app.get("/health")
def health():
    database_connected = False
    if SessionLocal:
        try:
            with SessionLocal() as session:
                session.execute(select(1))
            database_connected = True
        except Exception:
            logger.exception("Database health check failed")

    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "database_connected": database_connected,
        "persistence_enabled": SessionLocal is not None,
    }


@app.post("/predict", response_model=PredictionResponse)
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
            "Total Charges": customer.Total_Charges,
        }

        probability = float(model.predict_proba(pd.DataFrame([customer_data]))[0, 1])
        prediction = int(probability >= THRESHOLD)

        if SessionLocal:
            try:
                with SessionLocal() as session:
                    session.add(
                        Prediction(
                            customer_data=customer.model_dump(),
                            churn_probability=round(probability, 4),
                            churn_prediction=prediction,
                            churn_label="Yes" if prediction else "No",
                            threshold=THRESHOLD,
                            contract=customer.Contract,
                            tenure_months=customer.Tenure_Months,
                            monthly_charges=customer.Monthly_Charges,
                        )
                    )
                    session.commit()
            except Exception:
                logger.exception("Prediction succeeded but persistence failed")

        return {
            "churn_probability": round(probability, 4),
            "churn_prediction": prediction,
            "churn_label": "Yes" if prediction else "No",
            "threshold": THRESHOLD,
        }
    except Exception:
        logger.exception("Error while generating churn prediction")
        raise HTTPException(status_code=500, detail="Unable to generate churn prediction")


def serialize_prediction(record: Prediction) -> PredictionRecord:
    return PredictionRecord(
        id=record.id,
        customer=CustomerData.model_validate(record.customer_data),
        churn_probability=record.churn_probability,
        churn_prediction=record.churn_prediction,
        churn_label=record.churn_label,
        threshold=record.threshold,
        contract=record.contract,
        tenure_months=record.tenure_months,
        monthly_charges=record.monthly_charges,
        created_at=record.created_at.isoformat(),
    )


@app.get("/predictions", response_model=list[PredictionRecord])
def predictions():
    if not SessionLocal:
        return []

    try:
        with SessionLocal() as session:
            records = session.scalars(
                select(Prediction).order_by(Prediction.created_at.desc()).limit(50)
            ).all()
            return [serialize_prediction(record) for record in records]
    except Exception:
        logger.exception("Unable to load prediction history")
        raise HTTPException(status_code=503, detail="Prediction history is unavailable")


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics():
    if not SessionLocal:
        return AnalyticsResponse(
            prediction_count=0,
            average_churn_probability=0,
            high_risk_count=0,
            high_risk_rate=0,
            decision_threshold=THRESHOLD,
            contract_distribution={"Month-to-month": 0, "One year": 0, "Two year": 0},
        )

    try:
        with SessionLocal() as session:
            records = session.scalars(
                select(Prediction).order_by(Prediction.created_at.desc()).limit(1000)
            ).all()

        count = len(records)
        high_risk = sum(record.churn_prediction for record in records)
        average = sum(record.churn_probability for record in records) / count if count else 0
        contracts = {"Month-to-month": 0, "One year": 0, "Two year": 0}
        for record in records:
            contracts[record.contract] = contracts.get(record.contract, 0) + 1

        return AnalyticsResponse(
            prediction_count=count,
            average_churn_probability=round(average, 4),
            high_risk_count=high_risk,
            high_risk_rate=round(high_risk / count, 4) if count else 0,
            decision_threshold=THRESHOLD,
            contract_distribution=contracts,
        )
    except Exception:
        logger.exception("Unable to load analytics")
        raise HTTPException(status_code=503, detail="Analytics are unavailable")
