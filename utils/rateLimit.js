const tokens = {};
const MAX = 30; // 每分钟最大请求数

module.exports = function rateLimit(ip) {
  const now = Math.floor(Date.now() / 60000);
  if (!tokens[ip] || tokens[ip].minute !== now) {
    tokens[ip] = { minute: now, count: 0 };
  }
  if (tokens[ip].count >= MAX) return false;
  tokens[ip].count += 1;
  return true;
};
