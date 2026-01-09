<template>
  <div class="help-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>帮助分类</template>
          <el-menu :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item index="user-guide">使用指南</el-menu-item>
            <el-menu-item index="faq">常见问题</el-menu-item>
            <el-menu-item index="contact">联系我们</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card v-if="activeMenu === 'user-guide'">
          <template #header>使用指南</template>
          <div class="help-content">
            <h3>快速开始</h3>
            <p>欢迎使用铁路安全管理系统,本系统提供以下功能:</p>
            <ul>
              <li>风险管理 - 记录和评估安全风险</li>
              <li>隐患管理 - 发现和整改安全隐患</li>
              <li>巡检管理 - 制定和执行巡检计划</li>
              <li>统计分析 - 查看安全数据报表</li>
            </ul>
          </div>
        </el-card>

        <el-card v-if="activeMenu === 'faq'">
          <template #header>常见问题</template>
          <el-collapse>
            <el-collapse-item title="如何创建风险记录?">
              <p>进入风险管理页面,点击"新增风险"按钮,填写风险信息并提交。</p>
            </el-collapse-item>
            <el-collapse-item title="如何导出数据?">
              <p>在各管理页面中,点击"导出数据"按钮即可导出当前列表数据。</p>
            </el-collapse-item>
            <el-collapse-item title="如何修改密码?">
              <p>进入个人中心页面,选择"修改密码"菜单,输入新旧密码后提交。</p>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <el-card v-if="activeMenu === 'contact'">
          <template #header>联系我们</template>
          <div class="contact-info">
            <h3>技术支持</h3>
            <p><el-icon><Phone /></el-icon> 电话: 400-888-8888</p>
            <p><el-icon><Message /></el-icon> 邮箱: support@example.com</p>
            <p><el-icon><Location /></el-icon> 地址: 北京市朝阳区</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Phone, Message, Location } from '@element-plus/icons-vue'

const activeMenu = ref('user-guide')

const handleMenuSelect = (key: string) => {
  activeMenu.value = key
}
</script>

<style scoped lang="scss">
.help-page {
  padding: 20px;

  .help-content {
    h3 {
      margin-bottom: 16px;
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .contact-info {
    h3 {
      margin-bottom: 16px;
    }

    p {
      margin: 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>