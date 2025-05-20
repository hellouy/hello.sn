import React, { useState } from "react";
import ResultCard from "../components/ResultCard";
import parseWhois from "../utils/parseWhois";

function validateDomain(domain) {
  // 只允许类似 example.com 这种域名
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain.trim());
}

export default function Home() {
  const [domain, setDomain] = useState("");
  const [protocol, setProtocol] = useState("auto");
  const [customServer, setCustomServer] = useState("");
  const [showCustomServer, setShowCustomServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const onQuery = async () => {
    setError("");
    setResult(null);
    const dom = domain.trim().toLowerCase().replace(/^www\./, "");
    if (!validateDomain(dom)) {
      setError("请输入合法的域名，例如：example.com");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: dom,
          protocol: protocol === "auto" ? undefined : protocol,
          customServer: customServer.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data || !data.raw) throw new Error(data.error || "查询失败");
      const parsed = parseWhois(data.raw);
      setResult(parsed);
      setHistory(h => [{ domain: dom, protocol: data.protocol, raw: data.raw }, ...h.filter(i => i.domain !== dom)].slice(0, 5));
    } catch (e) {
      setError(e.message || "查询异常");
    }
    setLoading(false);
  };

  return (
    <div className="main-container" style={{ marginTop: 16, marginBottom: 16 }}>
      <h1 style={{
        fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center", letterSpacing: 1, color: "#19307A"
      }}>
        域名查询工具
      </h1>
      <div style={{ fontSize: 17, color: "#34495e", textAlign: "center", marginBottom: 14 }}>
        输入要查询的域名，获取详细信息（RDAP + WHOIS）
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!loading) onQuery();
        }}
        style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="请输入域名，如 example.com"
            style={{
              flex: 1, minWidth: 0, padding: "8px", fontSize: 16, border: "1px solid #ccc", borderRadius: 6
            }}
            autoFocus
            inputMode="url"
            autoComplete="off"
          />
          <select
            value={protocol}
            onChange={e => setProtocol(e.target.value)}
            style={{ padding: "8px", fontSize: 16, border: "1px solid #ccc", borderRadius: 6 }}
          >
            <option value="auto">自动选择协议</option>
            <option value="whois">WHOIS</option>
            <option value="rdap">RDAP</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2469f7",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            查询
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            style={{
              background: "#eee",
              border: "none",
              borderRadius: 5,
              padding: "4px 10px",
              fontSize: 13,
              cursor: "pointer"
            }}
            onClick={() => setShowCustomServer(v => !v)}
          >
            {showCustomServer ? "收起自定义Whois服务器" : "自定义Whois服务器"}
          </button>
        </div>
        {showCustomServer && (
          <div style={{ marginTop: 8 }}>
            <input
              value={customServer}
              onChange={e => setCustomServer(e.target.value)}
              placeholder="可选：自定义Whois服务器地址"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: 15,
                border: "1px solid #ccc",
                borderRadius: 6,
                marginTop: 4,
              }}
            />
          </div>
        )}
      </form>
      <div style={{
        fontSize: 15, background: "#f8fafc", borderRadius: 8, color: "#345", padding: "10px 14px", margin: "0 0 10px 0"
      }}>
        支持查询全球常见顶级域名：.com, .net, .org, .cn, .io 等<br />
        输入格式：example.com（无需加http://或www.）<br />
        自动选择协议：优先使用RDAP，失败后自动切换到WHOIS
      </div>

      {history.length > 0 &&
        <div style={{ margin: "18px 0 10px 0" }}>
          <div style={{ fontWeight: 600, color: "#19307A", marginBottom: 6, fontSize: 15 }}>
            <span role="img" aria-label="history">🔍</span> 最近查询：
          </div>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {history.map((h, i) =>
              <li key={i} style={{ fontSize: 15, marginBottom: 3, color: "#345" }}>
                {h.domain}
                <span style={{
                  background: "#e6f0fa", color: "#356af3", borderRadius: 4, padding: "1px 8px", fontSize: 12, marginLeft: 7
                }}>
                  {h.protocol ? h.protocol.toUpperCase() + " 协议" : "自动"}
                </span>
                <button
                  style={{
                    marginLeft: 10, fontSize: 12, color: "#2469f7", background: "none",
                    border: "none", cursor: "pointer", padding: 0
                  }}
                  onClick={() => {
                    setDomain(h.domain);
                    setResult(parseWhois(h.raw));
                  }}
                >显示</button>
              </li>
            )}
          </ul>
        </div>
      }

      {error && <div style={{ color: "#e74c3c", margin: "10px 0", fontWeight: 600 }}>{error}</div>}
      {result && <ResultCard data={result} />}
    </div>
  );
}
