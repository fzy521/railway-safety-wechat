<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="900px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-width="120px">
      <el-divider content-position="left">基本信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预案名称" prop="name">
            <el-input v-model="planForm.name" placeholder="请输入预案名称" :disabled="isView" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="预案类型" prop="type">
            <el-select v-model="planForm.type" placeholder="请选择" style="width: 100%" :disabled="isView">
              <el-option label="综合应急预案" value="comprehensive" />
              <el-option label="专项应急预案" value="special" />
              <el-option label="现场处置方案" value="field" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本" prop="version">
            <el-input v-model="planForm.version" placeholder="请输入版本号" :disabled="isView" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="planForm.status" placeholder="请选择" style="width: 100%" :disabled="isView">
              <el-option label="已发布" value="active" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="审批部门" prop="approvalDept">
            <el-input v-model="planForm.approvalDept" placeholder="请输入审批部门" :disabled="isView" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="演练频次" prop="drillFrequency">
            <el-select v-model="planForm.drillFrequency" placeholder="请选择" style="width: 100%" :disabled="isView">
              <el-option label="每年1次" value="yearly_1" />
              <el-option label="每年2次" value="yearly_2" />
              <el-option label="每季度1次" value="quarterly_1" />
              <el-option label="每月1次" value="monthly_1" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上次评审日期" prop="lastReviewDate">
            <el-date-picker
              v-model="planForm.lastReviewDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="isView"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="下次评审日期" prop="nextReviewDate">
            <el-date-picker
              v-model="planForm.nextReviewDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="isView"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="有效性评估" prop="effectiveness">
        <el-input
          v-model="planForm.effectiveness"
          type="textarea"
          :rows="2"
          placeholder="请输入有效性评估"
          :disabled="isView"
        />
      </el-form-item>

      <el-divider content-position="left">预案文档</el-divider>

      <!-- 上传区域 -->
      <el-form-item label="上传文档" v-if="!isView">
        <el-upload
          ref="uploadRef"
          class="pdf-upload"
          :action="uploadAction"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :file-list="fileList"
          :limit="10"
          accept=".pdf"
          :auto-upload="true"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将PDF文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传PDF文件，且不超过50MB
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 已上传文件列表 -->
      <el-form-item label="已上传文档">
        <el-table :data="planForm.pdfFiles" border stripe v-if="planForm.pdfFiles.length > 0">
          <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
          <el-table-column prop="fileSize" label="大小" width="100" align="center" />
          <el-table-column prop="uploadTime" label="上传时间" width="180" />
          <el-table-column label="操作" width="200" align="center" v-if="!isView">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handlePreview(row)">
                预览
              </el-button>
              <el-button type="success" link size="small" @click="handleDownload(row)">
                下载
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteFile(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" v-else>
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handlePreview(row)">
                预览
              </el-button>
              <el-button type="success" link size="small" @click="handleDownload(row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无文档" :image-size="80" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose" v-if="!isView">取消</el-button>
      <el-button @click="handleClose" v-else>关闭</el-button>
      <el-button type="primary" @click="handleSubmit" v-if="!isView">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { createEmergencyPlan, updateEmergencyPlan, deletePdfFile, type PdfFile } from '@/api/emergency'
import type { EmergencyPlan } from '@/api/emergency'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'

interface Props {
  modelValue: boolean
  title: string
  plan: EmergencyPlan | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const planFormRef = ref<FormInstance>()
const uploadRef = ref()

// 是否是查看模式
const isView = computed(() => props.title === '查看预案')

// 上传配置
const uploadAction = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/emergency/upload'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})

// 文件列表
const fileList = ref<UploadUserFile[]>([])

// 预案表单
const planForm = ref<EmergencyPlan>({
  id: '',
  name: '',
  type: '',
  typeName: '',
  version: '',
  status: 'active',
  statusText: '',
  lastReviewDate: '',
  nextReviewDate: '',
  approvalDept: '',
  drillFrequency: '',
  drillFrequencyCode: '',
  effectiveness: '',
  pdfFiles: []
})

// 表单验证规则
const planRules: FormRules = {
  name: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择预案类型', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  approvalDept: [{ required: true, message: '请输入审批部门', trigger: 'blur' }],
  drillFrequency: [{ required: true, message: '请选择演练频次', trigger: 'change' }],
  lastReviewDate: [{ required: true, message: '请选择上次评审日期', trigger: 'change' }],
  nextReviewDate: [{ required: true, message: '请选择下次评审日期', trigger: 'change' }]
}

// 重置表单
const resetForm = () => {
  planForm.value = {
    id: '',
    name: '',
    type: '',
    typeName: '',
    version: '',
    status: 'active',
    statusText: '',
    lastReviewDate: '',
    nextReviewDate: '',
    approvalDept: '',
    drillFrequency: '',
    drillFrequencyCode: '',
    effectiveness: '',
    pdfFiles: []
  }
  fileList.value = []
}

// 监听plan变化
watch(
  () => props.plan,
  (newPlan) => {
    if (newPlan) {
      planForm.value = {
        ...newPlan,
        pdfFiles: newPlan.pdfFiles || []
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 上传前校验
const beforeUpload = (file: File) => {
  const isPDF = file.type === 'application/pdf'
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isPDF) {
    ElMessage.error('只能上传PDF文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('上传文件大小不能超过50MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response: any, file: UploadUserFile) => {
  ElMessage.success('上传成功')
  planForm.value.pdfFiles.push({
    id: response.data.id,
    fileName: response.data.fileName,
    fileSize: response.data.fileSize,
    uploadTime: response.data.uploadTime,
    fileUrl: response.data.fileUrl,
    cloudPath: response.data.cloudPath
  })
  fileList.value = []
}

// 上传失败
const handleUploadError = (error: any) => {
  ElMessage.error('上传失败')
  console.error('Upload error:', error)
}

// 预览文件
const handlePreview = (row: PdfFile) => {
  window.open(row.fileUrl, '_blank')
}

// 下载文件
const handleDownload = (row: PdfFile) => {
  const link = document.createElement('a')
  link.href = row.fileUrl
  link.download = row.fileName
  link.click()
}

// 删除文件
const handleDeleteFile = async (row: PdfFile) => {
  try {
    await deletePdfFile(row.cloudPath)
    planForm.value.pdfFiles = planForm.value.pdfFiles.filter(f => f.id !== row.id)
    ElMessage.success('删除成功')
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
  planFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!planFormRef.value) return

  await planFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 设置typeName
      const typeMap: Record<string, string> = {
        comprehensive: '综合应急预案',
        special: '专项应急预案',
        field: '现场处置方案'
      }
      planForm.value.typeName = typeMap[planForm.value.type]

      // 设置statusText
      const statusMap: Record<string, string> = {
        active: '已发布',
        draft: '草稿',
        archived: '已归档'
      }
      planForm.value.statusText = statusMap[planForm.value.status]

      // 设置drillFrequencyCode
      const frequencyMap: Record<string, string> = {
        'yearly_1': 'yearly_1',
        'yearly_2': 'yearly_2',
        'quarterly_1': 'quarterly_1',
        'monthly_1': 'monthly_1'
      }
      planForm.value.drillFrequencyCode = frequencyMap[planForm.value.drillFrequency]

      if (planForm.value._id) {
        await updateEmergencyPlan(planForm.value._id, planForm.value)
        ElMessage.success('更新成功')
      } else {
        planForm.value.id = 'EP' + Date.now()
        await createEmergencyPlan(planForm.value)
        ElMessage.success('创建成功')
      }

      emit('success')
      emit('update:modelValue', false)
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}
</script>

<style scoped>
.pdf-upload {
  width: 100%;
}

.el-icon--upload {
  font-size: 67px;
  color: var(--el-text-color-secondary);
  margin: 40px 0 16px;
}

.el-upload__text {
  color: var(--el-text-color-regular);
  font-size: 14px;
  text-align: center;
}

.el-upload__text em {
  color: var(--el-color-primary);
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 7px;
  text-align: center;
}
</style>