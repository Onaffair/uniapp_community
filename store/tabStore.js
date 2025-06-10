// tabStore.js
import { defineStore } from "pinia"
import { ref } from "vue"

export const useTabStore = defineStore('tab', () => {
    const tab = ref(0)

    const getTab = () => tab.value

    const setTab = (val) => {
        tab.value = val
    }
    
    return {
        tab,
        getTab,
        setTab,
    }
}, {
    persist: {
        enabled: true,
        key: 'tabStore'
    }
}) 