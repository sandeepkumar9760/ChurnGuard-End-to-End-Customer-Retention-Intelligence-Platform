import type { CustomerData, PredictionResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://churnguard-api-mqod.onrender.com";

export async function predictChurn(
  customer: CustomerData,
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    let message = "Prediction request failed.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the generic message when the API response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<PredictionResponse>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return false;
    const body = (await response.json()) as { status?: string; model_loaded?: boolean };
    return body.status === "healthy" && body.model_loaded === true;
  } catch {
    return false;
  }
}

export { API_BASE_URL };
