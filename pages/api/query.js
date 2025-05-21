const validDomain = require("../../utils/validDomain");
const whoisQuery = require("../../utils/whoisQuery");
const rdapQuery = require("../../utils/rdapQuery");
const parseWhois = require("../../utils/parseWhois");

function isUnregistered(whoisRaw, rdap) {
  if (whoisRaw && /(no match|not found|未注册|available|This query returned 0 objects|no data for)/i.test(whoisRaw)) return true;
  if (rdap && rdap.status && Array.isArray(rdap.status)) {
    return rdap.status.some(s => /available|inactive|未注册/i.test(s));
  }
  return false;
}

// 判断 RDAP 是否有值且能提取到注册商/注册时间等数据
function isValidRDAP(rdap) {
  if (!rdap || typeof rdap !== "object") return false;
  // 常见字段
  if (rdap.entities && rdap.entities.length) return true;
  if (rdap.events && rdap.events.length) return true;
  if (rdap.status && rdap.status.length) return true;
  if (rdap.ldhName) return true;
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
    let rdap = null, whoisRaw = null, protocol = null;

    // 1. 先查 RDAP
    rdap = await rdapQuery(domain);

    // 2. 如果 RDAP 能用且能提取数据，直接返回 RDAP 结果
    if (isValidRDAP(rdap)) {
      protocol = "rdap";
    } else {
      // 3. 否则自动查 whois（whoisQuery 会自动读取 whois-servers.json 匹配服务器）
      whoisRaw = await whoisQuery(domain, server);
      protocol = "whois";
      // 如果 whois 也查不到
      if (!whoisRaw) {
        throw new Error("RDAP和WHOIS均无法获取信息，域名或服务器异常");
      }
    }

    // 解析 whois
    const whoisParsed = whoisRaw ? parseWhois(whoisRaw) : null;
    const registered = !isUnregistered(whoisRaw, rdap);

    res.status(200).json({
      domain,
      protocol, // 返回实际使用的协议，前端可高亮
      whois: whoisRaw,
      rdap,
      whoisParsed,
      registered
    });
  } catch (e) {
    res.status(500).json({ error: "查询出错", detail: e && e.message ? e.message : String(e) });
  }
}
