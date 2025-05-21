import React, { useState } from "react";
import {
  FaServer,
  FaCalendarAlt,
  FaInfoCircle,
  FaGlobe,
  FaKey,
  FaRegFlag,
  FaUser
} from "react-icons/fa";

// 时间剩余友好显示
function getRemain(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const end = new Date(dateStr);
  if (isNaN(end.getTime())) return "";
  let months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  if (end.getDate() < now.getDate()) months--;
  let years = Math.floor(months / 12);
  let ms = end - now;
  if (ms < 0) return "(已过期)";
  if (years > 0) return `(剩余 ${years}年${months % 12}个月)`;
  if (months > 0) return `(剩余 ${months}个月)`;
  return "";
}

export default function ResultCard({
  data,
  protocol, // "rdap" | "whois"
  usedProtocol, // "rdap" | "whois"
  registered
}) {
  const [tab, setTab] = useState("raw");
  if (!data) return null;

  // 展示字段
  const {
    domain = "",
    registrar = "",
    created = "",
    expiry = "",
    updated = "",
    status = "",
    dns = [],
    registrant = "",
    raw,
    rdap,
  } = data;

  // 顶部注册状态
  const statusTag = registered
    ? <span style={{
        background: "#14c972",
        color: "#fff",
        fontWeight: 600,
        borderRadius: 16,
        fontSize: 16,
        padding: "3px 18px",
        marginLeft: 12,
        verticalAlign: "middle",
        display: "inline-block"
      }}>已注册</span>
    : <span style={{
        background: "#f4e2e5",
        color: "#e44",
        fontWeight: 600,
        borderRadius: 16,
        fontSize: 16,
        padding: "3px 18px",
        marginLeft: 12,
        verticalAlign: "middle",
        display: "inline-block"
      }}>未注册</span>;

  // 协议标签
  const protocolTitle = usedProtocol === "rdap" ? "RDAP 协议" : "WHOIS 协议";
  const protocolDesc = usedProtocol === "rdap" ? "使用了RDAP协议查询" : "使用了WHOIS协议查询";

  // 友好格式化
  function field(label, value, extra, icon, vertical = false) {
    return (
      <div style={{
        display: "flex",
        alignItems: vertical ? "flex-start" : "center",
        fontSize: 16,
        color: "#222",
        marginBottom: 14
      }}>
        {icon && <span style={{ marginRight: 10, marginTop: vertical ? 2 : 0 }}>{icon}</span>}
        <span style={{ minWidth: 72, color: "#7c7d88" }}>{label}</span>
        <span style={{ fontWeight: 500, wordBreak: "break-all" }}>{value || <span style={{ color: "#bbb" }}>未知</span>}</span>
        {extra && <span style={{ marginLeft: 8, color: "#888", fontSize: 15 }}>{extra}</span>}
      </div>
    );
  }

  return (
    <div>
      {/* 协议与刷新 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span style={{
            background: usedProtocol === "rdap" ? "#131f3c" : "#f5f5f7",
            color: usedProtocol === "rdap" ? "#fff" : "#7c7d88",
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 16,
            padding: "5px 18px",
            marginRight: 10,
            display: "inline-block"
          }}>
            {protocolTitle}
          </span>
          <span style={{
            color: "#9a9cab",
            fontSize: 15,
            fontWeight: 400
          }}>
            {protocolDesc}
          </span>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: "#fff",
            color: "#222",
            border: "1.5px solid #f1f2f7",
            borderRadius: 12,
            fontWeight: 500,
            fontSize: 17,
            padding: "7px 18px",
            cursor: "pointer",
            boxShadow: "0 2px 8px #f4f5f9",
            display: "flex",
            alignItems: "center"
          }}
        >
          <svg style={{ marginRight: 6 }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 10a7.5 7.5 0 0113.06-4.45l.94-1.45A9 9 0 103 10h2zm14-7v6h-6l2.21-2.21A6.47 6.47 0 002.5 10h2A4.5 4.5 0 1116.5 10h2A6.47 6.47 0 0016.5 3.8z" fill="#2469f7"/></svg>
          刷新
        </button>
      </div>

      {/* 域名 + 注册状态 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, marginTop: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 28, color: "#181c28", letterSpacing: 1 }}>{domain}</div>
        {statusTag}
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 10px #f1f2f7",
        padding: "18px 14px 14px 14px",
        marginTop: 4,
        wordBreak: "break-all"
      }}>
        {/* 主要字段展示 */}
        {field("注册商", registrar, "", <FaServer />)}
        {field("注册日期", created, "", <FaCalendarAlt />)}
        {field(
          "到期日期",
          expiry,
          getRemain(expiry),
          <FaRegFlag />
        )}
        {field("状态", status, "", <FaInfoCircle />)}
        {field("注册人", registrant, "", <FaUser />)}
        {field(
          "WHOIS服务器",
          usedProtocol === "rdap" ? "RDAP查询" : (data.whoisServer || "未知"),
          "",
          <FaServer />
        )}
        <div style={{ marginBottom: 12, color: "#222", fontSize: 16, display: "flex", alignItems: "flex-start" }}>
          <span style={{ marginRight: 10, marginTop: 2 }}><FaKey /></span>
          <span style={{ minWidth: 72, color: "#7c7d88" }}>名称服务器</span>
          <span>
            {dns && dns.length > 0
              ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {dns.map((d, i) => <li key={i} style={{ fontWeight: 500 }}>{d}</li>)}
                </ul>
              ) : <span style={{ color: "#bbb" }}>未知</span>}
          </span>
        </div>

        {/* Tab切换：原始数据/结构化信息 */}
        <div style={{
          display: "flex",
          margin: "20px 0 8px 0",
          borderRadius: 10,
          background: "#f6f8fa",
          overflow: "hidden",
        }}>
          <button
            type="button"
            onClick={() => setTab("raw")}
            style={{
              flex: 1,
              fontWeight: 700,
              fontSize: 16,
              padding: "10px 0",
              background: tab === "raw" ? "#fff" : "transparent",
              color: tab === "raw" ? "#222" : "#9a9cab",
              border: "none",
              borderBottom: tab === "raw" ? "2px solid #131f3c" : "2px solid transparent",
              cursor: "pointer",
              outline: "none",
              transition: "all .12s"
            }}
          >原始数据</button>
          <button
            type="button"
            onClick={() => setTab("info")}
            style={{
              flex: 1,
              fontWeight: 700,
              fontSize: 16,
              padding: "10px 0",
              background: tab === "info" ? "#fff" : "transparent",
              color: tab === "info" ? "#222" : "#9a9cab",
              border: "none",
              borderBottom: tab === "info" ? "2px solid #131f3c" : "2px solid transparent",
              cursor: "pointer",
              outline: "none",
              transition: "all .12s"
            }}
          >查询信息</button>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 8,
          padding: "14px 10px 10px 10px",
          fontSize: 14,
          minHeight: 80,
          color: "#23242d",
          wordBreak: "break-all"
        }}>
          {tab === "raw" ? (
            <pre style={{
              margin: 0,
              background: "none",
              fontSize: 13,
              lineHeight: 1.7,
              color: "#23242d"
            }}>
              {raw && typeof raw === "string"
                ? raw
                : JSON.stringify(raw || data.rdap || {}, null, 2)}
            </pre>
          ) : (
            <pre style={{
              margin: 0,
              background: "none",
              fontSize: 13,
              lineHeight: 1.7,
              color: "#23242d"
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
