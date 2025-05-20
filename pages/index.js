import React, { useState } from "react";
import parseWhois from "../utils/parseWhois";

function validateDomain(domain) {
  return /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(domain.trim());
}

const exampleHint = "example.com（无需加http://或www.）";

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
    <div className="page-bg">
      <div className="card">
        <div className="header">
          <span className="title">域名查询工具</span>
        </div>
        <div className="desc">输入要查询的域名，获取详细信息（RDAP + WHOIS）</div>
        <form
          className="form"
          onSubmit={e => {
            e.preventDefault();
            if (!loading) onQuery();
          }}
        >
          <input
            className="domain-input"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="请输入域名，如 example.com"
            autoFocus
            inputMode="url"
            autoComplete="off"
          />
          <div className="select-row">
            <select
              className="protocol-select"
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
            >
              <option value="auto">自动选择协议</option>
              <option value="whois">WHOIS</option>
              <option value="rdap">RDAP</option>
            </select>
            <button className="query-btn" type="submit" disabled={loading}>
              查询
            </button>
          </div>
          <button
            type="button"
            className="custom-btn"
            onClick={() => setShowCustomServer(v => !v)}
          >
            {showCustomServer ? "收起自定义Whois服务器" : "自定义Whois服务器"}
          </button>
          {showCustomServer && (
            <input
              className="custom-server"
              value={customServer}
              onChange={e => setCustomServer(e.target.value)}
              placeholder="可选：自定义Whois服务器地址"
            />
          )}
        </form>
        <div className="hint-block">
          支持查询全球常见顶级域名：.com, .net, .org, .cn, .io 等<br />
          输入格式：{exampleHint}<br />
          自动选择协议：优先使用RDAP，失败后自动切换到WHOIS
        </div>
        {history.length > 0 && (
          <div className="history-block">
            <div className="history-title">
              <span role="img" aria-label="history">🔍</span> 最近查询：
            </div>
            <ul className="history-list">
              {history.map((h, i) =>
                <li key={i} className="history-item">
                  {h.domain}
                  <span className="history-proto">
                    {h.protocol ? h.protocol.toUpperCase() + " 协议" : "自动"}
                  </span>
                  <button
                    className="history-show"
                    onClick={() => {
                      setDomain(h.domain);
                      setResult(parseWhois(h.raw));
                    }}
                  >显示</button>
                </li>
              )}
            </ul>
          </div>
        )}
        {error && <div className="error-block">{error}</div>}
        {result && (
          <div className="result-block">
            <div className="result-row">
              <span className="result-label">域名：</span>
              <span className="result-value">{result.domain || "-"}</span>
            </div>
            <div className="result-row">
              <span className="result-label">注册商：</span>
              <span className="result-value">{result.registrar || "-"}</span>
            </div>
            <div className="result-row">
              <span className="result-label">创建时间：</span>
              <span className="result-value">{result.created || "-"}</span>
            </div>
            <div className="result-row">
              <span className="result-label">到期时间：</span>
              <span className="result-value">{result.expiry || "-"}</span>
            </div>
            <div className="result-row">
              <span className="result-label">状态：</span>
              <span className="result-value">{result.status || "-"}</span>
            </div>
            <div className="result-row">
              <span className="result-label">DNS服务器：</span>
              <span className="result-value">{result.dns && result.dns.length
                ? result.dns.join(" | ") : "-"}</span>
            </div>
            <details className="raw-details">
              <summary>查看原始数据</summary>
              <div className="raw-box"><pre>{result.raw}</pre></div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
