<template>
  <div class="login-callback">
    <el-card class="callback-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#409eff"><Loading /></el-icon>
          <span>正在处理登录...</span>
        </div>
      </template>

      <div v-if="loading" class="loading-content">
        <el-icon class="is-loading" :size="48" color="#409eff"><Loading /></el-icon>
        <p>正在获取用户信息,请稍候...</p>
      </div>

      <div v-else-if="error" class="error-content">
        <el-icon :size="48" color="#f56c6c"><CircleClose /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="goToLogin">返回登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleClose } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { callCloudFunction } from '@/api/cloud'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  await handleCallback()
})

const handleCallback = async () => {
  try {
    // 从URL中获取参数
    const code = route.query.code as string
    const state = route.query.state as string

    console.log('微信回调参数:', { code, state })

    if (!code) {
      throw new Error('未获取到授权码')
    }

    // 调用云函数,使用code换取access_token和用户信息
    // 注意: 需要创建一个云函数来处理微信登录
    const result = await callCloudFunction('login', {
      action: 'wechat_callback',
      code: code,
      state: state
    })

    console.log('登录结果:', result)

    if (result.success && result.user) {
      // 登录成功,保存用户信息
      userStore.setToken('wechat-token-' + Date.now())
      userStore.setUserInfo(result.user)

      ElMessage.success('登录成功')

      // 跳转到首页
      router.push('/dashboard')
    } else {
      throw new Error(result.error || '登录失败')
    }
  } catch (err: any) {
    console.error('处理微信登录回调失败:', err)
    error.value = err.message || '登录失败,请重试'
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.login-callback {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-card {
  width: 400px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.loading-content p,
.error-content p {
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}
</style>