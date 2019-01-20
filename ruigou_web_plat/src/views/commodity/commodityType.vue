<template id="commodityType">

    <el-row style="height: 100%;border: 0px solid rebeccapurple;margin-top: 10px">
        <el-col :span="9" style="padding-top: 10px; min-height:700px;">
            <!--<div class="grid-content bg-purple">-->
                <!--<el-tree :data="productTypes" :props="defaultProps" @node-contextmenu="openContextMenu" @node-click="handleNodeClick">-->
                <!--</el-tree>-->
            <!--</div>-->
            <el-card class="box-card" style="height: 700px">
                <div slot="header" class="clearfix">
                    <span>所有类型：</span>
                </div>
                <el-scrollbar>
                    <div class="grid-content" style="height: 600px">
                        <el-tree :data="commodityTypes" :props="defaultProps" @node-contextmenu="openContextMenu">
                        </el-tree>
                    </div>
                </el-scrollbar>
            </el-card>
        </el-col>
        <el-col :span="10" style="margin-left: 10px;padding-top: 10px; min-height:700px;">
            <el-card class="box-card" style="height: 700px">
                <div slot="header" class="clearfix">
                    <span>添加类型：</span>
                </div>
                <div class="grid-content">
                    <div>
                        <el-form>
                            <el-form-item label="活动名称">
                                <el-input style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item label="活动名称">
                                <el-input style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item label="活动名称">
                                <el-input style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item label="活动名称">
                                <el-input style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item label="活动名称">
                                <el-input style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                                <el-button @click="resetForm('ruleForm')">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </el-card>

            <div v-show = "menuVisible">
                <ul id = "menu">
                    <li tabindex="-1" class="menu__item" id="menu-4994-1-0">Axure Components</li>
                    <li tabindex="-1" class="menu__item" id="menu-4994-1-1">Sketch Templates</li>
                    <li tabindex="-1" class="menu__item" id="menu-4994-1-2">组件交互文档</li>
                </ul>
            </div>
        </el-col>
    </el-row>
</template>
<style>
    .el-row {
        margin-bottom: 0px;
        height: 100%;
    }
    :last-child {
        margin-bottom: 0;
    }
    .grid-content {
        border-radius: 4px;
        min-height: 36px;
    }
    .el-tree {
        border: 0px;
    }
    .el-card {
        margin-left: 120px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 600px;
    }

    .el-scrollbar{
        height: 100%;
    }
    .el-scrollbar__wrap{
        overflow: scroll;
        overflow-y:auto;
    }
</style>

<script>
    export default {
        data() {
            return {
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                menuVisible:false,
                commodityTypes:[],
                defaultProps: {
                    children: 'children',
                    label: 'name'
                }
            }
        },
        methods:{
            onSubmit() {
                console.log('submit!');
            },
            openContextMenu(event,object,value,element){
                if(value.level == 1){
                    this.menuVisible = true;
                    let menu = document.querySelector("#menu");
                    /* 菜单定位基于鼠标点击位置 */
                    menu.style.left = event.clientX + 20 + "px" ;
                    menu.style.top = event.clientY -10 + "px";
                }
                console.log("右键被点击的event:",event);
                console.log("右键被点击的object:",object);
                console.log("右键被点击的value:",value);
                console.log("右键被点击的element:",element);
            },
            getTreeData(){
                console.log(this);
                this.$http.get("/commodity/commodityType/treeData")
                    .then(res=>{
                            console.log(this);
                            this.commodityTypes = res.data;
                        });
            }
        },
        mounted(){
            //对productTypes数据赋值
            console.log(this);
           this.getTreeData();
        }
    };
    // document.onclick=function(){
    //
    //     //用户触发click事件就可以关闭了，因为绑定在window上，按事件冒泡处理，不会影响菜单的功能
    //     document.querySelector('#menu').style.width=0;
    // }
</script>