module.exports = function validDomain(domain) {
  return /^([a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\-\.]{0,62})\.([a-zA-Z0-9\u4e00-\u9fa5\-]{2,})$/.test(domain);
};
