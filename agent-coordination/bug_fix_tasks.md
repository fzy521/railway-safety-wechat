# 剩余错误修复任务分配

## 任务分配原则
- 按照智能体的职责范围分配任务
- 优先修复影响系统运行的错误
- 合理分配工作量，避免单个智能体负载过高

## 任务分配详情

### web-admin-dev-agent
**负责修复Web后台相关的错误，共48个错误**

1. **src/layouts/MainLayout.vue**
   - 错误：QuestionFilled未使用
   - 修复：删除未使用的QuestionFilled导入

2. **src/router/index.ts**
   - 错误：from未使用
   - 修复：删除未使用的from参数

3. **src/views/certificates/index.vue**
   - 错误1：ElMessageBox未使用
   - 错误2：handleView中的row参数未使用
   - 错误3：handleEdit中的row参数未使用
   - 错误4：handleDelete中的row参数未使用
   - 修复：删除未使用的导入和参数

4. **src/views/danger/index.vue**
   - 错误1：result.success不存在
   - 错误2：result.error不存在
   - 错误3：result.success不存在
   - 错误4：result.error不存在
   - 修复：添加适当的类型检查或更新ICallFunctionResponse类型

5. **src/views/emergency/PlanDialog.vue**
   - 错误1：uploadRef未使用
   - 错误2：file参数未使用
   - 修复：删除未使用的变量和参数

6. **src/views/incident/index.vue**
   - 错误1：statistics.byStatus['处理中']索引错误
   - 错误2：statistics.byStatus['已处理']索引错误
   - 修复：添加类型定义或使用可选链

7. **src/views/inspection/index.vue**
   - 错误1：result.data不存在
   - 错误2：result.data不存在
   - 错误3：row参数未使用
   - 错误4：row参数未使用
   - 错误5：result.data不存在
   - 修复：添加类型检查或更新ICallFunctionResponse类型

8. **src/views/login/index.vue**
   - 错误1：result.status不存在
   - 错误2：result.status不存在
   - 错误3：result.userInfo不存在
   - 修复：添加类型检查或更新ICallFunctionResponse类型

9. **src/views/notifications/NotificationList.vue**
   - 错误1：defineProps导入冲突
   - 错误2：defineEmits导入冲突
   - 修复：删除重复的导入

10. **src/views/risk/index.vue**
    - 错误1：getRiskLevelColor导入冲突
    - 错误2：matrixFilters.likelihood赋值错误
    - 错误3：matrixFilters.severity赋值错误
    - 错误4：pageSize不存在
    - 修复：解决导入冲突，修复类型错误

11. **src/views/settings/index.vue**
    - 错误1：row参数未使用
    - 错误2：row参数未使用
    - 修复：删除未使用的参数

12. **src/views/statistics/index.vue**
    - 错误1：formatDate未使用
    - 错误2：dailyTrend未使用
    - 错误3：dailyHazardTrend未定义
    - 错误4：ElMessage.loading不存在
    - 错误5：ElMessage.loading不存在
    - 修复：删除未使用的变量，修复方法调用错误

13. **src/views/supervision/index.vue**
    - 错误1：progress属性不存在
    - 错误2：progress属性不存在
    - 错误3：result.message不存在
    - 错误4：result.data不存在
    - 错误5：row参数未使用
    - 错误6：row.progress不存在
    - 修复：添加类型定义，修复属性访问错误

14. **src/views/users/index.vue**
    - 错误：row参数未使用
    - 修复：删除未使用的参数

15. **src/views/warning/index.vue**
    - 错误1：getWarningLevelColor未使用
    - 错误2：result.data不存在
    - 错误3：result.message不存在
    - 错误4：result.data不存在
    - 错误5：row参数未使用
    - 错误6：row.rectifyMeasures不存在
    - 修复：删除未使用的导入和参数，修复属性访问错误

### data-viz-agent
**负责修复数据可视化相关的错误**

1. **src/views/statistics/index.vue**
   - 协助修复图表相关的错误
   - 优化数据可视化功能

2. **src/views/danger/index.vue**
   - 协助修复隐患统计图表相关的错误

## 修复优先级

### 高优先级（影响系统运行）
- 云函数调用相关的类型错误
- 组件渲染相关的错误
- 路由相关的错误

### 中优先级（影响代码质量）
- 未使用的导入和变量
- 类型定义错误
- 导入冲突

### 低优先级（不影响系统运行）
- 未使用的参数
- 代码风格问题

## 修复时间表

- **开始时间**：2026-01-08 18:30:00
- **预计完成时间**：2026-01-09 12:00:00
- **验收时间**：2026-01-09 14:00:00

## 修复要求

1. 修复错误后，运行构建命令验证修复效果
2. 更新tasks.json和status.json，记录修复进度
3. 每个修复完成后，更新工作进度
4. 遇到问题及时沟通，避免延误

## 验收标准

- 构建命令无错误
- 系统能够正常运行
- 代码质量符合要求
- 文档更新及时

## 协调机制

- 项目协调智能体负责跟踪进度
- 每日10:00和16:00进行进度同步
- 遇到问题时，及时通过messages.json沟通
- 修复完成后，提交修复报告
