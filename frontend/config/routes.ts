export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { name: '概况', icon: 'smile', path: '/abstract', component: './Abstract'},
  { name: '任务管理', icon: 'table', path: '/task', component: './Task' },
  {name: '任务详情', icon: 'profile', path: '/taskdetail', component: './TaskDetail'},
  { path: '/', redirect: '/abstract' },
  { path: '*', layout: false, component: './404' },
];
