import React from "react";

export default function ResultCard({ data, registered, protocol, rawWhois, rdap, fullResult }) {
  // 确保 data 存在并为对象
  const safe = (v) => (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) ? null : v;

  // 让数组字段变成字符串显示
  const join = (arr) => Array.isArray(arr) ? arr.join("、") : arr;

  // 兼容 DNSSEC 字段（有些注册局有）
  const getDnssec = () => {
    if (data && data.dnssec) return data.dnssec;
    // 从原始文本简单提取
    if (rawWhois) {
      const m = rawWhois.match(/DNSSEC:\s*([^\r\n]+)/i);
      if (m) return m[1];
    }
    return null;
  };

  if (protocol === "whois" && data && typeof data === "object" && Object.keys(data).length > 0) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 10px #f1f2f7",
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 22, color: "#2469f7", margin: 0 }}>
          WHOIS详细信息
        </h3>
        <div style={{
          fontSize: 15,
          margin: "10px 0 16px 0",
          color: registered ? "#2ba95b" : "#b33",
          fontWeight: 600
        }}>
          {registered ? "已注册" : "未注册"}
        </div>
        {safe(data.domainName) && <div>域名：{data.domainName}</div>}
        {safe(data.registrar) && <div>注册商：{data.registrar}</div>}
        {safe(data.creationDate) && <div>注册日期：{data.creationDate}</div>}
        {safe(data.updatedDate) && <div>更新日期：{data.updatedDate}</div>}
        {safe(data.expiryDate) && <div>过期日期：{data.expiryDate}</div>}
        {safe(data.status) && <div>域名状态：{join(data.status)}</div>}
        {safe(data.nameServers) && <div>DNS服务器：{join(data.nameServers)}</div>}
        {safe(getDnssec()) && <div>DNSSEC：{getDnssec()}</div>}
        {/* 可选附加信息 */}
        {safe(data.registrant) && <div>注册联系人：{data.registrant}</div>}
        {safe(data.registrantOrg) && <div>注册组织：{data.registrantOrg}</div>}
        {safe(data.registrantEmail) && <div>注册邮箱：{data.registrantEmail}</div>}
        {safe(data.registrantCountry) && <div>注册国家：{data.registrantCountry}</div>}
        {safe(data.registrantCity) && <div>注册城市：{data.registrantCity}</div>}
        {safe(data.registrantStreet) && <div>注册地址：{data.registrantStreet}</div>}
        {safe(data.adminEmail) && <div>管理员邮箱：{data.adminEmail}</div>}
        {safe(data.techEmail) && <div>技术邮箱：{data.techEmail}</div>}
        {/* 其它邮箱字段 */}
        {safe(data.emails) && <div>邮箱：{join(data.emails)}</div>}
        <details style={{ marginTop: 15 }}>
          <summary style={{ color: "#2469f7", cursor: "pointer" }}>显示原始WHOIS信息</summary>
          <pre style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "#444", marginTop: 8 }}>
            {rawWhois}
          </pre>
        </details>
      </div>
    );
  }

  // 兜底展示
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 10px #f1f2f7",
      padding: 20,
      marginBottom: 20
    }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, color: "#2469f7", margin: 0 }}>
        查询结果
      </h3>
      <pre style={{ fontSize: 13, margin: "12px 0 0 0", whiteSpace: "pre-wrap", color: "#444" }}>
        {JSON.stringify(fullResult, null, 2)}
      </pre>
    </div>
  );
}
