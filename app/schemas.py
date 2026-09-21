from typing import Literal

from pydantic import BaseModel, Field


class CustomerData(BaseModel):

    Gender: Literal["Male", "Female"]

    Senior_Citizen: Literal["Yes", "No"]

    Partner: Literal["Yes", "No"]

    Dependents: Literal["Yes", "No"]

    Tenure_Months: float = Field(
        ge=0,
        le=72
    )

    Phone_Service: Literal["Yes", "No"]

    Multiple_Lines: str

    Internet_Service: Literal[
        "DSL",
        "Fiber optic",
        "No"
    ]

    Online_Security: str
    Online_Backup: str
    Device_Protection: str
    Tech_Support: str

    Streaming_TV: str
    Streaming_Movies: str

    Contract: Literal[
        "Month-to-month",
        "One year",
        "Two year"
    ]

    Paperless_Billing: Literal["Yes", "No"]

    Payment_Method: str

    Monthly_Charges: float = Field(
        ge=0
    )

    Total_Charges: float = Field(
        ge=0
    )