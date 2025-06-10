"use strict";
const common_vendor = require("../common/vendor.js");
const emptyUserDetail = {
  account: "",
  username: "",
  email: "",
  avatar: "",
  status: "",
  phone: "",
  role: 0,
  isWechatBound: false
};
const useUserStore = common_vendor.defineStore("user", () => {
  const isLogin = common_vendor.ref(false);
  const userDetail = common_vendor.ref({ ...emptyUserDetail });
  const token = common_vendor.ref("");
  const participation = common_vendor.ref([]);
  const myActivity = common_vendor.ref([]);
  const friend = common_vendor.ref([]);
  const group = common_vendor.ref([]);
  const followData = common_vendor.ref([]);
  const systemInfo = common_vendor.ref([]);
  const getUser = () => {
    return userDetail.value;
  };
  const getToken = () => {
    return token.value;
  };
  const getIsLogin = () => {
    return isLogin.value;
  };
  const getParticipation = () => {
    return participation.value;
  };
  const getMyActivity = () => {
    return myActivity.value;
  };
  const getFriend = () => {
    return friend.value;
  };
  const getGroup = () => {
    return group.value;
  };
  const getFollowData = () => {
    return followData.value;
  };
  const getSystemInfo = () => {
    return systemInfo.value;
  };
  const setUser = (data) => {
    const fieldsToUpdate = ["account", "username", "email", "avatar", "status", "phone", "role", "isWechatBound"];
    fieldsToUpdate.forEach((field) => {
      if (data.hasOwnProperty(field)) {
        userDetail.value[field] = data[field] ?? userDetail.value[field];
      }
    });
  };
  const setToken = (data) => {
    token.value = data;
  };
  const setIsLogin = (data) => {
    isLogin.value = data;
  };
  const setParticipation = (data) => {
    participation.value = data;
  };
  const setMyActivity = (data) => {
    myActivity.value = data;
  };
  const setFriend = (data) => {
    friend.value = data;
  };
  const setGroup = (data) => {
    group.value = data;
  };
  const setFollowData = (data) => {
    followData.value = data;
  };
  const setSystemInfo = (data) => {
    systemInfo.value = data;
  };
  const quit = () => {
    setIsLogin(false);
    setToken("");
    setUser(emptyUserDetail);
    setParticipation([]);
    setMyActivity([]);
    setFriend([]);
    setGroup([]);
    setFollowData([]);
    setSystemInfo([]);
  };
  const updateGroupInfo = (groupData) => {
    const groups = getGroup();
    const index = groups.findIndex((g) => g.group.groupId === groupData.groupId);
    if (index !== -1) {
      groups[index].group = {
        ...groups[index].group,
        groupName: groupData.groupName,
        announcement: groupData.announcement,
        avatar: groupData.avatar
      };
      common_vendor.index.setStorageSync("groups", JSON.stringify(groups));
    }
  };
  return {
    userDetail,
    token,
    isLogin,
    participation,
    myActivity,
    friend,
    group,
    followData,
    systemInfo,
    getUser,
    getToken,
    getIsLogin,
    setUser,
    setToken,
    setIsLogin,
    setFriend,
    setGroup,
    setFollowData,
    setSystemInfo,
    quit,
    setParticipation,
    getParticipation,
    setMyActivity,
    getMyActivity,
    getFriend,
    getGroup,
    getFollowData,
    getSystemInfo,
    updateGroupInfo
  };
}, {
  persist: {
    enabled: true,
    key: "userStore"
  }
});
exports.useUserStore = useUserStore;
