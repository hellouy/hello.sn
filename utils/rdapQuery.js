const fetch = require("node-fetch");

module.exports = async function rdapQuery(domain, timeout = 5000) {
  const tld = domain.split(".").pop().toLowerCase();
  const bootstrapUrl = "https://data.iana.org/rdap/dns.json";
  try {
    const resp = await fetch(bootstrapUrl, { timeout: 4000 });
    if (!resp.ok) return null;
    const data = await resp.json();
    let rdapServer = null;
    for (const arr of data.services || []) {
      if (arr[0].some((s) => s.replace(/^\./, "") === tld)) {
        rdapServer = arr[1][0];
        break;
      }
    }
    if (!rdapServer) return null;
    const url = `${rdapServer.replace(/\/+$/, "")}/domain/${domain}`;
    return await Promise.race([
      fetch(url, { timeout: 4000 }).then(async r => (r.ok ? r.json() : null)),
      new Promise(resolve => setTimeout(() => resolve(null), timeout))
    ]);
  } catch {
    return null;
  }
};
