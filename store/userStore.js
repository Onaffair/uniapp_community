// userStore.js
import { defineStore } from "pinia"
import { ref } from "vue"

const emptyUserDetail = {
    account: "",
    username: "",
    email: "",
    avatar: "",
    status: "",
    phone: "",
    role: 0,
    isWechatBound: false
}

export const useUserStore = defineStore('user', () => {
    /*********State**********/
    const isLogin = ref(false)
    const userDetail = ref({...emptyUserDetail})
    const token = ref("")
    const participation = ref([])
    const myActivity = ref([])
    const friend = ref([])
    const group = ref([])
    const followData = ref([])
    const systemInfo = ref([])
    const myAIChatSession = ref([])
    /*********State**********/

    /* ***************Getter ************/
    const getUser = () => {
        return userDetail.value
    }
    
    const getToken = () => {
        return token.value
    }
    
    const getIsLogin = () => {
        return isLogin.value
    }
    
    const getParticipation = () => {
        return participation.value
    }
    
    const getMyActivity = () => {
        return myActivity.value
    }
    
    const getFriend = () => {
        return friend.value
    }
    
    const getGroup = () => {
        return group.value
    }
    
    const getFollowData = () => {
        return followData.value
    }
    
    const getSystemInfo = () => {
        return systemInfo.value
    }
    const getMyAIChatSession = () => {
        return myAIChatSession.value
    }
    /* ***************Getter ************/

    /* ************Setter ******************/
    const setUser = (data) => {
        const fieldsToUpdate = ['account', 'username', 'email', 'avatar', 'status', 'phone', 'role', 'isWechatBound']
        fieldsToUpdate.forEach(field => {
            if (data.hasOwnProperty(field)) {
                userDetail.value[field] = data[field] ?? userDetail.value[field]
            }
        })
    }
    
    const setToken = (data) => {
        token.value = data
    }
    
    const setIsLogin = (data) => {
        isLogin.value = data
    }
    
    const setParticipation = (data) => {
        participation.value = data
    }
    
    const setMyActivity = (data) => {
        myActivity.value = data
    }
    
    const setFriend = (data) => {
        friend.value = data
    }
    
    const setGroup = (data) => {
        group.value = data
    }
    
    const setFollowData = (data) => {
        followData.value = data
    }
    
    const setSystemInfo = (data) => {
        systemInfo.value = data
    }
    const setMyAIChatSession = (data) => {
        myAIChatSession.value = data
    }
    const quit = () => {
        setIsLogin(false)
        setToken("")
        setUser(emptyUserDetail)
        setParticipation([])
        setMyActivity([])
        setFriend([])
        setGroup([])
        setFollowData([])
        setSystemInfo([])
        setMyAIChatSession([])
    }
    /* ************Setter ******************/

    // 更新群组信息
    const updateGroupInfo = (groupData) => {
        const groups = getGroup()
        const index = groups.findIndex(g => g.group.groupId === groupData.groupId)
        
        if (index !== -1) {
            // 更新群组信息，但保留其他数据如成员和聊天记录
            groups[index].group = {
                ...groups[index].group,
                groupName: groupData.groupName,
                announcement: groupData.announcement,
                avatar: groupData.avatar
            }
            
            // 在uniapp中使用uni.setStorageSync替代localStorage
            uni.setStorageSync('groups', JSON.stringify(groups))
        }
    }

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
        myAIChatSession,
        getUser,
        getToken,
        getIsLogin,
        getMyAIChatSession,
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
        updateGroupInfo,
        setMyAIChatSession
    }
}, {
    persist: {
        enabled: true,
        key: 'userStore'
    }
}) 