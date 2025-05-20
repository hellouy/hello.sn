import React from "react";
import { FaSyncAlt } from "react-icons/fa";

export default function DomainForm({
  domain,
  setDomain,
  protocol,
  setProtocol,
  onQuery,
  loading,
  customServer,
  setCustomServer,
  showCustomServer,
  setShowCustomServer,
  onRefresh
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onQuery();
      }}
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="请输入域名，如 example.com"
          style={{
            flex: 1, minWidth: 0, padding: "8px", fontSize: 16, border: "1px solid #ccc", borderRadius: 6
          }}
          autoFocus
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
        {/* 刷新按钮统一风格 */}
        <button
          type="button"
          onClick={onRefresh}
          style={{
            background: "#f7f7f7",
            color: "#2469f7",
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
        >
          <FaSyncAlt style={{ marginRight: 6 }} />
          刷新
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
  );
}
