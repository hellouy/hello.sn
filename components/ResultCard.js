import React from "react";

export default function ResultCard({ data, registered, protocol, rawWhois, rdap, fullResult }) {
  // whoisParsed 展示
  if (protocol === "whois" && data && Object.keys(data).length > 0) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 10px #f1f2f7",
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 22, color: "#2469f7", margin: 0 }}>
          WHOIS信息
        </h3>
        <div style={{ fontSize: 15, margin: "10px 0 0 0", color: registered ? "#2ba95b" : "#b33", fontWeight: 600 }}>
          {registered ? "已注册" : "未注册"}
        </div>
        {data.domainName && <div>域名：{data.domainName}</div>}
        {data.registrar && <div>注册商：{data.registrar}</div>}
        {data.creationDate && <div>注册时间：{data.creationDate}</div>}
        {data.updatedDate && <div>更新时间：{data.updatedDate}</div>}
        {data.expiryDate && <div>到期时间：{data.expiryDate}</div>}
        {data.status && <div>状态：{data.status}</div>}
        {data.nameServers && data.nameServers.length > 0 && (
          <div>DNS服务器：{data.nameServers.join("、")}</div>
        )}
        {data.org && <div>注册组织：{data.org}</div>}
        {data.country && <div>国家：{data.country}</div>}
        {data.registrant && <div>注册联系人：{data.registrant}</div>}
        {data.registrarIANAID && <div>注册商IANA ID：{data.registrarIANAID}</div>}
        {data.registrarAbuseContactEmail && <div>注册商投诉邮箱：{data.registrarAbuseContactEmail}</div>}
        {data.registrarAbuseContactPhone && <div>注册商投诉电话：{data.registrarAbuseContactPhone}</div>}
        {data.registrantStreet && <div>注册地址：{data.registrantStreet}</div>}
        {data.registrantCity && <div>注册城市：{data.registrantCity}</div>}
        {data.registrantState && <div>注册省/州：{data.registrantState}</div>}
        {data.registrantPostalCode && <div>邮编：{data.registrantPostalCode}</div>}
        {data.registrantPhone && <div>联系电话：{data.registrantPhone}</div>}
        {data.registrantFax && <div>传真：{data.registrantFax}</div>}
        {data.emails && data.emails.length > 0 && (
          <div>邮箱：{data.emails.join("、")}</div>
        )}
        <details style={{ marginTop: 10 }}>
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
