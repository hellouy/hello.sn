const whois = require("whois");
const whoisServers = require("../whois-servers.json");

// 多语言“未注册”特征
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

// 更丰富的正则解析
function parseSimpleWhois(raw) {
  if (!raw) return {};
  const matchers = {
    domainName: /Domain Name:\s*([^\s]+)/i,
    registrar: /Registrar:\s*([^\r\n]+)/i,
    creationDate: /Creation Date:\s*([^\r\n]+)/i,
    updatedDate: /Updated Date:\s*([^\r\n]+)/i,
    expiryDate: /(Registry Expiry Date|Registrar Registration Expiration Date|Expiration Date):\s*([^\r\n]+)/i,
    status: /Status:\s*([^\r\n]+)/ig,
    nameServers: /Name Server:\s*([^\r\n]+)/ig,
    dnssec: /DNSSEC:\s*([^\r\n]+)/i,
    registrant: /Registrant(?: Name)?:\s*([^\r\n]+)/i,
    registrantOrg: /Registrant Organization:\s*([^\r\n]+)/i,
    registrantEmail: /Registrant Email:\s*([^\r\n]+)/i,
    registrantCountry: /Registrant Country:\s*([^\r\n]+)/i,
    registrantCity: /Registrant City:\s*([^\r\n]+)/i,
    registrantStreet: /Registrant Street:\s*([^\r\n]+)/i,
    registrantState: /Registrant State\/Province:\s*([^\r\n]+)/i,
    registrantPostalCode: /Registrant Postal Code:\s*([^\r\n]+)/i,
    registrantPhone: /Registrant Phone:\s*([^\r\n]+)/i,
    registrantFax: /Registrant Fax:\s*([^\r\n]+)/i,
    adminEmail: /Admin Email:\s*([^\r\n]+)/i,
    techEmail: /Tech Email:\s*([^\r\n]+)/i,
    abuseContactEmail: /Abuse Contact Email:\s*([^\r\n]+)/i,
    abuseContactPhone: /Abuse Contact Phone:\s*([^\r\n]+)/i,
    emails: /Email:\s*([^\r\n]+)/ig
  };
  const result = {};
  for (const key in matchers) {
    // 多值字段
    if (["status","nameServers","emails"].includes(key)) {
      result[key] = [];
      let m;
      while ((m = matchers[key].exec(raw))) result[key].push(m[1]);
    } else if (key === "expiryDate") {
      const m = matchers[key].exec(raw);
      if (m) result[key] = m[2] || m[1];
    } else {
      const m = matchers[key].exec(raw);
      if (m) result[key] = m[1];
    }
  }
  return result;
}

// 注册状态判断（更健壮）
function isRegisteredByParsedWhois(parsed, whoisRaw) {
  if (!parsed) return false;
  // 只要有注册日期、到期日期、注册商、域名就认为是已注册
  if (
    (parsed.creationDate && parsed.creationDate.length > 0) ||
    (parsed.expiryDate && parsed.expiryDate.length > 0) ||
    (parsed.registrar && parsed.registrar.length > 0) ||
    (parsed.domainName && parsed.domainName.length > 0)
  ) return true;
  // 如果没有解析出来，但原始文本没有命中“未注册”正则，也认为已注册
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
