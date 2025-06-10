"use strict";
const common_vendor = require("../common/vendor.js");
const util_basicData = require("./basic-data.js");
const store_userStore = require("../store/userStore.js");
class Request {
  constructor() {
    this.baseURL = util_basicData.backUrl;
    this.timeout = 1e4;
  }
  /**
   * 发送请求的核心方法
   * @param {Object} options - 请求选项
   * @returns {Promise} - 返回Promise对象
   */
  request(options) {
    return new Promise((resolve, reject) => {
      const userStore = store_userStore.useUserStore();
      const token = userStore.getToken();
      const header = options.header || {};
      header["Authorization"] = "Bearer " + token;
      common_vendor.index.request({
        url: this.baseURL + options.url,
        method: options.method || "GET",
        data: options.data,
        header,
        timeout: this.timeout,
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
  /**
   * GET请求
   * @param {string} url - 请求地址
   * @param {Object} params - 请求参数
   * @param {Object} header - 请求头
   * @returns {Promise} - 返回Promise对象
   */
  get(url, params = {}, header = {}) {
    return this.request({
      url,
      method: "GET",
      data: params,
      header
    });
  }
  /**
   * POST请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} header - 请求头
   * @returns {Promise} - 返回Promise对象
   */
  post(url, data = {}, header = {}) {
    return this.request({
      url,
      method: "POST",
      data,
      header
    });
  }
  /**
   * PUT请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} header - 请求头
   * @returns {Promise} - 返回Promise对象
   */
  put(url, data = {}, header = {}) {
    return this.request({
      url,
      method: "PUT",
      data,
      header
    });
  }
  /**
   * DELETE请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} header - 请求头
   * @returns {Promise} - 返回Promise对象
   */
  delete(url, data = {}, header = {}) {
    return this.request({
      url,
      method: "DELETE",
      data,
      header
    });
  }
  /**
   * 上传文件
   * @param {string} url - 上传地址
   * @param {string} filePath - 文件路径
   * @param {string} name - 文件对应的key
   * @param {Object} formData - 附加的表单数据
   * @returns {Promise} - 返回Promise对象
   */
  upload({ url, filePath, name = "file", formData = {} }) {
    return new Promise((resolve, reject) => {
      common_vendor.index.uploadFile({
        url: util_basicData.backUrl + url,
        filePath,
        name,
        formData,
        header: {
          "Authorization": "Bearer " + store_userStore.useUserStore().getToken()
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              resolve(data);
            } else {
              reject(new Error(data.msg || "上传失败"));
            }
          } catch (e) {
            reject(new Error("上传返回格式错误"));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
}
const request = new Request();
exports.request = request;
