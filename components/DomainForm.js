import React, { useState } from "react";

export default function DomainForm({ onSearch, loading, whoisServer, setWhoisServer }) {
  const [input, setInput] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim(), whoisServer);
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", marginBottom: 18, gap: 8 }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入域名"
        style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        disabled={loading}
      />
      <input
        type="text"
        value={whoisServer || ""}
        onChange={e => setWhoisServer(e.target.value)}
        placeholder="自定义WHOIS服务器(可选)"
        style={{ width: 190, fontSize: 15, padding: 8, borderRadius: 6, border: "1px solid #eee" }}
        disabled={loading}
      />
      <button
        type="submit"
        style={{
          padding: "8px 17px", fontSize: 16,
          background: "#222", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer"
        }}
        disabled={loading}
      >查询</button>
    </form>
  );
}
