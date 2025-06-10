<template>
    <view class="comment-wrapper">
        <view class="comment-container">
            <!-- 引用内容（仅在 replyHint 存在时显示） -->
            <view v-if="myComment.replyHint" class="quote">
                <view class="quote-content">
                    <text class="quote-icon">💬</text>
                    <text>{{ myComment.replyText }}</text>
                </view>
                <text class="iconfont icon-close quote-close" @tap="clearReply"></text>
            </view>

            <!-- 评分 -->
            <view class="rating">
                <text
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ filled: i <= myComment.rating }"
                    @tap="setRating(i)"
                >★
                </text>
            </view>

            <view class="user-info">
                <image :src="imgBaseUrl+userDetail?.avatar" class="user-avatar"/>
                <input
                    v-model="myComment.textContent"
                    placeholder="写下你的评论..."
                    class="comment-input"
                />
                <view class="upload-section">
                    <ImgUploader
                        v-model:img-src="myComment.imageUrl"
                        :max-count="1"
                    >
                        <template #button>
                            <view class="upload-icon">
                                <text class="icon">📷</text>
                            </view>
                        </template>
                    </ImgUploader>
                </view>
            </view>


            <!-- 发布按钮 -->
            <button class="submit-button" @tap="submitComment">发布评论</button>
        </view>
    </view>
</template>

<script setup>
import {reactive} from "vue";
import {imgBaseUrl} from "@/util/basic-data";
import {useUserStore} from "@/store/userStore";
import {postActivityComment} from "@/api/activityAPI";
import ImgUploader from "@/components/ImgUploader/ImgUploader.vue";

const userStore = useUserStore();
const emits = defineEmits(["onCommentSuccess"]);

const props = defineProps({
    myComment: {
        type: Object,
        default: () => ({
            activityId: "",
            userId: "",
            textContent: "",
            imageUrl: '',
            rating: 0,
            replyHint: null,
            replyText: "",
        }),
    }
});

const myComment = reactive(props.myComment);
const userDetail = userStore.getUser();

// 清除回复
const clearReply = () => {
    myComment.replyHint = null;
    myComment.replyText = null;
};

// 设置评分
const setRating = (value) => {
    myComment.rating = value;
};

// 提交评论
const submitComment = async () => {
    if (!myComment.textContent.trim() && !myComment.imageUrl) {
        uni.showToast({
            title: '评论内容不能为空！',
            icon: 'none'
        });
        return;
    }

    try {
        const res = await postActivityComment(myComment);
        if (res.code === 200) {
            myComment.textContent = "";
            myComment.imageUrl = '';
            myComment.rating = 0;
            myComment.replyHint = null;
            myComment.replyText = null;

            emits("onCommentSuccess"); // 重新获取信息

            uni.showToast({
                title: '评论成功',
                icon: 'success'
            });
        }
    } catch (error) {
        uni.showToast({
            title: '评论失败',
            icon: 'none'
        });
    }
};
</script>

<style>
/* 容器 */
.comment-wrapper {
    display: flex;
    justify-content: center;
    padding: 40rpx;
}

.comment-container {
    width: 90%;
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 头像 & 输入框 */
.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.comment-input {
    flex: 1;
    padding: 20rpx;
    border: 1px solid #ddd;
    border-radius: 10rpx;
    font-size: 28rpx;
}

/* 评分 */
.rating {
    display: flex;
    margin: 20rpx 0;
}

.star {
    font-size: 40rpx;
    color: lightgray;
    margin-right: 10rpx;
}

.filled {
    color: gold;
}

/* 引用内容 */
.quote {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    padding: 16rpx;
    border-left: 8rpx solid #1989fa;
    font-size: 28rpx;
    color: #555;
    margin-bottom: 30rpx;
    border-radius: 10rpx;
}

.quote-content {
    display: flex;
    align-items: center;
}

.quote-close {
    font-size: 36rpx;
    color: #999;
}

.quote-icon {
    margin-right: 10rpx;
}

/* 上传图片 */
.upload-section {
    display: flex;
    align-items: center;
}

/* 发布按钮 */
.submit-button {
    margin-top: 40rpx;
    width: 100%;
    padding: 16rpx;
    background: #1989fa;
    color: white;
    border: none;
    border-radius: 10rpx;
    font-size: 32rpx;
}
.upload-icon {
    width: 80rpx;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #ddd;
}

.upload-icon .icon {
    font-size: 32rpx;
}
</style> 