"use strict";
const common_vendor = require("../common/vendor.js");
class WebSocketUtils {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.socketTask = null;
    this.onMessageCallback = null;
    this.onOpenCallback = null;
    this.onCloseCallback = null;
    this.onErrorCallback = null;
  }
  /**
   * 设置Token
   * @param {string} token - 认证令牌
   */
  setToken(token) {
    this.token = token;
  }
  /**
   * 初始化WebSocket连接
   */
  connect() {
    try {
      if (this.socketTask) {
        this.close();
      }
      this.socketTask = common_vendor.index.connectSocket({
        url: `${this.url}`,
        header: {
          "content-type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        // 指定子协议
        protocols: ["auth", this.token],
        complete: () => {
          console.log("WebSocket连接尝试完成");
        }
      });
      this.setupEventHandlers();
    } catch (error) {
      console.error("WebSocket连接初始化失败", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }
  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    if (!this.socketTask) {
      console.error("WebSocket尚未初始化，无法设置事件处理器");
      return;
    }
    this.socketTask.onOpen(() => {
      console.log("WebSocket连接已建立");
      if (this.onOpenCallback) {
        this.onOpenCallback();
      }
    });
    this.socketTask.onMessage((result) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(result.data);
      }
    });
    this.socketTask.onClose((result) => {
      console.log("WebSocket连接已关闭", result);
      if (this.onCloseCallback) {
        this.onCloseCallback(result);
      }
      this.socketTask = null;
    });
    this.socketTask.onError((error) => {
      console.error("WebSocket连接错误", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    });
  }
  /**
   * 发送消息
   * @param {string} message - 要发送的消息
   * @returns {Promise} - 返回发送结果的Promise
   */
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.socketTask) {
        const error = new Error("WebSocket未连接");
        console.error(error.message);
        reject(error);
        return;
      }
      this.socketTask.send({
        data: message,
        success: (res) => {
          console.log("消息发送成功");
          resolve(res);
        },
        fail: (error) => {
          console.error("消息发送失败", error);
          reject(error);
        }
      });
    });
  }
  /**
   * 关闭连接
   */
  close() {
    return new Promise((resolve, reject) => {
      if (!this.socketTask) {
        console.log("WebSocket已经关闭");
        resolve();
        return;
      }
      this.socketTask.close({
        code: 1e3,
        // 正常关闭
        reason: "Manual close",
        success: () => {
          console.log("WebSocket连接已手动关闭");
          this.socketTask = null;
          resolve();
        },
        fail: (error) => {
          console.error("WebSocket关闭失败", error);
          reject(error);
        }
      });
    });
  }
  /**
   * 设置消息接收回调
   * @param {Function} callback - 消息接收回调函数
   */
  setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }
  /**
   * 设置连接成功回调
   * @param {Function} callback - 连接成功回调函数
   */
  setOnOpenCallback(callback) {
    this.onOpenCallback = callback;
  }
  /**
   * 设置连接关闭回调
   * @param {Function} callback - 连接关闭回调函数
   */
  setOnCloseCallback(callback) {
    this.onCloseCallback = callback;
  }
  /**
   * 设置错误回调
   * @param {Function} callback - 错误回调函数
   */
  setOnErrorCallback(callback) {
    this.onErrorCallback = callback;
  }
}
exports.WebSocketUtils = WebSocketUtils;
