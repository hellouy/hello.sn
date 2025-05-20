import React, { useState } from "react";

export default function DomainForm({ onSearch, loading }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", marginBottom: 18 }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入域名，例如 whois.com"
        style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        disabled={loading}
      />
      <button
        type="submit"
        style={{
          marginLeft: 8, padding: "8px 28px", fontSize: 16,
          background: "#222", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer"
        }}
        disabled={loading}
      >查询</button>
    </form>
  );
}
