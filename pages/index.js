import React, { useState, useRef } from "react";
import DomainForm from "../components/DomainForm";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";
import ProtocolTabs from "../components/ProtocolTabs";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState("auto");
  const [domain, setDomain] = useState("");
  const [customServer, setCustomServer] = useState("");
  const [showCustomServer, setShowCustomServer] = useState(false);

  // 最近查询历史仅存在内存中，页面刷新即清空
  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);

  async function handleSearch(searchDomain = domain) {
    if (!searchDomain) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`/api/query?domain=${encodeURIComponent(searchDomain)}`);
      const data = await resp.json();
      setResult(data);
      // 新增历史，去重
      if (!historyRef.current.includes(searchDomain)) {
        const newHistory = [searchDomain, ...historyRef.current].slice(0, 8);
        historyRef.current = newHistory;
        setHistory(newHistory);
      }
    } catch {
      setResult({ error: "查询失败" });
    }
    setLoading(false);
  }

  function handleHistoryClick(h) {
    setDomain(h);
    handleSearch(h);
  }

  function handleRefresh() {
    handleSearch(domain);
  }

  return (
    <div style={{ maxWidth: 470, margin: "40px auto", padding: 18 }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 20 }}>域名查询工具</h2>
      <DomainForm
        domain={domain}
        setDomain={setDomain}
        protocol={protocol}
        setProtocol={setProtocol}
        onQuery={() => handleSearch(domain)}
        loading={loading}
        customServer={customServer}
        setCustomServer={setCustomServer}
        showCustomServer={showCustomServer}
        setShowCustomServer={setShowCustomServer}
        onRefresh={handleRefresh}
      />
      {/* 最近查询记录 */}
      {history.length > 0 && (
        <div style={{ margin: "12px 0 0 0", fontSize: 14, color: "#888" }}>
          <span role="img" aria-label="search">🔍</span> 最近查询：
          {history.map(h => (
            <span
              key={h}
              style={{
                margin: "0 8px 0 0",
                cursor: "pointer",
                color: "#2469f7",
                textDecoration: "underline"
              }}
              onClick={() => handleHistoryClick(h)}
            >
              {h}
            </span>
          ))}
        </div>
      )}
      <ProtocolTabs protocol={protocol} onSwitch={setProtocol} />
      {/* 刷新按钮 */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 }}>
        <button
          type="button"
          onClick={handleRefresh}
          style={{
            background: "#f7f7f7",
            color: "#2469f7",
            border: "none",
            outline: "none",
            borderRadius: 16,
            padding: "3px 18px",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            {/* 统一风格刷新图标 */}
            <svg style={{ marginRight: 6 }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 10a7.5 7.5 0 0113.06-4.45l.94-1.45A9 9 0 103 10h2zm14-7v6h-6l2.21-2.21A6.47 6.47 0 002.5 10h2A4.5 4.5 0 1116.5 10h2A6.47 6.47 0 0016.5 3.8z" fill="#2469f7"/></svg>
            刷新
          </span>
        </button>
      </div>
      {loading && <Loader />}
      {result && !result.error && (
        <ResultCard data={result.whoisParsed} registered={result.registered} />
      )}
      {result && result.error && (
        <div style={{ color: "red", marginTop: 16 }}>{result.error}</div>
      )}
      <div style={{ marginTop: 30, color: "#bbb", fontSize: 13, textAlign: "center" }}>
        Powered by Whois/RDAP | <a href="https://github.com/hellouy" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
  );
}
