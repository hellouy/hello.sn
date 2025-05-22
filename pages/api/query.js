const validDomain = require("../../utils/validDomain");
const robustDomainQuery = require("../../utils/whoisQuery");
const parseWhois = require("../../utils/parseWhois");

function isUnregistered(whoisRaw, rdap) {
  if (whoisRaw && /(no match|not found|未注册|available|This query returned 0 objects|no data for)/i.test(whoisRaw)) return true;
  if (rdap && rdap.status && Array.isArray(rdap.status)) {
    return rdap.status.some(s => /available|inactive|未注册/i.test(s));
  }
  return false;
}

export default async function handler(req, res) {
  const { domain, server } = req.query;
  res.setHeader("Cache-Control", "no-store");
  if (!domain || !validDomain(domain)) {
    res.status(400).json({ error: "请输入合法的域名参数" });
    return;
  }

  try {
    // 健壮查询
    const result = await robustDomainQuery(domain, server);
    const whoisParsed = result.whois ? parseWhois(result.whois) : null;
    const registered = !isUnregistered(result.whois, result.rdap);

    // 额外debug信息仅在后台查日志用，前端可选择显示
    if (result.error) {
      res.status(500).json({
        domain,
        protocol: result.protocol || null,
        whois: result.whois || null,
        rdap: result.rdap || null,
        whoisParsed,
        registered: false,
        error: result.error,
        debug: result.debug
      });
      return;
    }

    res.status(200).json({
      domain,
      protocol: result.protocol,
      whois: result.whois,
      rdap: result.rdap,
      whoisParsed,
      registered,
      debug: result.debug
    });
  } catch (e) {
    res.status(500).json({
      error: "查询出错",
      detail: e && e.message ? e.message : String(e)
    });
  }
}
