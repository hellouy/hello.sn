import React from "react";
import {
  FaServer,
  FaCalendarAlt,
  FaInfoCircle,
  FaGlobe,
  FaKey,
  FaRegFlag
} from "react-icons/fa";

export default function ResultCard({ data, registered }) {
  if (!data) return null;
  const {
    domain,
    registrar,
    created,
    expiry,
    updated,
    status,
    dns,
    raw
  } = data;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 10px #f1f2f7",
        padding: "18px 14px 14px 14px",
        marginTop: 12,
        wordBreak: "break-all"
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 21, marginBottom: 8, color: "#1a237e", display: "flex", alignItems: "center" }}>
        <FaGlobe style={{ marginRight: 8, color: "#2469f7" }} />
        {domain || <span style={{ color: "#aaa" }}>未能识别域名</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaServer style={{ marginRight: 4, color: "#49b" }} />
        WHOIS服务器: {registrar ? registrar : <span style={{ color: "#aaa" }}>whois.nic.bn</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaCalendarAlt style={{ marginRight: 4, color: "#2a9d8f" }} />
        创建时间: {created || <span style={{ color: "#aaa" }}>-</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaRegFlag style={{ marginRight: 4, color: "#e76f51" }} />
        到期时间: {expiry || <span style={{ color: "#aaa" }}>-</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaCalendarAlt style={{ marginRight: 4, color: "#8d37ff" }} />
        更新时间: {updated || <span style={{ color: "#aaa" }}>-</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaInfoCircle style={{ marginRight: 4, color: "#f39c12" }} />
        状态: {registered === false
          ? <span style={{ color: "#E76F51" }}>未注册</span>
          : <span style={{ color: "#2A9D8F" }}>已注册</span>}
      </div>
      <div style={{ marginBottom: 4, color: "#444", fontSize: 15 }}>
        <FaKey style={{ marginRight: 4, color: "#00aaff" }} />
        DNS服务器:
        {dns && dns.length > 0
          ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {dns.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          ) : <span style={{ color: "#aaa" }}> - </span>}
      </div>
      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: "pointer", color: "#2469f7", fontWeight: 600, fontSize: 15 }}>
          查看原始数据
        </summary>
        <pre style={{ marginTop: 8, fontSize: 13, background: "#f8f8fa", borderRadius: 8, padding: 10 }}>
          {raw}
        </pre>
      </details>
    </div>
  );
}
