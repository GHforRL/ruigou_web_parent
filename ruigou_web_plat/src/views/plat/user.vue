<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers" class="fa fa-search">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" class="fa fa-plus">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="username" align="center" label="用户名" width="260" sortable>
            </el-table-column>
            <el-table-column prop="nickname" align="center" label="昵称" width="260" sortable>
            </el-table-column>
            <el-table-column prop="avatar" label="头像" align="center" min-width="200px" padding="0px" :show-overflow-tooltip = "true">
         <template slot-scope="scope">
                    <el-popover placement="right" title="" trigger="hover">
                        <img :src="imgSrc(scope.row.avatar)"/>
                        <img slot="reference" :src="imgSrc(scope.row.avatar)" :alt="scope.row.avatar" style="max-height: 50px;max-width: 130px">
                    </el-popover>
         </template>
      </el-table-column>
            <el-table-column label="操作" width="260">
                <template scope="scope">
                    <el-button size="small" class="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" class="el-icon-delete" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="formVisible" :close-on-click-modal="false" @close="editDialog=false,resetForm('editForm')" >
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form" name="editForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="form.nickname" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/services/common/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="fileList2"
                            :on-success="handleSuccess"
                            list-type="picture"
                    >
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>



<script>
    export default {
        data() { //数据
            return {
                filters: {
                    keyword: ''
                },
                users: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                fileList2: [],
                formVisible: false,//编辑界面是否显示
                editLoading: false,
                formRules: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                form: {
                    username:'',
                    password:'',
                    nickname: '',
                    avatar: ''
                }
            }
        },
        methods: {
            imgSrc: function(imgurl){
                return 'http://120.76.57.57:8888/'+(imgurl)
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            handleSuccess(response, file, fileList){
                //上传成功回调
                this.form.avatar = file.response.resultObj;
            },
            handleRemove(file, fileList) {
                var filePath =file.response.resultObj;
                this.$http.delete("/common/del?filePath="+filePath)
                    .then(res=>{
                        if(res.data.success){
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        }else{
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                    })
            },
            handlePreview(file) {
                console.log(file);
            },
            //方法
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取用户列表
            getUsers() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                this.listLoading = true;

                this.$http.post("/plat/user/json",para)
                    .then((res) => {
                        this.total = res.data.total;
                        this.users = res.data.rows;
                        this.listLoading = false;
                    });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    // let id = { id: row.id };
                    this.$http.delete("/plat/user/"+row.id).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.formVisible = true;
                //回显
                this.form = Object.assign({}, row);

                this.fileList2 = [];
                //回显缩略图
                this.fileList2.push({
                    "url":this.$staticIp+row.avatar
                })
            },
            //显示新增界面
            handleAdd: function () {
                this.formVisible = true;
                this.form = {
                    username:'',
                    password:'',
                    nickname: '',
                    avatar: ''
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    console.log(this.fileList2);
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.form);
                            this.$http.post("/plat/user/save",para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/plat/user/"+ids).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            }
        }, // $(function()) 加载完毕后执行
        mounted() {
            this.getUsers();
        }
    }

</script>


<style scoped>

</style>