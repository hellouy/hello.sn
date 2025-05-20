const validDomain = require("../../utils/validDomain");
const whoisQuery = require("../../utils/whoisQuery");
const rdapQuery = require("../../utils/rdapQuery");
const parseWhois = require("../../utils/parseWhois");

function isUnregistered(whoisRaw, rdap) {
  if (whoisRaw && /(no match|not found|未注册|available)/i.test(whoisRaw)) return true;
  if (rdap && rdap.status && Array.isArray(rdap.status)) {
    return rdap.status.some(s => /available|inactive|未注册/i.test(s));
  }
  return false;
}

export default async function handler(req, res) {
  const { domain, server } = req.query; // 支持自定义whois server参数
  res.setHeader("Cache-Control", "no-store");
  if (!domain || !validDomain(domain)) {
    res.status(400).json({ error: "请输入合法的域名参数" });
    return;
  }
  try {
    const [whoisRaw, rdap] = await Promise.all([
      whoisQuery(domain, server),
      rdapQuery(domain)
    ]);
    const whoisParsed = whoisRaw ? parseWhois(whoisRaw) : null;
    const registered = !isUnregistered(whoisRaw, rdap);
    res.status(200).json({
      domain,
      whois: whoisRaw,
      rdap,
      whoisParsed,
      registered
    });
  } catch (e) {
    res.status(500).json({ error: "查询出错", detail: e && e.message ? e.message : String(e) });
  }
}
