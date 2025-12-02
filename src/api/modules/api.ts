import api from '../index'

export default {
  // 登录
  login: (data: {
    account: string
    password: string
  }) => api.post('/user/loginByPassword', data, {}),

  // 获取权限
  permission: () => api.get('user/permission', {
    baseURL: '/mock/',
  }),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api.post('user/updatePassword', data),

  // 加载字典
  listDict: () => api.get('/dict/list'),

  // 分页查询字典
  pageDict: (data: { type: number }) => api.post('/dict/page', data),

  // 提交字段数据
  submitDict: (data: {
    id: number,
    parentId: number,
    type: number,
    label: string,
    value: number,
    content: string,
    sort: number,
    enable: boolean
  }) => api.post('/dict/submit', data),

  // 删除字段数据
  deleteDict: (id: number) => api.post('/dict/delete?id=' + id),

  // 分页查询用户
  pageUser: (data: {
    id: number,
    page: number
    size: number
  }) => api.post('/user/page', data),

  // 分页查询简历
  pageWorkerProfile: (data: {
    userId: number,
    jobId: number,
    page: number
    size: number
  }) => api.post('/worker_profile/page', data),

  // 修改简历
  updateWorkerProfile: (data: { enrollNumber: number }) => api.post('/worker_profile/update', data),

  // 分页查询招聘
  pageBossJob: (data: {
    userId: number,
    page: number
    size: number
  }) => api.post('/boss_job/page', data),

  // 分页查询岗位
  pageJob: (data: {
    page: number
    size: number
  }) => api.post('/job/page', data),

  // 分页查询报名信息
  pageEnroll: (data: {
    page: number
    size: number,
    enrollStartTime: string
    enrollEndTime: string
    hasConnected: string
    jobTitle: string
    workerName: string
    workerMobile: string
  }) => api.post('/worker_enroll/page', data),

  // 修改报名信息是否沟通
  updateEnrollHasConnected: (data: {
    id: number,
    hasConnected: boolean
  }) => api.post('/worker_enroll/updateHasConnected', data),

  // 分页查询资料
  pageStudyFile: (data: {
    page: number
    size: number
  }) => api.post('/study_file/page', data),

  // 查询教育背景
  listWorkerEdu: (userId: number) => api.get('/worker_edu/list?userId=' + userId),

  // 查询工作经验
  listWorkerExp: (userId: number) => api.get('/worker_exp/list?userId=' + userId),

  // 查询证书
  listWorkerCert: (userId: number) => api.get('/worker_cert/list?userId=' + userId),

  // 查询附件简历
  listWorkerAppendix: (userId: number) => api.get('/worker_appendix/list?userId=' + userId),

  // 审核招聘
  reviewBossJob: (data: {
    id: number,
    reviewStatus: number
    reviewRemark: number
  }) => api.post('/boss_job/review', data),

  // 删除项目
  deleteJob: (id: number) => api.post('/job/delete?id=' + id),

  // 新增项目
  addJob: (data: {}) => api.post('/job/add', data),

  // 更新项目
  updateJob: (data: {}) => api.post('/job/update', data),

  // 提交资料
  submitStudyFile: (data: {}) => api.post('/study_file/submit', data),

  // 删除资料
  deleteStudyFile: (id: number) => api.post('/study_file/delete?id=' + id),

  // 上传文件
  uploadFile: (data: FormData) => api.postForm('/file/upload', data),

  // 查询提示
  listHint: () => api.get('/hint/list'),

  // 消除提示
  removeHint: (data: {scene: string}) => api.post('/hint/remove', data),
}
