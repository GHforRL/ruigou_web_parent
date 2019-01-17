import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Brand from './views/commodity/Brand.vue'
import commodityType from './views/commodity/commodityType.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '首页',
        leaf: true,//只有一个节点
        iconCls: 'fa fa-home',
        redirect: { path: '/main' },
        children: [
            { path: '/main', component: echarts, name: '首页' }
        ]
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '商品模块',
        iconCls: 'fa fa-shopping-bag',//图标样式class
        children: [
            { path: '/commodityBrand', component: Brand, name: '商品品牌'},
            { path: '/commodityType', component: commodityType, name: '商品类型' },
            { path: '/commodityTemplate', component: Table, name: '商品模板' },
            { path: '/commodityViewProperties', component: user, name: '商品规格' },
            { path: '/commodity', component: Table, name: '商品管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'fa fa-th-large',
        children: [
            { path: '/page4', component: Page4, name: '员工管理' },
            { path: '/page5', component: Page5, name: '部门管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '营销管理',
        iconCls: 'fa fa-line-chart',
        children: [
            { path: '/page6', component: Page6, name: '营销活动管理' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;