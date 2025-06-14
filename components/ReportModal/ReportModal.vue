<template>
    <uni-popup ref="reportPopup" type="center" :mask-click="false">
        <view class="report-modal">
            <view class="modal-header">
                <text class="modal-title">举报活动</text>
                <text class="close-btn" @click="closeModal">×</text>
            </view>
            
            <view class="modal-content">
                <!-- 举报类型选择 -->
                <view class="form-item">
                    <text class="label">举报类型 <text class="required">*</text></text>
                    <uni-data-select
                        v-model="reportForm.reportType"
                        :localdata="reportTypes"
                        placeholder="请选择举报类型"
                        @change="onReportTypeChange"
                    ></uni-data-select>
                </view>
                
                <!-- 举报描述 -->
                <view class="form-item">
                    <text class="label">举报描述 <text class="required">*</text></text>
                    <textarea
                        v-model="reportForm.description"
                        placeholder="请详细描述举报原因（至少10个字符）"
                        class="textarea"
                        maxlength="500"
                        :show-confirm-bar="false"
                    ></textarea>
                    <text class="char-count">{{ reportForm.description.length }}/500</text>
                </view>
                
                <!-- 证据图片上传 -->
                <view class="form-item">
                    <text class="label">证据图片（可选）</text>
                    <ImgUploader
                        v-model:img-src="reportForm.evidenceImages"
                        :max-count="5"
                        :size-type="['compressed']"
                        @upload-success="onImageUploadSuccess"
                    />
                    <text class="tip">最多上传5张图片作为举报证据</text>
                </view>
            </view>
            
            <view class="modal-footer">
                <button class="cancel-btn" @click="closeModal">取消</button>
                <button 
                    class="submit-btn" 
                    :disabled="!canSubmit"
                    :class="{ disabled: !canSubmit }"
                    @click="submit"
                >
                    提交举报
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getReportTypes, submitReport } from '../../api/userAPI'
import { useUserStore } from '@/store/userStore'

const props = defineProps({
    activityId: {
        type: [String, Number],
        required: true
    }
})

const emit = defineEmits(['report-success'])

const reportPopup = ref()
const userStore = useUserStore()
const { userDetail } = userStore

// 举报类型列表
const reportTypes = ref([])

// 举报表单
const reportForm = reactive({
    reportType: '',
    description: '',
    evidenceImages: []
})

// 计算是否可以提交
const canSubmit = computed(() => {
    return reportForm.reportType && 
           reportForm.description.length >= 10
})

// 获取举报类型
const loadReportTypes = async () => {
    try {
        const res = await getReportTypes()
        if (res.code === 200) {
            reportTypes.value = []
            if (typeof res?.data === 'object'){
            //     遍历字典
                for (const key in res.data) {
                    reportTypes.value.push({
                        text: res.data[key],
                        value: key
                    })
                }
                console.log(reportTypes.value)
            }
        }
    } catch (error) {
        console.error('获取举报类型失败:', error)
        uni.showToast({
            title: '获取举报类型失败',
            icon: 'none'
        })
    }
}

// 举报类型改变
const onReportTypeChange = (value) => {
    reportForm.reportType = value
}

// 图片上传成功
const onImageUploadSuccess = (images) => {
    reportForm.evidenceImages = images
}

// 提交举报
const submit = async () => {
    if (!canSubmit.value) {
        uni.showToast({
            title: '请完善举报信息',
            icon: 'none'
        })
        return
    }
    try {
        uni.showLoading({
            title: '提交中...'
        })

        const reportData = {
            activityId: props.activityId,
            reporter: userDetail?.account,
            reportType: reportForm.reportType,
            description: reportForm.description,
            evidenceImages: reportForm.evidenceImages
        }

        const res = await submitReport(reportData)

        uni.hideLoading()

        if (res.code === 200) {
            uni.showToast({
                title: '举报提交成功',
                icon: 'success'
            })

            emit('report-success')
            closeModal()
            resetForm()
        } else {
            uni.showToast({
                title: res.msg || '举报提交失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.hideLoading()
        console.error('提交举报失败:', error)
        uni.showToast({
            title: '举报提交失败',
            icon: 'none'
        })
    }
}

// 重置表单
const resetForm = () => {
    reportForm.reportType = ''
    reportForm.description = ''
    reportForm.evidenceImages = []
}

// 打开弹窗
const openModal = () => {
    reportPopup.value?.open()
}

// 关闭弹窗
const closeModal = () => {
    reportPopup.value?.close()
}

// 暴露方法给父组件
defineExpose({
    openModal,
    closeModal
})

// 初始化
onMounted(() => {
    loadReportTypes()
})
</script>

<style scoped>
.report-modal {
    width: 600rpx;
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1px solid #f0f0f0;
}

.modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.close-btn {
    font-size: 48rpx;
    color: #999;
    line-height: 1;
}

.modal-content {
    padding: 32rpx;
    max-height: 800rpx;
    overflow-y: auto;
}

.form-item {
    margin-bottom: 32rpx;
}

.label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
}

.required {
    color: #ff4757;
}

.textarea {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    border: 1px solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;
    line-height: 1.5;
    box-sizing: border-box;
}

.char-count {
    display: block;
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
}

.tip {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
}

.modal-footer {
    display: flex;
    padding: 32rpx;
    gap: 24rpx;
    border-top: 1px solid #f0f0f0;
}

.cancel-btn,
.submit-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
}

.cancel-btn {
    background: #f5f5f5;
    color: #666;
}

.submit-btn {
    background: #ff4757;
    color: white;
}

.submit-btn.disabled {
    background: #ccc;
    color: #999;
}
</style>