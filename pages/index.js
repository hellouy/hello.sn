import React, { useState, useRef } from "react";
import DomainForm from "../components/DomainForm";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [customServer, setCustomServer] = useState("");
  const [showCustomServer, setShowCustomServer] = useState(false);
  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);

  async function handleSearch(searchDomain = domain) {
    const trimmed = (searchDomain || "").trim().toLowerCase();
    if (!trimmed || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed)) {
      setResult({ error: "请输入正确格式的域名" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let url = `/api/query?domain=${encodeURIComponent(trimmed)}`;
      if (customServer) url += `&server=${encodeURIComponent(customServer)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.error) throw data;
      setResult(data);
      if (!historyRef.current.includes(trimmed)) {
        const newHistory = [trimmed, ...historyRef.current].slice(0, 8);
        historyRef.current = newHistory;
        setHistory(newHistory);
      }
    } catch (e) {
      setResult({ error: e.error || e.message || "查询失败", detail: e.detail });
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
    <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 470, margin: "20px auto 0 auto", padding: 0 }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 10px #f1f2f7",
          padding: "28px 22px 24px 22px",
          marginBottom: 20,
          position: "relative"
        }}>
          <h2 style={{
            fontWeight: 700,
            fontSize: 32,
            margin: 0,
            color: "#212a3a",
            letterSpacing: 1
          }}>域名查询工具</h2>
          <div style={{ fontSize: 17, color: "#6a7587", margin: "16px 0 24px 0", fontWeight: 500, letterSpacing: 0.2 }}>
            输入要查询的域名，获取详细信息（RDAP + WHOIS）
          </div>
          <DomainForm
            domain={domain}
            setDomain={setDomain}
            onQuery={() => handleSearch(domain)}
            loading={loading}
            customServer={customServer}
            setCustomServer={setCustomServer}
            showCustomServer={showCustomServer}
            setShowCustomServer={setShowCustomServer}
            onRefresh={handleRefresh}
          />
          <div style={{
            background: "#f6f8fa",
            borderRadius: 12,
            padding: "14px 13px",
            color: "#5c667b",
            fontSize: 15,
            margin: "0 0 6px 0"
          }}>
            支持查询全球常见顶级域名：.com, .net, .org, .cn, .io 等<br />
            输入格式：example.com（无需添加http://或www.）
          </div>
        </div>

        {history.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 10px #f1f2f7",
            padding: "18px 18px 12px 18px",
            marginBottom: 18
          }}>
            <div style={{ fontSize: 15, color: "#7b8ba0", marginBottom: 8 }}>
              <span role="img" aria-label="search" style={{ fontSize: 17, marginRight: 2 }}>🔍</span>
              最近查询：
              {history.map((h) => (
                <span key={h} style={{ margin: "0 10px 0 4px", fontWeight: 600, color: "#212a3a" }}>
                  <span
                    style={{ cursor: "pointer", color: "#2469f7", textDecoration: "underline", fontWeight: 500 }}
                    onClick={() => handleHistoryClick(h)}
                  >{h}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: 8
          }}>
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
              <svg style={{ marginRight: 6 }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 10a7.5 7.5 0 0113.06-4.45l.94-1.45A9 9 0 103 10h2zm14-7v6h-6l2.21-2.21A6.47 6.47 0 002.5 10h2A4.5 4.5 0 1116.5 10h2A6.47 6.47 0 0016.5 3.8z" fill="#2469f7"/></svg>
              刷新
            </button>
          </div>
          {loading && <Loader />}
          {result && !result.error && (
            <ResultCard
              data={result.whoisParsed || result.rdap || result.whois || result}
              registered={result.registered}
              protocol={result.protocol}
              rawWhois={result.whois}
              rdap={result.rdap}
              fullResult={result}
            />
          )}
          {result && result.error && (
            <div style={{ color: "red", marginTop: 16, fontWeight: 600, fontSize: 18 }}>
              {result.error}
              {result.detail && (
                <pre style={{ color: "#a33", fontSize: 13, marginTop: 4, whiteSpace: "pre-wrap" }}>{result.detail}</pre>
              )}
            </div>
          )}
          {/* 调试用 */}
          {/* {result && <pre style={{fontSize:12, color:'#777', marginTop:16}}>{JSON.stringify(result, null, 2)}</pre>} */}
        </div>

        <div style={{ marginTop: 40, color: "#bbb", fontSize: 13, textAlign: "center" }}>
          Powered by Whois/RDAP | <a href="https://github.com/hellouy" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </div>
  );
}
