import axios from "axios";
import {useUserStore} from "@/store/userStore";
import {backUrl} from "@/util/basic-data";
import  adapter from 'uni-request-adapter'


const _axios = axios.create(
    {
        baseURL:backUrl,
        timeout:10000,
        adapter:adapter
    }
)

_axios.interceptors.request.use( config =>{

    const useStore = useUserStore()

    // console.log("userStore.getToken = ",useStore.getToken())
    config.headers['Authorization'] =  'Bearer ' + useStore.getToken()

    return config
}, error =>{ 
    return Promise.reject(error)
})

_axios.interceptors.response.use( response =>{
    return response
}, error => {
    return Promise.reject(error)
})


export default _axios

