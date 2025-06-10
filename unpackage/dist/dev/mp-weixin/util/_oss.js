"use strict";
const common_vendor = require("../common/vendor.js");
const api_userAPI = require("../api/userAPI.js");
const util_showMessages = require("./showMessages.js");
const DEFAULT_DIR = "images/";
class OSSUploader {
  constructor() {
    this.client = null;
    this.expiredTime = null;
    this.defaultDir = DEFAULT_DIR;
    this.reflashInterval = 1e3 * 15 * 60;
    this.reflashTimer = null;
    this.STS = {};
  }
  async init() {
    try {
      let res = await api_userAPI.getSTS();
      const { accessKeyId, accessKeySecret, bucket, region, stsToken, expiration } = res == null ? void 0 : res.data;
      this.STS = { ...res == null ? void 0 : res.data };
      this.expiredTime = Date.now() + this.reflashInterval - 1e3;
      this.client = new common_vendor.OSS({
        accessKeySecret,
        accessKeyId,
        bucket,
        region,
        stsToken,
        secure: true,
        refreshSTSToken: async () => {
          const res2 = await api_userAPI.getSTS();
          const { accessKeyId: accessKeyId2, accessKeySecret: accessKeySecret2, stsToken: stsToken2 } = res2.data;
          return {
            accessKeyId: accessKeyId2,
            accessKeySecret: accessKeySecret2,
            stsToken: stsToken2
          };
        },
        refreshSTSTokenInterval: this.reflashInterval
      });
      console.log("初始化成功");
      return true;
    } catch (e) {
      console.log("初始化失败", e.message);
      return false;
    } finally {
    }
  }
  isSTSTokenExpired() {
    return Date.now() > this.expiredTime;
  }
  startReflashTimer() {
    if (this.reflashTimer)
      clearInterval(this.reflashTimer);
    this.reflashTimer = setInterval(async () => {
      if (this.isSTSTokenExpired()) {
        await this.init();
      }
    }, this.reflashInterval);
  }
  async upload(file, dir = this.defaultDir) {
    var _a, _b, _c, _d;
    try {
      const ext = ((_b = (_a = file.name) == null ? void 0 : _a.split(".")) == null ? void 0 : _b.pop()) || ((_d = (_c = file.path) == null ? void 0 : _c.split(".")) == null ? void 0 : _d.pop()) || "file";
      const signRes = await api_userAPI.getSign(ext);
      if (!signRes || signRes.code !== 200) {
        throw new Error("获取签名失败");
      }
      const { signUrl, accessUrl, fileName } = signRes == null ? void 0 : signRes.data;
      const fs = common_vendor.index.getFileSystemManager();
      const fileData = fs.readFileSync(file.path);
      return await new Promise((resolve, reject) => {
        common_vendor.index.request({
          url: signUrl,
          method: "PUT",
          header: {
            "Content-Type": "application/octet-stream"
          },
          data: fileData,
          success: (res) => {
            resolve(accessUrl);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    } catch (e) {
      util_showMessages.alertFail(this.upload.name, e.message);
    }
  }
}
exports.OSSUploader = OSSUploader;
