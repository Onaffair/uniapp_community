"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const util_crypto = require("../../util/crypto.js");
const api_userAPI = require("../../api/userAPI.js");
const _sfc_main = {
  __name: "Login",
  setup(__props) {
    const name = common_vendor.ref("");
    const password = common_vendor.ref("");
    const inputType = common_vendor.ref("password");
    const passwordClass = common_vendor.ref("icon-input-show");
    const togglePasswordVisibility = () => {
      inputType.value = inputType.value === "password" ? "text" : "password";
      passwordClass.value = passwordClass.value === "icon-input-show" ? "icon-input-password" : "icon-input-show";
    };
    const goToRegister = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Register/Register"
      });
    };
    const handleWxLogin = () => {
      common_vendor.index.getUserProfile({
        desc: "用于完善用户资料",
        // 声明获取用户个人信息后的用途
        success: (profileRes) => {
          const userInfo = profileRes.userInfo;
          common_vendor.index.showLoading({
            title: "登录中..."
          });
          common_vendor.index.login({
            provider: "weixin",
            success: async (loginRes) => {
              if (loginRes.code) {
                try {
                  const res = await api_userAPI.wxLogin({
                    code: loginRes.code,
                    userInfo
                  });
                  common_vendor.index.hideLoading();
                  if ((res == null ? void 0 : res.code) === 200) {
                    console.log("微信登录返回数据:", res.data);
                    common_vendor.index.showToast({
                      title: "登录成功",
                      icon: "success",
                      duration: 2e3
                    });
                    setTimeout(() => {
                      common_vendor.index.switchTab({
                        url: "/pages/Home/Home"
                      });
                    }, 2e3);
                  }
                } catch (error) {
                  common_vendor.index.hideLoading();
                  common_vendor.index.showToast({
                    title: "微信登录失败",
                    icon: "none"
                  });
                  console.error("微信登录失败:", error);
                }
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: "微信登录授权失败",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "微信登录失败",
                icon: "none"
              });
              console.error("微信登录失败:", err);
            }
          });
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "用户拒绝了授权",
            icon: "none"
          });
          console.error("获取用户信息失败:", err);
        }
      });
    };
    const submit = async () => {
      const userName = name.value;
      const userPassword = password.value;
      if (validateUserName(userName) !== "ok") {
        common_vendor.index.showToast({
          title: "用户名格式不正确",
          icon: "none"
        });
        return;
      }
      if (validatePassword(userPassword) !== "ok") {
        common_vendor.index.showToast({
          title: "密码格式不正确",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      try {
        const res = await api_userAPI.postLoginInfo({
          account: userName,
          password: util_crypto.encrypt(userPassword)
        });
        common_vendor.index.hideLoading();
        if ((res == null ? void 0 : res.code) === 200) {
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 2e3
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/Home/Home"
            });
          }, 2e3);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      }
    };
    const validateUserName = (userName) => {
      if (!userName)
        return "用户名不能为空";
      return "ok";
    };
    const validatePassword = (password2) => {
      if (!password2)
        return "密码不能为空";
      if (password2.length < 3)
        return "密码长度为6-20位，请重新输入";
      return "ok";
    };
    return (_ctx, _cache) => {
      return {
        a: name.value,
        b: common_vendor.o(common_vendor.m(($event) => name.value = $event.detail.value, {
          trim: true
        })),
        c: inputType.value,
        d: inputType.value,
        e: password.value,
        f: common_vendor.o(common_vendor.m(($event) => password.value = $event.detail.value, {
          trim: true
        })),
        g: common_vendor.n(passwordClass.value),
        h: common_vendor.o(togglePasswordVisibility),
        i: common_vendor.o(submit),
        j: common_assets._imports_0$1,
        k: common_vendor.o(handleWxLogin),
        l: common_vendor.o(goToRegister)
      };
    };
  }
};
wx.createComponent(_sfc_main);
