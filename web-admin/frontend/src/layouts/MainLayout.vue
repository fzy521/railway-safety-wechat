<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img src="/logo.png" alt="Logo" v-if="!isCollapse" />
        <span v-if="!isCollapse">铁路安全</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <!-- 数据中心 -->
        <el-sub-menu index="/data-center">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>数据中心</span>
          </template>
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>数据看板</template>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>
            <template #title>统计分析</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 安全管理 -->
        <el-sub-menu index="/safety-management">
          <template #title>
            <el-icon><Warning /></el-icon>
            <span>安全管理</span>
          </template>
          <el-menu-item index="/risk">
            <el-icon><Warning /></el-icon>
            <template #title>风险管理</template>
          </el-menu-item>
          <el-menu-item index="/danger">
            <el-icon><Document /></el-icon>
            <template #title>隐患管理</template>
          </el-menu-item>
          <el-menu-item index="/incident">
            <el-icon><CircleClose /></el-icon>
            <template #title>事故管理</template>
          </el-menu-item>
          <el-menu-item index="/warning">
            <el-icon><Bell /></el-icon>
            <template #title>风险预警</template>
          </el-menu-item>
          <el-menu-item index="/supervision">
            <el-icon><Files /></el-icon>
            <template #title>隐患督办</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 日常运营 -->
        <el-sub-menu index="/daily-operation">
          <template #title>
            <el-icon><Operation /></el-icon>
            <span>日常运营</span>
          </template>
          <el-menu-item index="/inspection">
            <el-icon><Checked /></el-icon>
            <template #title>巡检管理</template>
          </el-menu-item>
          <el-menu-item index="/emergency">
            <el-icon><Lightning /></el-icon>
            <template #title>应急管理</template>
          </el-menu-item>
          <el-menu-item index="/certificates">
            <el-icon><Medal /></el-icon>
            <template #title>证书管理</template>
          </el-menu-item>
          <el-menu-item index="/notifications">
            <el-icon><Bell /></el-icon>
            <template #title>消息通知</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 用户中心 -->
        <el-sub-menu index="/user-center">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户中心</span>
          </template>
          <el-menu-item index="/users">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><Avatar /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 帮助与支持 -->
        <el-menu-item index="/help">
          <el-icon><Help /></el-icon>
          <template #title>帮助与支持</template>
        </el-menu-item>

        <!-- 系统设置 -->
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatarUrl">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userInfo?.name }}</span>
              <el-icon class="arrow-down"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  Warning,
  Document,
  Bell,
  Files,
  Checked,
  TrendCharts,
  User,
  Setting,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton,
  Lightning,
  QuestionFilled,
  Monitor,
  Operation,
  Medal,
  Avatar,
  Help
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const userInfo = computed(() => userStore.getUserInfo())
const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.28s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo span {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* 菜单项和子菜单标题文字颜色 */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
  color: #fff !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #fff !important;
}

/* 菜单项和子菜单标题图标颜色 */
.sidebar-menu :deep(.el-menu-item .el-icon),
.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover .el-icon),
.sidebar-menu :deep(.el-sub-menu__title:hover .el-icon) {
  color: #fff !important;
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #fff !important;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
}

.user-info .username {
  margin: 0 8px;
  font-size: 14px;
  color: #303133;
}

.arrow-down {
  font-size: 12px;
  color: #909399;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f0f2f5;
  padding: 20px;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>