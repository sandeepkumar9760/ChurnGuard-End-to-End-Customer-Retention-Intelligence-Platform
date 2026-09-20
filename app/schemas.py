from pydantic import BaseModel


class CustomerData(BaseModel):

    Gender: str
    Senior_Citizen: str
    Partner: str
    Dependents: str

    Tenure_Months: float

    Phone_Service: str
    Multiple_Lines: str
    Internet_Service: str

    Online_Security: str
    Online_Backup: str
    Device_Protection: str
    Tech_Support: str

    Streaming_TV: str
    Streaming_Movies: str

    Contract: str
    Paperless_Billing: str
    Payment_Method: str

    Monthly_Charges: float
    Total_Charges: float