<template>
  <div class="video-edit-page">
    <el-page-header @back="$router.back()" :title="isEdit ? '编辑视频' : '发布视频'" />
    
    <div class="edit-container">
      <!-- 左侧主表单 -->
      <div class="main-form">
        <el-card>
          <template #header>
            <span>基本信息</span>
          </template>
          
          <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
            <el-form-item label="视频标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入视频标题" maxlength="100" show-word-limit />
            </el-form-item>
            
            <el-form-item label="视频分类" prop="categoryId">
              <el-cascader 
                v-model="formData.categoryId" 
                :options="categoryOptions" 
                placeholder="请选择分类"
                :props="{ checkStrictly: true, emitPath: false }"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="视频简介" prop="description">
              <el-input 
                v-model="formData.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入视频简介"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="标签">
              <el-select 
                v-model="formData.tags" 
                multiple 
                filterable 
                allow-create 
                default-first-option
                placeholder="请选择或输入标签" 
                style="width: 100%"
              >
                <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 视频文件上传 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>视频文件</span>
              <el-tag v-if="uploadProgress > 0 && uploadProgress < 100" type="warning">
                上传中 {{ uploadProgress }}%
              </el-tag>
              <el-tag v-else-if="formData.url" type="success">已上传</el-tag>
            </div>
          </template>
          
          <div class="video-upload-section">
            <el-upload
              ref="videoUploadRef"
              class="video-uploader"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleVideoChange"
              accept=".mp4,.mov,.avi,.mkv,.webm"
            >
              <div class="upload-content" v-if="!formData.url">
                <el-icon :size="40"><UploadFilled /></el-icon>
                <p>将视频拖到此处，或<em>点击上传</em></p>
                <p class="upload-tip">支持 mp4, mov, avi, mkv, webm 格式，最大 4GB</p>
              </div>
              <div class="upload-preview" v-else>
                <video :src="videoPreviewUrl" controls style="max-width: 100%; max-height: 300px;" />
              </div>
            </el-upload>
            
            <el-progress v-if="uploadProgress > 0 && uploadProgress < 100" :percentage="uploadProgress" :stroke-width="8" />
            
            <div class="upload-info" v-if="videoFile">
              <div class="info-item">
                <span class="label">文件名:</span>
                <span>{{ videoFile.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">文件大小:</span>
                <span>{{ formatFileSize(videoFile.size) }}</span>
              </div>
              <el-button type="danger" size="small" @click="clearVideo">移除视频</el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 章节标记 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>章节标记</span>
              <el-button type="primary" size="small" :icon="Plus" @click="addChapter">添加章节</el-button>
            </div>
          </template>
          
          <div class="chapters-list" v-if="formData.chapters.length > 0">
            <div class="chapter-item" v-for="(chapter, index) in formData.chapters" :key="index">
              <div class="chapter-time">
                <el-input-number 
                  v-model="chapter.startTime" 
                  :min="0" 
                  :max="formData.duration || 9999"
                  size="small"
                  controls-position="right"
                />
                <span class="time-label">秒</span>
              </div>
              <el-input v-model="chapter.title" placeholder="章节标题" class="chapter-title" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="removeChapter(index)" />
            </div>
          </div>
          <el-empty v-else description="暂无章节，点击上方按钮添加" :image-size="60" />
        </el-card>
        
        <!-- 字幕管理 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字幕管理</span>
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                @change="handleSubtitleUpload"
                accept=".srt,.vtt,.ass"
              >
                <el-button type="primary" size="small" :icon="Upload">上传字幕</el-button>
              </el-upload>
            </div>
          </template>
          
          <div class="subtitles-list" v-if="formData.subtitles.length > 0">
            <div class="subtitle-item" v-for="(sub, index) in formData.subtitles" :key="index">
              <div class="subtitle-info">
                <el-icon><Document /></el-icon>
                <span class="name">{{ sub.name }}</span>
                <el-tag size="small">{{ sub.language }}</el-tag>
              </div>
              <div class="subtitle-actions">
                <el-switch v-model="sub.isDefault" active-text="默认" size="small" />
                <el-button type="danger" :icon="Delete" link @click="removeSubtitle(index)" />
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无字幕文件" :image-size="60" />
        </el-card>
      </div>
      
      <!-- 右侧设置 -->
      <div class="side-form">
        <!-- 封面设置 -->
        <el-card>
          <template #header>视频封面</template>
          
          <div class="cover-section">
            <div class="cover-preview" v-if="formData.cover">
              <img :src="formData.cover" alt="封面" />
              <div class="cover-mask">
                <el-button size="small" @click="showCoverCapture = true">截取</el-button>
                <el-button size="small" @click="formData.cover = ''">删除</el-button>
              </div>
            </div>
            <el-upload
              v-else
              class="cover-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleCoverChange"
              accept="image/*"
            >
              <div class="upload-placeholder">
                <el-icon :size="32"><Plus /></el-icon>
                <span>上传封面</span>
              </div>
            </el-upload>
            
            <div class="cover-actions">
              <el-button size="small" :disabled="!formData.url" @click="showCoverCapture = true">
                <el-icon><VideoPause /></el-icon>从视频截取
              </el-button>
            </div>
            <p class="cover-tip">建议尺寸 1280x720，支持 jpg/png 格式</p>
          </div>
        </el-card>
        
        <!-- 权限设置 -->
        <el-card>
          <template #header>权限设置</template>
          
          <el-form label-position="top">
            <el-form-item label="可见性">
              <el-radio-group v-model="formData.visibility">
                <el-radio value="public">公开</el-radio>
                <el-radio value="private">私有</el-radio>
                <el-radio value="password">密码保护</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item v-if="formData.visibility === 'password'" label="访问密码">
              <el-input v-model="formData.password" placeholder="请设置密码" show-password />
            </el-form-item>
            
            <el-form-item label="允许下载">
              <el-switch v-model="formData.allowDownload" />
            </el-form-item>
            
            <el-form-item label="允许评论">
              <el-switch v-model="formData.allowComment" />
            </el-form-item>
            
            <el-form-item label="VIP专属">
              <el-switch v-model="formData.isVip" />
            </el-form-item>
            
            <el-form-item v-if="formData.isVip" label="所需积分">
              <el-input-number v-model="formData.pointsRequired" :min="0" :max="10000" />
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 水印设置 -->
        <el-card>
          <template #header>水印设置</template>
          
          <el-form label-position="top">
            <el-form-item label="启用水印">
              <el-switch v-model="formData.watermark.enabled" />
            </el-form-item>
            
            <template v-if="formData.watermark.enabled">
              <el-form-item label="水印类型">
                <el-radio-group v-model="formData.watermark.type">
                  <el-radio value="text">文字</el-radio>
                  <el-radio value="image">图片</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item v-if="formData.watermark.type === 'text'" label="水印文字">
                <el-input v-model="formData.watermark.text" placeholder="输入水印文字" />
              </el-form-item>
              
              <el-form-item v-if="formData.watermark.type === 'image'" label="水印图片">
                <div class="watermark-image-upload">
                  <div class="watermark-preview" v-if="formData.watermark.image">
                    <img :src="formData.watermark.image" alt="水印图片" />
                    <div class="preview-mask">
                      <el-button size="small" @click="formData.watermark.image = ''">删除</el-button>
                    </div>
                  </div>
                  <el-upload
                    v-else
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    @change="handleWatermarkImageChange"
                    accept="image/png,image/gif"
                    class="watermark-uploader"
                  >
                    <div class="upload-placeholder">
                      <el-icon><Plus /></el-icon>
                      <span>上传水印</span>
                    </div>
                  </el-upload>
                  <p class="watermark-tip">建议使用PNG透明图片，尺寸不超过200x100</p>
                </div>
              </el-form-item>
              
              <el-form-item label="位置">
                <el-select v-model="formData.watermark.position">
                  <el-option label="左上" value="top-left" />
                  <el-option label="右上" value="top-right" />
                  <el-option label="左下" value="bottom-left" />
                  <el-option label="右下" value="bottom-right" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="透明度">
                <el-slider v-model="formData.watermark.opacity" :min="10" :max="100" />
              </el-form-item>
            </template>
          </el-form>
        </el-card>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="handleSubmit('published')" :loading="loading">
            <el-icon><CircleCheck /></el-icon>发布视频
          </el-button>
          <el-button size="large" @click="handleSubmit('draft')" :loading="loading">
            <el-icon><Document /></el-icon>保存草稿
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </div>
      </div>
    </div>
    
    <!-- 封面截取弹窗 -->
    <el-dialog v-model="showCoverCapture" title="从视频截取封面" width="700px">
      <div class="cover-capture">
        <video ref="captureVideoRef" :src="videoPreviewUrl" controls style="width: 100%; max-height: 400px;" />
        <div class="capture-actions">
          <el-button type="primary" @click="captureCover">截取当前帧</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Plus, Delete, Upload, UploadFilled, Document, VideoPause, CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { mockService } from '@/mock'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 上传相关
const videoUploadRef = ref()
const videoFile = ref<File | null>(null)
const videoPreviewUrl = ref('')
const uploadProgress = ref(0)
const showCoverCapture = ref(false)
const captureVideoRef = ref<HTMLVideoElement>()

// 分类选项
const categoryOptions = [
  { value: 'cat-1', label: '前端开发', children: [
    { value: 'cat-1-1', label: 'Vue' },
    { value: 'cat-1-2', label: 'React' },
    { value: 'cat-1-3', label: 'Angular' }
  ]},
  { value: 'cat-2', label: '后端开发', children: [
    { value: 'cat-2-1', label: 'Node.js' },
    { value: 'cat-2-2', label: 'Java' },
    { value: 'cat-2-3', label: 'Python' }
  ]},
  { value: 'cat-3', label: '数据库' },
  { value: 'cat-4', label: '运维部署' },
  { value: 'cat-5', label: '人工智能' }
]

// 标签选项
const tagOptions = ['Vue', 'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'MySQL', 'Docker', 'Kubernetes', 'AI']

// 表单数据
const formData = reactive({
  title: '',
  categoryId: '',
  cover: '',
  url: '',
  description: '',
  tags: [] as string[],
  duration: 0,
  // 章节
  chapters: [] as { startTime: number; title: string }[],
  // 字幕
  subtitles: [] as { name: string; language: string; url: string; isDefault: boolean }[],
  // 权限
  visibility: 'public' as 'public' | 'private' | 'password',
  password: '',
  allowDownload: false,
  allowComment: true,
  isVip: false,
  pointsRequired: 0,
  // 水印
  watermark: {
    enabled: false,
    type: 'text' as 'text' | 'image',
    text: '',
    image: '',
    position: 'bottom-right' as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    opacity: 80
  }
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入视频简介', trigger: 'blur' }]
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 水印图片上传
function handleWatermarkImageChange(file: UploadFile) {
  if (file.raw) {
    formData.watermark.image = URL.createObjectURL(file.raw)
    ElMessage.success('水印图片上传成功')
  }
}

// 封面上传
function handleCoverChange(file: UploadFile) {
  if (file.raw) {
    formData.cover = URL.createObjectURL(file.raw)
  }
}

// 视频上传
function handleVideoChange(file: UploadFile) {
  if (file.raw) {
    videoFile.value = file.raw
    videoPreviewUrl.value = URL.createObjectURL(file.raw)
    formData.url = file.name
    
    // 模拟上传进度
    simulateUpload()
  }
}

async function simulateUpload() {
  uploadProgress.value = 0
  for (let i = 0; i <= 100; i += 5) {
    await new Promise(r => setTimeout(r, 100))
    uploadProgress.value = i
  }
  ElMessage.success('视频上传成功')
}

function clearVideo() {
  videoFile.value = null
  videoPreviewUrl.value = ''
  formData.url = ''
  uploadProgress.value = 0
}

// 章节管理
function addChapter() {
  formData.chapters.push({ startTime: 0, title: '' })
}

function removeChapter(index: number) {
  formData.chapters.splice(index, 1)
}

// 字幕上传
function handleSubtitleUpload(file: UploadFile) {
  if (file.raw) {
    formData.subtitles.push({
      name: file.name,
      language: '中文',
      url: URL.createObjectURL(file.raw),
      isDefault: formData.subtitles.length === 0
    })
    ElMessage.success('字幕上传成功')
  }
}

function removeSubtitle(index: number) {
  formData.subtitles.splice(index, 1)
}

// 从视频截取封面
function captureCover() {
  const video = captureVideoRef.value
  if (!video) return
  
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0)
  formData.cover = canvas.toDataURL('image/jpeg', 0.8)
  showCoverCapture.value = false
  ElMessage.success('封面截取成功')
}

// 提交
async function handleSubmit(status: string) {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success(status === 'published' ? '发布成功' : '已保存草稿')
      router.push('/admin/videos')
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 加载编辑数据
onMounted(async () => {
  if (isEdit.value) {
    const id = route.params.id as string
    const video = await mockService.getVideoDetail(id)
    if (video) {
      Object.assign(formData, {
        title: video.title,
        categoryId: video.categoryId,
        cover: video.cover,
        url: video.url,
        description: video.description,
        tags: video.tags,
        duration: video.duration
      })
      videoPreviewUrl.value = video.url
    }
  }
})
</script>

<style scoped lang="scss">
.video-edit-page {
  .edit-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    align-items: flex-start;
  }
  
  .main-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  
  .side-form {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  // 视频上传
  .video-upload-section {
    .video-uploader {
      :deep(.el-upload-dragger) {
        width: 100%;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .upload-content {
      text-align: center;
      color: var(--color-text-tertiary);
      
      p {
        margin: 12px 0 0;
        
        em {
          color: var(--color-primary);
          font-style: normal;
        }
      }
      
      .upload-tip {
        font-size: 12px;
      }
    }
    
    .upload-preview {
      text-align: center;
    }
    
    .upload-info {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 16px;
      padding: 12px 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      
      .info-item {
        .label {
          color: var(--color-text-tertiary);
          margin-right: 8px;
        }
      }
    }
  }
  
  // 章节
  .chapters-list {
    .chapter-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      .chapter-time {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .time-label {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
      }
      
      .chapter-title {
        flex: 1;
      }
    }
  }
  
  // 字幕
  .subtitles-list {
    .subtitle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      margin-bottom: 8px;
      
      .subtitle-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .name {
          font-weight: 500;
        }
      }
      
      .subtitle-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
  
  // 封面
  .cover-section {
    .cover-preview {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
      
      img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
      }
      
      .cover-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover .cover-mask {
        opacity: 1;
      }
    }
    
    .cover-uploader {
      .upload-placeholder {
        width: 100%;
        aspect-ratio: 16 / 9;
        border: 2px dashed var(--color-border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--color-text-tertiary);
        cursor: pointer;
        transition: border-color 0.3s;
        
        &:hover {
          border-color: var(--color-primary);
        }
      }
    }
    
    .cover-actions {
      margin: 12px 0;
    }
    
    .cover-tip {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  }
  
  // 操作按钮
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .el-button {
      width: 100%;
    }
  }
  
  // 封面截取
  .cover-capture {
    .capture-actions {
      margin-top: 16px;
      text-align: center;
    }
  }
  
  // 水印图片上传
  .watermark-image-upload {
    .watermark-preview {
      position: relative;
      width: 120px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--color-border);
      
      img {
        width: 100%;
        height: 60px;
        object-fit: contain;
        background: #f5f5f5;
      }
      
      .preview-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover .preview-mask {
        opacity: 1;
      }
    }
    
    .watermark-uploader {
      .upload-placeholder {
        width: 120px;
        height: 60px;
        border: 2px dashed var(--color-border);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--color-text-tertiary);
        cursor: pointer;
        font-size: 12px;
        transition: border-color 0.3s;
        
        &:hover {
          border-color: var(--color-primary);
        }
      }
    }
    
    .watermark-tip {
      font-size: 12px;
      color: var(--color-text-tertiary);
      margin-top: 8px;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .video-edit-page {
    .edit-container {
      flex-direction: column;
    }
    
    .side-form {
      width: 100%;
      position: static;
    }
  }
}
</style>
