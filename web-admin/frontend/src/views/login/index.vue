<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>铁路安全管理系统</h1>
        <p>Railway Safety Management System</p>
      </div>

      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <div
          class="tab-item"
          :class="{ active: loginType === 'account' }"
          @click="loginType = 'account'"
        >
          账号登录
        </div>
        <div
          class="tab-item"
          :class="{ active: loginType === 'qrcode' }"
          @click="loginType = 'qrcode'"
        >
          扫码登录
        </div>
      </div>

      <!-- 账号密码登录 -->
      <el-form
        v-if="loginType === 'account'"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 微信扫码登录 -->
      <div v-else class="qrcode-login">
        <div class="qrcode-container">
          <div v-show="qrcodeStatus === 'loading'" class="qrcode-loading">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>二维码生成中...</p>
          </div>
          <div v-show="qrcodeStatus === 'active'" class="qrcode-wrapper">
            <div ref="qrcodeRef" class="qrcode"></div>
            <p class="qrcode-tip">请使用微信扫码登录</p>
          </div>
          <div v-show="qrcodeStatus === 'scanned'" class="qrcode-scanned">
            <el-icon :size="60" color="#67c23a"><CircleCheck /></el-icon>
            <p>扫码成功,请在手机上确认</p>
          </div>
          <div v-show="qrcodeStatus === 'expired'" class="qrcode-expired">
            <el-icon :size="60" color="#f56c6c"><Refresh /></el-icon>
            <p>二维码已过期</p>
            <el-button type="primary" link @click="refreshQrcode">刷新二维码</el-button>
          </div>
          <div v-show="qrcodeStatus === 'success'" class="qrcode-success">
            <el-icon :size="60" color="#67c23a"><CircleCheck /></el-icon>
            <p>登录成功,正在跳转...</p>
          </div>
        </div>
      </div>

      <div class="login-footer">
        <p>安全风险分级管控和隐患排查治理双控机制</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Loading, CircleCheck, Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import QRCode from 'qrcode'

const router = useRouter()
const userStore = useUserStore()

// 登录方式: account-账号登录, qrcode-扫码登录
const loginType = ref('account')

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 二维码相关
const qrcodeRef = ref<HTMLElement>()
const qrcodeStatus = ref<'loading' | 'active' | 'scanned' | 'expired' | 'success'>('loading')
const qrcodeTimer = ref<NodeJS.Timeout | null>(null)
const checkLoginTimer = ref<NodeJS.Timeout | null>(null)
const qrCodeId = ref('')

// 生成二维码
const generateQrcode = async (retryCount = 0) => {
  try {
    qrcodeStatus.value = 'loading'
    
    // 等待DOM更新,多次尝试确保元素存在
    for (let i = 0; i < 5; i++) {
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (qrcodeRef.value) {
        break
      }
    }
    
    // 生成唯一的登录会话ID
    qrCodeId.value = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 创建登录数据
    const loginData = {
      type: 'web_login',
      sessionId: qrCodeId.value,
      timestamp: Date.now(),
      platform: 'web'
    }
    
    // 将登录数据转换为JSON字符串
    const loginDataStr = JSON.stringify(loginData)
    
    console.log('生成小程序扫码登录二维码,会话ID:', qrCodeId.value)
    
    // 创建登录会话到云数据库
    try {
      await callCloudFunction('webLogin', {
        action: 'create_session',
        sessionId: qrCodeId.value
      })
    } catch (error) {
      console.warn('创建登录会话失败(可能云函数未部署):', error)
    }
    
    // 生成二维码
    if (qrcodeRef.value) {
      // 清空容器
      qrcodeRef.value.innerHTML = ''
      
      // 创建canvas元素
      const canvas = document.createElement('canvas')
      qrcodeRef.value.appendChild(canvas)
      
      await QRCode.toCanvas(canvas, loginDataStr, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      console.log('二维码生成成功')
      qrcodeStatus.value = 'active'
      
      // 启动检查登录状态的定时器
      startCheckLoginStatus()
      
      // 5分钟后二维码过期
      qrcodeTimer.value = setTimeout(() => {
        if (qrcodeStatus.value === 'active' || qrcodeStatus.value === 'scanned') {
          qrcodeStatus.value = 'expired'
          stopCheckLoginStatus()
        }
      }, 5 * 60 * 1000)
    } else {
      console.error('二维码容器元素不存在,重试次数:', retryCount)
      
      // 如果容器不存在,重试一次
      if (retryCount < 3) {
        setTimeout(() => {
          generateQrcode(retryCount + 1)
        }, 200)
      } else {
        ElMessage.error('二维码容器未找到,请刷新页面重试')
        qrcodeStatus.value = 'expired'
      }
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败: ' + (error as Error).message)
    qrcodeStatus.value = 'expired'
  }
}

// 检查登录状态(调用云函数)
const checkLoginStatus = async (qrId: string): Promise<boolean> => {
  try {
    const result = await callCloudFunction('webLogin', {
      action: 'check',
      sessionId: qrId
    })
    
    if (result.status === 'scanned') {
      qrcodeStatus.value = 'scanned'
    }
    
    if (result.status === 'success') {
      // 登录成功
      userStore.setToken('wechat-token-' + Date.now())
      userStore.setUserInfo(result.userInfo)
      return true
    }
    
    return false
  } catch (error) {
    console.error('检查登录状态失败:', error)
    return false
  }
}

// 刷新二维码
const refreshQrcode = () => {
  generateQrcode()
}

// 启动检查登录状态
const startCheckLoginStatus = () => {
  // 每2秒检查一次登录状态
  checkLoginTimer.value = setInterval(async () => {
    try {
      // 这里应该调用后端API检查登录状态
      // 实际实现需要后端支持轮询或WebSocket
      
      // 模拟检查逻辑
      const isLoggedIn = await checkLoginStatus(qrCodeId.value)
      
      if (isLoggedIn) {
        qrcodeStatus.value = 'success'
        stopCheckLoginStatus()
        
        // 模拟登录成功
        setTimeout(() => {
          handleWechatLoginSuccess()
        }, 1000)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }, 2000)
}

// 停止检查登录状态
const stopCheckLoginStatus = () => {
  if (checkLoginTimer.value) {
    clearInterval(checkLoginTimer.value)
    checkLoginTimer.value = null
  }
}

// 微信登录成功处理
const handleWechatLoginSuccess = async () => {
  try {
    // 实际应该从后端获取用户信息
    const mockUser = {
      _id: '123456',
      _openid: 'openid123',
      name: '微信用户',
      avatarUrl: '',
      phone: '13800138000',
      email: 'wechat@railway.com',
      deptId: 'dept001',
      position: '系统管理员',
      roles: ['admin'],
      status: 1,
      inspections: 100,
      incidents: 5,
      certificates: 3,
      experience: 10
    }

    userStore.setToken('wechat-token-' + Date.now())
    userStore.setUserInfo(mockUser)

    ElMessage.success('登录成功')

    router.push('/dashboard')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  }
}

// 账号密码登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      // 模拟登录 - 实际应该调用云函数
      // const result = await login(loginForm.username, loginForm.password)

      // 模拟登录成功
      const mockUser = {
        _id: '123456',
        _openid: 'openid123',
        name: '管理员',
        avatarUrl: '',
        phone: '13800138000',
        email: 'admin@railway.com',
        deptId: 'dept001',
        position: '系统管理员',
        roles: ['admin'],
        status: 1,
        inspections: 100,
        incidents: 5,
        certificates: 3,
        experience: 10
      }

      userStore.setToken('mock-token-' + Date.now())
      userStore.setUserInfo(mockUser)

      ElMessage.success('登录成功')

      router.push('/dashboard')
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

// 监听登录方式切换
import { watch } from 'vue'
watch(loginType, async (newType) => {
  if (newType === 'qrcode') {
    // 切换到扫码登录时生成二维码
    await generateQrcode()
  } else {
    // 切换回账号登录时清理二维码相关资源
    if (qrcodeTimer.value) {
      clearTimeout(qrcodeTimer.value)
      qrcodeTimer.value = null
    }
    stopCheckLoginStatus()
    qrcodeStatus.value = 'loading'
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  if (qrcodeTimer.value) {
    clearTimeout(qrcodeTimer.value)
    qrcodeTimer.value = null
  }
  stopCheckLoginStatus()
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #e6e6e6;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  font-size: 16px;
  color: #909399;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.login-form {
  margin-bottom: 20px;
}

.qrcode-login {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.qrcode-container {
  width: 240px;
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qrcode-loading,
.qrcode-scanned,
.qrcode-expired,
.qrcode-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.qrcode-loading p,
.qrcode-scanned p,
.qrcode-expired p,
.qrcode-success p {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode {
  border: 1px solid #e6e6e6;
  padding: 10px;
  border-radius: 4px;
}

.qrcode-tip {
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer p {
  font-size: 12px;
  color: #909399;
}
</style>