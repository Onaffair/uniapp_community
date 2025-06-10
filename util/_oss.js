import {getSign, getSTS} from "@/api/userAPI";
import OSS from "ali-oss";
import {alertFail} from "@/util/showMessages";

const DEFAULT_DIR  = 'images/'

export class OSSUploader{
    constructor() {
        this.client = null
        this.expiredTime = null
        this.defaultDir = DEFAULT_DIR
        this.reflashInterval = 1000 * 15 * 60
        this.reflashTimer = null
        this.STS = {}
    }

    async init(){
        try {
            let res = await getSTS()
            const {accessKeyId, accessKeySecret, bucket, region, stsToken,expiration} = res?.data

            this.STS = {...res?.data}

            this.expiredTime = Date.now() + this.reflashInterval - 1000 // 假想提早一分钟过期

            this.client = new OSS({
                accessKeySecret,
                accessKeyId,
                bucket,
                region,
                stsToken,
                secure: true,
                refreshSTSToken:async () =>{
                    const res = await getSTS()
                    const { accessKeyId, accessKeySecret, stsToken } = res.data
                    return {
                        accessKeyId,
                        accessKeySecret,
                        stsToken
                    }
                },
                refreshSTSTokenInterval: this.reflashInterval
            })

            // this.startReflashTimer()

            console.log("初始化成功")
            return true
        }catch(e){
            console.log("初始化失败",e.message)
            return false
        }finally {}
    }

    isSTSTokenExpired(){
        return Date.now() > this.expiredTime
    }

    startReflashTimer(){
        if (this.reflashTimer) clearInterval(this.reflashTimer)
        this.reflashTimer = setInterval(async () =>{
            if (this.isSTSTokenExpired()){
                await this.init()
            }
        },this.reflashInterval)
    }

    async upload(file,dir = this.defaultDir){

        try {


            // #ifdef MP-WEIXIN

            const ext =  file.name?.split('.')?.pop() || file.path?.split('.')?.pop() || 'file'

            const signRes = await getSign(ext)

            if(!signRes || signRes.code !== 200){
                throw new Error("获取签名失败")
            }

            const {signUrl,accessUrl,fileName} = signRes?.data
            const fs = uni.getFileSystemManager()
            const fileData = fs.readFileSync(file.path);

            return await new Promise((resolve,reject) =>{
                uni.request({
                    url : signUrl,
                    method:'PUT',
                    header:{
                        'Content-Type':'application/octet-stream'
                    },
                    data:fileData,
                    success:(res) =>{
                        resolve(accessUrl)
                    },
                    fail:(err) =>{
                        reject(err)
                    }
                })
            })

            // #endif


            // #ifndef MP-WEIXIN
            if (!this.client || this.isSTSTokenExpired()){
                await this.init()
            }

            const targetFile = file
            const ext = file.name?.split('.')?.pop() || file.path?.split('.')?.pop() || 'jpg';
            const fileName = `${dir}${crypto.randomUUID()}.${ext}`
            const res = await this.client.put(fileName,targetFile,{
                headers:{
                    'x-oss-object-acl': 'public-read'
                },
                timeout:30000
            })
            return res.url
            // #endif

        }catch (e){
            alertFail(this.upload.name,e.message)
        }
    }

}