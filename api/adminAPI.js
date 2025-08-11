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

// ==================== 维修管理相关接口 ====================

/**
 * 管理员获取所有维修请求
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回维修请求列表
 */
export const getAllRepairRequests = async (params = {}) => {
    try {
        let res = await request.get('/admin/repair/list', params);
        return res?.data;
    } catch (e) {
        console.error('getAllRepairRequests error:', e);
        throw e;
    }
};

/**
 * 管理员分配维修任务
 * @param {Object} data - 分配数据
 * @returns {Promise} - 返回分配结果
 */
export const assignRepairTask = async (data) => {
    try {
        let res = await request.post('/admin/repair/assign', data);
        return res?.data;
    } catch (e) {
        console.error('assignRepairTask error:', e);
        throw e;
    }
};

/**
 * 管理员拒绝维修请求
 * @param {Object} data - 包含requestId的数据对象
 * @returns {Promise} - 返回拒绝结果
 */
export const rejectRepairRequest = async (data) => {
    try {
        let res = await request.post('/admin/repair/reject', data);
        return res?.data;
    } catch (e) {
        console.error('rejectRepairRequest error:', e);
        throw e;
    }
};

/**
 * 管理员获取技术员列表
 * @returns {Promise} - 返回技术员列表
 */
export const getTechnicianList = async () => {
    try {
        let res = await request.get('/admin/repair/technicians');
        return res;
    } catch (e) {
        console.error('getTechnicianList error:', e);
        throw e;
    }
};

/**
 * 获取所有维修员列表
 * @returns {Promise} - 返回维修员列表
 */
export const getAllTechnicians = async () => {
    try {
        let res = await request.get('/admin/repair/technicians');
        return res?.data;
    } catch (e) {
        console.error('getAllTechnicians error:', e);
        throw e;
    }
};

/**
 * 管理员获取服务评价列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回评价列表
 */
export const getServiceReviews = async (params = {}) => {
    try {
        let res = await request.get('/admin/repair/reviews', params);
        return res?.data;
    } catch (e) {
        console.error('getServiceReviews error:', e);
        throw e;
    }
};

/**
 * 获取服务评价详情
 * @param {number} reviewId - 评价ID
 * @returns {Promise} - 返回评价详情
 */
export const getServiceReviewById = async (reviewId) => {
    try {
        let res = await request.get(`/repair/review/${reviewId}`);
        return res?.data;
    } catch (e) {
        console.error('getServiceReviewById error:', e);
        throw e;
    }
};

/**
 * 更新服务评价
 * @param {number} reviewId - 评价ID
 * @param {Object} data - 更新数据
 * @returns {Promise} - 返回更新结果
 */
export const updateServiceReview = async (reviewId, data) => {
    try {
        let res = await request.put(`/repair/review/${reviewId}`, data);
        return res?.data;
    } catch (e) {
        console.error('updateServiceReview error:', e);
        throw e;
    }
};

/**
 * 删除服务评价
 * @param {number} reviewId - 评价ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteServiceReview = async (reviewId) => {
    try {
        let res = await request.delete(`/repair/review/${reviewId}`);
        return res?.data;
    } catch (e) {
        console.error('deleteServiceReview error:', e);
        throw e;
    }
};

// ==================== 公告管理相关接口 ====================

/**
 * 管理员获取所有公告
 * @returns {Promise} - 返回公告列表
 */
export const getAllAnnouncements = async () => {
    try {
        let res = await request.get('/admin/announcements');
        return res?.data;
    } catch (e) {
        console.error('getAllAnnouncements error:', e);
        throw e;
    }
};

/**
 * 管理员创建公告
 * @param {Object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {Array} data.images - 公告图片列表
 * @returns {Promise} - 返回创建结果
 */
export const createAnnouncement = async (data) => {
    try {
        let res = await request.post('/admin/announcements', data);
        return res?.data;
    } catch (e) {
        console.error('createAnnouncement error:', e);
        throw e;
    }
};

/**
 * 管理员更新公告
 * @param {Object} data - 公告数据
 * @param {string} data.announcementId - 公告ID
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {Array} data.images - 公告图片列表
 * @returns {Promise} - 返回更新结果
 */
export const updateAnnouncement = async (data) => {
    try {
        let res = await request.put(`/admin/announcements/${data.announcementId}`, data);
        return res?.data;
    } catch (e) {
        console.error('updateAnnouncement error:', e);
        throw e;
    }
};

/**
 * 管理员删除公告
 * @param {string} announcementId - 公告ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteAnnouncementAPI = async (announcementId) => {
    try {
        let res = await request.delete(`/admin/announcements/${announcementId}`);
        return res?.data;
    } catch (e) {
        console.error('deleteAnnouncementAPI error:', e);
        throw e;
    }
};

/**
 * 获取待审核活动列表
 * @param {Object} params - 分页参数 {page, pageSize}
 * @returns {Promise} - 返回待审核活动列表
 */
export const getPendingActivities = async (params) => {
    try {
        let res = await request.get('/admin/activities/pending', {
            ...params
        });
        return res?.data?.data;
    } catch (e) {
        console.error('getPendingActivities error:', e);
        throw e;
    }
};

/**
 * 审核通过活动
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回审核结果
 */
export const approveActivity = async (activityId) => {
    try {
        let res = await request.post(`/admin/activities/${activityId}/approve`);
        return res?.data;
    } catch (e) {
        console.error('approveActivity error:', e);
        throw e;
    }
};

/**
 * 审核拒绝活动
 * @param {string} activityId - 活动ID
 * @returns {Promise} - 返回审核结果
 */
export const rejectActivity = async (activityId) => {
    try {
        let res = await request.post(`/admin/activities/${activityId}/reject`);
        return res?.data;
    } catch (e) {
        console.error('rejectActivity error:', e);
        throw e;
    }
};