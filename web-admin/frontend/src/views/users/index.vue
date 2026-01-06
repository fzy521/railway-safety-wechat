<template>
  <div class="users-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="部门">
          <el-input
            v-model="searchForm.dept"
            placeholder="请输入部门"
            clearable
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="userList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="name" label="姓名" width="100" />

        <el-table-column prop="phone" label="手机号" width="130" />

        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />

        <el-table-column prop="deptId" label="部门" width="120" />

        <el-table-column prop="position" label="职位" width="120" />

        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role"
              type="primary"
              size="small"
              style="margin-right: 5px"
            >
              {{ getRoleName(role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="inspections" label="巡检次数" width="100" align="center" />

        <el-table-column prop="incidents" label="上报事故" width="100" align="center" />

        <el-table-column prop="experience" label="工作经验" width="100" align="center">
          <template #default="{ row }">
            {{ row.experience }}年
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="部门" prop="deptId">
              <el-select v-model="userForm.deptId" placeholder="请选择" style="width: 100%">
                <el-option label="工务段" value="dept001" />
                <el-option label="电务段" value="dept002" />
                <el-option label="运输部" value="dept003" />
                <el-option label="机务段" value="dept004" />
                <el-option label="安监部" value="dept005" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="userForm.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="工作经验" prop="experience">
              <el-input-number v-model="userForm.experience" :min="0" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色" prop="roles">
          <el-checkbox-group v-model="userForm.roles">
            <el-checkbox label="admin">管理员</el-checkbox>
            <el-checkbox label="inspector">巡检员</el-checkbox>
            <el-checkbox label="supervisor">监督员</el-checkbox>
            <el-checkbox label="user">普通用户</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider>统计信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="巡检次数">
              <el-input-number v-model="userForm.inspections" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="上报事故">
              <el-input-number v-model="userForm.incidents" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="证书数量">
              <el-input-number v-model="userForm.certificates" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { formatDate, exportToCSV } from '@/utils'
import type { UserInfo } from '@/stores/user'

// 搜索表单
const searchForm = reactive({
  name: '',
  dept: '',
  status: undefined
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 用户列表
const userList = ref<UserInfo[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const userFormRef = ref<FormInstance>()

// 用户表单
const userForm = reactive({
  _id: '',
  name: '',
  phone: '',
  email: '',
  deptId: '',
  position: '',
  roles: [],
  status: 1,
  inspections: 0,
  incidents: 0,
  certificates: 0,
  experience: 0
})

// 表单验证规则
const userRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 获取角色名称
const getRoleName = (role: string) => {
  const names: Record<string, string> = {
    'admin': '管理员',
    'inspector': '巡检员',
    'supervisor': '监督员',
    'user': '普通用户'
  }
  return names[role] || role
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    // 模拟数据
    userList.value = [
      {
        _id: 'user001',
        _openid: 'openid001',
        name: '张三',
        avatarUrl: '',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        deptId: 'dept001',
        position: '巡检员',
        roles: ['inspector', 'user'],
        status: 1,
        inspections: 100,
        incidents: 2,
        certificates: 3,
        experience: 5
      },
      {
        _id: 'user002',
        _openid: 'openid002',
        name: '李四',
        avatarUrl: '',
        phone: '13800138002',
        email: 'lisi@example.com',
        deptId: 'dept002',
        position: '监督员',
        roles: ['supervisor', 'user'],
        status: 1,
        inspections: 150,
        incidents: 1,
        certificates: 5,
        experience: 8
      },
      {
        _id: 'user003',
        _openid: 'openid003',
        name: '王五',
        avatarUrl: '',
        phone: '13800138003',
        email: 'wangwu@example.com',
        deptId: 'dept005',
        position: '管理员',
        roles: ['admin'],
        status: 1,
        inspections: 50,
        incidents: 0,
        certificates: 2,
        experience: 10
      }
    ]
    pagination.total = userList.value.length
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    dept: '',
    status: undefined
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(userForm, {
    _id: '',
    name: '',
    phone: '',
    email: '',
    deptId: '',
    position: '',
    roles: [],
    status: 1,
    inspections: 0,
    incidents: 0,
    certificates: 0,
    experience: 0
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: UserInfo) => {
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, {
    ...row
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row: UserInfo) => {
  ElMessage.info('查看详情功能开发中')
}

// 删除
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    ElMessage.success('删除成功')
    loadUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (userForm._id) {
        ElMessage.success('更新成功')
      } else {
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadUserList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
}

// 导出
const handleExport = () => {
  exportToCSV(userList.value, `用户列表_${formatDate(new Date(), 'YYYYMMDD')}.csv`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadUserList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadUserList()
}

// 初始化
loadUserList()
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.search-card,
.operation-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>