// basic-data.js
// 可根据实际环境配置不同的URL

//26.131.212.33
const baseUrl = "onaffair.website"
const localUrl = "localhost"

const wsUrl = `ws://${localUrl}:9000/ws`
const backUrl = `http://${localUrl}:721/api`
const imgBaseUrl = ``

export {
    wsUrl,
    backUrl,
    imgBaseUrl
} 