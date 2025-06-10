// GroupApI.js
import request from '../util/request';
import { useUserStore } from '../store/userStore';
import { alertFail } from '../util/showMessages';

/**
 * 创建群组
 * @param {Object} activity - 活动数据
 * @returns {Promise} - 返回创建结果
 */
export const createGroup = async (activity) => {
    try {
        let res = await request.post('/group/create-group', activity);
        console.log("creatGroup", res?.data);
        const userStore = useUserStore();
        userStore.getGroup().push((res?.data?.data));
        return res?.data;
    } catch (e) {
        alertFail(createGroup.name, e?.message);
    }
};

/**
 * 获取我的群组
 * @returns {Promise} - 返回我的群组列表
 */
export const geyMyGroup = async () => {
    try {
        let res = await request.get('/group/my-group');
        const userStore = useUserStore();
        userStore.setGroup(res?.data?.data);
        return res?.data;
    } catch (e) {
        alertFail(geyMyGroup.name, e?.message);
    }
};

/**
 * 加入群组
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回加入结果
 */
export const joinGroup = async (activityId) => {
    try {
        let res = await request.post('/group/join-group', activityId);
        const userStore = useUserStore();
        userStore.getGroup().push((res?.data?.data));
        return res?.data;
    } catch (e) {
        alertFail(joinGroup.name, e?.message);
    }
};

/**
 * 退出群组
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回退出结果
 */
export const quitGroup = async (activityId) => {
    try {
        let res = await request.post('/group/quit-group', activityId);
        await geyMyGroup();
        
        return res?.data;
    } catch (e) {
        alertFail(quitGroup.name, e?.message);
    }
};

/**
 * 更新群组信息
 * @param {Object} group - 群组数据
 * @returns {Promise} - 返回更新结果
 */
export const updateGroup = async (group) => {
    try {
        let res = await request.post('/group/update-group', group);
        
        return res?.data;
    } catch (e) {
        alertFail(updateGroup.name, e?.message);
        throw e;
    }
}; 