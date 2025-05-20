import React from "react";
export default function RawTabs({ showRaw, setShowRaw }) {
  return (
    <div style={{ display: "flex", marginTop: 18, marginBottom: 8 }}>
      <button
        onClick={() => setShowRaw(true)}
        style={{
          flex: 1,
          background: showRaw ? "#f7fafe" : "#fff",
          border: "1px solid #e2e9f6",
          borderBottom: showRaw ? "2px solid #3988ff" : "1px solid #e2e9f6",
          color: "#222",
          fontWeight: showRaw ? 700 : 400,
          borderRadius: "8px 8px 0 0",
          padding: "7px 0",
          cursor: "pointer"
        }}>原始数据</button>
      <button
        onClick={() => setShowRaw(false)}
        style={{
          flex: 1,
          background: !showRaw ? "#f7fafe" : "#fff",
          border: "1px solid #e2e9f6",
          borderBottom: !showRaw ? "2px solid #3988ff" : "1px solid #e2e9f6",
          color: "#222",
          fontWeight: !showRaw ? 700 : 400,
          borderRadius: "8px 8px 0 0",
          padding: "7px 0",
          cursor: "pointer"
        }}>查询信息</button>
    </div>
  );
}
