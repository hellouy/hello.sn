import React, { useState } from "react";
import { FaUser, FaServer, FaCalendarAlt, FaInfoCircle, FaGlobe, FaKey } from "react-icons/fa";

const iconStyle = { color: "#506080", minWidth: 18, marginRight: 6, verticalAlign: "middle" };
function InfoItem({ icon, label, value }) {
  if (!value || value === "--") return null;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 10, fontSize: 15 }}>
      <span style={iconStyle}>{icon}</span>
      <span style={{ color: "#506080", marginRight: 5, minWidth: 62 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function ResultCard({ domain, whois, rdap, whoisParsed, registered }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 8px #f0f1f2",
      padding: 22,
      marginTop: 16
    }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{domain}
        {registered === true && <span style={{ color: "#19be6b", fontWeight: 600, marginLeft: 10 }}>已注册</span>}
        {registered === false && <span style={{ color: "#ff4d4f", fontWeight: 600, marginLeft: 10 }}>未注册</span>}
      </div>
      <InfoItem icon={<FaGlobe />} label="注册商" value={whoisParsed?.registrar} />
      <InfoItem icon={<FaUser />} label="注册人" value={whoisParsed?.registrant} />
      <InfoItem icon={<FaCalendarAlt />} label="注册日期" value={whoisParsed?.creation} />
      <InfoItem icon={<FaCalendarAlt />} label="到期日期" value={whoisParsed?.expiry} />
      <InfoItem icon={<FaInfoCircle />} label="状态" value={whoisParsed?.status} />
      {Array.isArray(whoisParsed?.ns) && whoisParsed.ns.length > 0 && (
        <div style={{ margin: "8px 0" }}>
          <div style={{ color: "#506080", fontSize: 15, marginBottom: 2, display: "flex", alignItems: "center" }}>
            <FaKey style={iconStyle} /> 名称服务器
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6 }}>
            {whoisParsed.ns.map((n, i) => <div key={i}>{n}</div>)}
          </div>
        </div>
      )}
      {/* 原始数据按钮 */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowRaw(!showRaw)}
          style={{
            background: "#f5f6fa",
            color: "#2b5cff",
            border: "none",
            borderRadius: 6,
            padding: "5px 14px",
            fontSize: 14,
            cursor: "pointer"
          }}>
          {showRaw ? "关闭原始数据" : "查看原始数据"}
        </button>
      </div>
      {showRaw && (
        <div style={{
          background: "#f9f9f9",
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: "#333",
          marginTop: 8,
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
          border: "1px solid #eee"
        }}>
          {whois || "无原始数据"}
        </div>
      )}
    </div>
  );
}
