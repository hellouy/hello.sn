const whois = require("whois");
const path = require("path");
const fs = require("fs");

// 读取 whois-servers.json 并缓存
let whoisServers = null;
function loadWhoisServers() {
  if (whoisServers) return whoisServers;
  try {
    const filePath = path.resolve(__dirname, "../whois-servers.json");
    whoisServers = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    whoisServers = {};
  }
  return whoisServers;
}

function getWhoisServer(domain) {
  const parts = domain.split(".");
  if (parts.length < 2) return null;
  const tld = parts[parts.length - 1].toLowerCase();
  const servers = loadWhoisServers();
  return servers[tld] || null;
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
