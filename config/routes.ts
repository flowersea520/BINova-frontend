export default [
  // 注意：删除了对应的页面，记得一定要删对应路由
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '二级管理页', component: './Admin' },
    ],
  },
  // 将主页重定向到我们 的 ai生成图表页面
  { path: '/', redirect: '/add_chart' },
  // 注意啊，react框架的组件，全部对应 pages页面下面文件目录
  { path: '/add_chart', name: '智能分析（同步）', icon: 'barChart', component: './AddChart' },
  {
    path: '/add_chart_async',
    name: '智能分析（异步）',
    icon: 'barChart',
    component: './AddChartAsync',
  },
  { path: '/my_chart', name: '我的图表', icon: 'pieChart', component: './MyChart' },
  { path: '*', layout: false, component: './404' },
];
