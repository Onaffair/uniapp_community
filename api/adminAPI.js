// adminAPI.js
import request from '../util/request';

/**
 * 管理员测试接口
 * @returns {Promise} - 返回测试结果
 */
export const adminTest = async () => {
    try {
        let res = await request.get('/admin/test');
        return res?.data;
    } catch (e) {
        console.error('adminTest error:', e);
        throw e;
    }
};

/**
 * 获取所有用户列表
 * @returns {Promise} - 返回用户列表
 */
export const getAllUsers = async () => {
    try {
        let res = await request.get('/admin/getAllUsers');
        return res?.data;
    } catch (e) {
        console.error('getAllUsers error:', e);
        throw e;
    }
};

/**
 * 获取所有活动列表
 * @returns {Promise} - 返回活动列表
 */
export const getAllActivities = async () => {
    try {
        let res = await request.get('/admin/getAllActivities');
        return res?.data;
    } catch (e) {
        console.error('getAllActivities error:', e);
        throw e;
    }
};

/**
 * 更新用户信息
 * @param {Object} userData - 用户数据
 * @returns {Promise} - 返回更新结果
 */
export const updateUser = async (userData) => {
    try {
        let res = await request.post('/admin/updateUser', userData);
        return res?.data;
    } catch (e) {
        console.error('updateUser error:', e);
        throw e;
    }
};

/**
 * 更新活动信息
 * @param {Object} activityData - 活动数据
 * @returns {Promise} - 返回更新结果
 */
export const updateActivityInfo = async (activityData) => {
    try {
        let res = await request.post('/admin/updateActivity', activityData);
        return res?.data;
    } catch (e) {
        console.error('updateActivityInfo error:', e);
        throw e;
    }
};

/**
 * 更新活动状态
 * @param {string} activityId - 活动ID
 * @param {number} newStatus - 新状态
 * @returns {Promise} - 返回更新结果
 */
export const updateActivityStatus = async (activityId, newStatus) => {
    try {
        // 这里其实是调用同一个接口，只是只更新状态
        let res = await request.post('/admin/updateActivity', {
            id: activityId,
            status: newStatus
        });
        return res?.data;
    } catch (e) {
        console.error('updateActivityStatus error:', e);
        throw e;
    }
};

/**
 * 获取所有群组列表
 * @returns {Promise} - 返回群组列表
 */
export const getAllGroups = async () => {
    try {
        let res = await request.get('/admin/getAllGroups');
        return res?.data;
    } catch (e) {
        console.error('getAllGroups error:', e);
        throw e;
    }
};

/**
 * 更新群组状态
 * @param {string} groupId - 群组ID
 * @param {number} status - 新状态
 * @returns {Promise} - 返回更新结果
 */
export const updateGroupStatus = async (groupId, status) => {
    try {
        let res = await request.post('/admin/updateGroupStatus', {
            groupId,
            status
        });
        return res?.data;
    } catch (e) {
        console.error('updateGroupStatus error:', e);
        throw e;
    }
};

/**
 * 删除群组
 * @param {string} groupId - 群组ID
 * @returns {Promise} - 返回删除结果
 */

export const deleteGroup = async (groupId) => {
    try {
        let res = await request.delete(
            '/admin/delete-group',
            {groupId}
        )
        return res?.data;
    } catch (e) {
        console.error('deleteGroup error:', e);
        throw e;
    }
};

/**
 * 移除群组成员
 * @param {string} groupId - 群组ID
 * @param {string} userAccount - 用户账号
 * @returns {Promise} - 返回移除结果
 */
export const deleteGroupMember = async (groupId, userAccount) => {
    try {
        let res = await request.delete('/admin/delete-group-member', {
            groupId,
            userAccount
        });
        return res?.data;
    } catch (e) {
        console.error('deleteGroupMember error:', e);
        throw e;
    }
};

/**
 * 获取举报列表（管理员功能）
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页
 * @param {number} params.size - 每页大小
 * @param {string} params.status - 举报状态（可选）
 * @returns {Promise} - 返回举报列表
 */
export const getReportList = async (params) => {
    try {
        let res = await request.get('/report/list', params);
        return res?.data;
    } catch (e) {
        console.error('getReportList error:', e);
        throw e;
    }
};

/**
 * 获取举报详情（管理员功能）
 * @param {number} reportId - 举报ID
 * @returns {Promise} - 返回举报详情
 */
export const getReportDetail = async (reportId) => {
    try {
        let res = await request.get(`/report/detail/${reportId}`);
        return res?.data;
    } catch (e) {
        console.error('getReportDetail error:', e);
        throw e;
    }
};

/**
 * 处理举报（管理员功能）
 * @param {Object} data - 处理数据
 * @param {number} data.reportId - 举报ID
 * @param {string} data.handlerAccount - 处理人账号
 * @param {string} data.handleAction - 处理措施
 * @param {string} data.handleComment - 处理备注
 * @returns {Promise} - 返回处理结果
 */
export const handleReport = async (data) => {
    try {
        let res = await request.post('/report/handle', data);
        return res?.data;
    } catch (e) {
        console.error('handleReport error:', e);
        throw e;
    }
};