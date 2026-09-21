import requests


BASE_URL = "http://localhost:8000"


def test_health():
    response = requests.get(f"{BASE_URL}/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_prediction():
    payload = {
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
        "Total_Charges": 140.0,
    }

    response = requests.post(
        f"{BASE_URL}/predict",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert 0 <= data["churn_probability"] <= 1
    assert data["churn_prediction"] in [0, 1]
    assert data["churn_label"] in ["Yes", "No"]
    assert data["threshold"] == 0.35