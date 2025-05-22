const validDomain = require("../../utils/validDomain");
const robustDomainQuery = require("../../utils/whoisQuery");
const parseWhois = require("../../utils/parseWhois");

/**
 * 更健壮的未注册判断：
 * - whoisRaw 为空或全是空白；
 * - whoisRaw 含有典型“未注册”关键词；
 * - RDAP status 字段包含 available/inactive/未注册 等。
 */
function isUnregistered(whoisRaw, rdap) {
  // 1. whois返回内容为空或全是空白，或内容极短（防止只返回一行无意义内容）
  if (!whoisRaw || !whoisRaw.trim() || whoisRaw.trim().length < 12) return true;
  // 2. 关键字判定
  if (/(no match|not found|未注册|available|This query returned 0 objects|no data for|status:\s?free)/i.test(whoisRaw)) return true;
  // 3. RDAP判定
  if (rdap && rdap.status && Array.isArray(rdap.status)) {
    return rdap.status.some(s => /available|inactive|未注册/i.test(s));
  }
  return false;
}

export default async function handler(req, res) {
  const { domain, server } = req.query;
  res.setHeader("Cache-Control", "no-store");

  // 0. 必须传递有效域名
  if (!domain || !validDomain(domain)) {
    res.status(400).json({ error: "请输入合法的域名参数" });
    return;
  }

  try {
    // 1. 健壮查询（RDAP优先，whois自动fallback，内部已自动选服务器&递归）
    const result = await robustDomainQuery(domain, server);

    // 2. 解析 whois 结构化信息
    const whoisParsed = result.whois ? parseWhois(result.whois) : null;

    // 3. 判断是否已注册（未注册页面应友好提示，不能静默无响应）
    const registered = !isUnregistered(result.whois, result.rdap);

    // 4. 最终响应结构
    res.status(result.error ? 500 : 200).json({
      domain,
      protocol: result.protocol || null,
      whois: result.whois || null,
      rdap: result.rdap || null,
      whoisParsed,
      registered,
      error: result.error || null,
      debug: result.debug || null // 可选，便于前端debug
    });
  } catch (e) {
    res.status(500).json({
      error: "查询出错",
      detail: e && e.message ? e.message : String(e)
    });
  }
}
