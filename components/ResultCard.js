import React from "react";

// 小工具函数
const safe = (v) => (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) ? null : v;
const join = (arr, sep = "、") => Array.isArray(arr) ? arr.join(sep) : arr;

// 允许注册状态多行（状态+链接）
const renderStatus = (statusArr) => {
  if (!statusArr || statusArr.length === 0) return null;
  return (
    <div style={{
      background: "#e8f7ee",
      borderRadius: 18,
      padding: "8px 18px",
      marginBottom: 14,
      color: "#18a058",
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.7,
      display: "inline-block"
    }}>
      {statusArr.map((s, i) => (
        <div key={i} style={{ wordBreak: "break-all" }}>{s}</div>
      ))}
    </div>
  );
};

export default function ResultCard({ data, registered, protocol, rawWhois, rdap, fullResult }) {
  if (!data || typeof data !== "object") data = {};
  // 字段适配
  const domain = data.domainName || data.ldhName || (fullResult && fullResult.domain) || "";
  const registrar = data.registrar || data["Registrar"] || "-";
  const creation = data.creationDate || data["Created On"] || data["Registration Time"] || "";
  const expiry = data.expiryDate || data["Registry Expiry Date"] || data["Registrar Registration Expiration Date"] || "";
  const status = data.status || data["Domain Status"] || [];
  const registrant = data.registrant || data["Registrant Name"] || data["Registrant"] || "-";
  const whoisServer = data.whoisServer || data["WHOIS Server"] || "-";
  const nameServers = data.nameServers || data["Name Server"] || data["Nameservers"] || [];
  // 状态数组兼容
  const statusArr = Array.isArray(status) ? status : (typeof status === "string" ? [status] : []);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 10px #f1f2f7",
      padding: 26,
      marginBottom: 22
    }}>
      <div style={{ fontWeight: 800, fontSize: 28, color: "#222", marginBottom: 7 }}>
        {domain}
      </div>
      {registered && statusArr.length > 0 && renderStatus(statusArr)}
      {/* 字段区 */}
      <div style={{ fontSize: 16, color: "#222" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>📑</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>注册商</span>
          <span>{registrar}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>📅</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>注册日期</span>
          <span>{creation || "-"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>📅</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>到期日期</span>
          <span>{expiry || "-"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>🔖</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>状态</span>
          <span>
            {statusArr.length === 0 ? "-" : (
              <div>
                {statusArr.map((s, i) => (
                  <div key={i} style={{ wordBreak: "break-all" }}>{s}</div>
                ))}
              </div>
            )}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>👤</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>注册人</span>
          <span>{registrant}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
          <span style={{ width: 30, fontSize: 19, opacity: .7 }}>🗄️</span>
          <span style={{ width: 88, color: "#7b8ba0" }}>WHOIS服务器</span>
          <span>{whoisServer || "-"}</span>
        </div>
        {/* 名称服务器 */}
        {nameServers && nameServers.length > 0 && (
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: 10 }}>
            <span style={{ width: 30, fontSize: 19, opacity: .7, marginTop: 2 }}>🖥️</span>
            <span style={{ width: 88, color: "#7b8ba0", marginTop: 2 }}>名称服务器</span>
            <div>
              {nameServers.map((ns, i) => (
                <div key={i} style={{ marginBottom: 2 }}>{ns}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 折叠原始 WHOIS */}
      <details style={{ marginTop: 18 }}>
        <summary style={{ color: "#2469f7", cursor: "pointer", fontSize: 15 }}>显示原始WHOIS信息</summary>
        <pre style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "#444", marginTop: 8 }}>
          {rawWhois}
        </pre>
      </details>
    </div>
  );
}
