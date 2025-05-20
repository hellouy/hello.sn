import React, { useState } from "react";
import DomainForm from "../components/DomainForm";
import ResultCard from "../components/ResultCard";
import ProtocolTabs from "../components/ProtocolTabs";
import Loader from "../components/Loader";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState("rdap");
  const [whoisServer, setWhoisServer] = useState("");

  async function handleSearch(domain, customWhoisServer) {
    setLoading(true);
    setResult(null);
    const url = `/api/query?domain=${encodeURIComponent(domain)}&protocol=${protocol}&whoisServer=${encodeURIComponent(customWhoisServer||"")}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      setResult(data);
    } catch {
      setResult({ error: "查询失败" });
    }
    setLoading(false);
  }

  function handleProtocolSwitch(p) {
    setProtocol(p);
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 18 }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 20 }}>域名查询工具</h2>
      <ProtocolTabs protocol={protocol} onSwitch={handleProtocolSwitch} />
      <DomainForm onSearch={handleSearch} loading={loading} whoisServer={whoisServer} setWhoisServer={setWhoisServer} />
      {loading && <Loader />}
      {result && !result.error &&
        <ResultCard
          {...result}
          protocol={protocol}
          onProtocolSwitch={handleProtocolSwitch}
          onRefresh={() => handleSearch(result.domain, whoisServer)}
          loading={loading}
        />}
      {result && result.error && <div style={{ color: "red", marginTop: 16 }}>{result.error}</div>}
      <div style={{ marginTop: 30, color: "#bbb", fontSize: 13, textAlign: "center" }}>
        Powered by Whois/RDAP | <a href="https://github.com/hellouy" target="_blank">GitHub</a>
      </div>
    </div>
  );
}
