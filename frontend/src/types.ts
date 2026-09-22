export type YesNo = "No" | "Yes";
export type Gender = "Female" | "Male";
export type InternetService = "DSL" | "Fiber optic" | "No";
export type Contract = "Month-to-month" | "One year" | "Two year";
export type MultipleLines = "No" | "No phone service" | "Yes";
export type InternetOption = "No" | "No internet service" | "Yes";
export type PaymentMethod =
  | "Bank transfer (automatic)"
  | "Credit card (automatic)"
  | "Electronic check"
  | "Mailed check";

export interface CustomerData {
  Gender: Gender;
  Senior_Citizen: YesNo;
  Partner: YesNo;
  Dependents: YesNo;
  Tenure_Months: number;
  Phone_Service: YesNo;
  Multiple_Lines: MultipleLines;
  Internet_Service: InternetService;
  Online_Security: InternetOption;
  Online_Backup: InternetOption;
  Device_Protection: InternetOption;
  Tech_Support: InternetOption;
  Streaming_TV: InternetOption;
  Streaming_Movies: InternetOption;
  Contract: Contract;
  Paperless_Billing: YesNo;
  Payment_Method: PaymentMethod;
  Monthly_Charges: number;
  Total_Charges: number;
}

export interface PredictionResponse {
  churn_probability: number;
  churn_prediction: 0 | 1;
  churn_label: "No" | "Yes";
  threshold: number;
}


export interface PredictionRecord {
  id: number;
  customer: CustomerData;
  churn_probability: number;
  churn_prediction: 0 | 1;
  churn_label: "No" | "Yes";
  threshold: number;
  contract: string;
  tenure_months: number;
  monthly_charges: number;
  created_at: string;
}

export interface AnalyticsResponse {
  prediction_count: number;
  average_churn_probability: number;
  high_risk_count: number;
  high_risk_rate: number;
  decision_threshold: number;
  contract_distribution: Record<string, number>;
}
