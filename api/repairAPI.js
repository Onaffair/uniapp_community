import request from '../util/request';
import { alertFail, showSuccess } from '../util/showMessages';

/**
 * 用户提交维修申请
 * @param {Object} data - 维修申请数据
 * @returns {Promise} - 返回提交结果
 */
export const submitRepairRequest = async (data) => {
    try {
        let res = await request.post('/repair/submit', data);
        if (res.data?.code === 200) {
            showSuccess('维修申请提交成功');
        }
        return res?.data;
    } catch (e) {
        alertFail('submitRepairRequest', e?.message);
        throw e;
    }
};

/**
 * 获取用户的维修申请列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回维修申请列表
 */
export const getUserRepairRequests = async (params = {}) => {
    try {
        let res = await request.get('/repair/user/list', params);
        return res?.data;
    } catch (e) {
        alertFail('getUserRepairRequests', e?.message);
        throw e;
    }
};

/**
 * 获取维修申请详情
 * @param {number} requestId - 维修申请ID
 * @returns {Promise} - 返回维修申请详情
 */
export const getRepairRequestDetail = async (requestId) => {
    try {
        let res = await request.get(`/repair/detail/${requestId}`);
        return res?.data;
    } catch (e) {
        alertFail('getRepairRequestDetail', e?.message);
        throw e;
    }
};

/**
 * 用户对维修服务进行评价
 * @param {Object} data - 评价数据
 * @returns {Promise} - 返回评价结果
 */
export const submitServiceReview = async (data) => {
    try {
        let res = await request.post('/repair/review', data);
        if (res.data?.code === 200) {
            showSuccess('评价提交成功');
        }
        return res?.data;
    } catch (e) {
        alertFail('submitServiceReview', e?.message);
        throw e;
    }
};

/**
 * 获取维修员的任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回任务列表
 */
export const getTechnicianTasks = async (params = {}) => {
    try {
        let res = await request.get('/repair/technician/tasks', params);
        return res?.data;
    } catch (e) {
        alertFail('getTechnicianTasks', e?.message);
        throw e;
    }
};

/**
 * 维修员完成维修任务
 * @param {number} requestId - 维修申请ID
 * @returns {Promise} - 返回完成结果
 */
export const completeRepairTask = async (requestId) => {
    try {
        let res = await request.post(`/repair/technician/complete/${requestId}`);
        if (res.data?.code === 200) {
            showSuccess('任务完成');
        }
        return res?.data;
    } catch (e) {
        alertFail('completeRepairTask', e?.message);
        throw e;
    }
};