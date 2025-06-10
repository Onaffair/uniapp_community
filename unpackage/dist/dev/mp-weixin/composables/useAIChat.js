"use strict";
const common_vendor = require("../common/vendor.js");
const util_showMessages = require("../util/showMessages.js");
const store_userStore = require("../store/userStore.js");
const util_basicData = require("../util/basic-data.js");
function useAIChat({ endpoint = "/ai/chat" } = {}) {
  const markdownContent = common_vendor.ref("");
  const isLoading = common_vendor.ref(false);
  const error = common_vendor.ref(null);
  const sendRequest = async (payload, method = "POST") => {
    isLoading.value = true;
    markdownContent.value = "";
    error.value = null;
    try {
      const token = store_userStore.useUserStore().getToken();
      const fullUrl = new URL(`api${endpoint}`, util_basicData.backUrl);
      if (method.toUpperCase() === "GET") {
        Object.entries(payload).forEach(([key, value]) => {
          fullUrl.searchParams.append(key, value);
        });
      }
      const options = {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      };
      if (method.toUpperCase() === "POST") {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(payload);
      }
      const response = await fetch(fullUrl.href, options);
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态码：${response.status}`);
      }
      if (!response.body) {
        throw new Error("ReadableStream 不可用");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith("data:")) {
            let dataStr = line.slice(5).trim();
            if (!dataStr)
              continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                markdownContent.value += data.content;
              }
            } catch (e) {
              buffer = dataStr;
              try {
                const combined2 = buffer;
                const data = JSON.parse(combined2);
                buffer = "";
                if (data.content) {
                  markdownContent.value += data.content;
                }
              } catch {
                console.warn("JSON 缓冲区未完成:", combined);
              }
            }
          }
        }
      }
      if (buffer) {
        try {
          const data = JSON.parse(buffer);
          if (data.content) {
            markdownContent.value += data.content;
          }
        } catch {
          console.warn("最终缓冲区解析失败:", buffer);
        }
      }
      isLoading.value = false;
    } catch (err) {
      console.error("AI 请求失败:", err);
      error.value = err.message;
      util_showMessages.alertFail("AI 回复失败", err.message);
      isLoading.value = false;
    }
  };
  return {
    markdownContent,
    isLoading,
    error,
    sendRequest
  };
}
exports.useAIChat = useAIChat;
