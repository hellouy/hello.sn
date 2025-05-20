const validDomain = require("../../utils/validDomain");
const whoisQuery = require("../../utils/whoisQuery");
const rdapQuery = require("../../utils/rdapQuery");
const parseWhois = require("../../utils/parseWhois");
const rateLimit = require("../../utils/rateLimit");
const fs = require("fs");
const path = require("path");

function mergeInfo({ whoisParsed, rdap, protocol }) {
  let registrar = whoisParsed?.registrar || rdap?.entities?.find(e => (e.roles || []).includes("registrar"))?.vcardArray?.[1]?.find(i => i[0] === "fn")?.[3] || "";
  let registrant = whoisParsed?.registrant || rdap?.entities?.find(e => (e.roles || []).includes("registrant"))?.vcardArray?.[1]?.find(i => i[0] === "fn")?.[3] || "";
  let create = whoisParsed?.creation || (rdap?.events?.find(e => e.eventAction === "registration")?.eventDate) || "";
  let expiry = whoisParsed?.expiry || (rdap?.events?.find(e => e.eventAction === "expiration")?.eventDate) || "";
  let status = whoisParsed?.status || (Array.isArray(rdap?.status) ? rdap.status.join(", ") : rdap?.status) || "";
  let ns = whoisParsed?.ns?.length ? whoisParsed.ns : (rdap?.nameservers?.map(n => n.ldhName) || []);
  let whoisServer = protocol === "whois" ? (rdap?.port43 || "") : "RDAP查询";
  return { registrar, registrant, create, expiry, status, ns, whoisServer };
}

function isUnregistered(whoisRaw, rdap) {
  if (whoisRaw && /(no match|not found|未注册|available)/i.test(whoisRaw)) return true;
  if (rdap && rdap.status && Array.isArray(rdap.status)) {
    return rdap.status.some(s => /available|inactive|未注册/i.test(s));
  }
  return false;
}

// 加载自定义whois server
function getCustomWhoisServer(domain, userInput) {
  if (userInput) return userInput;
  const ext = domain.split(".").pop().toLowerCase();
  const file = path.join(process.cwd(), "whois-servers.json");
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (data[ext]) return data[ext];
  }
  return null;
}

export default async function handler(req, res) {
  const ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  if (!rateLimit(ip)) {
    res.status(429).json({ error: "请求过于频繁，请稍后再试" });
    return;
  }
  const { domain, protocol = "rdap", whoisServer: userWhoisServer } = req.query;
  res.setHeader("Cache-Control", "no-store");
  if (!domain || !validDomain(domain)) {
    res.status(400).json({ error: "请输入合法的域名参数" });
    return;
  }
  try {
    // RDAP优先/WHOIS备用
    let whoisRaw = null, rdap = null, protocolUsed = protocol;
    if (protocol === "rdap") {
      rdap = await rdapQuery(domain);
      if (!rdap) { // fallback to whois
        protocolUsed = "whois";
        const customServer = getCustomWhoisServer(domain, userWhoisServer);
        whoisRaw = await whoisQuery(domain, customServer);
      }
    } else {
      const customServer = getCustomWhoisServer(domain, userWhoisServer);
      whoisRaw = await whoisQuery(domain, customServer);
      if (!whoisRaw) {
        protocolUsed = "rdap";
        rdap = await rdapQuery(domain);
      }
    }
    if (!whoisRaw && !rdap) {
      res.status(502).json({ error: "未获取到任何whois/rdap信息" });
      return;
    }
    const whoisParsed = whoisRaw ? parseWhois(whoisRaw) : {};
    const info = mergeInfo({ whoisParsed, rdap, protocol: protocolUsed });
    const registered = !isUnregistered(whoisRaw, rdap);
    res.status(200).json({
      protocol: protocolUsed,
      domain,
      registered,
      ...info,
      raw: whoisRaw,
      rawData: protocolUsed === "rdap" ? rdap : whoisRaw
    });
  } catch (e) {
    res.status(500).json({ error: "查询出错", detail: e.toString() });
  }
}
