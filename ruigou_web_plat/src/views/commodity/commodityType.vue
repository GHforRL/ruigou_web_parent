<template>
    <el-card class="box-card" style="height: 700px">
        <div slot="header" class="clearfix">
            <span>类型操作：</span>
        </div>
        <div class="expand">
            <div>
                <el-tree ref="expandMenuList" class="expand-tree"
                         v-if="isLoadingTree"
                         :data="commodityTypes"
                         node-key="id"
                         highlight-current
                         :props="defaultProps"
                         :expand-on-click-node="false"
                         :render-content="renderContent"
                         :default-expanded-keys="defaultExpandKeys"
                         @node-click="handleNodeClick"></el-tree>
            </div>
        </div>
        <!--编辑界面-->
        <el-dialog title="类型编辑" v-model="formVisible" :close-on-click-modal="false" @close="editDialog=false,resetForm('editForm')" >
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form" name="editForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </el-card>
</template>
<script>
    import TreeRender from '../utils/tree_render.vue'

    export default{
        name: 'commodityTypeTree',
        data(){
            return{
                maxexpandId: 0,//新增节点开始id
                non_maxexpandId: 0,//新增节点开始id(不更改)
                isLoadingTree: false,//是否加载节点树
                formVisible: false,//编辑界面是否显示
                editLoading: false,
                commodityTypes:[],//节点树数据
                formRules: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ]
                },
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                defaultExpandKeys: [],//默认展开节点列表
                form: {
                    id:null,
                    name: '',
                    pid:'',
                    description:''
                }
            }
        },
        mounted(){
            this.initExpand();
            this.getTreeData();
        },
        methods: {
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            getTreeData(){
                console.log(this);
                this.$http.get("/commodity/commodityType/treeData")
                    .then(res=>{
                        console.log(this);
                        this.commodityTypes = res.data;
                        this.maxexpandId=res.data[res.data.length - 1];
                        this.non_maxexpandId=res.data[res.data.length - 1];
                    });
            },
            initExpand(){
                this.isLoadingTree = true;
            },
            handleNodeClick(d,n,s){//点击节点
                // console.log(d,n)
                d.isEdit = false;//放弃编辑状态
            },
            renderContent(h,{node,data,store}){//加载节点
                let that = this;
                return h(TreeRender,{
                    props: {
                        DATA: data,
                        NODE: node,
                        STORE: store,
                        maxexpandId: that.non_maxexpandId
                    },
                    on: {
                        nodeAdd: ((s,d,n) => that.handleAdd(s,d,n)),
                        nodeEdit: ((s,d,n) => that.handleEdit(s,d,n)),
                        nodeDel: ((s,d,n) => that.handleDelete(s,d,n))
                    }
                });
            },
            handleAdd(s,d,n,row){//增加节点
                // console.log(s,d,n)
                if(n.level >=3){
                    this.$message.error("最多只支持3级！")
                    return false;
                };
                this.formVisible = true;
                this.form = {
                    name: '',
                    pid:d.id,
                    description:''
                };
                //展开节点
                if(!n.expanded){
                    n.expanded = true;
                }
            },
            handleEdit(s,d,n){//编辑节点
                this.formVisible = true;
                this.form = {
                    id:d.id,
                    name: d.name,
                    description:d.description,
                    pid:d.pid,
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.form);
                            this.$http.post("/commodity/commodityType/save",para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getTreeData();
                            });
                        });
                    }
                });
            },
            handleDelete(s,d,n){//删除节点
                console.log(s,d,n)
                let that = this;
                //有子级不删除
                if(d.children && d.children.length !== 0){
                    this.$message.error("此节点有子级，不可删除！")
                    return false;
                }else{
                    //新增节点直接删除，否则要询问是否删除
                    let delNode = () => {
                        let list = n.parent.data.children || n.parent.data,//节点同级数据
                            _index = 99999;//要删除的index
                        /*if(!n.parent.data.children){//删除顶级节点，无children
                          list = n.parent.data
                        }*/
                        list.map((c,i) => {
                            if(d.id == c.id){
                                _index = i;
                            }
                        })
                        let k = list.splice(_index,1);
                        this.$http.delete("/commodity/commodityType/"+d.id);
                        this.getTreeData();
                        this.$message.success("删除成功！")
                    }
                    let isDel = () => {
                        that.$confirm("是否删除此节点？","提示",{
                            confirmButtonText: "确认",
                            cancelButtonText: "取消",
                            type: "warning"
                        }).then(() => {
                            delNode()
                        }).catch(() => {
                            return false;
                        })
                    }
                    //判断是否新增
                    d.id > this.non_maxexpandId ? delNode() : isDel()

                }
            },
        }

    }
</script>

<style>
    .el-card {
        margin-top: 30px;
        margin-left: 60px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }

    .expand{
        width:700px;
        height: 600px;
        overflow:hidden;
    }
    .expand>div{
        height: 100%;
        width:100%;
        overflow-y:auto;
    }
    .expand>div::-webkit-scrollbar-track{
        box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        border-radius:5px;
    }
    .expand>div::-webkit-scrollbar-thumb{
        background-color:rgba(50, 65, 87, 0.5);
        outline:1px solid slategrey;
        border-radius:5px;
    }
    .expand>div::-webkit-scrollbar{
        width:10px;
    }
    .expand-tree{
        border:none;
        /*margin-top:10px;*/
    }
    .expand-tree .el-tree-node.is-current,
    .expand-tree .el-tree-node:hover{
        overflow:hidden;
    }
    .expand-tree .is-current>.el-tree-node__content .tree-btn,
    .expand-tree .el-tree-node__content:hover .tree-btn{
        display:inline-block;
    }
    .expand-tree .is-current>.el-tree-node__content .tree-label{
        font-weight:600;
        white-space:normal;
    }
</style>