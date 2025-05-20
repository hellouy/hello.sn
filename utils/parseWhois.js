// 更健壮的 whois 解析，自动去除时间部分并适配多种字段写法
function extractDate(whois, patterns) {
  for (const pattern of patterns) {
    const match = whois.match(pattern);
    if (match) {
      // 只保留日期部分，去除T04:00:00Z等
      return match[1].split('T')[0].replace(/[^\d\-\/\.]/g, '').trim();
    }
  }
  return '';
}

function extractField(whois, patterns) {
  for (const pattern of patterns) {
    const match = whois.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

module.exports = function parseWhois(whoisText) {
  if (!whoisText) return {};
  // 常见whois文本字段的多种写法
  const patterns = {
    domainName: [
      /domain[\s_-]*name\s*[:=]\s*([^\r\n]+)/i,
      /registrant[\s_-]*name\s*[:=]\s*([^\r\n]+)/i,
    ],
    registrar: [
      /registrar\s*[:=]\s*([^\r\n]+)/i,
      /sponsoring registrar\s*[:=]\s*([^\r\n]+)/i,
    ],
    creationDate: [
      /creation[\s_-]*date\s*[:=]\s*([^\r\n]+)/i,
      /registered[\s_-]*on\s*[:=]\s*([^\r\n]+)/i,
      /created\s*[:=]\s*([^\r\n]+)/i,
      /domain registration date\s*[:=]\s*([^\r\n]+)/i,
    ],
    expiryDate: [
      /expiry[\s_-]*date\s*[:=]\s*([^\r\n]+)/i,
      /expires[\s_-]*on\s*[:=]\s*([^\r\n]+)/i,
      /expiration[\s_-]*date\s*[:=]\s*([^\r\n]+)/i,
      /paid-till\s*[:=]\s*([^\r\n]+)/i,
    ],
    updatedDate: [
      /updated[\s_-]*date\s*[:=]\s*([^\r\n]+)/i,
      /last modified\s*[:=]\s*([^\r\n]+)/i,
      /last update\s*[:=]\s*([^\r\n]+)/i,
      /modified\s*[:=]\s*([^\r\n]+)/i,
    ],
    status: [
      /status\s*[:=]\s*([^\r\n]+)/i,
      /domain status\s*[:=]\s*([^\r\n]+)/i,
    ],
    dns: [
      /name server\s*[:=]\s*([^\r\n]+)/ig,
      /nserver\s*[:=]\s*([^\r\n]+)/ig,
      /dns[\s_-]*server\s*[:=]\s*([^\r\n]+)/ig,
    ]
  };

  // 提取域名
  const domain = extractField(whoisText, patterns.domainName) || '';
  // 提取注册商
  const registrar = extractField(whoisText, patterns.registrar) || '';
  // 提取创建、到期、更新时间，并去掉时分秒
  const created = extractDate(whoisText, patterns.creationDate) || '';
  const expiry = extractDate(whoisText, patterns.expiryDate) || '';
  const updated = extractDate(whoisText, patterns.updatedDate) || '';
  // 提取状态
  const status = extractField(whoisText, patterns.status) || '';
  // 提取DNS服务器（可能有多个匹配项）
  let dns = [];
  for (const p of patterns.dns) {
    let m;
    while ((m = p.exec(whoisText))) {
      let d = m[1].trim();
      if (d && !dns.includes(d)) dns.push(d);
    }
  }
  return {
    domain,
    registrar,
    created,
    expiry,
    updated,
    status,
    dns,
    raw: whoisText,
  };
};
