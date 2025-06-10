"use strict";
const util_request = require("../util/request.js");
const util_showMessages = require("../util/showMessages.js");
const store_activityStore = require("../store/activityStore.js");
const common_vendor = require("../common/vendor.js");
const store_userStore = require("../store/userStore.js");
const launchActivity = async (data) => {
  try {
    let res = await util_request.request.post("/activity/launch", data);
    await getUserActivity();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(launchActivity.name, e == null ? void 0 : e.message);
  }
};
const getCityAndCategory = async () => {
  var _a;
  try {
    let res = await util_request.request.get("/activity/public/city-category");
    res = res == null ? void 0 : res.data;
    const activeStore = store_activityStore.useActivityStore();
    activeStore.setCityList(res == null ? void 0 : res.data.cities);
    activeStore.setCategoryList((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.categories);
    return res;
  } catch (e) {
    util_showMessages.alertFail(getCityAndCategory.name, e == null ? void 0 : e.message);
  }
};
const getActivityList = (selectedCategory = common_vendor.ref(0), page = common_vendor.ref(1), keyword = common_vendor.ref(""), isLoading = common_vendor.ref(false)) => {
  const activities = common_vendor.ref();
  common_vendor.watch([selectedCategory, page, keyword], async () => {
    var _a;
    try {
      isLoading.value = true;
      let res = await util_request.request.get("/activity/public/activity-list", {
        categoryId: selectedCategory.value || 0,
        page: 1,
        pageSize: 4 * page.value || 4,
        keyword: keyword.value || ""
      });
      isLoading.value = false;
      activities.value = (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data;
    } catch (e) {
      util_showMessages.alertFail(getActivityList.name, e == null ? void 0 : e.message);
    }
  }, {
    immediate: true
  });
  return activities;
};
const getActivityDetail = async (id) => {
  var _a;
  try {
    let res = await util_request.request.get("/activity/public/activity-detail", {
      id
    });
    return (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data;
  } catch (e) {
    util_showMessages.alertFail(getActivityDetail.name, e == null ? void 0 : e.message);
  }
};
const getJoinedActivity = async () => {
  var _a;
  try {
    let res = await util_request.request.get("/activity/activity-joined");
    const userStore = store_userStore.useUserStore();
    userStore.setParticipation(((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data) ?? []);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getJoinedActivity.name, e == null ? void 0 : e.message);
  }
};
const joinActivity = async (activityId) => {
  try {
    let res = await util_request.request.post("/activity/activity-join", activityId, {
      header: { "Content-Type": "application/json" }
    });
    await getJoinedActivity();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(joinActivity.name, e == null ? void 0 : e.message);
  }
};
const cancelJoinActivity = async (activityId) => {
  try {
    let res = await util_request.request.post("/activity/activity-join-cancel", activityId, {
      header: { "Content-Type": "application/json" }
    });
    await getJoinedActivity();
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(cancelJoinActivity.name, e == null ? void 0 : e.message);
  }
};
const getUserActivity = async (userId = null) => {
  try {
    let res = await util_request.request.get("/activity/list", {
      userId
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getUserActivity.name, e == null ? void 0 : e.message);
  }
};
const cancelActivity = async (activityId) => {
  try {
    let res = await util_request.request.post("/activity/activity-cancel", activityId, {
      header: { "Content-Type": "application/json" }
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(cancelActivity.name, e == null ? void 0 : e.message);
  }
};
const postActivityComment = async (data) => {
  try {
    let res = await util_request.request.post("/activity/activity-comment", data);
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(postActivityComment.name, e == null ? void 0 : e.message);
  }
};
const getTopActivity = async (num = 3) => {
  try {
    let res = await util_request.request.get(`/activity/public/top-activity`, {
      num
    });
    return res == null ? void 0 : res.data;
  } catch (e) {
    util_showMessages.alertFail(getTopActivity.name, e == null ? void 0 : e.message);
  }
};
exports.cancelActivity = cancelActivity;
exports.cancelJoinActivity = cancelJoinActivity;
exports.getActivityDetail = getActivityDetail;
exports.getActivityList = getActivityList;
exports.getCityAndCategory = getCityAndCategory;
exports.getJoinedActivity = getJoinedActivity;
exports.getTopActivity = getTopActivity;
exports.getUserActivity = getUserActivity;
exports.joinActivity = joinActivity;
exports.launchActivity = launchActivity;
exports.postActivityComment = postActivityComment;
