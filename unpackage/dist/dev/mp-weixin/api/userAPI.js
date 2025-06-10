"use strict";
const common_vendor = require("../common/vendor.js");
const util_request = require("../util/request.js");
const util_showMessages = require("../util/showMessages.js");
const store_userStore = require("../store/userStore.js");
require("../store/tabStore.js");
require("../store/activityStore.js");
const api_activityAPI = require("./activityAPI.js");
const api_GroupApI = require("./GroupApI.js");
const postRegisterInfo = async (data) => {
  var _a, _b, _c;
  try {
    let res = await util_request.request.post("/user/public/register", data);
    const userStore = store_userStore.useUserStore();
    userStore.quit();
    userStore.setUser((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    userStore.setToken((_c = (_b = res == null ? void 0 : res.data) == null ? void 0 : _b.data) == null ? void 0 : _c.token);
    userStore.setIsLogin(true);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(postRegisterInfo.name, e == null ? void 0 : e.message);
  }
};
const postLoginInfo = async (data) => {
  var _a, _b;
  try {
    let res = await util_request.request.post("/user/public/login", data);
    if (((_a = res.data) == null ? void 0 : _a.code) === 500) {
      common_vendor.index.showToast({
        title: (_b = res == null ? void 0 : res.data) == null ? void 0 : _b.msg,
        icon: "none"
      });
    }
    const userStore = store_userStore.useUserStore();
    userStore.setUser(res.data.data);
    userStore.setToken(res == null ? void 0 : res.data.data.token);
    userStore.setIsLogin(true);
    await api_activityAPI.getJoinedActivity();
    await api_activityAPI.getUserActivity().then((res2) => {
      userStore.setMyActivity(res2 == null ? void 0 : res2.data);
    });
    await getFriend();
    await getFollowList().then((res2) => {
      userStore.setFollowData(res2 == null ? void 0 : res2.data);
    });
    await getFriendRequest().then((res2) => {
      userStore.setSystemInfo(res2 == null ? void 0 : res2.data);
    });
    await api_GroupApI.geyMyGroup();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(postLoginInfo.name, e == null ? void 0 : e.message);
  }
};
const userQuit = async () => {
  try {
    let res = await util_request.request.post(`/user/quit`);
    const userStore = store_userStore.useUserStore();
    userStore.quit();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(userQuit.name, e == null ? void 0 : e.message);
  }
};
const userEditInfo = async (data) => {
  try {
    let res = await util_request.request.post("/user/editInfo", data);
    res = res.data;
    if ((res == null ? void 0 : res.code) === 200) {
      const userStore = store_userStore.useUserStore();
      userStore.setUser(res.data);
    } else {
      common_vendor.index.showToast({
        title: res == null ? void 0 : res.msg,
        icon: "none"
      });
    }
  } catch (e) {
    util_showMessages.alertFail(userEditInfo.name, e == null ? void 0 : e.message);
  }
};
const reFreshToken = async () => {
  var _a;
  const userStore = store_userStore.useUserStore();
  try {
    let res = await util_request.request.get("/user/reFlashToken");
    if ((res == null ? void 0 : res.data.code) !== 200) {
      throw new Error(res == null ? void 0 : res.data.msg);
    }
    userStore.setToken((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(reFreshToken.name, e == null ? void 0 : e.message);
    userStore.quit();
    common_vendor.index.switchTab({ url: "/pages/PersonalCenter/PersonalCenter" });
    common_vendor.index.showToast({
      title: "登录已过期，请重新登录",
      icon: "none"
    });
  }
};
const getFriend = async () => {
  var _a;
  try {
    let res = await util_request.request.get("/user/friend/get");
    store_userStore.useUserStore().setFriend(((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data) || []);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getFriend.name, e == null ? void 0 : e.message);
  }
};
const follow = async (userId) => {
  try {
    let res = await util_request.request.post("/user/follow", userId, {
      header: { "Content-Type": "application/json" }
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(follow.name, e == null ? void 0 : e.message);
  }
};
const unfollow = async (userId) => {
  try {
    let res = await util_request.request.post("/user/unfollow", userId, {
      header: { "Content-Type": "application/json" }
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(unfollow.name, e == null ? void 0 : e.message);
  }
};
const getFollowList = async (userId = null) => {
  try {
    let res = await util_request.request.get("/user/followList", {
      userId
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getFollowList.name, e == null ? void 0 : e.message);
  }
};
const getUserInfo = async (userId = null) => {
  try {
    let res = await util_request.request.get("/user/info", {
      userId
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getUserInfo.name, e == null ? void 0 : e.message);
  }
};
const addFriend = async (friendAccount) => {
  try {
    let res = await util_request.request.post("/user/friend/add", friendAccount);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(addFriend.name, e == null ? void 0 : e.message);
  }
};
const getFriendRequest = async () => {
  try {
    let res = await util_request.request.get("/user/friend/getRequest");
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getFriendRequest.name, e == null ? void 0 : e.message);
  }
};
const getRequesterInfo = async (userList) => {
  try {
    let res = await util_request.request.get("/user/friend/requester-info", {
      userList
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getRequesterInfo.name, e == null ? void 0 : e.message);
  }
};
const friendRequestAccept = async (requestId) => {
  try {
    let res = await util_request.request.post("/user/friend/request-accept", requestId);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(friendRequestAccept.name, e == null ? void 0 : e.message);
  }
};
const friendRequestRefuse = async (requestId) => {
  try {
    let res = await util_request.request.post("/user/friend/request-refuse", requestId);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(friendRequestRefuse.name, e == null ? void 0 : e.message);
  }
};
const wxLogin = async (data) => {
  var _a;
  try {
    const requestData = typeof data === "string" ? { code: data } : data;
    let res = await util_request.request.post("/wx/public/login", requestData).then((t) => t.data);
    if ((res == null ? void 0 : res.code) === 200) {
      const userStore = store_userStore.useUserStore();
      userStore.setUser(res.data.user);
      userStore.setToken(res.data.token);
      userStore.setIsLogin(true);
      await api_activityAPI.getJoinedActivity();
      await api_activityAPI.getUserActivity().then((res2) => {
        userStore.setMyActivity(res2 == null ? void 0 : res2.data);
      });
      await getFriend();
      await getFollowList().then((res2) => {
        userStore.setFollowData(res2 == null ? void 0 : res2.data);
      });
      await getFriendRequest().then((res2) => {
        userStore.setSystemInfo(res2 == null ? void 0 : res2.data);
      });
      await api_GroupApI.geyMyGroup();
    } else {
      common_vendor.index.showToast({
        title: ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.msg) || "微信登录失败",
        icon: "none"
      });
    }
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(wxLogin.name, e == null ? void 0 : e.message);
  }
};
const getSTS = async () => {
  try {
    let res = await util_request.request.get("/oss/get-sts");
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getSTS.name, e == null ? void 0 : e.message);
  }
};
const getSign = async (ext) => {
  try {
    let res = await util_request.request.get("/oss/get-sign", {
      ext
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getSign.name, e == null ? void 0 : e.message);
  }
};
exports.addFriend = addFriend;
exports.follow = follow;
exports.friendRequestAccept = friendRequestAccept;
exports.friendRequestRefuse = friendRequestRefuse;
exports.getFollowList = getFollowList;
exports.getFriend = getFriend;
exports.getFriendRequest = getFriendRequest;
exports.getRequesterInfo = getRequesterInfo;
exports.getSTS = getSTS;
exports.getSign = getSign;
exports.getUserInfo = getUserInfo;
exports.postLoginInfo = postLoginInfo;
exports.postRegisterInfo = postRegisterInfo;
exports.reFreshToken = reFreshToken;
exports.unfollow = unfollow;
exports.userEditInfo = userEditInfo;
exports.userQuit = userQuit;
exports.wxLogin = wxLogin;
