<template>
  <div class="risk-matrix">
    <div class="matrix-header">
      <h3 class="matrix-title">风险矩阵</h3>
      <div class="matrix-stats">
        <span class="stat-item">总风险数: {{ totalRisks }}</span>
        <span class="stat-item">重大风险: {{ majorRisks }}个</span>
      </div>
    </div>
    <div class="matrix-container">
      <!-- 矩阵标题行 -->
      <div class="matrix-row header-row">
        <div class="matrix-cell header-cell"></div>
        <div class="matrix-cell header-cell" v-for="l in likelihoodLevels" :key="`likelihood-${l}`">
          <div class="header-label">{{ likelihoodLabels[l] }}</div>
          <div class="header-value">{{ l }}</div>
        </div>
      </div>
      
      <!-- 矩阵内容行 -->
      <div class="matrix-row" v-for="s in severityLevels" :key="`severity-${s}`">
        <div class="matrix-cell header-cell severity-header">
          <div class="header-label">{{ severityLabels[s] }}</div>
          <div class="header-value">{{ s }}</div>
        </div>
        
        <div 
          class="matrix-cell risk-cell" 
          v-for="l in likelihoodLevels" 
          :key="`cell-${l}-${s}`"
          :class="getRiskLevelClass(l, s)"
          @click="handleRiskCellClick(l, s)"
        >
          <div class="risk-value">{{ calculateRiskValue(l, s) }}</div>
          <div class="risk-count">{{ getRiskCount(l, s) }}</div>
          <div class="risk-ratio" v-if="getRiskCount(l, s) > 0">{{ getRiskRatio(l, s) }}%</div>
        </div>
      </div>
    </div>
    
    <!-- 风险等级图例 -->
    <div class="matrix-legend">
      <div class="legend-item" v-for="level in riskLevels" :key="level.value">
        <div class="legend-color" :class="`risk-level-${level.value}`"></div>
        <div class="legend-text">{{ level.label }}</div>
        <div class="legend-count">{{ getLevelRiskCount(level.value) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Risk } from '@/types'

// 定义组件属性
interface Props {
  risks: Risk[]
}

const props = withDefaults(defineProps<Props>(), {
  risks: () => []
})

// 定义组件事件
const emit = defineEmits<{
  (e: 'riskSelected', likelihood: number, severity: number): void
}>()

// 可能性等级 (E值)
const likelihoodLevels = [1, 2, 3, 6, 10] as const
const likelihoodLabels: Record<typeof likelihoodLevels[number], string> = {
  1: '几乎不可能',
  2: '很少',
  3: '有时',
  6: '经常',
  10: '频繁'
}

// 严重性等级 (S值)
const severityLevels = [1, 2, 4, 8, 10] as const
const severityLabels: Record<typeof severityLevels[number], string> = {
  1: '轻微伤害',
  2: '需医院治疗',
  4: '永久失能',
  8: '1人死亡',
  10: '多人死亡'
}

// 风险等级配置
const riskLevels = [
  { value: 4, label: '低风险', min: 1, max: 40, color: '#22c55e' },
  { value: 3, label: '一般风险', min: 40, max: 90, color: '#eab308' },
  { value: 2, label: '较大风险', min: 90, max: 180, color: '#f59e0b' },
  { value: 1, label: '重大风险', min: 180, max: Infinity, color: '#ef4444' }
]

// 总风险数
const totalRisks = computed(() => props.risks.length)

// 重大风险数
const majorRisks = computed(() => {
  return props.risks.filter(risk => {
    const e = Math.max(risk.e1Value, risk.e2Value)
    const r = risk.mValue * e * risk.sValue
    return r >= 180
  }).length
})

// 计算风险值
const calculateRiskValue = (likelihood: number, severity: number, m: number = 1) => {
  return likelihood * severity * m
}

// 获取风险等级
const getRiskLevel = (riskValue: number) => {
  for (const level of riskLevels) {
    if (riskValue >= level.min && riskValue < level.max) {
      return level.value
    }
  }
  return 4
}

// 获取风险等级样式类
const getRiskLevelClass = (likelihood: number, severity: number, m: number = 1) => {
  const riskValue = calculateRiskValue(likelihood, severity, m)
  const level = getRiskLevel(riskValue)
  return `risk-level-${level}`
}

// 获取特定风险等级的风险数量
const getRiskCount = (likelihood: number, severity: number) => {
  return props.risks.filter(risk => {
    const e = Math.max(risk.e1Value, risk.e2Value)
    const r = risk.mValue * e * risk.sValue
    const cellR = calculateRiskValue(likelihood, severity)
    
    return r >= cellR && r < cellR * 10 + 1
  }).length
}

// 获取风险等级的风险数量
const getLevelRiskCount = (level: number) => {
  return props.risks.filter(risk => {
    const e = Math.max(risk.e1Value, risk.e2Value)
    const r = risk.mValue * e * risk.sValue
    const riskLevel = getRiskLevel(r)
    return riskLevel === level
  }).length
}

// 获取风险占比
const getRiskRatio = (likelihood: number, severity: number) => {
  const count = getRiskCount(likelihood, severity)
  return totalRisks.value > 0 ? Math.round((count / totalRisks.value) * 100) : 0
}

// 风险单元格点击事件
const handleRiskCellClick = (likelihood: number, severity: number) => {
  const count = getRiskCount(likelihood, severity)
  if (count > 0) {
    emit('riskSelected', likelihood, severity)
  } else {
    ElMessage.info('该风险等级暂无数据')
  }
}
</script>

<style scoped>
.risk-matrix {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.matrix-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.matrix-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  font-size: 14px;
  color: #606266;
  padding: 5px 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.matrix-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.matrix-row {
  display: flex;
}

.matrix-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #e0e0e0;
  padding: 10px;
  min-width: 100px;
  min-height: 100px;
  font-size: 14px;
}

.header-row {
  font-weight: bold;
  background-color: #f5f7fa;
}

.header-cell {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.header-label {
  font-size: 12px;
  margin-bottom: 5px;
}

.header-value {
  font-size: 16px;
}

.severity-header {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.risk-cell {
  cursor: pointer;
  transition: all 0.3s ease;
}

.risk-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.risk-value {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.risk-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 5px;
}

.risk-ratio {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
}

/* 风险等级样式 */
.risk-level-1 {
  background-color: #ef4444;
}

.risk-level-2 {
  background-color: #f59e0b;
}

.risk-level-3 {
  background-color: #eab308;
}

.risk-level-4 {
  background-color: #22c55e;
}

/* 图例样式 */
.matrix-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-text {
  font-size: 14px;
  color: #303133;
}

.legend-count {
  font-size: 12px;
  color: #909399;
  background-color: #ffffff;
  padding: 1px 6px;
  border-radius: 10px;
}
</style>