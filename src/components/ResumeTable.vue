<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {useDictStore} from '@/store/modules/dict'
import {DownloadIcon, SearchIcon} from "tdesign-icons-vue-next"
import {downloadFile} from '@/utils/dom'

const props = defineProps({
  loadData: {
    type: Function,
    required: true
  },
  filter: {
    type: Object,
    default: {}
  }
})

const dictStore = useDictStore()
// 表格配置
const stripe = ref(false)
const bordered = ref(true)
const hover = ref(true)
const tableLayout = ref(false)
const size = ref('small')
const showHeader = ref(true)

const loading = ref(false)
const _filter = reactive({userId: null})
const list = ref([])
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'userId', title: '用户id', align: 'center', width: 70},
  {
    colKey: 'avatar', title: '头像', align: 'center', width: 70, cell: (h, {row}) => {
      return (
        <t-avatar image={row.avatar}/>
      );
    },
  },
  {colKey: 'name', title: '姓名'},
  {colKey: 'mobile', title: '手机', width: '120'},
  {
    colKey: 'gender', title: '性别', width: '70', cell: (h, {row}) => {
      return dictStore.getLabel(5, row.gender)
    }
  },
  {colKey: 'birthday', title: '生日', align: 'center'},
  {
    colKey: 'edu', title: '学历', cell: (h, {row}) => {
      return dictStore.getLabel(3, row.edu)
    }
  },
  {
    colKey: 'location', title: '所在地', width: 180, cell: (h, {row}) => {
      return dictStore.getLabel(3, dictStore.getLabel(-1, row.location))
    }
  },
  {
    colKey: 'requiredJobType', title: '工作类型', cell: (h, {row}) => {
      return dictStore.getLabel(1, row.requiredJobType)
    }
  },
  {
    colKey: 'requiredJobKinds', title: '求职岗位', cell: (h, {row}) => {
      return row.requiredJobKinds.map(it => dictStore.getLabel(6, it)).join("、")
    }
  },
  {
    colKey: 'pastJobLevel', title: '过往最高岗位', width: 120, cell: (h, {row}) => {
      return dictStore.getLabel(7, row.pastJobLevel)
    }
  },
  {
    colKey: 'careers', title: '项目经历', width: 150, ellipsis: true, cell: (h, {row}) => {
      return row.careers.length > 0 ? row.careers.map(it => dictStore.getLabel(17, it)).join("、") : "-"
    }
  },
  {
    colKey: 'skills', title: '擅长项目', width: 150, ellipsis: true, cell: (h, {row}) => {
      return row.skills.length > 0 ? row.skills.map(it => dictStore.getLabel(18, it)).join("、") : "-"
    }
  },
  {
    colKey: 'certs', title: '资格证书', width: 150, ellipsis: true, cell: (h, {row}) => {
      return row.certs.length > 0 ? row.certs.map(it => dictStore.getLabel(8, it)).join("、") : "-"
    }
  },
  {colKey: 'enrollNumber', title: '报名数', align: 'center'},
  {
    colKey: 'workerEdu', title: '教育背景', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('edu', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'workerExp', title: '工作经历', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('exp', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'workerCert', title: '证件证书', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('cert', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'appendix', title: '附件简历', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('appendix', row)}>查看</t-button>)
    }
  },
  {colKey: 'createTime', title: '创建时间', width: 180},
  {
    colKey: 'action',
    title: '操作',
    fixed: 'right',
    cell: (h, {row}) => {
      return (<t-button theme="primary" size="small"
                        onClick={() => onShowUpdateDialogBtnClick(row)}>修改报名数</t-button>)
    }
  }
])

function onPageChange(pageInfo) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  _loadData()
}

// 查看弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false)
const dialogColumn = ref([])
const dialogTitle = ref('')
const eduColumns = [
  {colKey: 'school', title: '学校'},
  {colKey: 'fromDate', title: '开始时间'},
  {colKey: 'toDate', title: '截止时间'},
]
const expColumns = [
  {colKey: 'company', title: '公司', width: 150},
  {colKey: 'fromDate', title: '开始时间', width: 120, align: 'center'},
  {colKey: 'toDate', title: '截止时间', width: 120, align: 'center'},
  {colKey: 'jobKind', title: '担任职位', width: 150, align: 'center'},
  {colKey: 'jobContent', title: '工作内容'},
]
const certColumns = [
  {
    title: '类型', cell: (h, {row}) => {
      return dictStore.getLabel(15, row.type)
    }
  },
  {
    title: '照片', cell: (h, {row}) => {
      const imageNodes = row.images.map(src =>
        (<t-image src={src} fit="cover" position="center" style={{width: '120px', height: '68px'}}></t-image>)
      )
      return (<div class="flex flex-gap2">{imageNodes}</div>)
    }
  },
]

const appendixColumns = [
  {colKey: 'name', title: '文件名'},
  {
    colKey: 'action', title: '操作', cell: (h, {row}) => {
      return (
        <t-button theme="primary" size="small" variant="base"
                  onClick={() => onAppendixDownloadBtnClick(row)}>下载</t-button>)
    }
  }
]

const dialogTableList = ref([])

async function showDialog(type, row) {
  dialogVisible.value = true
  dialogLoading.value = true

  if (type === 'edu') {
    dialogTitle.value = '教育背景'
    dialogColumn.value = eduColumns
    dialogTableList.value = (await api.listWorkerEdu(row.userId)).data
  } else if (type === 'exp') {
    dialogTitle.value = '工作经历'
    dialogColumn.value = expColumns
    dialogTableList.value = (await api.listWorkerExp(row.userId)).data
  } else if (type === 'appendix') {
    dialogTitle.value = '附件简历'
    dialogColumn.value = appendixColumns
    dialogTableList.value = (await api.listWorkerAppendix(row.userId)).data
  } else {
    dialogTitle.value = '证件证书'
    dialogColumn.value = certColumns
    const data = (await api.listWorkerCert(row.userId)).data
    const tableList = []
    for (let type in data) {
      tableList.push({
        type: parseInt(type),
        images: data[type]
      })
    }
    dialogTableList.value = tableList
  }
  dialogLoading.value = false
}

function closeDialog(context) {
  const {e} = context
  e.stopPropagation()
  dialogVisible.value = false
  dialogColumn.value = []
  dialogTableList.value = []
  dialogTitle.value = ''
}

function onDialogClose() {
  dialogColumn.value = []
  dialogTableList.value = []
  dialogTitle.value = ''
}

function onAppendixDownloadBtnClick(row) {
  downloadFile(row.url)
}

function onExportBtnClick() {
  let queries = []
  for (let key in _filter) {
    if (_filter[key]) {
      queries.push(`${key}=${_filter[key]}`)
    }
  }
  const url = import.meta.env.VITE_DOWNLOAD_URL_PREFIX + `/worker_profile/export?${queries.join('&')}`
  downloadFile(url)
}

function onAppendixExportBtnClick() {
  const url = import.meta.env.VITE_DOWNLOAD_URL_PREFIX + `/worker_appendix/export`
  downloadFile(url)
}

async function _loadData(resetCurrentPage) {
  if(resetCurrentPage) {
    pagination.current = 1
  }
  loading.value = true
  const data = await props.loadData({..._filter, page: pagination.current, size: pagination.pageSize})
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

function refresh() {
  pagination.current = 1
  _filter.userId = null
  for (let key in props.filter) {
    _filter[key] = props.filter[key]
  }
  _loadData()
}

//////////////////////////////////////////// 报名数弹窗
const updateDialogVisible = ref(false)
const updateDialogLoading = ref(false)
const updateDialogFormData = reactive({
  id: null,
  enrollNumber: null
})

function onShowUpdateDialogBtnClick(row) {
  updateDialogVisible.value = true
  updateDialogFormData.id = row.id
  updateDialogFormData.enrollNumber = row.enrollNumber
}

async function onUpdateDialogSubmit() {
  updateDialogLoading.value = true
  await api.updateWorkerProfile(updateDialogFormData)
  updateDialogLoading.value = false
  updateDialogVisible.value = false
  await _loadData()
}

defineExpose({
  refresh
})

onMounted(async () => {
  await _loadData()
})

</script>

<template>
  <div>
    <!--工具栏-->
    <div class="flex flex-row mb-4">
      <t-input v-model="_filter.userId" clearable class="user-id-input" label="用户id: " placeholder="请输入用户id"
               type="number" @enter="_loadData(true)">
        <template #suffixIcon>
          <search-icon/>
        </template>
      </t-input>
      <div class="space-grow"/>
      <div class="flex gap-4">
        <t-button theme="primary" @click="onAppendixExportBtnClick">
          <template #icon>
            <download-icon/>
          </template>
          附件简历导出
        </t-button>
        <t-button theme="primary" @click="onExportBtnClick">
          <template #icon>
            <download-icon/>
          </template>
          简历导出
        </t-button>
      </div>
    </div>
    <!--表格-->
    <t-table
      row-key="index"
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
    <!--教育背景模态框-->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      width="70%"
      :cancel-btn="null"
      :confirm-on-enter="true"
      @close="onDialogClose"
      @confirm="closeDialog">
      <t-space direction="vertical" style="width: 100%">
        <t-table
          row-key="index"
          :data="dialogTableList"
          :columns="dialogColumn"
          :stripe="false"
          :bordered="false"
          :hover="hover"
          table-layout="auto"
          size="small"
          :show-header="true"
          cell-empty-content="-"
          :loading="dialogLoading"
          lazy-load/>
      </t-space>
    </t-dialog>
    <!--修改报名数-->
    <t-dialog v-model:visible="updateDialogVisible" title="修改报名数" width="500px"
              :confirm-loading="updateDialogLoading"
              @confirm="onUpdateDialogSubmit">
      <t-form :colon="true">
        <t-form-item label="报名数">
          <t-input v-model="updateDialogFormData.enrollNumber" placeholder="请输入报名数"/>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<style scoped>
.space-vertical {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin: 16px 0
}

.user-id-input {
  width: 200px;
}

.space-grow {
  flex-grow: 1;
  height: 1px;
}
</style>
