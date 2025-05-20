const COMMON_REGEX = {
  registrar: [/Registrar[：:\s]*([^\r\n]+)/i],
  registrant: [/Registrant[：:\s]*([^\r\n]+)/i],
  creation: [/Creation Date[：:\s]*([^\r\n]+)/i],
  expiry: [/Expiry Date[：:\s]*([^\r\n]+)/i, /Expiration Date[：:\s]*([^\r\n]+)/i],
  status: [/Status[：:\s]*([^\r\n]+)/i],
  ns: [/Name Server[：:\s]*([^\r\n]+)/gi]
};

function matchFirst(raw, arr) {
  for (const re of arr) {
    const m = raw.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "未知";
}

function matchMulti(raw, arr) {
  let out = [];
  for (const re of arr) {
    let m;
    while ((m = re.exec(raw)) !== null) {
      out.push(m[1].trim());
    }
    if (out.length) break;
  }
  return out.length ? Array.from(new Set(out)) : [];
}

module.exports = function parseWhois(raw) {
  return {
    registrar: matchFirst(raw, COMMON_REGEX.registrar),
    registrant: matchFirst(raw, COMMON_REGEX.registrant),
    creation: matchFirst(raw, COMMON_REGEX.creation),
    expiry: matchFirst(raw, COMMON_REGEX.expiry),
    status: matchFirst(raw, COMMON_REGEX.status),
    ns: matchMulti(raw, COMMON_REGEX.ns)
  };
};
