import {defineStore} from "pinia";
import {ref} from "vue";
import {OSSUploader} from "@/util/_oss";

export const useOSSStore = defineStore('OSSStore',() =>{

    const ossUploader = new OSSUploader()

    const initialize = async () =>{
        await ossUploader.init()
    }

    return{
        ossUploader,
        initialize
    }

})
