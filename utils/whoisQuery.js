const whois = require("whois");
const whoisServers = require("../whois-servers.json");

function getWhoisServer(domain) {
  const parts = domain.split(".");
  if (parts.length < 2) return null;
  const tld = parts[parts.length - 1].toLowerCase();
  return whoisServers[tld] || null;
}

module.exports = function whoisQuery(domain, server, timeout = 10000) {
  return new Promise((resolve) => {
    const finalServer = server || getWhoisServer(domain);
    const options = { timeout };
    if (finalServer) options.server = finalServer;
    whois.lookup(domain, options, (err, data) => {
      if (err || !data) {
        return resolve(null);
      }
      resolve(data);
    });
  });
};
