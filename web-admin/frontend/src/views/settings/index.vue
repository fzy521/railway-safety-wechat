<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <!-- 左侧菜单 -->
      <el-col :xs="24" :sm="6">
        <el-card class="menu-card">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            class="settings-menu"
          >
            <el-menu-item index="basic">
              <el-icon><Setting /></el-icon>
              <span>基础设置</span>
            </el-menu-item>
            <el-menu-item index="business">
              <el-icon><Document /></el-icon>
              <span>业务规则</span>
            </el-menu-item>
            <el-menu-item index="dictionary">
              <el-icon><Files /></el-icon>
              <span>字典管理</span>
            </el-menu-item>
            <el-menu-item index="logs">
              <el-icon><Notebook /></el-icon>
              <span>日志管理</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :xs="24" :sm="18">
        <!-- 基础设置 -->
        <el-card v-if="activeMenu === 'basic'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>基础设置</span>
            </div>
          </template>

          <el-form :model="basicForm" label-width="150px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>

            <el-form-item label="系统简称">
              <el-input v-model="basicForm.systemShortName" placeholder="请输入系统简称" />
            </el-form-item>

            <el-form-item label="系统Logo">
              <el-upload
                class="logo-uploader"
                action="#"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeLogoUpload"
              >
                <img v-if="basicForm.logoUrl" :src="basicForm.logoUrl" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="系统描述">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input v-model="basicForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>

            <el-form-item label="联系邮箱">
              <el-input v-model="basicForm.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 业务规则 -->
        <el-card v-if="activeMenu === 'business'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>业务规则</span>
            </div>
          </template>

          <el-form :model="businessForm" label-width="200px">
            <el-divider content-position="left">风险管控规则</el-divider>

            <el-form-item label="重大风险检查频次">
              <el-select v-model="businessForm.majorRiskFrequency" placeholder="请选择">
                <el-option label="每周一次" value="weekly" />
                <el-option label="每两周一次" value="biweekly" />
                <el-option label="每月一次" value="monthly" />
              </el-select>
            </el-form-item>

            <el-form-item label="较大风险检查频次">
              <el-select v-model="businessForm.largerRiskFrequency" placeholder="请选择">
                <el-option label="每月一次" value="monthly" />
                <el-option label="每季度一次" value="quarterly" />
              </el-select>
            </el-form-item>

            <el-form-item label="一般风险检查频次">
              <el-select v-model="businessForm.generalRiskFrequency" placeholder="请选择">
                <el-option label="每季度一次" value="quarterly" />
                <el-option label="每半年一次" value="semiannual" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">隐患治理规则</el-divider>

            <el-form-item label="重大隐患整改时限">
              <el-input-number v-model="businessForm.majorDangerDays" :min="1" :max="180" />
              <span style="margin-left: 10px">天</span>
            </el-form-item>

            <el-form-item label="一般隐患整改时限">
              <el-input-number v-model="businessForm.generalDangerDays" :min="1" :max="90" />
              <span style="margin-left: 10px">天</span>
            </el-form-item>

            <el-form-item label="超期预警提前天数">
              <el-input-number v-model="businessForm.warningDays" :min="1" :max="30" />
              <span style="margin-left: 10px">天</span>
            </el-form-item>

            <el-divider content-position="left">巡检规则</el-divider>

            <el-form-item label="日常巡检周期">
              <el-select v-model="businessForm.dailyInspectionCycle" placeholder="请选择">
                <el-option label="每天" value="daily" />
                <el-option label="每两天" value="every2days" />
              </el-select>
            </el-form-item>

            <el-form-item label="定期巡检周期">
              <el-select v-model="businessForm.regularInspectionCycle" placeholder="请选择">
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveBusiness">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 字典管理 -->
        <el-card v-if="activeMenu === 'dictionary'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>字典管理</span>
              <el-button type="primary" @click="handleAddDict">
                <el-icon><Plus /></el-icon>
                新增字典
              </el-button>
            </div>
          </template>

          <el-table :data="dictionaryList" border stripe>
            <el-table-column type="index" label="序号" width="60" align="center" />

            <el-table-column prop="dictCode" label="字典编码" width="150" />

            <el-table-column prop="dictName" label="字典名称" width="150" />

            <el-table-column prop="dictType" label="字典类型" width="120" />

            <el-table-column prop="itemCount" label="字典项数" width="100" align="center" />

            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditDict(row)">
                  编辑
                </el-button>
                <el-button type="primary" link size="small" @click="handleViewDictItems(row)">
                  字典项
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 日志管理 -->
        <el-card v-if="activeMenu === 'logs'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>日志管理</span>
              <el-button type="danger" @click="handleClearLogs">
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
            </div>
          </template>

          <el-form :inline="true" :model="logSearchForm">
            <el-form-item label="日志类型">
              <el-select v-model="logSearchForm.logType" placeholder="请选择" clearable>
                <el-option label="操作日志" value="operation" />
                <el-option label="登录日志" value="login" />
                <el-option label="异常日志" value="error" />
              </el-select>
            </el-form-item>

            <el-form-item label="时间范围">
              <el-date-picker
                v-model="logSearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 240px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSearchLogs">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="logList" border stripe>
            <el-table-column type="index" label="序号" width="60" align="center" />

            <el-table-column prop="logType" label="日志类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogTypeTag(row.logType)">
                  {{ getLogTypeName(row.logType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="username" label="用户名" width="120" />

            <el-table-column prop="module" label="模块" width="120" />

            <el-table-column prop="action" label="操作" width="150" />

            <el-table-column prop="ip" label="IP地址" width="130" />

            <el-table-column prop="createTime" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime, 'YYYY-MM-DD HH:mm:ss') }}
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="logPagination.page"
              v-model:page-size="logPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="logPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card v-if="activeMenu === 'security'" class="content-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>

          <el-form :model="securityForm" label-width="200px">
            <el-divider content-position="left">登录安全</el-divider>

            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="securityForm.maxLoginAttempts" :min="3" :max="10" />
            </el-form-item>

            <el-form-item label="锁定时间(分钟)">
              <el-input-number v-model="securityForm.lockTime" :min="5" :max="60" />
            </el-form-item>

            <el-form-item label="密码有效期(天)">
              <el-input-number v-model="securityForm.passwordExpiry" :min="30" :max="365" />
            </el-form-item>

            <el-form-item label="强制密码复杂度">
              <el-switch v-model="securityForm.passwordComplexity" />
            </el-form-item>

            <el-divider content-position="left">操作日志</el-divider>

            <el-form-item label="记录操作日志">
              <el-switch v-model="securityForm.enableOperationLog" />
            </el-form-item>

            <el-form-item label="日志保留天数">
              <el-input-number v-model="securityForm.logRetentionDays" :min="7" :max="365" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Document,
  Files,
  Notebook,
  Lock,
  Plus,
  Delete,
  Search
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils'

// 当前激活的菜单
const activeMenu = ref('basic')

// 基础设置表单
const basicForm = reactive({
  systemName: '铁路安全管理系统',
  systemShortName: '铁路安全',
  logoUrl: '',
  description: '铁路安全风险分级管控和隐患排查治理双控机制管理系统',
  contactPhone: '010-12345678',
  contactEmail: 'support@railway-safety.com'
})

// 业务规则表单
const businessForm = reactive({
  majorRiskFrequency: 'weekly',
  largerRiskFrequency: 'monthly',
  generalRiskFrequency: 'quarterly',
  majorDangerDays: 90,
  generalDangerDays: 30,
  warningDays: 7,
  dailyInspectionCycle: 'daily',
  regularInspectionCycle: 'monthly'
})

// 字典列表
const dictionaryList = ref([
  {
    dictCode: 'risk_level',
    dictName: '风险等级',
    dictType: '风险',
    itemCount: 4,
    description: '风险等级分类',
    status: 1
  },
  {
    dictCode: 'danger_level',
    dictName: '隐患等级',
    dictType: '隐患',
    itemCount: 2,
    description: '隐患等级分类',
    status: 1
  },
  {
    dictCode: 'danger_category',
    dictName: '隐患类别',
    dictType: '隐患',
    itemCount: 10,
    description: '隐患类别分类',
    status: 1
  },
  {
    dictCode: 'check_type',
    dictName: '巡检类型',
    dictType: '巡检',
    itemCount: 3,
    description: '巡检类型分类',
    status: 1
  }
])

// 日志搜索表单
const logSearchForm = reactive({
  logType: '',
  dateRange: []
})

// 日志列表
const logList = ref([
  {
    logType: 'operation',
    username: 'admin',
    module: '风险管理',
    action: '新增风险',
    ip: '192.168.1.100',
    createTime: new Date(),
    status: 'success'
  },
  {
    logType: 'login',
    username: 'admin',
    module: '登录',
    action: '用户登录',
    ip: '192.168.1.100',
    createTime: new Date(),
    status: 'success'
  },
  {
    logType: 'error',
    username: 'admin',
    module: '隐患管理',
    action: '删除隐患',
    ip: '192.168.1.100',
    createTime: new Date(),
    status: 'failed'
  }
])

// 日志分页
const logPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 3
})

// 安全设置表单
const securityForm = reactive({
  maxLoginAttempts: 5,
  lockTime: 30,
  passwordExpiry: 90,
  passwordComplexity: true,
  enableOperationLog: true,
  logRetentionDays: 90
})

// 菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// Logo上传成功
const handleLogoSuccess = () => {
  ElMessage.success('Logo上传成功')
}

// Logo上传前
const beforeLogoUpload = () => {
  return true
}

// 保存基础设置
const handleSaveBasic = () => {
  ElMessage.success('基础设置保存成功')
}

// 保存业务规则
const handleSaveBusiness = () => {
  ElMessage.success('业务规则保存成功')
}

// 新增字典
const handleAddDict = () => {
  ElMessage.info('新增字典功能开发中')
}

// 编辑字典
const handleEditDict = (row: any) => {
  ElMessage.info('编辑字典功能开发中')
}

// 查看字典项
const handleViewDictItems = (row: any) => {
  ElMessage.info('字典项管理功能开发中')
}

// 搜索日志
const handleSearchLogs = () => {
  ElMessage.success('日志搜索完成')
}

// 清空日志
const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗?此操作不可恢复!', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    ElMessage.success('日志已清空')
  } catch {
    // 用户取消
  }
}

// 保存安全设置
const handleSaveSecurity = () => {
  ElMessage.success('安全设置保存成功')
}

// 获取日志类型标签
const getLogTypeName = (type: string) => {
  const names: Record<string, string> = {
    'operation': '操作日志',
    'login': '登录日志',
    'error': '异常日志'
  }
  return names[type] || type
}

// 获取日志类型标签类型
const getLogTypeTag = (type: string) => {
  const types: Record<string, any> = {
    'operation': 'primary',
    'login': 'success',
    'error': 'danger'
  }
  return types[type] || 'info'
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.menu-card {
  margin-bottom: 20px;
}

.settings-menu {
  border-right: none;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.logo {
  width: 178px;
  height: 178px;
  display: block;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>