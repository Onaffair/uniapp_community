"use strict";
const common_vendor = require("../../common/vendor.js");
const store_userStore = require("../../store/userStore.js");
const util_basicData = require("../../util/basic-data.js");
const _sfc_main = {
  __name: "MyChat",
  setup(__props) {
    const userStore = store_userStore.useUserStore();
    const searchQuery = common_vendor.ref("");
    const activeSections = common_vendor.ref(["friends", "groups"]);
    const friends = common_vendor.computed(() => userStore.getFriend());
    const groups = common_vendor.computed(() => userStore.getGroup());
    const filteredFriends = common_vendor.computed(() => {
      if (!searchQuery.value)
        return friends.value;
      const query = searchQuery.value.toLowerCase();
      return friends.value.filter((friend) => {
        var _a, _b;
        return ((_a = friend.userName) == null ? void 0 : _a.toLowerCase().includes(query)) || ((_b = friend.account) == null ? void 0 : _b.toLowerCase().includes(query));
      });
    });
    const filteredGroups = common_vendor.computed(() => {
      if (!searchQuery.value)
        return groups.value;
      const query = searchQuery.value.toLowerCase();
      return groups.value.filter((group) => {
        var _a, _b;
        return ((_a = group.group.groupName) == null ? void 0 : _a.toLowerCase().includes(query)) || ((_b = group.group.groupId) == null ? void 0 : _b.toString().includes(query));
      });
    });
    const onSearch = () => {
      console.log("搜索:", searchQuery.value);
    };
    const onCancel = () => {
      searchQuery.value = "";
    };
    const toggleSection = (sectionName) => {
      if (activeSections.value.includes(sectionName)) {
        activeSections.value = activeSections.value.filter((name) => name !== sectionName);
      } else {
        activeSections.value.push(sectionName);
      }
    };
    const goToChat = (target, type) => {
      common_vendor.index.navigateTo({
        url: `./ChatRoom?targetId=${target.account || target.id}&targetName=${target.userName || target.name}&type=${type}`
      });
    };
    const goToGroupChat = (target, type) => {
      common_vendor.index.navigateTo({
        url: `./GroupChatRoom?targetId=${target.group.groupId}&type=${type}`
      });
    };
    common_vendor.watch(searchQuery, (newVal) => {
      if (newVal) {
        activeSections.value = ["friends", "groups"];
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onSearch),
        b: searchQuery.value,
        c: common_vendor.o(($event) => searchQuery.value = $event.detail.value),
        d: searchQuery.value
      }, searchQuery.value ? {
        e: common_vendor.o(onCancel)
      } : {}, {
        f: searchQuery.value
      }, searchQuery.value ? common_vendor.e({
        g: filteredFriends.value.length > 0
      }, filteredFriends.value.length > 0 ? {
        h: common_vendor.f(filteredFriends.value, (friend, k0, i0) => {
          var _a;
          return {
            a: common_vendor.unref(util_basicData.imgBaseUrl) + friend.avatar,
            b: common_vendor.t(friend.userName),
            c: common_vendor.t(((_a = friend.chat[friend.chat.length - 1]) == null ? void 0 : _a.textContent) || "暂无消息"),
            d: friend.account,
            e: common_vendor.o(($event) => goToChat(friend, "friend"), friend.account)
          };
        })
      } : {}, {
        i: filteredGroups.value.length > 0
      }, filteredGroups.value.length > 0 ? {
        j: common_vendor.f(filteredGroups.value, (item, k0, i0) => {
          var _a, _b;
          return {
            a: item.group.avatar ? common_vendor.unref(util_basicData.imgBaseUrl) + item.group.avatar : "/static/images/default-group.png",
            b: common_vendor.t(item.group.groupName),
            c: common_vendor.t(((_a = item.chat[item.chat.length - 1]) == null ? void 0 : _a.textContent) || (((_b = item.chat[item.chat.length - 1]) == null ? void 0 : _b.imageUrl) ? "[图片]" : "暂无消息")),
            d: item.group.groupId,
            e: common_vendor.o(($event) => goToGroupChat(item, "group"), item.group.groupId)
          };
        })
      } : {}, {
        k: filteredFriends.value.length === 0 && filteredGroups.value.length === 0
      }, filteredFriends.value.length === 0 && filteredGroups.value.length === 0 ? {} : {}) : common_vendor.e({
        l: activeSections.value.includes("friends") ? 1 : "",
        m: common_vendor.o(($event) => toggleSection("friends")),
        n: activeSections.value.includes("friends")
      }, activeSections.value.includes("friends") ? common_vendor.e({
        o: common_vendor.f(friends.value, (friend, k0, i0) => {
          var _a, _b;
          return {
            a: common_vendor.unref(util_basicData.imgBaseUrl) + friend.avatar,
            b: common_vendor.t(friend.userName),
            c: common_vendor.t(((_a = friend.chat[friend.chat.length - 1]) == null ? void 0 : _a.textContent) || ((_b = friend.chat[friend.chat.length - 1]) == null ? void 0 : _b.imageUrl) ? "[图片]" : "暂无消息"),
            d: friend.account,
            e: common_vendor.o(($event) => goToChat(friend, "friend"), friend.account)
          };
        }),
        p: friends.value.length === 0
      }, friends.value.length === 0 ? {} : {}) : {}, {
        q: activeSections.value.includes("groups") ? 1 : "",
        r: common_vendor.o(($event) => toggleSection("groups")),
        s: activeSections.value.includes("groups")
      }, activeSections.value.includes("groups") ? common_vendor.e({
        t: common_vendor.f(groups.value, (item, k0, i0) => {
          var _a, _b;
          return {
            a: item.group.avatar ? common_vendor.unref(util_basicData.imgBaseUrl) + item.group.avatar : "/static/images/default-group.png",
            b: common_vendor.t(item.group.groupName),
            c: common_vendor.t(((_a = item.chat[item.chat.length - 1]) == null ? void 0 : _a.textContent) || (((_b = item.chat[item.chat.length - 1]) == null ? void 0 : _b.imageUrl) ? "[图片]" : "暂无消息")),
            d: item.group.groupId,
            e: common_vendor.o(($event) => goToGroupChat(item, "group"), item.group.groupId)
          };
        }),
        v: groups.value.length === 0
      }, groups.value.length === 0 ? {} : {}) : {}));
    };
  }
};
wx.createPage(_sfc_main);
