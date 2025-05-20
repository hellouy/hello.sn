import React from "react";
export default function ProtocolTabs({ protocol, onSwitch }) {
  return (
    <div style={{ display: "flex", marginBottom: 16, alignItems: "center" }}>
      <button
        onClick={() => onSwitch("rdap")}
        style={{
          background: protocol === "rdap" ? "#131f3c" : "#f7f7f7",
          color: protocol === "rdap" ? "#fff" : "#7b8499",
          fontWeight: protocol === "rdap" ? 700 : 400,
          border: "none",
          borderRadius: "16px",
          padding: "6px 18px",
          fontSize: 15,
          marginRight: 12,
          cursor: "pointer"
        }}
      >RDAP 协议</button>
      <span style={{ color: "#acb1bd", fontSize: 15 }}>使用了{protocol === "rdap" ? "RDAP" : "WHOIS"}协议查询</span>
    </div>
  );
}
