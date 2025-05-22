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
        <div style={{ fontSize: 15, margin: "10px 0 0 0", color: registered ? "#2ba95b" : "#b33" }}>
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
        {data.country && <div>国家：{data.country}</div>}
        {data.org && <div>组织：{data.org}</div>}
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

  // RDAP 展示（如后续恢复，可补充）
  if (protocol === "rdap" && rdap) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 10px #f1f2f7",
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 22, color: "#2469f7", margin: 0 }}>
          {rdap.ldhName || "域名"}
        </h3>
        <div style={{ fontSize: 15, margin: "10px 0 0 0", color: registered ? "#2ba95b" : "#b33" }}>
          {registered ? "已注册" : "未注册"}
        </div>
        {rdap.status && (
          <div style={{ fontSize: 14, margin: "8px 0", color: "#5c667b" }}>
            状态：{rdap.status.join("、")}
          </div>
        )}
        {rdap.events && (
          <div style={{ fontSize: 14, margin: "8px 0", color: "#5c667b" }}>
            {rdap.events.map(e => (
              <div key={e.eventAction}>
                {e.eventAction === "registration" && "注册时间：" + e.eventDate}
                {e.eventAction === "expiration" && "到期时间：" + e.eventDate}
                {e.eventAction === "last changed" && "最近变更：" + e.eventDate}
              </div>
            ))}
          </div>
        )}
        {rdap.nameservers && (
          <div style={{ fontSize: 14, margin: "8px 0", color: "#5c667b" }}>
            DNS服务器：{rdap.nameservers.map(ns => ns.ldhName).join("、")}
          </div>
        )}
        {/* 其他RDAP信息可按需补充 */}
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
