<template>
    <el-row >
        <el-col span="10">
            <el-card class="box-card" style="height: 750px">
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
        </el-col>
        <el-col span="13">
            <el-card class="box-card" style="height: 750px; margin-left: 0px">
                <div slot="header" class="clearfix">
                    <span>类型属性配置：</span>
                </div>
                <div>
                    <el-table :data="specifications" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: auto">
                        <el-table-column type="index" width="60">
                        </el-table-column>
                        <el-table-column prop="name" label="属性名称" width="200" sortable>
                        </el-table-column>
                        <el-table-column prop="commodityTypeId" label="类型Id" width="180" sortable>
                        </el-table-column>
                        <el-table-column prop="isSku" label="属性分类" min-width="180" :formatter="formatsku" sortable>
                        </el-table-column>
                        <el-table-column label="操作" width="200">
                            <template scope="scope">
                                <el-button size="small" class="el-icon-edit" @click="Editspecification(scope.$index, scope.row)">修改</el-button>
                                <el-button type="danger" size="small" class="el-icon-delete" @click="Delspecification(scope.$index, scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!--工具条-->
                    <el-col :span="24" class="toolbar">
                        <el-button class="fa fa-plus" type="primary" @click="Addspecification" style="float:right;">新增</el-button>
                    </el-col>

                    <!--编辑界面-->
                    <el-dialog title="编辑" v-model="editformVisible" :close-on-click-modal="false">
                        <el-form :model="specificationForm" label-width="80px" :rules="formRules" ref="form">
                            <el-form-item label="属性名称" prop="name">
                                <el-input v-model="specificationForm.name" auto-complete="off"></el-input>
                            </el-form-item>
                            <el-form-item label="属性分类" prop="isSku">
                                <el-select v-model="specificationForm.isSku" placeholder="请选择分类">
                                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div slot="footer" class="dialog-footer">
                            <el-button @click.native="editformVisible = false">取消</el-button>
                            <el-button type="primary" @click.native="specificationSubmit" :loading="editLoading">提交</el-button>
                        </div>
                    </el-dialog>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>
<script>
    import TreeRender from '../utils/tree_render.vue'
    var typeId=null;

    export default{
        name: 'commodityTypeTree',
        data(){
            return{
                maxexpandId: 0,//新增节点开始id
                non_maxexpandId: 0,//新增节点开始id(不更改)
                isLoadingTree: false,//是否加载节点树
                listLoading:false,
                formVisible: false,//编辑界面是否显示
                editformVisible:false,
                editLoading: false,
                commodityTypes:[],//节点树数据
                specifications:[],//类型属性
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
                },
                specificationForm:{
                    id:null,
                    name:'',
                    commodityTypeId:typeId,
                    isSku:0
                },
                options:[{
                    value: 0,
                    label: '显示属性'
                }, {
                    value: 1,
                    label: 'Sku属性'
                }]
            }
        },
        mounted(){
            this.initExpand();
        },
        methods: {
            //删除
            Delspecification: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/commodity/specification/"+row.id).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getspecifications();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            Editspecification: function (index, row) {
                this.editformVisible = true;
                this.specificationForm = Object.assign({}, row);
            },
            //显示新增界面
            Addspecification: function () {
                this.editformVisible = true;
                this.specificationForm = {
                    name:'',
                    commodityTypeId:typeId,
                    isSku:0
                };
            },
            specificationSubmit:function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.specificationForm);
                            this.$http.post("/commodity/specification/save", para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.editformVisible = false;
                                this.getspecifications();
                            });
                        });
                    }
                });
            },
            formatsku: function (row, column) {
                return row.isSku == 1 ? 'Sku属性' :"显示属性";
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            initExpand(){
                this.isLoadingTree = true;
                this.$http.get("/commodity/commodityType/treeData")
                    .then(res=>{
                        console.log(this);
                        this.commodityTypes = res.data;
                        this.maxexpandId=res.data[res.data.length - 1];
                        this.non_maxexpandId=res.data[res.data.length - 1];
                    });
            },
            handleNodeClick(d,n,s){//点击节点
                d.isEdit = false;//放弃编辑状态
                typeId=d.id;
                this.getspecifications();
            },
            getspecifications(){
                this.listLoading = true;
                this.$http.get("/commodity/specification/queryById/"+typeId)
                    .then(res=>{
                        this.specifications = res.data;
                        this.listLoading = false;
                    });
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
                                this.initExpand();
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
                        this.initExpand();
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
        width:595px;
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
        font-weight:500;
        white-space:normal;
    }
</style>