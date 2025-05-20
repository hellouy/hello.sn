import React, { useState } from "react";
import DomainForm from "../components/DomainForm";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(domain) {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`/api/query?domain=${encodeURIComponent(domain)}`);
      const data = await resp.json();
      setResult(data);
    } catch {
      setResult({ error: "查询失败" });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 470, margin: "40px auto", padding: 18 }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 20 }}>域名查询工具</h2>
      <DomainForm onSearch={handleSearch} loading={loading} />
      {loading && <Loader />}
      {result && !result.error && <ResultCard {...result} />}
      {result && result.error && <div style={{ color: "red", marginTop: 16 }}>{result.error}</div>}
      <div style={{ marginTop: 30, color: "#bbb", fontSize: 13, textAlign: "center" }}>
        Powered by Whois/RDAP | <a href="https://github.com/hellouy" target="_blank">GitHub</a>
      </div>
    </div>
  );
}
