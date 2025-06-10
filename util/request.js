// request.js
// UniApp适配版本的请求工具，替代原_axios.js
import { backUrl } from './basic-data';
import { useUserStore } from '../store/userStore';
/**
 * 封装uni.request的请求类
 */
class Request {
    constructor() {
        this.baseURL = backUrl;
        this.timeout = 10000;
    }

    /**
     * 发送请求的核心方法
     * @param {Object} options - 请求选项
     * @returns {Promise} - 返回Promise对象
     */
    request(options) {
        return new Promise( (resolve, reject) => {
            const userStore = useUserStore();
            const token = userStore.getToken();

            // 处理请求头
            const header = options.header || {};
            header['Authorization'] = 'Bearer ' + token;

            // 发送请求
            uni.request({
                url: this.baseURL + options.url,
                method: options.method || 'GET',
                data: options.data,
                header: header,
                timeout: this.timeout,
                success: (res) => {
                    // 请求成功，返回数据
                    resolve(res);
                },
                fail: (err) => {
                    // 请求失败，返回错误
                    reject(err);
                }
            });
        });
    }
    /**
     * GET请求
     * @param {string} url - 请求地址
     * @param {Object} params - 请求参数
     * @param {Object} header - 请求头
     * @returns {Promise} - 返回Promise对象
     */
    get(url, params = {}, header = {}) {
        return this.request({
            url,
            method: 'GET',
            data: params,
            header
        });
    }

    /**
     * POST请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} header - 请求头
     * @returns {Promise} - 返回Promise对象
     */
    post(url, data = {}, header = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            header
        });
    }

    /**
     * PUT请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @param {Object} header - 请求头
     * @returns {Promise} - 返回Promise对象
     */
    put(url, data = {}, header = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            header
        });
    }

    /**
     * DELETE请求
     * @param {string} url - 请求地址
     * @param {Object} params - 请求参数（将作为URL查询参数）
     * @param {Object} header - 请求头
     * @returns {Promise} - 返回Promise对象
     */
    delete(url, params = {}, header = {}) {
        // 将参数转换为查询字符串
        const queryString = Object.keys(params).length > 0 
            ? '?' + Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')
            : '';
        
        return this.request({
            url: url + queryString,
            method: 'DELETE',
            header
        });
    }

    /**
     * 上传文件
     * @param {string} url - 上传地址
     * @param {string} filePath - 文件路径
     * @param {string} name - 文件对应的key
     * @param {Object} formData - 附加的表单数据
     * @returns {Promise} - 返回Promise对象
     */
    upload({ url, filePath, name = 'file', formData = {} }) {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: backUrl + url,
                filePath,
                name,
                formData,
                header: {
                    'Authorization': 'Bearer ' + useUserStore().getToken()
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data)
                        if (data.code === 200) {
                            resolve(data)
                        } else {
                            reject(new Error(data.msg || '上传失败'))
                        }
                    } catch (e) {
                        reject(new Error('上传返回格式错误'))
                    }
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    }
}

const request = new Request();
export default request;