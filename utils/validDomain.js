module.exports = function validDomain(domain) {
  // 允许中文、国际化后缀
  return /^([a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\-\.]{0,62})\.([a-zA-Z\u4e00-\u9fa5\-]{2,})$/.test(domain);
};
