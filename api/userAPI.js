// userAPI.js
import request from '../util/request';
import { alertFail, showSuccess } from '../util/showMessages';
import { useUserStore } from '../store/userStore';
import { useTabStore } from '../store/tabStore';
import { useActivityStore } from '../store/activityStore';
import { getUserActivity, getJoinedActivity } from './activityAPI';
import { getMyGroup } from './GroupApI';

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @returns {Promise} - 返回注册结果
 */
export const postRegisterInfo = async (data) => {
    try {
        let res = await request.post('/user/public/register', data);
        
        const userStore = useUserStore();
        userStore.quit();
        userStore.setUser(res?.data?.data);
        userStore.setToken(res?.data?.data?.token);
        userStore.setIsLogin(true);
        
        return res?.data;
    } catch (e) {
        alertFail(postRegisterInfo.name, e?.message);
    }
};

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @returns {Promise} - 返回登录结果
 */
export const postLoginInfo = async (data) => {
    try {
        let res = await request.post('/user/public/login', data);
        if (res.data?.code === 500) {
            uni.showToast({
                title: res?.data?.msg,
                icon: 'none'
            });
        }
        
        const userStore = useUserStore();
        userStore.setUser(res.data.data);
        userStore.setToken(res?.data.data.token);
        userStore.setIsLogin(true);
        
        await getJoinedActivity();
        await getUserActivity()
            .then(res => {
                userStore.setMyActivity(res?.data);
            });
        await getFriend();
        await getFollowList()
            .then(res => {
                userStore.setFollowData(res?.data);
            });
        await getFriendRequest()
            .then(res => {
                userStore.setSystemInfo(res?.data);
            });
        await getMyGroup();
        
        return res?.data;
    } catch (e) {
        alertFail(postLoginInfo.name, e?.message);
    }
};

/**
 * 上传头像
 * @param {Object} data - 头像数据
 * @returns {Promise} - 返回上传结果
 */
export const uploadImage = async (filePath) => {
    try {
        // url: '/user/upload-image',
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
 * 删除头像
 * @param {string} fileName - 头像文件名
 * @returns {Promise} - 返回删除结果
 */
export const deleteImage = async (fileName) => {
    try {
        let res = await request.delete(`/user/public/avatar/${fileName}`); // `/user/image/${fileName}`
        return res?.data;
    } catch (e) {
        alertFail(deleteImage.name, e?.message);
    }
};

/**
 * 用户退出
 * @returns {Promise} - 返回退出结果
 */
export const userQuit = async () => {
    try {
        let res = await request.post(`/user/quit`);
        const userStore = useUserStore();
        userStore.quit();
        
        return res?.data;
    } catch (e) {
        alertFail(userQuit.name, e?.message);
    }
};

/**
 * 编辑用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise} - 返回编辑结果
 */
export const userEditInfo = async (data) => {
    try {
        let res = await request.post('/user/editInfo', data);
        res = res.data;
        if (res?.code === 200) {
            const userStore = useUserStore();
            userStore.setUser(res.data);
        } else {
            uni.showToast({
                title: res?.msg,
                icon: 'none'
            });
        }
    } catch (e) {
        alertFail(userEditInfo.name, e?.message);
    }
};

/**
 * 刷新Token
 * @returns {Promise} - 返回刷新结果
 */
export const reFreshToken = async () => {
    const userStore = useUserStore();
    try {
        let res = await request.get('/user/reFlashToken');
        if (res?.data.code !== 200){
            throw new Error(res?.data.msg)
        }
        userStore.setToken(res?.data?.data);
        return res?.data;
    } catch (e) {
        alertFail(reFreshToken.name, e?.message);
        userStore.quit();
        uni.switchTab({url:'/pages/PersonalCenter/PersonalCenter'})
        uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
        });
    }
};

/**
 * 获取好友列表
 * @returns {Promise} - 返回好友列表
 */
export const getFriend = async () => {
    try {
        let res = await request.get('/user/friend/get');
        useUserStore().setFriend(res?.data?.data || []);
        return res?.data;
    } catch (e) {
        alertFail(getFriend.name, e?.message);
    }
};

/**
 * 关注用户
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回关注结果
 */
export const follow = async (userId) => {
    try {
        let res = await request.post('/user/follow', userId, {
            header: {"Content-Type": "application/json"}
        });
        return res?.data;
    } catch (e) {
        alertFail(follow.name, e?.message);
    }
};

/**
 * 取消关注
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回取消关注结果
 */
export const unfollow = async (userId) => {
    try {
        let res = await request.post('/user/unfollow', userId, {
            header: {"Content-Type": "application/json"}
        });
        return res?.data;
    } catch (e) {
        alertFail(unfollow.name, e?.message);
    }
};

/**
 * 获取关注列表
 * @param {string|null} userId - 用户ID，为null时获取当前用户的关注列表
 * @returns {Promise} - 返回关注列表
 */
export const getFollowList = async (userId = null) => {
    try {
        let res = await request.get('/user/followList', {
            userId: userId
        });
        return res?.data;
    } catch (e) {
        alertFail(getFollowList.name, e?.message);
    }
};

/**
 * 获取用户信息
 * @param {string|null} userId - 用户ID，为null时获取当前用户信息
 * @returns {Promise} - 返回用户信息
 */
export const getUserInfo = async (userId = null) => {
    try {
        let res = await request.get('/user/info', {
            userId: userId
        });
        return res?.data;
    } catch (e) {
        alertFail(getUserInfo.name, e?.message);
    }
};

/**
 * 添加好友
 * @param {string} friendAccount - 好友账号
 * @returns {Promise} - 返回添加好友结果
 */
export const addFriend = async (friendAccount) => {
    try {
        let res = await request.post('/user/friend/add', friendAccount);
        return res?.data;
    } catch (e) {
        alertFail(addFriend.name, e?.message);
    }
};

/**
 * 获取好友请求
 * @returns {Promise} - 返回好友请求列表
 */
export const getFriendRequest = async () => {
    try {
        let res = await request.get('/user/friend/getRequest');
        return res?.data;
    } catch (e) {
        alertFail(getFriendRequest.name, e?.message);
    }
};

/**
 * 获取请求者信息
 * @param {Array} userList - 用户ID列表
 * @returns {Promise} - 返回请求者信息
 */
export const getRequesterInfo = async (userList) => {
    try {
        // 需要处理数组参数，UniApp中可以直接传递
        let res = await request.get('/user/friend/requester-info', {
            userList: userList
        });
        return res?.data;
    } catch (e) {
        alertFail(getRequesterInfo.name, e?.message);
    }
};

/**
 * 接受好友请求
 * @param {string} requestId - 请求ID
 * @returns {Promise} - 返回接受结果
 */
export const friendRequestAccept = async (requestId) => {
    try {
        let res = await request.post('/user/friend/request-accept', requestId);
        return res?.data;
    } catch (e) {
        alertFail(friendRequestAccept.name, e?.message);
    }
};

/**
 * 拒绝好友请求
 * @param {string} requestId - 请求ID
 * @returns {Promise} - 返回拒绝结果
 */
export const friendRequestRefuse = async (requestId) => {
    try {
        let res = await request.post('/user/friend/request-refuse', requestId);
        return res?.data;
    } catch (e) {
        alertFail(friendRequestRefuse.name, e?.message);
    }
};

/**
 * 微信登录
 * @param {Object} data - 登录数据
 * @param {string} data.code - 微信登录code
 * @param {Object} data.userInfo - 用户信息（昵称、头像等）
 * @returns {Promise} - 返回登录结果
 */
export const wxLogin = async (data) => {
    try {
        // 判断是否为旧版调用方式（只传入code字符串）
        const requestData = typeof data === 'string' 
            ? { code: data } 
            : data;
            
        let res = await request.post('/wx/public/login', requestData).then(t => t.data);
        if (res?.code === 200) {
            const userStore = useUserStore();
            
            // 处理返回的数据
            // 存储用户信息
            userStore.setUser(res.data.user);
            
            // 存储token
            userStore.setToken(res.data.token);
            
            // 设置登录状态
            userStore.setIsLogin(true);

            
            // 获取用户相关数据
            await getJoinedActivity();
            await getUserActivity()
                .then(res => {
                    userStore.setMyActivity(res?.data);
                });
            await getFriend();
            await getFollowList()
                .then(res => {
                    userStore.setFollowData(res?.data);
                });
            await getFriendRequest()
                .then(res => {
                    userStore.setSystemInfo(res?.data);
                });
            await getMyGroup();
        } else {
            uni.showToast({
                title: res?.data?.msg || '微信登录失败',
                icon: 'none'
            });
        }
        
        return res?.data;
    } catch (e) {
        alertFail(wxLogin.name, e?.message);
    }
};

/**
 * 绑定微信
 * @param {Object} wxCode - 微信登录code
 * @returns {Promise} - 返回绑定结果
 */
export const bindWechat = async (wxCode) => {
    try {
        let res = await request.post('/user/bindWechat', { code: wxCode });
        
        if (res.data?.code === 200) {
            uni.showToast({
                title: '绑定成功',
                icon: 'success'
            });
        } else {
            uni.showToast({
                title: res?.data?.msg || '绑定失败',
                icon: 'none'
            });
        }
        
        return res?.data;
    } catch (e) {
        alertFail(bindWechat.name, e?.message);
    }
};

/**
 * 解绑微信
 * @returns {Promise} - 返回解绑结果
 */
export const unbindWechat = async () => {
    try {
        let res = await request.post('/user/unbindWechat');
        if (res.data?.code === 200) {
            uni.showToast({
                title: '解绑成功',
                icon: 'success'
            });
        } else {
            uni.showToast({
                title: res?.data?.msg || '解绑失败',
                icon: 'none'
            });
        }
        
        return res?.data;
    } catch (e) {
        alertFail(unbindWechat.name, e?.message);
    }
};


export const getSTS = async () =>{
    try {
        let res = await request.get('/oss/get-sts');
        return res?.data;
    }catch (e){
        alertFail(getSTS.name, e?.message)
    }
}

export const getSign = async (ext) =>{
    try {
        let res = await request.get('/oss/get-sign', {
            ext
        });
        return res?.data;
    }catch (e){
        alertFail(getSign.name, e?.message)
    }
}

export const getMyAISessionHistory = async () =>{
    try {
        const res = await request.get('/user/my-session').then(res => res?.data)
        if (res.code === 200){
            useUserStore().setMyAIChatSession(res?.data || [])
            return res.data
        }
        throw new Error(res.msg)
    }catch (e){
        alertFail(getSessionChatHistory.name, e?.message)
    }
}

export const getSessionChatHistory = async (sessionId) =>{
    try {
        const res = await request.get('/user/session-chat-history', {
            sessionId
        }).then(res => res?.data)
        if (res.code === 200){
            return res.data
        }
    }catch (e){
        alertFail(getSessionChatHistory.name, e?.message)
    }

}










