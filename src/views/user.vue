<script setup lang="jsx">
import {ref} from 'vue'
import api from '@/api/modules/api'
import {SearchIcon} from "tdesign-icons-vue-next";
// 表格配置
const stripe = ref(false)
const bordered = ref(true)
const hover = ref(true)
const tableLayout = ref(false)
const size = ref('small')
const showHeader = ref(true)

const loading = ref(false)
const filter = reactive({id: null})
const list = ref([])
const pagination = reactive({defaultCurrent: 1, defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100], total: 0})

const columns = ref([
  {colKey: 'id', title: '用户id', align: 'center', width: '100'},
  {
    colKey: 'avatar',
    title: '头像',
    width: 100,
    align: 'center',
    cell: (h, {row}) => {
      return (
        <t-avatar image={row.avatar}/>
      );
    },
  },
  {colKey: 'nickname', title: '昵称'},
  {colKey: 'mobile', title: '手机'},
  {colKey: 'lastLoginTime', title: '上一次登录时间'},
  {colKey: 'createTime', title: '注册时间'},
])

function handleRowClick(e) {
  console.log(e)
}

function onPageChange(pageInfo) {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

async function loadData() {
  loading.value = true
  const data = (await api.pageUser({id: filter.id, page: pagination.current, size: pagination.pageSize})).data
  list.value = data.list
  pagination.total = data.total
  loading.value = false
}

onMounted(async () => {
  await loadData()
})

</script>

<template>
  <div>
    <FaPageMain>
      <div class="mb-4">
        <t-input class="w-50" v-model="filter.id" clearable label="用户id: " placeholder="请输入用户id"
                 type="number" @enter="loadData">
          <template #suffixIcon>
            <search-icon/>
          </template>
        </t-input>
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
        @row-click="handleRowClick"
        @page-change="onPageChange">
      </t-table>
    </FaPageMain>
  </div>
</template>
