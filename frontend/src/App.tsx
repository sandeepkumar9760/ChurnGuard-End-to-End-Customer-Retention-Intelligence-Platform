import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { checkHealth, getAnalytics, getPredictions, predictChurn } from "./api";
import type { AnalyticsResponse, CustomerData, PredictionRecord, PredictionResponse } from "./types";

type View = "prediction" | "analytics" | "customers";

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
  Payment_Method: [
    "Bank transfer (automatic)",
    "Credit card (automatic)",
    "Electronic check",
    "Mailed check",
  ],
};

function Field({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CUSTOMER PROFILE</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="field-grid">{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function AnalyticsView({ history, analytics }: { history: PredictionRecord[]; analytics: AnalyticsResponse | null }) {
  const contracts = ["Month-to-month", "One year", "Two year"].map((contract) => ({
    contract,
    count: analytics?.contract_distribution[contract] ?? 0,
  }));
  const maxContract = Math.max(...contracts.map((item) => item.count), 1);

  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p className="eyebrow">PORTFOLIO ANALYTICS</p>
          <h1>Prediction analytics.</h1>
          <p className="lead">Operational metrics calculated from predictions persisted by the production API.</p>
        </div>
        <div className="local-badge"><Clock3 size={15} /> PostgreSQL-backed history</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Predictions" value={String(analytics?.prediction_count ?? 0)} detail="Saved prediction runs" icon={<BarChart3 size={18} />} />
        <StatCard label="Avg. churn probability" value={`${((analytics?.average_churn_probability ?? 0) * 100).toFixed(1)}%`} detail="Across saved predictions" icon={<TrendingUp size={18} />} />
        <StatCard label="Higher-risk decisions" value={String(analytics?.high_risk_count ?? 0)} detail={`${((analytics?.high_risk_rate ?? 0) * 100).toFixed(1)}% of predictions`} icon={<Zap size={18} />} />
        <StatCard label="Decision threshold" value={`${((analytics?.decision_threshold ?? 0.35) * 100).toFixed(0)}%`} detail="Configured model threshold" icon={<ShieldCheck size={18} />} />
      </div>

      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">CONTRACT MIX</p><h2>Saved prediction distribution</h2></div>
            <BarChart3 size={18} />
          </div>
          {history.length ? contracts.map((item) => (
            <div className="bar-row" key={item.contract}>
              <div><span>{item.contract}</span><strong>{item.count}</strong></div>
              <div className="bar-track"><i style={{ width: `${(item.count / maxContract) * 100}%` }} /></div>
            </div>
          )) : <EmptyState title="No analytics yet" text="Run a prediction to populate the analytics workspace." />}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">RECENT ACTIVITY</p><h2>Latest predictions</h2></div>
            <Activity size={18} />
          </div>
          {history.length ? history.slice(0, 5).map((item) => (
            <div className="activity-row" key={item.id}>
              <span className={item.churn_prediction ? "status-dot high" : "status-dot low"} />
              <div><strong>{item.id}</strong><small>{item.customer.Contract} · {item.customer.Tenure_Months} months</small></div>
              <b>{(item.churn_probability * 100).toFixed(1)}%</b>
            </div>
          )) : <EmptyState title="Nothing recorded" text="Your recent model runs will appear here." />}
        </section>
      </div>

      <div className="disclaimer-card">
        <ShieldCheck size={18} />
        <div><strong>Analytics scope</strong><p>These metrics summarize predictions persisted by the ChurnGuard API in PostgreSQL. They are not a live view of the telecom customer database.</p></div>
      </div>
    </div>
  );
}

function CustomersView({
  history,
  onNewPrediction,
}: {
  history: PredictionRecord[];
  onNewPrediction: () => void;
}) {
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p className="eyebrow">CUSTOMER WORKSPACE</p>
          <h1>Prediction history.</h1>
          <p className="lead">Saved customer profiles and their latest model decisions.</p>
        </div>
        <button className="secondary-button" onClick={onNewPrediction}>New prediction <ArrowRight size={16} /></button>
      </div>

      <section className="table-panel">
        <div className="table-toolbar"><div><strong>{history.length} saved profiles</strong><span>Stored in production PostgreSQL</span></div></div>
        {history.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Contract</th><th>Tenure</th><th>Monthly</th><th>Probability</th><th>Decision</th></tr></thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong><small>{item.customer.Internet_Service} · {item.customer.Payment_Method}</small></td>
                    <td>{item.customer.Contract}</td>
                    <td>{item.customer.Tenure_Months} mo</td>
                    <td>₹{item.customer.Monthly_Charges.toFixed(2)}</td>
                    <td><strong>{(item.churn_probability * 100).toFixed(1)}%</strong></td>
                    <td><span className={`table-status ${item.churn_prediction ? "high" : "low"}`}>{item.churn_prediction ? "Churn" : "No churn"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No customer predictions yet" text="Generate your first prediction to create a persistent customer record." />}
      </section>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-page"><div className="empty-icon"><Users size={20} /></div><h3>{title}</h3><p>{text}</p></div>;
}

export default function App() {
  const [view, setView] = useState<View>("prediction");
  const [customer, setCustomer] = useState<CustomerData>(defaults);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkspace() {
      setDataLoading(true);
      const online = await checkHealth();
      setApiOnline(online);
      if (online) {
        try {
          const [predictions, analyticsData] = await Promise.all([
            getPredictions(),
            getAnalytics(),
          ]);
          setHistory(predictions);
          setAnalytics(analyticsData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to load persisted prediction data.");
        }
      }
      setDataLoading(false);
    }
    void loadWorkspace();
  }, []);

  async function refreshWorkspace() {
    const [predictions, analyticsData] = await Promise.all([
      getPredictions(),
      getAnalytics(),
    ]);
    setHistory(predictions);
    setAnalytics(analyticsData);
  }

  const riskPercent = result ? result.churn_probability * 100 : 0;
  const riskClass = result && riskPercent >= result.threshold * 100 ? "high" : "low";

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
      const prediction = await predictChurn(customer);
      setResult(prediction);
      await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the prediction service.");
    } finally {
      setLoading(false);
    }
  }

  function navigate(nextView: View) {
    setView(nextView);
    setError("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><ShieldCheck size={22} /></div><div><strong>ChurnGuard</strong><span>Retention Intelligence</span></div></div>
        <nav>
          <button className={view === "prediction" ? "active" : ""} onClick={() => navigate("prediction")}><Activity size={18} /> Prediction</button>
          <button className={view === "analytics" ? "active" : ""} onClick={() => navigate("analytics")}><TrendingUp size={18} /> Analytics</button>
          <button className={view === "customers" ? "active" : ""} onClick={() => navigate("customers")}><Users size={18} /> Customers</button>
        </nav>
        <div className="sidebar-card"><Sparkles size={17} /><div><strong>ML-powered</strong><p>Gradient Boosting inference with a configurable 0.35 decision threshold.</p></div></div>
        <div className="api-status"><span className={apiOnline ? "dot online" : apiOnline === false ? "dot offline" : "dot"} /> API {apiOnline ? "connected" : apiOnline === false ? "offline" : "checking"}</div>
      </aside>

      <main className="main">
        {view === "prediction" ? (
          <>
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
                      <div className={`risk-ring ${riskClass}`} style={{ "--risk": `${riskPercent * 3.6}deg` } as CSSProperties}><div><strong>{riskPercent.toFixed(1)}%</strong><span>churn probability</span></div></div>
                      <div className={`risk-badge ${riskClass}`}>{result.churn_label === "Yes" ? "Higher risk" : "Lower risk"}</div>
                      <p className="result-message">{riskMessage}</p>
                      <div className="metric-row"><span>Decision threshold</span><strong>{(result.threshold * 100).toFixed(0)}%</strong></div>
                      <div className="metric-row"><span>Model decision</span><strong>{result.churn_prediction === 1 ? "Churn" : "No churn"}</strong></div>
                      <div className="result-actions"><button className="secondary-button" onClick={() => navigate("customers")}>View saved profile <ArrowRight size={15} /></button></div>
                    </>
                  ) : (
                    <div className="empty-result"><div className="empty-icon"><Wifi size={22} /></div><h3>Ready for analysis</h3><p>Your prediction will appear here with the probability, threshold and model decision.</p></div>
                  )}
                </div>
                <div className="info-card"><div className="info-icon"><ShieldCheck size={18} /></div><div><strong>Decision support, not a decision maker</strong><p>The score is a predictive signal based on learned historical associations. It does not establish causality.</p></div></div>
              </aside>
            </div>
          </>
        ) : view === "analytics" ? (
          dataLoading ? (
            <div className="page-stack"><div className="empty-page"><div className="empty-icon"><Activity size={20} /></div><h3>Loading analytics</h3><p>Fetching persisted prediction data from PostgreSQL.</p></div></div>
          ) : (
            <AnalyticsView history={history} analytics={analytics} />
          )
        ) : (
          dataLoading ? (
            <div className="page-stack"><div className="empty-page"><div className="empty-icon"><Users size={20} /></div><h3>Loading customers</h3><p>Fetching persisted prediction history from PostgreSQL.</p></div></div>
          ) : (
            <CustomersView history={history} onNewPrediction={() => navigate("prediction")} />
          )
        )}
      </main>
    </div>
  );
}
