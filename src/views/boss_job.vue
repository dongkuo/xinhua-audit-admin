<script setup lang="jsx">
import {reactive, ref} from 'vue'
import api from '@/api/modules/api'

const dictStore = useDictStore()
const menuStore = useMenuStore()

const route = useRoute()

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
  {colKey: 'userId', title: '发布人用户id', width: 100},
  {colKey: 'title', title: '标题', width: 150, ellipsis: true},
  {
    colKey: 'type', title: '工作类型', cell: (h, {row}) => {
      return dictStore.getLabel(1, row.type)
    },
  },
  {colKey: 'number', title: '招聘人数', width: 80},
  {colKey: 'content', title: '招聘内容', width: 150, ellipsis: true},
  {colKey: 'publisherName', title: '招聘人姓名'},
  {colKey: 'publisherMobile', title: '招聘人联系方式', width: '120'},
  {colKey: 'publisherRemark', title: '招聘人备注', width: 120, ellipsis: true},
  {colKey: 'reviewTime', title: '审核时间', width: 170, align: 'center'},
  {colKey: 'reviewRemark', title: '审核备注', width: 150, ellipsis: true},
  {
    colKey: 'reviewStatus', title: '审核状态', width: '80', cell: (h, {row}) => {
      let theme
      let label
      if (row.reviewStatus === 0) {
        theme = 'primary'
        label = '待审核'
      } else if (row.reviewStatus === 1) {
        theme = 'success'
        label = '已通过'
      } else {
        theme = 'danger'
        label = '未通过'
      }
      return (<t-tag theme={theme} variant="light-outline">{label}</t-tag>)
    }
  },
  {colKey: 'createTime', title: '创建时间', width: 170, align: 'center'},
  {
    colKey: 'action', title: '操作', fixed: 'right', cell: (h, {row}) => {
      let reviewBtn
      if (row.reviewStatus === 0) {
        reviewBtn =
          <t-button theme="primary" size="small" variant="base" onClick={() => onReviewBtnClick(row)}>审核</t-button>
      }
      return (
        <div class="flex flex-gap2">
          {reviewBtn}
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

async function loadData() {
  loading.value = true
  const data = (await api.pageBossJob({
    userId: filter.value.userId,
    page: pagination.current,
    size: pagination.pageSize
  })).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

// 审核弹窗
const reviewDialogVisible = ref(false)
const reviewDialogFormData = reactive({id: null, reviewStatus: 1, reviewRemark: ''})
const reviewDialogSubmitLoading = ref(false)

function onReviewBtnClick(row) {
  reviewDialogVisible.value = true
  reviewDialogFormData.id = row.id
}

async function onReviewSubmit() {
  reviewDialogSubmitLoading.value = true
  await api.reviewBossJob({
    id: reviewDialogFormData.id,
    reviewStatus: reviewDialogFormData.reviewStatus,
    reviewRemark: reviewDialogFormData.reviewRemark
  })
  reviewDialogSubmitLoading.value = false
  reviewDialogVisible.value = false
  loadData().then().catch()
}

onMounted(async () => {
  await loadData()
  await menuStore.removeHint(route.path)
})

</script>

<template>
  <div>
    <FaPageMain>
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
    <!--审核弹窗-->
    <t-dialog v-model:visible="reviewDialogVisible" header="招聘审核" width="50%" :confirm-on-enter="false"
              :confirm-loading="reviewDialogSubmitLoading" @confirm="onReviewSubmit">
      <t-form ref="form" label-align="right" :data="reviewDialogFormData" :colon="true">
        <t-form-item label="审核结果">
          <t-select v-model="reviewDialogFormData.reviewStatus">
            <t-option :value="1" label="通过"></t-option>
            <t-option :value="2" label="不通过"></t-option>
          </t-select>
        </t-form-item>
        <t-form-item label="审核备注" name="age">
          <t-input v-model="reviewDialogFormData.reviewRemark"/>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
