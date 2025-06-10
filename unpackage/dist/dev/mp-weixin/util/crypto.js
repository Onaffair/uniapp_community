"use strict";
const common_vendor = require("../common/vendor.js");
const SECRET_KEY = "onaffaironaffair";
function encrypt(data) {
  if (!data)
    return null;
  const key = common_vendor.CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const encrypted = common_vendor.CryptoJS.AES.encrypt(data, key, {
    mode: common_vendor.CryptoJS.mode.ECB,
    // 使用 ECB 模式
    padding: common_vendor.CryptoJS.pad.Pkcs7
    // 明确填充方案
  });
  return encrypted.toString();
}
exports.encrypt = encrypt;
