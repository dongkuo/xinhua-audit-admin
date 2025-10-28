<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {useDictStore} from '@/store/modules/dict'
import {DownloadIcon, SearchIcon} from "tdesign-icons-vue-next"
import {downloadFile} from "@/utils/dom.js";

const dictStore = useDictStore()
// 表格配置
const stripe = ref(false)
const bordered = ref(true)
const hover = ref(true)
const tableLayout = ref(false)
const size = ref('small')
const showHeader = ref(true)

const loading = ref(false)
const filter = reactive({enrollTime: [], hasConnected: null, jobTitle: null, workerName: null, workerMobile: null})
const list = ref([])
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'createTime', title: '报名时间', width: 170, align: 'center'},
  {
    colKey: 'hasConnected', title: '是否已沟通', width: 100, align: 'center', cell: (h, {row}) => {
      const theme = row.hasConnected ? 'success' : 'warning'
      return (<t-tag theme={theme} variant="light-outline">{row.hasConnected ? '已沟通' : '未沟通'}</t-tag>)
    }
  },
  {colKey: 'jobTitle', title: '项目标题', width: 240, ellipsis: true},

  {colKey: 'workerProfileUserId', title: '用户id', align: 'center', width: 70},
  {
    colKey: 'workerProfileAvatar', title: '头像', align: 'center', width: 70, cell: (h, {row}) => {
      return (
        <t-avatar image={row.workerProfileAvatar}/>
      );
    },
  },
  {colKey: 'workerProfileName', title: '姓名', align: 'center',},
  {colKey: 'workerProfileMobile', title: '手机', align: 'center', width: '120'},
  {
    colKey: 'workerProfileGender', title: '性别', width: '70', align: 'center', cell: (h, {row}) => {
      return dictStore.getLabel(5, row.workerProfileGender)
    }
  },
  {colKey: 'workerProfileBirthday', title: '生日', align: 'center'},
  {
    colKey: 'workerProfileEdu', title: '学历', align: 'center', cell: (h, {row}) => {
      return dictStore.getLabel(3, row.workerProfileEdu)
    }
  },
  {
    colKey: 'workerProfileLocation', title: '所在地', width: 180, cell: (h, {row}) => {
      return dictStore.getLabel(3, dictStore.getLabel(-1, row.workerProfileLocation))
    }
  },
  {
    colKey: 'workerProfileRequiredJobType', title: '工作类型', align: 'center', cell: (h, {row}) => {
      return dictStore.getLabel(1, row.workerProfileRequiredJobType)
    }
  },
  {
    colKey: 'workerProfileRequiredJobKinds', title: '求职岗位', cell: (h, {row}) => {
      return row.workerProfileRequiredJobKinds?.length > 0 ? row.workerProfileRequiredJobKinds.map(it => dictStore.getLabel(6, it)).join("、") : "-"
    }
  },
  {
    colKey: 'workerProfilePastJobLevel', title: '过往最高岗位', width: 120, align: 'center', cell: (h, {row}) => {
      return dictStore.getLabel(7, row.workerProfilePastJobLevel)
    }
  },
  {
    colKey: 'workerProfileCareers',
    title: '项目经历',
    width: 150,
    align: 'center',
    ellipsis: true,
    cell: (h, {row}) => {
      return row.workerProfileCareers?.length > 0 ? row.workerProfileCareers.map(it => dictStore.getLabel(17, it)).join("、") : "-"
    }
  },
  {
    colKey: 'workerProfileSkills', title: '擅长项目', width: 150, align: 'center', ellipsis: true, cell: (h, {row}) => {
      return row.workerProfileSkills?.length > 0 ? row.workerProfileSkills.map(it => dictStore.getLabel(18, it)).join("、") : "-"
    }
  },
  {
    colKey: 'workerProfileCerts', title: '资格证书', width: 150, align: 'center', ellipsis: true, cell: (h, {row}) => {
      return row.workerProfileCerts?.length > 0 ? row.workerProfileCerts.map(it => dictStore.getLabel(8, it)).join("、") : "-"
    }
  },
  {colKey: 'workerProfileEnrollNumber', title: '报名数', align: 'center'},
  {
    colKey: 'workerEdu', title: '教育背景', align: 'center', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('edu', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'workerExp', title: '工作经历', align: 'center', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('exp', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'workerCert', title: '证件证书', align: 'center', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('cert', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'workerAppendix', title: '附件简历', align: 'center', cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text" onClick={() => showDialog('appendix', row)}>查看</t-button>)
    }
  },
  {
    colKey: 'action', title: '操作', fixed: 'right', align: 'center', cell: (h, {row}) => {
      return (
        <t-button theme={row.hasConnected ? 'danger' : 'primary'} size="small" variant="base"
                  onClick={() => updateEnrollHasConnected(row)}>{row.hasConnected ? '取消已沟通' : '标记已沟通'}</t-button>
      )
    }
  },
])

function onPageChange(pageInfo) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

async function loadData(resetCurrentPage) {
  if (resetCurrentPage) {
    pagination.current = 1
  }
  loading.value = true
  if (filter.enrollTime.length === 0) {
    filter.enrollStartTime = null
    filter.enrollEndTime = null
  } else if (filter.enrollTime.length > 1) {
    filter.enrollStartTime = filter.enrollTime[0] + " 00:00:00"
    filter.enrollEndTime = filter.enrollTime[1] + " 23:59:59"
  } else if (filter.enrollTime.length > 0) {
    filter.enrollStartTime = filter.enrollTime[0] + " 00:00:00"
  }
  const data = (await api.pageEnroll({
    ...filter,
    page: pagination.current,
    size: pagination.pageSize
  })).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

function onUpdateBtnClick(row) {
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
  {colKey: 'company', title: '公司'},
  {colKey: 'fromDate', title: '开始时间'},
  {colKey: 'toDate', title: '截止时间'},
  {colKey: 'jobKind', title: '担任职位'},
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
    dialogTableList.value = (await api.listWorkerEdu(row.workerProfileUserId)).data
  } else if (type === 'exp') {
    dialogTitle.value = '工作经历'
    dialogColumn.value = expColumns
    dialogTableList.value = (await api.listWorkerExp(row.workerProfileUserId)).data
  } else if (type === 'appendix') {
    dialogTitle.value = '附件简历'
    dialogColumn.value = appendixColumns
    dialogTableList.value = (await api.listWorkerAppendix(row.workerProfileUserId)).data
  } else {
    dialogTitle.value = '证件证书'
    dialogColumn.value = certColumns
    const data = (await api.listWorkerCert(row.workerProfileUserId)).data
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

async function updateEnrollHasConnected(row) {
  await api.updateEnrollHasConnected({id: row.id, hasConnected: !row.hasConnected})
  await loadData()
}

//////////////////////////////////////////// 导出
function onExportBtnClick() {
  const url = import.meta.env.VITE_DOWNLOAD_URL_PREFIX + `/worker_enroll/export`
  downloadFile(url)
}

onMounted(async () => {
  await loadData()
})

</script>

<template>
  <div>
    <FaPageMain>
      <div class="flex flex-gap2 mb-4 justify-between">
        <div class="flex flex-gap2">
          <t-date-range-picker placeholder="请选择报名时间" v-model="filter.enrollTime" clearable class="w-70"
                               @change="loadData(true)"/>
          <t-select label="是否已沟通: " v-model="filter.hasConnected" class="w-45" placeholder="请选择"
                    @change="loadData(true)">
            <t-option :value="null" label="全部"/>
            <t-option :value="true" label="已沟通"/>
            <t-option :value="false" label="未沟通"/>
          </t-select>
          <t-input v-model="filter.jobTitle" clearable class="w-65" label="项目标题: " placeholder="请输入"
                   @enter="loadData">
            <template #suffixIcon>
              <search-icon/>
            </template>
          </t-input>
          <t-input v-model="filter.workerName" clearable class="w-40" label="姓名: "
                   placeholder="请输入"
                   @enter="loadData(true)">
            <template #suffixIcon>
              <search-icon/>
            </template>
          </t-input>
          <t-input v-model="filter.workerMobile" clearable class="w-45" label="手机: "
                   placeholder="请输入" @enter="loadData(true)">
            <template #suffixIcon>
              <search-icon/>
            </template>
          </t-input>
        </div>
        <div class="flex flex-gap2">
          <t-button theme="primary" @click="onExportBtnClick">
            <template #icon>
              <download-icon/>
            </template>
            导出
          </t-button>
        </div>
      </div>
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
    </FaPageMain>

    <!--查看模态框-->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      width="50%"
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
  </div>
</template>

<style>

</style>
