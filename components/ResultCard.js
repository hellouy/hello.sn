import React, { useState } from "react";
import { FaSyncAlt, FaUser, FaServer, FaCalendarAlt, FaInfoCircle, FaGlobe, FaKey, FaRegFlag } from "react-icons/fa";
import RawTabs from "./RawTabs";

function timeDiffStr(expiry) {
  if (!expiry) return "";
  const now = Date.now();
  const exp = new Date(expiry).getTime();
  if (!exp || exp < now) return "";
  const diff = exp - now;
  const months = Math.floor(diff / (30 * 24 * 3600 * 1000));
  const years = Math.floor(months / 12);
  if (years > 0) return `(剩余 ${years}年${months % 12}个月)`;
  if (months > 0) return `(剩余 ${months}个月)`;
  return "";
}

export default function ResultCard({
  protocol, // "whois" or "rdap"
  onProtocolSwitch,
  onRefresh,
  domain,
  status,
  registrar,
  registrant,
  create,
  expiry,
  ns,
  whoisServer,
  raw,
  registered,
  rawData,
  loading
}) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #f0f1f2", padding: 22, marginTop: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 22 }}>{domain}</span>
        </div>
        <button
          aria-label="刷新"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#222", fontSize: 22, display: "flex", alignItems: "center", fontWeight: 500
          }}
          onClick={onRefresh}
          disabled={loading}
        >
          <FaSyncAlt style={{ marginRight: 4 }} />
          刷新
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
        {registered === true &&
          <span style={{
            background: "#14d88a",
            color: "#fff",
            borderRadius: 8,
            padding: "3px 18px",
            fontSize: 16,
            fontWeight: 700,
            marginRight: 10
          }}>已注册</span>
        }
        {registered === false &&
          <span style={{
            background: "#f2b94b",
            color: "#fff",
            borderRadius: 8,
            padding: "3px 18px",
            fontSize: 16,
            fontWeight: 700,
            marginRight: 10
          }}>未注册</span>
        }
        <span style={{ fontSize: 13, color: "#8a98b8" }}>{protocol === "rdap" ? "RDAP" : "WHOIS"} 协议</span>
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaGlobe style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>注册商</span>
          <span>{registrar || "未知"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaCalendarAlt style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>注册日期</span>
          <span>{create || "未知"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaCalendarAlt style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>到期日期</span>
          <span>{expiry || "未知"} <span style={{ color: "#8a98b8", marginLeft: 8 }}>{timeDiffStr(expiry)}</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaRegFlag style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>状态</span>
          <span>{status || "未知"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaUser style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>注册人</span>
          <span>{registrant || "未知"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <FaServer style={{ color: "#7d8599", marginRight: 7 }} />
          <span style={{ color: "#6e7b8a", minWidth: 62 }}>WHOIS服务器</span>
          <span>{whoisServer || (protocol === "rdap" ? "RDAP查询" : "未知")}</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: "#6e7b8a", fontSize: 15, marginBottom: 2, display: "flex", alignItems: "center" }}>
            <FaKey style={{ color: "#7d8599", marginRight: 7 }} /> 名称服务器
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {(ns || []).map((n, i) => <li key={i} style={{ fontSize: 15 }}>{n}</li>)}
          </ul>
        </div>
      </div>
      {/* 原始数据/查询信息Tab */}
      <RawTabs showRaw={showRaw} setShowRaw={setShowRaw} />
      {showRaw ? (
        <div style={{
          background: "#f9f9f9",
          borderRadius: 8,
          padding: 12,
          fontSize: 13,
          color: "#333",
          marginTop: 2,
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
          border: "1px solid #eee"
        }}>
          <pre style={{ margin: 0 }}>{typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
