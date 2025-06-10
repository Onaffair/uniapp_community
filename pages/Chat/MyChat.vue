<template>
    <view class="chat-list">
        
        <!-- 搜索框 -->
        <view class="search-box">
            <input
                type="text"
                class="search-input"
                v-model="searchQuery"
                placeholder="搜索好友或群组"
                confirm-type="search"
                @confirm="onSearch"
            />
            <text v-if="searchQuery" class="search-cancel" @tap="onCancel">取消</text>
        </view>

        <!-- 搜索结果 -->
        <view v-if="searchQuery" class="search-results">
            <view class="results-header">搜索结果</view>
            
            <!-- 好友搜索结果 -->
            <block v-if="filteredFriends.length > 0">
                <view class="results-subheader">好友</view>
                <view
                    v-for="friend in filteredFriends"
                    :key="friend.account"
                    class="list-item"
                    @tap="goToChat(friend, 'friend')"
                >
                    <image class="avatar" :src="imgBaseUrl + friend.avatar" mode="aspectFill"></image>
                    <view class="friend-info">
                        <text class="name">{{ friend.userName }}</text>
                        <text class="last-msg">{{
                                friend.chat[friend.chat.length - 1]?.textContent || '暂无消息'
                            }}
                        </text>
                    </view>
                </view>
            </block>
            
            <!-- 群组搜索结果 -->
            <block v-if="filteredGroups.length > 0">
                <view class="results-subheader">群聊</view>
                <view
                    v-for="item in filteredGroups"
                    :key="item.group.groupId"
                    class="list-item"
                    @tap="goToGroupChat(item, 'group')"
                >
                    <image
                        class="avatar"
                        :src="item.group.avatar ? imgBaseUrl+item.group.avatar : '/static/images/default-group.png'"
                        mode="aspectFill"
                    ></image>
                    <view class="friend-info">
                        <text class="name">{{ item.group.groupName }}</text>
                        <text class="last-msg">{{
                                item.chat[item.chat.length - 1]?.textContent || (item.chat[item.chat.length - 1]?.imageUrl ? '[图片]' : '暂无消息')
                            }}
                        </text>
                    </view>
                </view>
            </block>
            
            <!-- 无结果提示 -->
            <view v-if="filteredFriends.length === 0 && filteredGroups.length === 0" class="no-results">
                <text>没有找到相关联系人或群组</text>
            </view>
        </view>

        <!-- 列表展示 -->
        <view v-else class="content-container">
            <!-- 好友列表 -->
            <view class="section">
                <view class="section-header" @tap="toggleSection('friends')">
                    <text class="section-title">好友</text>
                    <text class="section-arrow" :class="{ 'active': activeSections.includes('friends') }">▼</text>
                </view>
                <view class="section-content" v-if="activeSections.includes('friends')">
                    <view
                        v-for="friend in friends"
                        :key="friend.account"
                        class="list-item"
                        @tap="goToChat(friend, 'friend')"
                    >
                        <image  class="avatar" :src="imgBaseUrl + friend.avatar" mode="aspectFill"></image>
                        <view class="friend-info">
                            <text class="name">{{ friend.userName }}</text>
                            <text class="last-msg">{{
                                    friend.chat[friend.chat.length - 1]?.textContent || friend.chat[friend.chat.length - 1]?.imageUrl ? '[图片]':'暂无消息'
                                }}
                            </text>
                        </view>
                    </view>
                    <view v-if="friends.length === 0" class="empty-hint">
                        <text>暂无好友</text>
                    </view>
                </view>
            </view>

            <!-- 群聊列表 -->
            <view class="section">
                <view class="section-header" @tap="toggleSection('groups')">
                    <text class="section-title">群聊</text>
                    <text class="section-arrow" :class="{ 'active': activeSections.includes('groups') }">▼</text>
                </view>
                <view class="section-content" v-if="activeSections.includes('groups')">
                    <view
                        v-for="item in groups"
                        :key="item.group.groupId"
                        class="list-item"
                        @tap="goToGroupChat(item, 'group')"
                    >
                        <image
                            class="avatar"
                            :src="item.group.avatar ? imgBaseUrl+item.group.avatar : '/static/images/default-group.png'"
                            mode="aspectFill"
                        ></image>
                        <view class="friend-info">
                            <text class="name">{{ item.group.groupName }}</text>
                            <text class="last-msg">{{
                                    item.chat[item.chat.length - 1]?.textContent || (item.chat[item.chat.length - 1]?.imageUrl ? '[图片]' : '暂无消息')
                                }}
                            </text>
                        </view>
                    </view>
                    <view v-if="groups.length === 0" class="empty-hint">
                        <text>暂无群聊</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import {useUserStore} from '@/store/userStore';
import {imgBaseUrl} from "@/util/basic-data";
import HeadTop from "@/components/Head/Head.vue";

const userStore = useUserStore();

const searchQuery = ref('');
const activeSections = ref(['friends', 'groups']); // 默认展开好友和群组

// 获取好友列表和群组列表
const friends = computed(() => userStore.getFriend());
const groups = computed(() => userStore.getGroup());

// 过滤好友列表
const filteredFriends = computed(() => {
    if (!searchQuery.value) return friends.value;
    const query = searchQuery.value.toLowerCase();
    return friends.value.filter(friend => {
        // 同时搜索用户名和帐号
        return friend.userName?.toLowerCase().includes(query) ||
            friend.account?.toLowerCase().includes(query);
    });
});

// 过滤群组列表
const filteredGroups = computed(() => {
    if (!searchQuery.value) return groups.value;
    const query = searchQuery.value.toLowerCase();
    return groups.value.filter(group => {
        // 搜索群组名称和群组ID
        return group.group.groupName?.toLowerCase().includes(query) ||
            group.group.groupId?.toString().includes(query);
    });
});

// 搜索相关方法
const onSearch = () => {
    // 可以在这里添加额外的搜索逻辑，如记录搜索历史等
    console.log('搜索:', searchQuery.value);
};

const onCancel = () => {
    searchQuery.value = '';
};

// 切换分组展开/收起状态
const toggleSection = (sectionName) => {
    if (activeSections.value.includes(sectionName)) {
        activeSections.value = activeSections.value.filter(name => name !== sectionName);
    } else {
        activeSections.value.push(sectionName);
    }
};

// 跳转到聊天界面
const goToChat = (target, type) => {
    uni.navigateTo({
        url: `./ChatRoom?targetId=${target.account || target.id}&targetName=${target.userName || target.name}&type=${type}`
    });
};

const goToGroupChat = (target, type) => {
    uni.navigateTo({
        url: `./GroupChatRoom?targetId=${target.group.groupId}&type=${type}`
    });
};

// 监听搜索词变化，自动展开所有分组
watch(searchQuery, (newVal) => {
    if (newVal) {
        activeSections.value = ['friends', 'groups'];
    }
});
</script>

<style>
.chat-list {
    padding: 0 30rpx 30rpx;
    background: #f7f8fa;
    height: 100vh;
}

.search-box {
    display: flex;
    align-items: center;
    margin: 20rpx 0;
}

.search-input {
    flex: 1;
    height: 80rpx;
    background: #ffffff;
    border-radius: 40rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
}

.search-cancel {
    padding-left: 20rpx;
    font-size: 28rpx;
    color: #007AFF;
}

.content-container {
    padding-bottom: 120rpx; /* 为tabBar留出空间 */
}

.section {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1px solid #f5f5f5;
}

.section-title {
    font-size: 32rpx;
    font-weight: 500;
}

.section-arrow {
    font-size: 24rpx;
    color: #999;
    transition: transform 0.3s;
}

.section-arrow.active {
    transform: rotate(180deg);
}

.section-content {
    padding: 0 20rpx;
}

.list-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #f5f5f5;
}

.list-item:last-child {
    border-bottom: none;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.friend-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.name {
    font-size: 32rpx;
    font-weight: 500;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.last-msg {
    font-size: 24rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 搜索结果样式 */
.search-results {
    background: #ffffff;
    border-radius: 12rpx;
    margin-top: 20rpx;
    overflow: hidden;
}

.results-header {
    font-weight: bold;
    font-size: 32rpx;
    padding: 20rpx 30rpx;
    border-bottom: 1px solid #f5f5f5;
}

.results-subheader {
    color: #999;
    font-size: 28rpx;
    padding: 16rpx 30rpx;
    background-color: #f9f9f9;
}

.no-results, .empty-hint {
    padding: 60rpx 0;
    text-align: center;
    color: #999;
    font-size: 28rpx;
}
</style> 