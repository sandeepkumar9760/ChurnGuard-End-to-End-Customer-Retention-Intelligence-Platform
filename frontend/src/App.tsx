import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users, Wifi, Zap } from "lucide-react";
import { checkHealth, predictChurn } from "./api";
import type { CustomerData, PredictionResponse } from "./types";

const defaults: CustomerData = {
  Gender: "Male",
  Senior_Citizen: "No",
  Partner: "No",
  Dependents: "No",
  Tenure_Months: 2,
  Phone_Service: "Yes",
  Multiple_Lines: "No",
  Internet_Service: "Fiber optic",
  Online_Security: "No",
  Online_Backup: "No",
  Device_Protection: "No",
  Tech_Support: "No",
  Streaming_TV: "No",
  Streaming_Movies: "No",
  Contract: "Month-to-month",
  Paperless_Billing: "Yes",
  Payment_Method: "Electronic check",
  Monthly_Charges: 70,
  Total_Charges: 140,
};

const optionGroups = {
  Gender: ["Female", "Male"],
  YesNo: ["No", "Yes"],
  Multiple_Lines: ["No", "No phone service", "Yes"],
  Internet_Service: ["DSL", "Fiber optic", "No"],
  InternetOption: ["No", "No internet service", "Yes"],
  Contract: ["Month-to-month", "One year", "Two year"],
  Payment_Method: ["Bank transfer (automatic)", "Credit card (automatic)", "Electronic check", "Mailed check"],
};

function Field({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <div><p className="eyebrow">CUSTOMER PROFILE</p><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      <div className="field-grid">{children}</div>
    </section>
  );
}

export default function App() {
  const [customer, setCustomer] = useState<CustomerData>(defaults);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { checkHealth().then(setApiOnline); }, []);

  const riskPercent = result ? result.churn_probability * 100 : 0;
  const riskClass = riskPercent >= result?.threshold! * 100 ? "high" : "low";

  const riskMessage = useMemo(() => {
    if (!result) return "Enter customer details to generate a risk signal.";
    return result.churn_label === "Yes"
      ? "This profile is classified as higher churn risk at the configured threshold."
      : "This profile is classified as lower churn risk at the configured threshold.";
  }, [result]);

  function update<K extends keyof CustomerData>(key: K, value: CustomerData[K]) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await predictChurn(customer));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the prediction service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><ShieldCheck size={22} /></div><div><strong>ChurnGuard</strong><span>Retention Intelligence</span></div></div>
        <nav><a className="active"><Activity size={18} /> Prediction</a><a><TrendingUp size={18} /> Analytics <small>soon</small></a><a><Users size={18} /> Customers <small>soon</small></a></nav>
        <div className="sidebar-card"><Sparkles size={17} /><div><strong>ML-powered</strong><p>Gradient Boosting inference with a configurable 0.35 decision threshold.</p></div></div>
        <div className="api-status"><span className={apiOnline ? "dot online" : apiOnline === false ? "dot offline" : "dot"} /> API {apiOnline ? "connected" : apiOnline === false ? "offline" : "checking"}</div>
      </aside>

      <main className="main">
        <header className="topbar"><div><p className="eyebrow">CUSTOMER RISK ENGINE</p><h1>Predict churn before it happens.</h1><p className="lead">Turn customer, service, contract and billing signals into an actionable churn-risk score.</p></div><div className="secure"><CheckCircle2 size={17} /> Production API</div></header>

        <div className="content-grid">
          <form className="prediction-card" onSubmit={submit}>
            <Section title="Customer profile" subtitle="Basic relationship and demographic signals.">
              <Field label="Gender" value={customer.Gender} options={optionGroups.Gender} onChange={(v) => update("Gender", v as CustomerData["Gender"])} />
              <Field label="Senior citizen" value={customer.Senior_Citizen} options={optionGroups.YesNo} onChange={(v) => update("Senior_Citizen", v as CustomerData["Senior_Citizen"])} />
              <Field label="Partner" value={customer.Partner} options={optionGroups.YesNo} onChange={(v) => update("Partner", v as CustomerData["Partner"])} />
              <Field label="Dependents" value={customer.Dependents} options={optionGroups.YesNo} onChange={(v) => update("Dependents", v as CustomerData["Dependents"])} />
              <label className="field"><span>Tenure (months)</span><input type="number" min="0" max="72" value={customer.Tenure_Months} onChange={(e) => update("Tenure_Months", Number(e.target.value))} /></label>
            </Section>

            <Section title="Services & support" subtitle="Current products and customer service coverage.">
              <Field label="Phone service" value={customer.Phone_Service} options={optionGroups.YesNo} onChange={(v) => update("Phone_Service", v as CustomerData["Phone_Service"])} />
              <Field label="Multiple lines" value={customer.Multiple_Lines} options={optionGroups.Multiple_Lines} onChange={(v) => update("Multiple_Lines", v as CustomerData["Multiple_Lines"])} />
              <Field label="Internet service" value={customer.Internet_Service} options={optionGroups.Internet_Service} onChange={(v) => update("Internet_Service", v as CustomerData["Internet_Service"])} />
              <Field label="Online security" value={customer.Online_Security} options={optionGroups.InternetOption} onChange={(v) => update("Online_Security", v as CustomerData["Online_Security"])} />
              <Field label="Online backup" value={customer.Online_Backup} options={optionGroups.InternetOption} onChange={(v) => update("Online_Backup", v as CustomerData["Online_Backup"])} />
              <Field label="Device protection" value={customer.Device_Protection} options={optionGroups.InternetOption} onChange={(v) => update("Device_Protection", v as CustomerData["Device_Protection"])} />
              <Field label="Tech support" value={customer.Tech_Support} options={optionGroups.InternetOption} onChange={(v) => update("Tech_Support", v as CustomerData["Tech_Support"])} />
              <Field label="Streaming TV" value={customer.Streaming_TV} options={optionGroups.InternetOption} onChange={(v) => update("Streaming_TV", v as CustomerData["Streaming_TV"])} />
              <Field label="Streaming movies" value={customer.Streaming_Movies} options={optionGroups.InternetOption} onChange={(v) => update("Streaming_Movies", v as CustomerData["Streaming_Movies"])} />
            </Section>

            <Section title="Contract & billing" subtitle="Commercial signals used by the model.">
              <Field label="Contract" value={customer.Contract} options={optionGroups.Contract} onChange={(v) => update("Contract", v as CustomerData["Contract"])} />
              <Field label="Paperless billing" value={customer.Paperless_Billing} options={optionGroups.YesNo} onChange={(v) => update("Paperless_Billing", v as CustomerData["Paperless_Billing"])} />
              <Field label="Payment method" value={customer.Payment_Method} options={optionGroups.Payment_Method} onChange={(v) => update("Payment_Method", v as CustomerData["Payment_Method"])} />
              <label className="field"><span>Monthly charges</span><input type="number" min="0" step="0.01" value={customer.Monthly_Charges} onChange={(e) => update("Monthly_Charges", Number(e.target.value))} /></label>
              <label className="field"><span>Total charges</span><input type="number" min="0" step="0.01" value={customer.Total_Charges} onChange={(e) => update("Total_Charges", Number(e.target.value))} /></label>
            </Section>

            {error && <div className="error-box">{error}</div>}
            <button className="predict-button" disabled={loading}>{loading ? <><span className="spinner" /> Analyzing customer...</> : <>Predict churn risk <ArrowRight size={19} /></>}</button>
          </form>

          <aside className="result-column">
            <div className="result-card">
              <div className="result-head"><div><p className="eyebrow">RISK ASSESSMENT</p><h2>Customer risk</h2></div><div className="icon-box"><Zap size={19} /></div></div>
              {result ? (
                <>
                  <div className={`risk-ring ${riskClass}`} style={{ "--risk": `${riskPercent * 3.6}deg` } as React.CSSProperties}><div><strong>{riskPercent.toFixed(1)}%</strong><span>churn probability</span></div></div>
                  <div className={`risk-badge ${riskClass}`}>{result.churn_label === "Yes" ? "Higher risk" : "Lower risk"}</div>
                  <p className="result-message">{riskMessage}</p>
                  <div className="metric-row"><span>Decision threshold</span><strong>{(result.threshold * 100).toFixed(0)}%</strong></div>
                  <div className="metric-row"><span>Model decision</span><strong>{result.churn_prediction === 1 ? "Churn" : "No churn"}</strong></div>
                </>
              ) : (
                <div className="empty-result"><div className="empty-icon"><Wifi size={22} /></div><h3>Ready for analysis</h3><p>Your prediction will appear here with the probability, threshold and model decision.</p></div>
              )}
            </div>
            <div className="info-card"><div className="info-icon"><ShieldCheck size={18} /></div><div><strong>Decision support, not a decision maker</strong><p>The score is a predictive signal based on learned historical associations. It does not establish causality.</p></div></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
