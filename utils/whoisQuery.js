const whois = require("whois");
const whoisServers = require("../whois-servers.json");
const fetch = require("node-fetch");

// RDAP查询
async function rdapQuery(domain, timeout = 5000) {
  const tld = domain.split(".").pop().toLowerCase();
  const bootstrapUrl = "https://data.iana.org/rdap/dns.json";
  try {
    const resp = await fetch(bootstrapUrl, { timeout: 4000 });
    if (!resp.ok) return null;
    const data = await resp.json();
    let rdapServer = null;
    for (const arr of data.services || []) {
      if (arr[0].some((s) => s.replace(/^\./, "") === tld)) {
        rdapServer = arr[1][0];
        break;
      }
    }
    if (!rdapServer) return null;
    const url = `${rdapServer.replace(/\/+$/, "")}/domain/${domain}`;
    // RDAP查询有些TLD会timeout，这里做超时保护
    return await Promise.race([
      fetch(url, { timeout: 4000 }).then(async r => (r.ok ? r.json() : null)),
      new Promise(resolve => setTimeout(() => resolve(null), timeout))
    ]);
  } catch {
    return null;
  }
}

// 判断RDAP查询是否有有效注册信息
function isValidRDAP(rdap) {
  if (!rdap || typeof rdap !== "object") return false;
  if (rdap.ldhName) return true;
  if (rdap.entities && rdap.entities.length) return true;
  if (rdap.events && rdap.events.length) return true;
  if (rdap.status && rdap.status.length) return true;
  return false;
}

// whois查询
function doWhoisQuery(domain, server, timeout = 10000) {
  return new Promise((resolve) => {
    // 递归跟随referral，防止.com/.net查不到详细信息
    const options = { timeout, follow: 2 };
    if (server) options.server = server;
    whois.lookup(domain, options, (err, data) => {
      if (err || !data) {
        return resolve(null);
      }
      resolve(data);
    });
  });
}

// 自动获取whois服务器
function getWhoisServer(domain) {
  const parts = domain.split(".");
  if (parts.length < 2) return null;
  const tld = parts[parts.length - 1].toLowerCase();
  return whoisServers[tld] || null;
}

/**
 * 健壮的域名注册信息查询
 * 返回: { protocol, whois, rdap, error }
 */
module.exports = async function robustDomainQuery(domain, server, timeout = 10000) {
  let protocol = "rdap";
  let rdap = null, whoisRaw = null, error = null;
  try {
    // 1. 先查RDAP
    rdap = await rdapQuery(domain, timeout);
    if (isValidRDAP(rdap)) {
      return { protocol: "rdap", rdap, whois: null, error: null };
    }
    // 2. RDAP无果，自动fallback到whois
    protocol = "whois";
    const finalServer = server || getWhoisServer(domain);
    whoisRaw = await doWhoisQuery(domain, finalServer, timeout);
    if (whoisRaw) {
      return { protocol: "whois", rdap, whois: whoisRaw, error: null };
    } else {
      error = "RDAP和WHOIS均无法获取信息";
    }
  } catch (e) {
    error = e && e.message ? e.message : String(e);
  }
  return { protocol, rdap, whois: whoisRaw, error };
};
