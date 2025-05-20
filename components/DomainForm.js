import React from "react";

export default function DomainForm({
  domain,
  setDomain,
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
      style={{ marginBottom: 0, marginTop: -8 }}
    >
      <div style={{ marginBottom: 15 }}>
        <input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="Whois.com"
          style={{
            width: "100%",
            padding: "13px 15px",
            fontSize: 18,
            border: "1.5px solid #e7eaf0",
            borderRadius: 8,
            background: "#fff",
            fontWeight: 500,
            color: "#2a3957",
            boxShadow: "none"
          }}
          autoFocus
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#131f3c",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 0",
            fontWeight: 700,
            fontSize: 18,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            letterSpacing: 1
          }}
        >
          查询
        </button>
      </div>
      <div style={{ marginBottom: 10, color: "#6a7587", fontSize: 15, textAlign: "left" }}>
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
