const whois = require("whois");
const whoisServers = require("../whois-servers.json");

// 未注册正则
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

// 兼容多写法的字段正则
function parseSimpleWhois(raw) {
  if (!raw) return {};
  // 支持多种字段名
  const matchers = {
    domainName: [/Domain Name:\s*([^\s]+)/i],
    registrar: [/Registrar:\s*([^\r\n]+)/i],
    creationDate: [
      /Creation Date:\s*([^\r\n]+)/i,
      /Registered On:\s*([^\r\n]+)/i,
      /Registration Time:\s*([^\r\n]+)/i
    ],
    updatedDate: [
      /Updated Date:\s*([^\r\n]+)/i,
      /Last Updated On:\s*([^\r\n]+)/i
    ],
    expiryDate: [
      /Registrar Registration Expiration Date:\s*([^\r\n]+)/i,
      /Registry Expiry Date:\s*([^\r\n]+)/i,
      /Expiration Date:\s*([^\r\n]+)/i,
      /Expires On:\s*([^\r\n]+)/i
    ],
    status: [/Status:\s*([^\r\n]+)/ig, /Domain Status:\s*([^\r\n]+)/ig],
    nameServers: [/Name Server:\s*([^\r\n]+)/ig, /Nameserver:\s*([^\r\n]+)/ig],
    whoisServer: [/WHOIS Server:\s*([^\r\n]+)/i],
    registrant: [/Registrant(?: Name)?:\s*([^\r\n]+)/i],
    dnssec: [/DNSSEC:\s*([^\r\n]+)/i]
  };
  const result = {};
  for (const key in matchers) {
    // 多值字段
    if (["status","nameServers"].includes(key)) {
      result[key] = [];
      matchers[key].forEach(reg => {
        let m;
        while ((m = reg.exec(raw))) result[key].push(m[1]);
      });
    } else {
      let value = null;
      for (let reg of matchers[key]) {
        const m = reg.exec(raw);
        if (m) {
          value = m[1];
          break;
        }
      }
      if (value) result[key] = value;
    }
  }
  return result;
}

// 注册状态判断（健壮）
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
