from typing import Literal

from pydantic import BaseModel, Field


class CustomerData(BaseModel):

    Gender: Literal[
        "Female",
        "Male"
    ]

    Senior_Citizen: Literal[
        "No",
        "Yes"
    ]

    Partner: Literal[
        "No",
        "Yes"
    ]

    Dependents: Literal[
        "No",
        "Yes"
    ]

    Tenure_Months: float = Field(
        ge=0,
        le=72
    )

    Phone_Service: Literal[
        "No",
        "Yes"
    ]

    Multiple_Lines: Literal[
        "No",
        "No phone service",
        "Yes"
    ]

    Internet_Service: Literal[
        "DSL",
        "Fiber optic",
        "No"
    ]

    Online_Security: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Online_Backup: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Device_Protection: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Tech_Support: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Streaming_TV: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Streaming_Movies: Literal[
        "No",
        "No internet service",
        "Yes"
    ]

    Contract: Literal[
        "Month-to-month",
        "One year",
        "Two year"
    ]

    Paperless_Billing: Literal[
        "No",
        "Yes"
    ]

    Payment_Method: Literal[
        "Bank transfer (automatic)",
        "Credit card (automatic)",
        "Electronic check",
        "Mailed check"
    ]

    Monthly_Charges: float = Field(
        ge=0
    )

    Total_Charges: float = Field(
        ge=0
    )