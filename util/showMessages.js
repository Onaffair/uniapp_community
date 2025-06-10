// showMessages.js
// UniApp适配版本的消息提示工具

/**
 * 显示失败消息
 * @param {string} tag - 消息标签
 * @param {string} msg - 消息内容
 */
const showFail = (tag, msg) => {
    console.log("fail at", tag, msg)
    uni.showToast({
        title: msg,
        icon: 'error',
        duration: 2000
    })
}

/**
 * 弹出失败提示
 * @param {string} tag - 消息标签
 * @param {string} msg - 消息内容
 */
const alertFail = (tag, msg) => {
    console.log(tag, msg)
    uni.showModal({
        title: '提示',
        content: msg,
        showCancel: false
    })
}

/**
 * 显示成功消息
 * @param {string} tag - 消息标签
 * @param {string} msg - 消息内容
 */
const showSuccess = (tag, msg) => {
    console.log("success at", tag, msg)
    uni.showToast({
        title: msg,
        icon: 'success',
        duration: 2000
    })
}

export {
    showFail,
    alertFail,
    showSuccess,
} 