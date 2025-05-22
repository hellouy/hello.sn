const whois = require("whois");
const whoisServers = require("../whois-servers.json");
const fetch = require("node-fetch");

const ENABLE_LOG = false; // 如需调试日志可置为 true

function log(...args) {
  if (ENABLE_LOG) console.log("[whoisQuery]", ...args);
}

// 多语言和多种 ccTLD 未注册典型正则
const unregisteredPatterns = [
  /no match for/i,
  /not found/i,
  /no data found/i,
  /status:\s?available/i,
  /domain.*not found/i,
  /does not exist/i,
  /no entries found/i,
  /domain is not registered/i,
  /the domain has not been registered/i,
  /no object found/i,
  /is free/i,
  /has not been registered/i,
  /available for registration/i,
  /the queried object does not exist/i,
  /not been registered/i,
  /domain name not known/i,
  /no records matching/i,
  /no such domain/i,
  /object does not exist/i,
  /nothing found for/i,
  /not registered/i,
  /no entries found for the selected source/i,
  /status: available/i,
  /status: not found/i,
  /domain not found/i,
  /no information available about domain name/i,
  /no whois server is known for this kind of object/i,
  /未注册/i,
  /查無此網域/i,
  /未註冊/i,
  /Не зарегистрирован/i,
  /Não encontrado/i
];

function isUnregisteredWhois(whoisRaw) {
  if (!whoisRaw) return true;
  const normalized = whoisRaw.replace(/[\s:：\r\n]+/g, ' ').toLowerCase();
  return unregisteredPatterns.some(re => re.test(normalized));
}

async function rdapQuery(domain, timeout = 5000) {
  const tld = domain.split(".").pop().toLowerCase();
  const bootstrapUrl = "https://data.iana.org/rdap/dns.json";
  try {
    const resp = await fetch(bootstrapUrl, { timeout: 4000 });
    if (!resp.ok) {
      log("IANA RDAP bootstrap获取失败");
      return null;
    }
    const data = await resp.json();
    let rdapServer = null;
    for (const arr of data.services || []) {
      if (arr[0].some((s) => s.replace(/^\./, "") === tld)) {
        rdapServer = arr[1][0];
        break;
      }
    }
    if (!rdapServer) {
      log("RDAP服务器未找到", tld);
      return null;
    }
    const url = `${rdapServer.replace(/\/+$/, "")}/domain/${domain}`;
    log("RDAP 查询 url:", url);
    return await Promise.race([
      fetch(url, { timeout: 4000 }).then(async r => (r.ok ? r.json() : null)),
      new Promise(resolve => setTimeout(() => resolve(null), timeout))
    ]);
  } catch (e) {
    log("RDAP异常", e);
    return null;
  }
}

function isValidRDAP(rdap) {
  if (!rdap || typeof rdap !== "object") return false;
  if (rdap.ldhName) return true;
  if (rdap.entities && rdap.entities.length) return true;
  if (rdap.events && rdap.events.length) return true;
  if (rdap.status && rdap.status.length) return true;
  return false;
}

function isRegisteredByRDAP(rdap) {
  if (!rdap || typeof rdap !== "object") return false;
  // 1. status 有 available 视为未注册
  if (rdap.status && rdap.status.some(s => /available/i.test(s))) return false;
  // 2. 有 registration 事件
  if (rdap.events && rdap.events.some(e => e.eventAction === "registration")) return true;
  // 3. 有 nameservers、entities、ldhName 均可视为已注册
  if (rdap.ldhName && (rdap.nameservers && rdap.nameservers.length)) return true;
  if (rdap.ldhName && (!rdap.status || !rdap.status.includes('available'))) return true;
  // 4. fallback
  return false;
}

function doWhoisQuery(domain, server, timeout = 10000) {
  return new Promise((resolve) => {
    const options = { timeout, follow: 2 };
    if (server) options.server = server;
    log("whois 查询参数:", options);
    whois.lookup(domain, options, (err, data) => {
      if (err || !data) {
        log("whois查询错误", err);
        return resolve(null);
      }
      resolve(data);
    });
  });
}

function getWhoisServer(domain) {
  const parts = domain.split(".");
  if (parts.length < 2) return null;
  const tld = parts[parts.length - 1].toLowerCase();
  return whoisServers[tld] || null;
}

module.exports = async function robustDomainQuery(domain, server, timeout = 10000) {
  let protocol = "rdap";
  let rdap = null, whoisRaw = null, error = null, debug = {};

  try {
    // RDAP 优先
    rdap = await rdapQuery(domain, timeout);
    debug.rdapTried = true;
    if (isValidRDAP(rdap)) {
      const registered = isRegisteredByRDAP(rdap);
      return { protocol: "rdap", rdap, whois: null, error: null, registered, debug };
    }
    // RDAP无效，自动fallback到whois
    protocol = "whois";
    const finalServer = server || getWhoisServer(domain);
    debug.finalWhoisServer = finalServer;
    whoisRaw = await doWhoisQuery(domain, finalServer, timeout);
    if (whoisRaw) {
      const registered = !isUnregisteredWhois(whoisRaw);
      return { protocol: "whois", rdap, whois: whoisRaw, error: null, registered, debug };
    } else {
      error = "RDAP和WHOIS均无法获取信息";
    }
  } catch (e) {
    error = e && e.message ? e.message : String(e);
    debug.catch = error;
  }
  return { protocol, rdap, whois: whoisRaw, error, registered: false, debug };
};
