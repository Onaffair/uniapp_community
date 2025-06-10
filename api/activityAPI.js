// activityAPI.js
import request from '../util/request';
import { alertFail } from '../util/showMessages';
import { useActivityStore } from '../store/activityStore';
import { ref, watch } from 'vue';
import { useUserStore } from '../store/userStore';

/**
 * 发起活动
 * @param {Object} data - 活动数据
 * @returns {Promise} - 返回发起结果
 */
export const launchActivity = async (data) => {
    try {
        let res = await request.post('/activity/launch', data);
        await getUserActivity();
        
        return res?.data;
    } catch (e) {
        alertFail(launchActivity.name, e?.message);
    }
};

/**
 * 上传图片
 * @param {Object} data - 图片数据
 * @returns {Promise} - 返回上传结果
 */
export const postImage = async (filePath) => {
    try {
        const res = await request.upload({
            url: '/user/public/avatar',
            filePath,
            name: 'file' // 与后端接收字段一致
        });
        return res;
    } catch (e) {
        alertFail(postImage.name, e?.message);
        throw e;
    }
};

/**
 * 删除图片
 * @param {string} fileName - 图片文件名
 * @returns {Promise} - 返回删除结果
 */
export const deleteImage = async (fileName) => {
    try {
        let res = await request.delete(`/user/public/avatar/${fileName}`);
        return res?.data;
    } catch (e) {
        alertFail(deleteImage.name, e?.message);
    }
};

/**
 * 获取城市与活动分类
 * @returns {Promise} - 返回城市和分类数据
 */
export const getCityAndCategory = async () => {
    try {
        let res = await request.get('/activity/public/city-category');
        res = res?.data;
        const activeStore = useActivityStore();
        activeStore.setCityList(res?.data.cities);
        activeStore.setCategoryList(res?.data?.categories);
        return res;
    } catch (e) {
        alertFail(getCityAndCategory.name, e?.message);
    }
};

/**
 * 获取活动列表
 * @param {Ref} selectedCategory - 选择的分类ID
 * @param {Ref} page - 页码
 * @param {Ref} keyword - 搜索关键词
 * @param {Ref} isLoading - 加载状态
 * @returns {Ref} - 返回活动列表的Ref对象
 */
export const getActivityList = (
    selectedCategory = ref(0),
    page = ref(1),
    keyword = ref(""),
    isLoading = ref(false)
) => {
    const activities = ref();
    watch([selectedCategory,page, keyword], async () => {
        try {
            isLoading.value = true;
            let res = await request.get('/activity/public/activity-list', {
                categoryId: selectedCategory.value || 0,
                page: 1,
                pageSize: 4 * page.value || 4,
                keyword: keyword.value || '',
            });
            isLoading.value = false;
            activities.value = res?.data?.data;
        } catch (e) {
            alertFail(getActivityList.name, e?.message);
        }
    }, {
        immediate: true
    });
    return activities;
};

/**
 * 获取活动详情
 * @param {string} id - 活动ID
 * @returns {Promise} - 返回活动详情
 */
export const getActivityDetail = async (id) => {
    try {
        let res = await request.get('/activity/public/activity-detail', {
            id: id
        });
        return res?.data?.data;
    } catch (e) {
        alertFail(getActivityDetail.name, e?.message);
    }
};

/**
 * 获取参与的活动
 * @returns {Promise} - 返回参与的活动列表
 */
export const getJoinedActivity = async () => {
    try {
        let res = await request.get('/activity/activity-joined');
        const userStore = useUserStore();
        userStore.setParticipation(res?.data?.data ?? []);
        return res?.data;
    } catch (e) {
        alertFail(getJoinedActivity.name, e?.message);
    }
};

/**
 * 参加活动
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回参加结果
 */
export const joinActivity = async (activityId) => {
    try {
        let res = await request.post('/activity/activity-join', activityId, {
            header: { 'Content-Type': 'application/json' }
        });
        await getJoinedActivity();
        return res?.data;
    } catch (e) {
        alertFail(joinActivity.name, e?.message);
    }
};

/**
 * 取消报名
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回取消结果
 */
export const cancelJoinActivity = async (activityId) => {
    try {
        let res = await request.post('/activity/activity-join-cancel', activityId, {
            header: { 'Content-Type': 'application/json' }
        });
        await getJoinedActivity();
        return res?.data;
    } catch (e) {
        alertFail(cancelJoinActivity.name, e?.message);
    }
};

/**
 * 获取用户发起的活动
 * @param {string|null} userId - 用户ID，为null时获取当前用户发起的活动
 * @returns {Promise} - 返回用户发起的活动列表
 */
export const getUserActivity = async (userId = null) => {
    try {
        let res = await request.get('/activity/list', {
            userId: userId
        });
        return res?.data;
    } catch (e) {
        alertFail(getUserActivity.name, e?.message);
    }
};

/**
 * 取消活动
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回取消结果
 */
export const cancelActivity = async (activityId) => {
    try {
        let res = await request.post('/activity/activity-cancel', activityId, {
            header: { 'Content-Type': 'application/json' }
        });
        return res?.data;
    } catch (e) {
        alertFail(cancelActivity.name, e?.message);
    }
};

/**
 * 发表活动评论
 * @param {Object} data - 评论数据
 * @returns {Promise} - 返回评论结果
 */
export const postActivityComment = async (data) => {
    try {
        let res = await request.post('/activity/activity-comment', data);
        return res?.data;
    } catch (e) {
        alertFail(postActivityComment.name, e?.message);
    }
};

/**
 * 获取热门活动
 * @param {number} num - 获取的数量
 * @returns {Promise} - 返回热门活动列表
 */
export const getTopActivity = async (num = 3) => {
    try {
        let res = await request.get(`/activity/public/top-activity`, {
            num: num
        });
        
        return res?.data;
    } catch (e) {
        alertFail(getTopActivity.name, e?.message);
    }
}; 