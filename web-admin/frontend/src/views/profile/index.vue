<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div class="profile-info">
            <el-avatar :size="80" src="/logo.png" />
            <h3>管理员</h3>
            <p>安全管理部门</p>
          </div>
          <el-menu :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item index="info">个人信息</el-menu-item>
            <el-menu-item index="password">修改密码</el-menu-item>
            <el-menu-item index="logs">操作记录</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card v-if="activeMenu === 'info'">
          <template #header>个人信息</template>
          <el-form label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="userInfo.name" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card v-if="activeMenu === 'password'">
          <template #header>修改密码</template>
          <el-form label-width="100px">
            <el-form-item label="原密码">
              <el-input v-model="passwordForm.oldPassword" type="password" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword">修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card v-if="activeMenu === 'logs'">
          <template #header>操作记录</template>
          <el-table :data="logs" border stripe>
            <el-table-column prop="action" label="操作" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column prop="time" label="时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeMenu = ref('info')
const userInfo = ref({
  username: 'admin',
  name: '管理员',
  email: 'admin@example.com',
  phone: '13800138000'
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const logs = ref([
  { action: '登录系统', ip: '192.168.1.1', time: '2024-12-25 10:00:00' },
  { action: '查看风险列表', ip: '192.168.1.1', time: '2024-12-25 10:05:00' }
])

const handleMenuSelect = (key: string) => {
  activeMenu.value = key
}

const handleSaveInfo = () => {
  ElMessage.success('个人信息保存成功')
}

const handleUpdatePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  ElMessage.success('密码修改成功')
}
</script>

<style scoped lang="scss">
.profile-page {
  padding: 20px;

  .profile-info {
    text-align: center;
    padding: 20px 0;

    h3 {
      margin: 16px 0 8px;
    }

    p {
      color: #909399;
      margin: 0;
    }
  }
}
</style>