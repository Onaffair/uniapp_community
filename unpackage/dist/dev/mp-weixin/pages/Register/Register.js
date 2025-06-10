"use strict";
const common_vendor = require("../../common/vendor.js");
const util_crypto = require("../../util/crypto.js");
const api_userAPI = require("../../api/userAPI.js");
if (!Math) {
  ImgUploader();
}
const ImgUploader = () => "../../components/ImgUploader/ImgUploader.js";
const _sfc_main = {
  __name: "Register",
  setup(__props) {
    const formData = common_vendor.ref({
      account: "",
      username: "",
      password: "",
      confirmPassword: "",
      // 新增确认密码字段
      email: "",
      phone: "",
      avatar: ""
    });
    const errors = common_vendor.reactive({
      account: "",
      username: "",
      password: "",
      confirmPassword: ""
    });
    const validateForm = () => {
      let isValid = true;
      errors.account = "";
      errors.username = "";
      errors.password = "";
      errors.confirmPassword = "";
      if (!formData.value.account.trim()) {
        errors.account = "账号不能为空";
        isValid = false;
      }
      if (!formData.value.username.trim()) {
        errors.username = "用户名不能为空";
        isValid = false;
      }
      if (!formData.value.password) {
        errors.password = "密码不能为空";
        isValid = false;
      } else if (formData.value.password.length < 3) {
        errors.password = "密码长度不能少于3位";
        isValid = false;
      }
      if (formData.value.password !== formData.value.confirmPassword) {
        errors.confirmPassword = "两次输入的密码不一致";
        isValid = false;
      }
      return isValid;
    };
    const generateRegisterInfo = () => {
      return {
        account: formData.value.account,
        username: formData.value.username,
        password: util_crypto.encrypt(formData.value.password),
        email: formData.value.email,
        phone: formData.value.phone,
        avatar: formData.value.avatar
      };
    };
    const onSubmit = async () => {
      if (!validateForm())
        return;
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      try {
        const registerInfo = generateRegisterInfo();
        const res = await api_userAPI.postRegisterInfo(registerInfo);
        common_vendor.index.hideLoading();
        if ((res == null ? void 0 : res.code) === 200) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success",
            duration: 2e3
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/Home/Home"
            });
          }, 2e3);
        } else {
          common_vendor.index.showToast({
            title: (res == null ? void 0 : res.msg) || "注册失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "注册失败，请稍后再试",
          icon: "none"
        });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(($event) => formData.value.avatar = $event),
        c: common_vendor.p({
          ["max-count"]: 1,
          ["is-preview"]: true,
          ["img-style"]: {
            width: "140rpx",
            height: "140rpx",
            borderRadius: "50%"
          },
          modelValue: formData.value.avatar
        }),
        d: formData.value.account,
        e: common_vendor.o(($event) => formData.value.account = $event.detail.value),
        f: errors.account
      }, errors.account ? {
        g: common_vendor.t(errors.account)
      } : {}, {
        h: formData.value.username,
        i: common_vendor.o(($event) => formData.value.username = $event.detail.value),
        j: errors.username
      }, errors.username ? {
        k: common_vendor.t(errors.username)
      } : {}, {
        l: formData.value.password,
        m: common_vendor.o(($event) => formData.value.password = $event.detail.value),
        n: errors.password
      }, errors.password ? {
        o: common_vendor.t(errors.password)
      } : {}, {
        p: formData.value.confirmPassword,
        q: common_vendor.o(($event) => formData.value.confirmPassword = $event.detail.value),
        r: errors.confirmPassword
      }, errors.confirmPassword ? {
        s: common_vendor.t(errors.confirmPassword)
      } : {}, {
        t: formData.value.email,
        v: common_vendor.o(($event) => formData.value.email = $event.detail.value),
        w: formData.value.phone,
        x: common_vendor.o(($event) => formData.value.phone = $event.detail.value),
        y: common_vendor.o(onSubmit),
        z: common_vendor.o(onSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b0433d4"]]);
wx.createPage(MiniProgramPage);
