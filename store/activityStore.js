// activityStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivityStore = defineStore('activityForm', () => {
    const activityStatusList = [
        {
            id: -1,
            name: "已拒绝"
        },
        {
            id: 0,
            name: "待审核"
        },
        {
            id: 1,
            name: "等待报名"
        },
        {
            id: 2,
            name: "报名中"
        },
        {
            id: 3,
            name: "报名人数已满"
        },
        {
            id: 4,
            name: "活动进行中"
        },
        {
            id: 5,
            name: "活动已结束"
        },
        {
            id: 6,
            name: "活动已取消"
        }
    ]
    const cityList = ref([
        {
            "name": "杭州",
            "id": 11
        },
        {
            "name": "宁波",
            "id": 21
        },
        {
            "name": "温州",
            "id": 31
        },
        {
            "name": "嘉兴",
            "id": 41
        },
        {
            "name": "湖州",
            "id": 51
        },
        {
            "name": "绍兴",
            "id": 61
        },
        {
            "name": "金华",
            "id": 71
        },
        {
            "name": "衢州",
            "id": 81
        },
        {
            "name": "舟山",
            "id": 91
        },
        {
            "name": "台州",
            "id": 101
        },
        {
            "name": "丽水",
            "id": 111
        }
    ])
    const categoryList = ref([
        {
            "name": "所有分类",
            "id": 0
        },
        {
            "name": "志愿服务",
            "id": 1
        },
        {
            "name": "节日庆典",
            "id": 2
        },
        {
            "name": "公益便民",
            "id": 3
        },
        {
            "name": "文化活动",
            "id": 4
        },
        {
            "name": "健康运动",
            "id": 5
        },
        {
            "name": "教育培训",
            "id": 6
        },
        {
            "name": "邻里互助",
            "id": 7
        },
        {
            "name": "街道政务",
            "id": 8
        },
        {
            "name": "其它活动",
            "id": 9
        }
    ])

    // 状态定义
    const formData = ref({
        title: '',
        categoryId: 0,
        highlight: '',
        content: '',
        images: [],
        city: 0,
        address: '',
        latitude: '',
        longitude: '',
        beginTime: '',
        endTime: '',
        leastJoinNum: '',
        mostJoinNum: '',
        status: 0,
        joinNum: 0,
        collectNum: ''
    })

    const setCityList = (data) => {
        cityList.value = []
        cityList.value.push(...data)
    }
    
    const setCategoryList = (data) => {
        categoryList.value = []
        categoryList.value = data
    }

    // 验证规则
    const validationRules = {
        title: v => !!v,
        categoryId: v => !!v,
        highlight: v => !!v,
        content: v => !!v,
        leastJoinNum: v => !!v,
        mostJoinNum: v => !!v,
        beginTime: v => !!v,
        endTime: v => !!v,
        address: v => !!v,
        city: v => v > 0
    }

    // 计算验证状态
    const isValid = computed(() => {
        return Object.entries(validationRules).every(([key, validate]) =>
            validate(formData.value[key])
        )
    })

    // 更新表单数据的方法
    const updateFormData = (payload) => {
        Object.keys(payload).forEach(key => {
            if (key in formData.value) {
                formData.value[key] = payload[key]
            }
        })
    }

    const clearFormData = () => {
        formData.value = {
            title: '',
            categoryId: 0,
            highlight: '',
            content: '',
            images: [],
            city: 0,
            address: '',
            latitude: '',
            longitude: '',
            beginTime: '',
            endTime: '',
            leastJoinNum: '',
            mostJoinNum: '',
            status: 0,
            joinNum: 0,
            collectNum: ''
        }
    }
    
    return {
        activityStatusList,
        cityList,
        categoryList,
        setCityList,
        setCategoryList,
        formData,
        isValid,
        updateFormData,
        clearFormData,
    }
}, {
    persist: {
        enabled: true,
        key: 'activityStore'
    }
}) 