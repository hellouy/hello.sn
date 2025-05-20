import React, { useState } from "react";
import parseWhois from "../utils/parseWhois";
import ResultCard from "../components/ResultCard";
import DomainForm from "../components/DomainForm";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [protocol, setProtocol] = useState("auto");
  const [customServer, setCustomServer] = useState("");
  const [showCustomServer, setShowCustomServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // 查询请求
  const onQuery = async () => {
    setError("");
    setResult(null);
    const domainTrimmed = domain.trim();
    if (!domainTrimmed) {
      setError("请输入要查询的域名");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domainTrimmed,
          protocol: protocol === "auto" ? undefined : protocol,
          customServer: customServer.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data || !data.raw) throw new Error(data.error || "查询失败");
      const parsed = parseWhois(data.raw);
      setResult(parsed);
      setHistory(h => [{ domain: domainTrimmed, protocol: data.protocol, raw: data.raw }, ...h.slice(0, 4)]);
    } catch (e) {
      setError(e.message || "查询异常");
    }
    setLoading(false);
  };

  return (
    <div className="main-container" style={{ marginTop: 18, marginBottom: 18 }}>
      <h1 style={{
        fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center", letterSpacing: 1, color: "#19307A"
      }}>
        域名查询工具
      </h1>
      <div style={{ fontSize: 17, color: "#34495e", textAlign: "center", marginBottom: 14 }}>
        输入要查询的域名，获取详细信息（RDAP + WHOIS）
      </div>
      <DomainForm
        domain={domain}
        setDomain={setDomain}
        protocol={protocol}
        setProtocol={setProtocol}
        onQuery={onQuery}
        loading={loading}
        customServer={customServer}
        setCustomServer={setCustomServer}
        showCustomServer={showCustomServer}
        setShowCustomServer={setShowCustomServer}
      />
      <div style={{
        fontSize: 15, background: "#f8fafc", borderRadius: 8, color: "#345", padding: "10px 14px", margin: "0 0 10px 0"
      }}>
        支持查询全球常见顶级域名：.com, .net, .org, .cn, .io 等<br />
        输入格式：example.com（无需加http://或www.）<br />
        自动选择协议：优先使用RDAP，失败后自动切换到WHOIS
      </div>

      {/* 历史记录仅当前会话 */}
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

      {/* 查询结果 */}
      {error && <div style={{ color: "#e74c3c", margin: "10px 0", fontWeight: 600 }}>{error}</div>}
      {result && <ResultCard data={result} />}
    </div>
  );
}
