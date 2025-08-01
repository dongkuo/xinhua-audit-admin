<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {useDictStore} from '@/store/modules/dict'
import {AddIcon, SearchIcon} from "tdesign-icons-vue-next"
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
const list = ref([])
const filter = reactive({type: null})
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'id', title: 'id', width: 70, align: "center"},
  {
    colKey: 'type', title: '类型', width: 150, cell: (h, {row}) => {
      return (<t-tag theme="primary" variant="light-outline">{dictStore.getLabel(0, row.type)}</t-tag>)
    }
  },
  {colKey: 'label', title: '文案', width: 150},
  {colKey: 'content', title: '数据', ellipsis: true},
  // {colKey: 'value', title: '取值', width: 100},
  {
    colKey: 'sort', title: '排序', width: 100
  },
  {
    colKey: 'enable', title: '状态', width: 100, align: 'center', cell: (h, {row}) => {
      return row.enable ? (<t-tag theme="success" variant="light-outline">正常</t-tag>) : (
        <t-tag theme="warning" variant="light-outline">停用</t-tag>)
    },
  },
  {
    colKey: 'action', title: '操作', align: 'center', cell: (h, {row}) => {
      return (
        <div class="flex gap-2 justify-center">
          <t-button theme="primary" variant="base" size="small" onClick={() => onUpdateBtnClick(row)}>修改
          </t-button>
          <t-button theme="danger" variant="base" size="small" onClick={() => onDeleteBtnClick(row)}>删除</t-button>
        </div>
      )
    }
  }
])


function onPageChange(pageInfo) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

async function loadData(reset) {
  if (reset) {
    pagination.current = 1
  }
  loading.value = true
  const data = (await api.pageDict({
    ...filter,
    page: pagination.current,
    size: pagination.pageSize
  })).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

function onAddBtnClick() {
  reset(submitFormData, {parentId: 0, enable: true, sort: 0})
  submitDialogTitle.value = '新增内容'
  submitDialogVisible.value = true
  submitDialogMode.value = 'add'
}

function onUpdateBtnClick(row) {
  submitFormData.id = row.id
  submitFormData.type = row.type
  submitFormData.label = row.label
  submitFormData.content = row.content
  submitFormData.sort = row.sort
  submitFormData.enable = row.enable

  submitDialogMode.value = 'update'
  submitDialogTitle.value = '修改内容'
  submitDialogVisible.value = true
}

////////////////////////////////////////// 新增/更新 dialog
const submitDialogVisible = ref(false)
const submitDialogLoading = ref(false)
const submitDialogTitle = ref('')
const submitDialogMode = ref('')
const submitFormData = reactive({
  id: null,
  parentId: 0,
  type: null,
  label: '',
  content: null,
  sort: 0,
  enable: true,
})

async function onSubmit() {
  submitDialogLoading.value = true
  await api.submitDict(submitFormData)
  submitDialogVisible.value = false
  submitDialogLoading.value = false
  await loadData()
}

////////////////////////////////////////// 删除 dialog
const deleteDialogVisible = ref(false)
const deleteDialogLoading = ref(false)
const deleteId = ref(null)

function onDeleteBtnClick(row) {
  deleteDialogVisible.value = true
  deleteId.value = row.id
}

async function onDeleteSubmit() {
  deleteDialogLoading.value = true
  await api.deleteDict(deleteId.value)
  deleteDialogLoading.value = false
  deleteDialogVisible.value = false
  await loadData(true)
}

onMounted(async () => {
  await loadData()
})

</script>

<template>
  <div>
    <FaPageMain>
      <div class="flex flex-gap2 mb-4 justify-between">
        <t-select v-model="filter.type" class="w-50" label="类型:" placeholder="按类型搜索" @change="loadData">
          <t-option :value="null" label="全部"/>
          <t-option v-for="item in dictStore.getOptions(0)" :value="item.value" :label="item.label"/>
          <template #suffixIcon>
            <search-icon/>
          </template>
        </t-select>
        <t-button theme="primary" @click="onAddBtnClick">
          <template #icon>
            <add-icon/>
          </template>
          新增
        </t-button>
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

    <!--提交 dialog-->
    <t-dialog v-model:visible="submitDialogVisible" :header="submitDialogTitle" width="40%" :confirm-on-enter="false"
              :confirm-loading="submitDialogLoading" @confirm="onSubmit">
      <t-form :data="submitFormData" :colon="true" :label-width="70">
        <t-form-item label="类型">
          <t-select v-model="submitFormData.type" :options="dictStore.getOptions(0)" placeholder="请选择类型"/>
        </t-form-item>
        <t-form-item label="文案">
          <t-input v-model="submitFormData.label" placeholder="请输入文案"/>
        </t-form-item>
        <t-form-item label="内容">
          <t-textarea v-model="submitFormData.content" placeholder="请输入内容" :autosize="{ minRows: 3, maxRows: 3 }"/>
        </t-form-item>
        <t-form-item label="排序">
          <t-input v-model="submitFormData.sort" placeholder="请输入排序" type="number"/>
        </t-form-item>
        <t-form-item label="状态">
          <t-select v-model="submitFormData.enable" placeholder="请选择状态">
            <t-option :value="true" label="正常"></t-option>
            <t-option :value="false" label="停用"></t-option>
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!--删除dialog-->
    <t-dialog v-model:visible="deleteDialogVisible" header="删除确认" width="40%" :confirm-on-enter="true"
              :confirm-loading="deleteDialogLoading" @confirm="onDeleteSubmit">
      <t-space direction="vertical" style="width: 100%">确认删除该内容吗？</t-space>
    </t-dialog>
  </div>
</template>
