"use strict";
const util_request = require("../util/request.js");
const store_userStore = require("../store/userStore.js");
const util_showMessages = require("../util/showMessages.js");
const createGroup = async (activity) => {
  var _a;
  try {
    let res = await util_request.request.post("/group/create-group", activity);
    console.log("creatGroup", res == null ? void 0 : res.data);
    const userStore = store_userStore.useUserStore();
    userStore.getGroup().push((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(createGroup.name, e == null ? void 0 : e.message);
  }
};
const geyMyGroup = async () => {
  var _a;
  try {
    let res = await util_request.request.get("/group/my-group");
    const userStore = store_userStore.useUserStore();
    userStore.setGroup((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(geyMyGroup.name, e == null ? void 0 : e.message);
  }
};
const joinGroup = async (activityId) => {
  var _a;
  try {
    let res = await util_request.request.post("/group/join-group", activityId);
    const userStore = store_userStore.useUserStore();
    userStore.getGroup().push((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(joinGroup.name, e == null ? void 0 : e.message);
  }
};
const quitGroup = async (activityId) => {
  try {
    let res = await util_request.request.post("/group/quit-group", activityId);
    await geyMyGroup();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(quitGroup.name, e == null ? void 0 : e.message);
  }
};
const updateGroup = async (group) => {
  try {
    let res = await util_request.request.post("/group/update-group", group);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(updateGroup.name, e == null ? void 0 : e.message);
    throw e;
  }
};
exports.createGroup = createGroup;
exports.geyMyGroup = geyMyGroup;
exports.joinGroup = joinGroup;
exports.quitGroup = quitGroup;
exports.updateGroup = updateGroup;
