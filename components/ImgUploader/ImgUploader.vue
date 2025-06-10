<script setup>
import { computed, ref } from 'vue'
import { useOSSStore } from '@/store/OSSStore'

const props = defineProps({
    imgSrc: {
        type: [String, Array],
        default: () => []
    },
    maxCount: {
        type: Number,
        default: 1,
        validator: v => v >= 1
    },
    isPreview: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:imgSrc'])

const ossStore = useOSSStore()

// 子组件内部统一处理为数组
const localImages = computed({
    get: () => {
        if (Array.isArray(props.imgSrc)) return props.imgSrc
        return props.imgSrc ? [props.imgSrc] : []
    },
    set: val => {
        // 根据 maxCount 决定返回给父组件的数据类型
        const output = props.maxCount === 1 ? val[0] || '' : val
        emit('update:imgSrc', output)
    }
})

// 图片列表始终为数组
const fileList = computed(() => localImages.value)

// 上传逻辑 - 使用uni-app的API
const handleSelect = async () => {
    const currentCount = localImages.value.length
    const count = props.maxCount - currentCount
    if (count <= 0) return
    
    try {
        const res = await uni.chooseImage({
            count,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera']
        })
        const urls = []
        for (const file of res.tempFiles) {
            const res = await ossStore.ossUploader.upload(file)
            urls.push(res)
        }
        localImages.value = [...localImages.value, ...urls]

    } catch (error) {
        console.error('选择图片失败', error)
        uni.showToast({
            title: '选择图片失败',
            icon: 'none'
        })
    }
}


// 预览图片
const previewImage = (url, index) => {
    const urls = localImages.value
    uni.previewImage({
        current: index,
        urls: urls,
        indicator: 'number'
    })
}

// 删除图片
const deleteImage = (index) => {
    localImages.value = localImages.value.filter((_, i) => i !== index)
}
</script>

<template>
    <view class="container">
        <view class="img-Container">
            <!-- 图片预览容器 -->
            <view
                v-if="isPreview"
                v-for="(item, index) of fileList"
                :key="index"
                class="image-wrapper"
            >
                <image
                    :src="item"
                    mode="aspectFill"
                    class="preview-image"
                    @click="previewImage(item, index)"
                />
                <!-- 删除按钮 -->
                <view
                    class="delete-btn"
                    @click.stop="deleteImage(index)"
                >
                    ×
                </view>
            </view>
            <!-- 上传按钮 -->
            <view @click="handleSelect" v-if="fileList.length < maxCount">
                <slot name="button">
                    <view class="upload-button">
                        <text class="upload-icon">+</text>
                    </view>
                </slot>
            </view>
        </view>
    </view>
</template>

<style scoped>
.container {
    padding: 5px 0;
}

.img-Container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
}

.image-wrapper {
    position: relative;
    flex: 1 1 80px;
    max-width: 80px;
    aspect-ratio: 1;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    flex-direction: row;
    display: flex;
}

.delete-btn {
    position: absolute;
    right: -6px;
    top: -6px;
    width: 20px;
    height: 20px;
    background: #ff4444;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.2s;
}

.delete-btn:hover {
    transform: scale(1.1);
    background: #ff0000;
}

.upload-button {
    width: 80px;
    height: 80px;
    border: 1px dashed #dcdee2;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7f7f7;
}

.upload-icon {
    font-size: 28px;
    color: #999;
}
</style>