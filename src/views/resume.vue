<script setup lang="jsx">
import api from '@/api/modules/api'
import ResumeTable from "@/components/ResumeTable.vue";

function loadData(queryData) {
  return new Promise(async (resolve, reject) => {
    const data = (await api.pageWorkerProfile(queryData)).data
    resolve(data)
  })
}

</script>

<template>
  <div>
    <FaPageMain>
      <ResumeTable :load-data="loadData"/>
    </FaPageMain>
  </div>
</template>
