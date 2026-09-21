from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


VALID_CUSTOMER = {
    "Gender": "Male",
    "Senior_Citizen": "No",
    "Partner": "Yes",
    "Dependents": "No",
    "Tenure_Months": 5,
    "Phone_Service": "Yes",
    "Multiple_Lines": "No",
    "Internet_Service": "Fiber optic",
    "Online_Security": "No",
    "Online_Backup": "No",
    "Device_Protection": "No",
    "Tech_Support": "No",
    "Streaming_TV": "Yes",
    "Streaming_Movies": "Yes",
    "Contract": "Month-to-month",
    "Paperless_Billing": "Yes",
    "Payment_Method": "Electronic check",
    "Monthly_Charges": 85.5,
    "Total_Charges": 427.5
}


def test_health_check():

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_root_endpoint():

    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "message" in data


def test_valid_prediction():

    response = client.post(
        "/predict",
        json=VALID_CUSTOMER
    )

    assert response.status_code == 200

    data = response.json()

    assert "churn_probability" in data
    assert "churn_prediction" in data
    assert "churn_label" in data
    assert "threshold" in data

    assert 0 <= data["churn_probability"] <= 1
    assert data["churn_prediction"] in [0, 1]
    assert data["churn_label"] in ["Yes", "No"]
    assert data["threshold"] == 0.35


def test_invalid_payment_method():

    customer = VALID_CUSTOMER.copy()

    customer["Payment_Method"] = "UPI"

    response = client.post(
        "/predict",
        json=customer
    )

    assert response.status_code == 422


def test_negative_monthly_charges():

    customer = VALID_CUSTOMER.copy()

    customer["Monthly_Charges"] = -100

    response = client.post(
        "/predict",
        json=customer
    )

    assert response.status_code == 422


def test_negative_total_charges():

    customer = VALID_CUSTOMER.copy()

    customer["Total_Charges"] = -500

    response = client.post(
        "/predict",
        json=customer
    )

    assert response.status_code == 422


def test_invalid_contract():

    customer = VALID_CUSTOMER.copy()

    customer["Contract"] = "Monthly Contract"

    response = client.post(
        "/predict",
        json=customer
    )

    assert response.status_code == 422