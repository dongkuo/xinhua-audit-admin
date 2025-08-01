<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {useDictStore} from '@/store/modules/dict'
import {AddIcon} from "tdesign-icons-vue-next"
import {reset} from '@/utils/object'

const dictStore = useDictStore()
// 表格配置
const stripe = ref(false)
const bordered = ref(true)
const hover = ref(true)
const tableLayout = ref(false)
const size = ref('small')
const showHeader = ref(true)

const loading = ref(false)
const filter = ref({userId: null})
const list = ref([])
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'id', title: '资料id', width: '70', align: 'center'},
  {
    colKey: 'cover', title: '封面', width: '140', align: 'center', cell: (h, {row}) => {
      return (<t-image src={row.cover} fit="cover" position="center" style={{width: '120px', height: '68px'}}/>)
    }
  },
  {colKey: 'title', title: '标题', width: 150, align: 'center', },
  {colKey: 'summary', title: '摘要', width: 200, align: 'center', },
  {colKey: 'readNumber', title: '阅读量', align: 'center'},
  {colKey: 'downloadNumber', title: '下载量', align: 'center'},
  {
    colKey: 'type', title: '类别', width: 100, align: 'center', cell: (h, {row}) => {
      return dictStore.getLabel(12, row.type)
    }
  },
  {
    colKey: 'status', title: '状态', align: 'center', cell: (h, {row}) => {
      let theme
      let label
      if (row.status === 0) {
        theme = 'danger'
        label = '下架'
      } else {
        theme = 'success'
        label = '上架'
      }
      return (<t-tag theme={theme} variant="light">{label}</t-tag>)
    }
  },
  {colKey: 'publishTime', title: '发布时间'},
  {colKey: 'createTime', title: '创建时间'},
  {
    colKey: 'action', title: '操作', fixed: 'right', cell: (h, {row}) => {
      return (
        <div class="flex flex-gap2">
          <t-button theme="primary" size="small" variant="base" onClick={() => onUpdateBtnClick(row)}>编辑</t-button>
          <t-button theme="danger" size="small" variant="base" onClick={() => onDeleteBtnClick(row)}>删除</t-button>
        </div>
      )
    }
  },
])

function getFileNameFromUrl(url) {
  const cleanUrl = url.split('?')[0].split('#')[0];
  return cleanUrl.split('/').pop();
}

function onAddBtnClick() {
  submitDialogTitle.value = '新增项目'
  submitDialogVisible.value = true
  submitDialogMode.value = 'add'
  reset(submitFormData)
}

function onUpdateBtnClick(row) {
  submitFormData.id = row.id
  submitFormData.type = row.type
  submitFormData.title = row.title
  submitFormData.cover = row.cover
  submitFormData.summary = row.summary
  submitFormData.readNumber = row.readNumber
  submitFormData.downloadNumber = row.downloadNumber
  submitFormData.downloadUrl = row.downloadUrl
  submitFormData.publishTime = row.publishTime
  submitFormData.status = row.status
  submitCovers.value = [{status: 'success', url: row.cover}]
  submitDownloadUrls.value = [{status: 'success', url: row.downloadUrl, name: getFileNameFromUrl(row.downloadUrl)}]

  submitDialogMode.value = 'update'
  submitDialogTitle.value = '修改资料'
  submitDialogVisible.value = true
}

function onDeleteBtnClick(row) {
  deleteDialogVisible.value = true
  deleteId.value = row.id
}

function onPageChange(pageInfo) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

async function loadData() {
  loading.value = true
  const data = (await api.pageStudyFile({
    userId: filter.value.userId,
    page: pagination.current,
    size: pagination.pageSize
  })).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

////////////////////////////////////////// 提交 dialog
const submitDialogVisible = ref(false)
const submitDialogLoading = ref(false)
const submitDialogTitle = ref('')
const submitDialogMode = ref('')
const submitFormData = reactive({
  id: null,
  type: null,
  title: null,
  cover: null,
  summary: null,
  readNumber: null,
  downloadNumber: null,
  downloadUrl: null,
  publishTime: null,
  status: null,
})
const submitCovers = ref([])
const submitDownloadUrls = ref([])

watch(submitCovers, (newVal, oldVal) => {
  if (newVal && newVal.length > 0) {
    submitFormData.cover = newVal[0].url
  } else {
    submitFormData.cover = null
  }
})

watch(submitDownloadUrls, (newVal, oldVal) => {
  if (newVal && newVal.length > 0) {
    submitFormData.downloadUrl = newVal[0].url
  } else {
    submitFormData.downloadUrl = null
  }
})

async function onSubmit() {
  submitDialogLoading.value = true
  try {
    await api.submitStudyFile(submitFormData)
  } catch (e) {
    console.log('提交失败', e)
    return
  }
  submitDialogLoading.value = false
  submitDialogVisible.value = false
  await loadData()
}

function uploadFile(file) {
  return new Promise(async (resolve) => {
    const formData = new FormData()
    formData.append('file', file.raw)
    const url = (await api.uploadFile(formData)).data
    resolve({status: 'success', response: {url}});
  });
}

////////////////////////////////////////// 删除 dialog
const deleteDialogVisible = ref(false)
const deleteDialogLoading = ref(false)
const deleteId = ref(null)

async function onDeleteSubmit() {
  deleteDialogLoading.value = true
  await api.deleteStudyFile(deleteId.value)
  deleteDialogLoading.value = false
  deleteDialogVisible.value = false
  await loadData()
}

onMounted(async () => {
  await loadData()
})

</script>

<template>
  <div>
    <FaPageMain>
      <div class="flex flex-gap2 mb-4">
        <t-button theme="primary" @click="onAddBtnClick">
          <template #icon>
            <add-icon/>
          </template>
          新增
        </t-button>
      </div>
      <t-table
        row-key="id"
        :loading="loading"
        :data="list"
        :columns="columns"
        :stripe="stripe"
        :bordered="bordered"
        :hover="hover"
        :table-layout="tableLayout ? 'auto' : 'fixed'"
        :size="size"
        :pagination="pagination"
        :show-header="showHeader"
        cell-empty-content="-"
        lazy-load
        @page-change="onPageChange">
      </t-table>
    </FaPageMain>
    <!--提交dialog-->
    <t-dialog v-model:visible="submitDialogVisible" :header="submitDialogTitle" width="40%"
              :confirm-loading="submitDialogLoading" @confirm="onSubmit">
      <t-form :data="submitFormData" :label-width="70">
        <t-form-item label="封面">
          <t-upload v-model="submitCovers" theme="image" accept="image/*" placeholder="请选择封面图片" :multiple="false"
                    :auto-upload="true" :size-limit="{ size: 3, unit: 'MB' }" :request-method="uploadFile"/>
        </t-form-item>
        <t-form-item label="标题">
          <t-input v-model="submitFormData.title" placeholder="请输入标题" clearable/>
        </t-form-item>
        <t-form-item label="类别">
          <t-select v-model="submitFormData.type" placeholder="请选择类别">
            <t-option v-for="item in dictStore.getOptions(12)" :value="item.value" :label="item.label"/>
          </t-select>
        </t-form-item>
        <t-form-item label="摘要">
          <t-textarea v-model="submitFormData.summary" placeholder="请输入摘要" :autosize="{ minRows: 3, maxRows: 3 }"/>
        </t-form-item>
        <t-form-item label="发布时间">
          <t-date-picker v-model="submitFormData.publishTime" placeholder="请选择发布时间" enable-time-picker/>
        </t-form-item>
        <t-form-item label="状态">
          <t-select v-model="submitFormData.status" placeholder="请选择状态">
            <t-option :value="1" label="上架"/>
            <t-option :value="0" label="下架"/>
          </t-select>
        </t-form-item>
        <t-form-item label="阅读量">
          <t-input v-model="submitFormData.readNumber" placeholder="请输入阅读量" type="number"/>
        </t-form-item>
        <t-form-item label="下载量">
          <t-input v-model="submitFormData.downloadNumber" placeholder="请输入下载量" type="number"/>
        </t-form-item>
        <t-form-item label="文件">
          <t-upload v-model="submitDownloadUrls" placeholder="请选择资料文件" :multiple="false"
                    :auto-upload="true" :size-limit="{ size: 20, unit: 'MB' }" :request-method="uploadFile"/>
        </t-form-item>
      </t-form>
    </t-dialog>
    <!--删除dialog-->
    <t-dialog v-model:visible="deleteDialogVisible" header="删除确认" width="40%" :confirm-loading="deleteDialogLoading"
              @confirm="onDeleteSubmit">
      <t-space direction="vertical" style="width: 100%">确认删除该资料吗？</t-space>
    </t-dialog>
  </div>
</template>
