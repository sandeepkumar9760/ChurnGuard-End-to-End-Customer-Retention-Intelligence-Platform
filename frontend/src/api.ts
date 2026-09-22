import type { AnalyticsResponse, CustomerData, PredictionRecord, PredictionResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://churnguard-api-mqod.onrender.com";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = "API request failed.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the generic message when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function predictChurn(customer: CustomerData): Promise<PredictionResponse> {
  return request<PredictionResponse>("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
}

export async function getPredictions(): Promise<PredictionRecord[]> {
  return request<PredictionRecord[]>("/predictions");
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return request<AnalyticsResponse>("/analytics");
}

export async function checkHealth(): Promise<boolean> {
  try {
    const body = await request<{
      status?: string;
      model_loaded?: boolean;
      database_connected?: boolean;
      persistence_enabled?: boolean;
  }>("/health");

    return (
      body.status === "healthy" &&
      body.model_loaded === true &&
      body.database_connected === true &&
      body.persistence_enabled === true
    );
  } catch {
    return false;
  }
}

export { API_BASE_URL };
