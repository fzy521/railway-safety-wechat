<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>抱歉,您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
}

.content h1 {
  font-size: 120px;
  margin: 0;
  font-weight: bold;
}

.content p {
  font-size: 24px;
  margin: 20px 0 30px;
}
</style>