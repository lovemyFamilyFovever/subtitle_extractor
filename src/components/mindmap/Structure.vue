<template>
    <div class="style-panel" ref="panelRef">
        <div class="panel-header">
            <span class="panel-title"> 结构</span>
        </div>

        <div class="panel-body customScrollbar">

            <div class="layoutGroupList">
                <div class="layoutGroup" v-for="group in layoutGroupList" :key="group.name">
                    <div class="groupName">{{ group.name }}</div>
                    <div class="layoutList">
                        <div class="layoutItem" v-for="item in group.list" :key="item"
                            @click="() => emit('setLayout', item)" :class="{ active: item === layout }">
                            <img :src="layoutImgMap[item]" alt="" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>


</template>


<script setup>
import {ref, computed,onMounted, onBeforeUnmount } from 'vue'

// 导入所有结构图片
import logicalStructureImg from '@/assets/structures/logicalStructure.jpg'
import logicalStructureLeftImg from '@/assets/structures/logicalStructureLeft.jpg'
import mindMapImg from '@/assets/structures/mindMap.jpg'
import organizationStructureImg from '@/assets/structures/organizationStructure.jpg'
import catalogOrganizationImg from '@/assets/structures/catalogOrganization.jpg'
import timelineImg from '@/assets/structures/timeline.jpg'
import timeline2Img from '@/assets/structures/timeline2.jpg'
import fishboneImg from '@/assets/structures/fishbone.jpg'
import fishbone2Img from '@/assets/structures/fishbone2.jpg'
import rightFishboneImg from '@/assets/structures/rightFishbone.jpg'
import rightFishbone2Img from '@/assets/structures/rightFishbone2.jpg'
import verticalTimelineImg from '@/assets/structures/verticalTimeline.jpg'
import verticalTimeline2Img from '@/assets/structures/verticalTimeline2.jpg'
import verticalTimeline3Img from '@/assets/structures/verticalTimeline3.jpg'



// 图片路径映射
const layoutImgMap = {
    logicalStructure: logicalStructureImg,
    logicalStructureLeft: logicalStructureLeftImg,
    mindMap: mindMapImg,
    organizationStructure: organizationStructureImg,
    catalogOrganization: catalogOrganizationImg,
    timeline: timelineImg,
    timeline2: timeline2Img,
    fishbone: fishboneImg,
    fishbone2: fishbone2Img,
    rightFishbone: rightFishboneImg,
    rightFishbone2: rightFishbone2Img,
    verticalTimeline: verticalTimelineImg,
    verticalTimeline2: verticalTimeline2Img,
    verticalTimeline3: verticalTimeline3Img
}

// 提取文件名作为 key
const layoutImgMapProcessed = computed(() => {
    const map = {}
    for (const [path, mod] of Object.entries(layoutImgMap)) {
        const filename = path.split('/').pop().replace('.jpg', '')
        map[filename] = mod.default
    }
    return map
})

const layoutGroupList = [
    { name: '逻辑结构图', list: ['logicalStructure', 'logicalStructureLeft'] },
    { name: '思维导图', list: ['mindMap'] },
    { name: '组织结构图', list: ['organizationStructure'] },
    { name: '目录组织图', list: ['catalogOrganization'] },
    { name: '时间轴', list: ['timeline', 'timeline2', 'verticalTimeline'] },
    { name: '鱼骨图', list: ['fishbone'] }
]

const emit = defineEmits(['close','setLayout', 'getLayout'])

const layout = emit('getLayout')

const panelRef = ref(null)

function handleOutsideClick(e) {
    if (panelRef.value && !panelRef.value.contains(e.target)) {
        emit('close')
    }
}

onMounted(() => {
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick)
    }, 100)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleOutsideClick)
})

</script>

<style scoped>
/* 样式面板 */
.style-panel {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 300px;
    background: rgb(255, 255, 255);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.25);
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: 100;
    animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(12px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    letter-spacing: 0.02em;
}

.panel-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.05);
    color: #888;
    font-weight: 500;
}

.panel-body {
    padding: 14px 16px 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-height: calc(100vh - 150px);
    overflow-x: hidden;
    overflow-y: auto;
}


.layoutGroupList {
    width: 100%;
}

.layoutGroupList.isDark .layoutGroup .groupName {
    color: #fff;
}

.layoutGroupList .layoutGroup {
    width: 100%;
    margin-bottom: 12px;
}

.layoutGroupList .layoutGroup .groupName {
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
    font-size: 14px;
}

.layoutGroupList .layoutGroup .layoutList {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.layoutGroupList .layoutGroup .layoutList .layoutItem {
    width: 120px;
    height: 70px;
    cursor: pointer;
    border: 1px solid #e9e9e9;
    transition: all 0.2s;
    overflow: hidden;
    margin-bottom: 12px;
    padding: 5px;
    border-radius: 5px;
}

.layoutGroupList .layoutGroup .layoutList .layoutItem:hover {
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
        0 3px 6px 0 rgba(0, 0, 0, 0.12),
        0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.layoutGroupList .layoutGroup .layoutList .layoutItem.active {
    border: 1px solid #409eff;
}

.layoutGroupList .layoutGroup .layoutList .layoutItem img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>