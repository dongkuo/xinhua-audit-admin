// @ts-nocheck
import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/',
  component: Layout,
  name: 'app',
  children: [
    {
      path: 'user',
      name: 'user',
      component: () => import("@/views/user.vue"),
      meta: {
        title: '用户管理',
      },
    },
    {
      path: 'resume',
      name: 'resume',
      component: () => import("@/views/resume.vue"),
      meta: {
        title: '简历管理',
      },
    },
    {
      path: 'boss_job',
      name: 'boss_job',
      component: () => import("@/views/boss_job.vue"),
      meta: {
        title: '招聘管理',
      },
    },
    {
      path: 'job',
      name: 'job',
      component: () => import("@/views/job.vue"),
      meta: {
        title: '项目管理',
      },
    },
    {
      path: 'study_file',
      name: 'study_file',
      component: () => import("@/views/study_file.vue"),
      meta: {
        title: '资料管理',
      },
    },
    {
      path: 'dict',
      name: 'dict',
      component: () => import("@/views/dict.vue"),
      meta: {
        title: '内容管理',
      },
    },
  ],
}

export default routes
