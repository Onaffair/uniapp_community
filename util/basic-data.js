// basic-data.js
// 可根据实际环境配置不同的URL

//26.131.212.33
const baseUrl = "localhost"

const wsUrl = `ws://${baseUrl}:9000/ws`
const backUrl = `http://${baseUrl}:721/api`
const imgBaseUrl = ``

export {
    wsUrl,
    backUrl,
    imgBaseUrl
} 