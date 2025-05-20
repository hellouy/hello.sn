const whois = require("whois");

module.exports = function whoisQuery(domain, server, timeout = 10000) {
  return new Promise((resolve) => {
    const options = { timeout };
    if (server) options.server = server;
    whois.lookup(domain, options, (err, data) => {
      if (err || !data) {
        return resolve(null);
      }
      resolve(data);
    });
  });
};
