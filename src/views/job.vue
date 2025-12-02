<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {useDictStore} from '@/store/modules/dict'
import {AddIcon, DownloadIcon, SearchIcon} from "tdesign-icons-vue-next"
import {reset} from '@/utils/object'
import ResumeTable from "@/components/ResumeTable.vue";
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
const filter = reactive({id: null, title: null, status: null, level: null})
const list = ref([])
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'id', title: '项目id', width: 70, align: "center"},
  {
    colKey: 'status', title: '项目状态', align: 'center', cell: (h, {row}) => {
      let theme
      let label
      if (row.status === 0) {
        theme = 'primary'
        label = '报名中'
      } else if (row.status === 1) {
        theme = 'success'
        label = '进行中'
      } else {
        theme = 'default'
        label = '已结束'
      }
      return (<t-tag theme={theme} variant="light-outline">{label}</t-tag>)
    },
  },
  {
    colKey: 'level', title: '是否重点', width: 90, align: 'center', cell: (h, {row}) => {
      let theme
      let label
      if (row.level === 0) {
        theme = 'default'
        label = '否'
      } else if (row.level === 1) {
        theme = 'primary'
        label = '是'
      }
      return (<t-tag theme={theme} variant="light">{label}</t-tag>)
    },
  },
  {colKey: 'title', title: '标题', width: 170, ellipsis: true},
  {colKey: 'remark', title: '备注', width: 120, ellipsis: true},
  {colKey: 'content', title: '内容', width: 170, ellipsis: true,},
  {colKey: 'salary', title: '薪资', width: 140, ellipsis: true},
  {
    colKey: 'type', title: '工作类型', align: "center", cell: (h, {row}) => {
      return dictStore.getLabel(1, row.type)
    },
  },
  {
    colKey: 'kind', title: '职位名称', align: "center", cell: (h, {row}) => {
      return dictStore.getLabel(2, row.kind)
    },
  },
  // {
  //   colKey: 'edu', title: '学历要求', cell: (h, {row}) => {
  //     return dictStore.getLabel(3, row.edu)
  //   },
  // },
  {
    colKey: 'exp', title: '工作经验要求', align: "center", width: 120, cell: (h, {row}) => {
      return dictStore.getLabel(4, row.exp)
    },
  },
  {colKey: 'number', title: '招聘人数', width: 80, align: "center"},
  {
    colKey: 'location', title: '工作地点', width: 170, cell: (h, {row}) => {
      return dictStore.getLabel(-1, row.location)
    },
  },
  {colKey: 'enrollNumber', title: '报名人数', align: "center", width: 80},
  {
    colKey: 'realEnrollNumber', title: '实际报名人数', align: "center", width: 120, cell: (h, {row}) => {
      return (<t-button theme="primary" variant="text"
                        onClick={() => onRealEnrollNumberBtnClick(row)}>{row.realEnrollNumber}</t-button>)
    }
  },
  // {colKey: 'readNumber', title: '阅读次数', width: 80},
  // {colKey: 'fromTime', title: '项目起始时间', width: 110},
  // {colKey: 'toTime', title: '项目截止时间', width: 110},
  {colKey: 'timeRange', title: '项目时间', width: 150},
  // {colKey: 'publishTime', title: '发布时间', width: 170},
  {
    colKey: 'visible', title: '是否可见', width: 90, align: 'center', cell: (h, {row}) => {
      const theme = row.visible ? 'primary' : 'danger'
      return (
        <t-tag theme={theme} variant="light">{row.visible ? '是' : '否'}</t-tag>
      );
    }
  },
  {colKey: 'createTime', title: '创建时间', width: 170},
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
  const data = (await api.pageJob({
    ...filter,
    page: pagination.current,
    size: pagination.pageSize
  })).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

function onAddBtnClick() {
  reset(submitFormData, {level: 0})
  submitDialogTitle.value = '新增项目'
  submitDialogVisible.value = true
  submitDialogMode.value = 'add'
}

function onUpdateBtnClick(row) {
  submitFormData.id = row.id
  submitFormData.title = row.title
  submitFormData.salary = row.salary
  submitFormData.level = row.level
  submitFormData.type = row.type
  submitFormData.kind = row.kind
  submitFormData.edu = row.edu
  submitFormData.exp = row.exp
  submitFormData.number = row.number
  submitFormData.content = row.content
  submitFormData.location = row.location
  submitFormData.readNumber = row.readNumber
  submitFormData.enrollNumber = row.enrollNumber
  submitFormData.status = row.status
  submitFormData.visible = row.visible
  submitFormData.bossPublishId = row.bossPublishId
  // submitFormData.fromTime = row.fromTime
  // submitFormData.toTime = row.toTime
  submitFormData.timeRange = row.timeRange
  // submitFormData.publishTime = row.publishTime
  // submitFormData.fromToTime = [row.fromTime, row.toTime]
  submitFormData.remark = row.remark
  submitDialogMode.value = 'update'
  submitDialogTitle.value = '修改项目'
  submitDialogVisible.value = true
}

function onDeleteBtnClick(row) {
  deleteDialogVisible.value = true
  deleteId.value = row.id
}

////////////////////////////////////////// 新增/更新 dialog
const submitDialogVisible = ref(false)
const submitDialogLoading = ref(false)
const submitDialogTitle = ref('')
const submitDialogMode = ref('')
const submitFormData = reactive({
  id: null,
  title: null,
  remark: null,
  salary: null,
  type: null,
  level: 0,
  kind: null,
  edu: null,
  exp: null,
  number: null,
  content: null,
  location: null,
  readNumber: null,
  enrollNumber: null,
  status: null,
  visible: null,
  bossPublishId: null,
  // fromTime: null,
  // toTime: null,
  timeRange: null,
  // publishTime: null,
  // fromToTime: []
})

async function onSubmit() {
  // submitFormData.fromTime = submitFormData.fromToTime[0]
  // submitFormData.toTime = submitFormData.fromToTime[1]
  submitDialogLoading.value = true
  if (submitDialogMode.value === 'update') {
    await api.updateJob(submitFormData)
  } else {
    await api.addJob(submitFormData)
  }
  submitDialogVisible.value = false
  submitDialogLoading.value = false
  await loadData()
}

////////////////////////////////////////// 删除 dialog
const deleteDialogVisible = ref(false)
const deleteDialogLoading = ref(false)
const deleteId = ref(null)

async function onDeleteSubmit() {
  deleteDialogLoading.value = true
  await api.deleteJob(deleteId.value)
  deleteDialogLoading.value = false
  deleteDialogVisible.value = false
  await loadData()
}

////////////////////////////////////////// 报名人 Dialog
const resumeDialogVisible = ref(false)
const resumeFilter = reactive({jobId: null})
const resumeTableRef = ref("")

function onRealEnrollNumberBtnClick(row) {
  if (row.realEnrollNumber <= 0) {
    return
  }
  resumeFilter.jobId = row.id
  resumeTableRef.value && resumeTableRef.value.refresh()
  resumeDialogVisible.value = true
}

function loadResume(queryData) {
  return new Promise(async (resolve, reject) => {
    const data = (await api.pageWorkerProfile({...queryData})).data
    resolve(data)
  })
}

function onResumeSubmit() {
  resumeDialogVisible.value = false
}

//////////////////////////////////////////// 导出
function onExportBtnClick() {
  const url = import.meta.env.VITE_DOWNLOAD_URL_PREFIX + `/job/export`
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
          <t-select v-model="filter.status" class="w-45" label="项目状态: " placeholder="请选择"
                    @change="loadData(true)">
            <t-option :value="null" label="全部"/>
            <t-option :value="0" label="报名中"/>
            <t-option :value="1" label="进行中"/>
            <t-option :value="2" label="已结束"/>
          </t-select>
          <t-select v-model="filter.level" class="w-45" label="是否重点: " placeholder="请选择"
                    @change="loadData(true)">
            <t-option :value="null" label="全部"/>
            <t-option :value="0" label="否"/>
            <t-option :value="1" label="是"/>
          </t-select>
          <t-input v-model="filter.title" clearable class="w-70" label="项目标题: " placeholder="请输入"
                   @enter="loadData(true)">
            <template #suffixIcon>
              <search-icon/>
            </template>
          </t-input>
        </div>
        <div class="flex flex-gap2">
          <t-button theme="primary" @click="onAddBtnClick">
            <template #icon>
              <add-icon/>
            </template>
            新增
          </t-button>
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
    <!--新增/修改dialog-->
    <t-dialog v-model:visible="submitDialogVisible" :header="submitDialogTitle" width="55%" :confirm-on-enter="false"
              :confirm-loading="submitDialogLoading" @confirm="onSubmit">
      <t-form :data="submitFormData" :colon="true" :label-width="70">
        <t-form-item label="项目标题">
          <t-input v-model="submitFormData.title" placeholder="请输入标题"></t-input>
        </t-form-item>
        <!---->
        <div class="flex gap-x-4">
          <t-form-item class="flex-1" label="薪资待遇">
            <t-input v-model="submitFormData.salary" placeholder="请输入薪资待遇"></t-input>
          </t-form-item>
          <t-form-item class="flex-1" label="招聘人数">
            <t-input v-model="submitFormData.number" placeholder="请输入招聘人数" type="number"/>
          </t-form-item>
        </div>
        <!---->
        <div class="flex gap-x-4">
          <t-form-item class="flex-1" label="工作地点">
            <t-cascader v-model="submitFormData.location" check-strictly :options="dictStore.getOptions(-1)"
                        placeholder="请选择工作地点"/>
          </t-form-item>
          <t-form-item class="flex-1" label="项目时间">
            <t-input v-model="submitFormData.timeRange" placeholder="请输入项目时间"/>
          </t-form-item>
        </div>
        <!---->
        <div class="flex gap-x-4">
          <t-form-item class="flex-1" label="是否重点">
            <t-select v-model="submitFormData.level" placeholder="请选择">
              <t-option :value="0" label="否"/>
              <t-option :value="1" label="是"/>
            </t-select>
          </t-form-item>
          <t-form-item class="flex-1" label="项目备注">
            <t-input v-model="submitFormData.remark" placeholder="请输入备注"></t-input>
          </t-form-item>
        </div>
        <!---->
        <t-row :gutter="16" class="t-form__item">
          <t-col :span="4">
            <t-form-item label="工作类型">
              <t-select v-model="submitFormData.type" placeholder="请选择工作类型">
                <t-option :value="0" label="不限"/>
                <t-option v-for="item in dictStore.getOptions(1)" :value="item.value" :label="item.label"/>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="4">
            <t-form-item label="职位名称">
              <t-select v-model="submitFormData.kind" placeholder="请选择职位名称">
                <t-option v-for="item in dictStore.getOptions(2)" :value="item.value" :label="item.label"/>
              </t-select>
            </t-form-item>
          </t-col>
          <!--<t-col :span="4">-->
          <!--  <t-form-item label="学历要求">-->
          <!--    <t-select class="w-full" v-model="submitFormData.edu" placeholder="请选择学历要求">-->
          <!--      <t-option :value="0" label="不限"/>-->
          <!--      <t-option v-for="item in dictStore.getOptions(3)" :value="item.value" :label="item.label"/>-->
          <!--    </t-select>-->
          <!--  </t-form-item>-->
          <!--</t-col>-->
          <t-col :span="4">
            <t-form-item label="经验要求">
              <t-select v-model="submitFormData.exp" placeholder="请选择经验要求">
                <t-option :value="0" label="不限"/>
                <t-option v-for="item in dictStore.getOptions(4)" :value="item.value" :label="item.label"/>
              </t-select>
            </t-form-item>
          </t-col>
        </t-row>
        <!---->
        <t-row :gutter="16" class="t-form__item">
          <!--<t-col :span="4">-->
          <!--  <t-form-item label="阅读数量">-->
          <!--    <t-input v-model="submitFormData.readNumber" placeholder="请输入阅读数量" type="number"/>-->
          <!--  </t-form-item>-->
          <!--</t-col>-->
          <t-col :span="4">
            <t-form-item label="报名人数">
              <t-input v-model="submitFormData.enrollNumber" placeholder="请输入报名人数" type="number"/>
            </t-form-item>
          </t-col>
          <t-col :span="4">
            <t-form-item label="项目状态">
              <t-select v-model="submitFormData.status" placeholder="请选择项目状态">
                <t-option :value="0" label="报名中"/>
                <t-option :value="1" label="进行中"/>
                <t-option :value="2" label="已结束"/>
              </t-select>
            </t-form-item>
          </t-col>
          <t-col :span="4">
            <t-form-item label="是否可见">
              <t-select v-model="submitFormData.visible" placeholder="请选择项目可见性">
                <t-option :value="false" label="否"/>
                <t-option :value="true" label="是"/>
              </t-select>
            </t-form-item>
          </t-col>
        </t-row>
        <!---->
        <!--<t-row :gutter="16" class="t-form__item">-->
        <!--  <t-col :span="4">-->
        <!--    <t-form-item label="发布时间">-->
        <!--      <t-date-picker v-model="submitFormData.publishTime" enable-time-picker placeholder="请选择发布时间"/>-->
        <!--    </t-form-item>-->
        <!--  </t-col>-->
        <!--</t-row>-->
        <t-form-item label="其他内容">
          <t-textarea v-model="submitFormData.content" placeholder="请输入其他内容"
                      :autosize="{ minRows: 5, maxRows: 5 }"/>
        </t-form-item>
      </t-form>
    </t-dialog>
    <!--删除dialog-->
    <t-dialog v-model:visible="deleteDialogVisible" header="删除确认" width="40%" :confirm-on-enter="true"
              :confirm-loading="deleteDialogLoading" @confirm="onDeleteSubmit">
      <t-space direction="vertical" style="width: 100%">确认删除该项目吗？</t-space>
    </t-dialog>
    <!--报名人Dialog-->
    <t-dialog v-model:visible="resumeDialogVisible" header="报名人员" width="60%" @confirm="onResumeSubmit">
      <ResumeTable ref="resumeTableRef" :load-data="loadResume" :filter="resumeFilter"/>
    </t-dialog>
  </div>
</template>
