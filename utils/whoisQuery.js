const whois = require("whois");
const whoisServers = require("../whois-servers.json");

const unregisteredPatterns = [
  /no match for/i, /not found/i, /no data found/i, /status:\s?available/i,
  /domain.*not found/i, /does not exist/i, /no entries found/i,
  /domain is not registered/i, /the domain has not been registered/i,
  /no object found/i, /is free/i, /has not been registered/i,
  /available for registration/i, /the queried object does not exist/i,
  /not been registered/i, /domain name not known/i, /no records matching/i,
  /no such domain/i, /object does not exist/i, /nothing found for/i,
  /not registered/i, /no entries found for the selected source/i,
  /status: available/i, /status: not found/i, /domain not found/i,
  /no information available about domain name/i,
  /no whois server is known for this kind of object/i,
  /未注册/i, /查無此網域/i, /未註冊/i, /Не зарегистрирован/i, /Não encontrado/i
];

function isUnregisteredWhois(whoisRaw) {
  if (!whoisRaw) return true;
  const normalized = whoisRaw.replace(/[\s:：\r\n]+/g, ' ').toLowerCase();
  return unregisteredPatterns.some(re => re.test(normalized));
}

function parseSimpleWhois(raw) {
  if (!raw) return {};
  // 多语种/多写法/多分隔符
  const sep = '[\\s:：=]+';

  // 字段正则(多行)
  const makeFieldRegexes = (fields, multi = false) =>
    fields.map(f =>
      new RegExp(`^\\s*${f}${sep}([^\r\n]+)`, multi ? 'igm' : 'im')
    );
  const matchers = {
    domainName: makeFieldRegexes([
      "Domain Name", "domain", "域名"
    ]),
    registrar: makeFieldRegexes([
      "Registrar", "Sponsoring Registrar", "注册商"
    ]),
    creationDate: makeFieldRegexes([
      "Creation Date", "Created On", "Registered On", "Domain Registration Date", "注册时间", "注册日期", "成立时间"
    ]),
    updatedDate: makeFieldRegexes([
      "Updated Date", "Last Updated On", "Last Update", "Domain Last Updated Date", "更新时间", "Modified Date"
    ]),
    expiryDate: makeFieldRegexes([
      "Registrar Registration Expiration Date", "Registry Expiry Date", "Expiration Date", "Expires On", "Paid-till", "Expiry Date", "到期时间", "Expire", "Renewal Date", "Domain Expiration Date", "Expiry", "Expires", "到期日期"
    ]),
    status: makeFieldRegexes([
      "Status", "Domain Status", "状态"
    ], true),
    nameServers: makeFieldRegexes([
      "Name Server", "Nameserver", "Nserver", "DNS", "Name Servers", "DNS servers", "域名服务器"
    ], true),
    whoisServer: makeFieldRegexes([
      "WHOIS Server"
    ]),
    dnssec: makeFieldRegexes([
      "DNSSEC", "Dnssec", "DNS Sec"
    ])
  };

  const result = {};
  for (const key in matchers) {
    if (["status", "nameServers"].includes(key)) {
      result[key] = [];
      matchers[key].forEach(reg => {
        let m;
        while ((m = reg.exec(raw))) {
          let v = m[1].trim();
          if (v && !result[key].includes(v)) result[key].push(v);
        }
      });
    } else {
      for (const reg of matchers[key]) {
        const m = reg.exec(raw);
        if (m && m[1]) {
          result[key] = m[1].trim();
          break;
        }
      }
    }
  }

  // 兼容 Name Servers: 块多行（如BN等国别域名）
  if ((!result.nameServers || result.nameServers.length === 0) && /Name Servers?:/i.test(raw)) {
    const nsBlock = raw.match(/Name Servers?:\s*([\s\S]+?)(?:\n\s*\n|$)/i);
    if (nsBlock && nsBlock[1]) {
      result.nameServers = nsBlock[1].split('\n')
        .map(s => s.trim())
        .filter(s => !!s && !s.toLowerCase().includes('name server'));
    }
  }

  return result;
}

function isRegisteredByParsedWhois(parsed, whoisRaw) {
  if (!parsed) return false;
  if (
    (parsed.creationDate && parsed.creationDate.length > 0) ||
    (parsed.expiryDate && parsed.expiryDate.length > 0) ||
    (parsed.registrar && parsed.registrar.length > 0) ||
    (parsed.domainName && parsed.domainName.length > 0)
  ) return true;
  if (whoisRaw && !isUnregisteredWhois(whoisRaw)) return true;
  return false;
}

function doWhoisQuery(domain, server, timeout = 10000) {
  return new Promise((resolve) => {
    const options = { timeout, follow: 2 };
    if (server) options.server = server;
    whois.lookup(domain, options, (err, data) => {
      if (err || !data) return resolve(null);
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
  const finalServer = server || getWhoisServer(domain);
  const whoisRaw = await doWhoisQuery(domain, finalServer, timeout);
  let whoisParsed = parseSimpleWhois(whoisRaw);
  let registered = isRegisteredByParsedWhois(whoisParsed, whoisRaw);
  return { protocol: "whois", rdap: null, whois: whoisRaw, whoisParsed, error: null, registered };
};
