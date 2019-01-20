<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getCommoditys">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleConfigViewProperties">配置显示属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleConfigSkuProperties">配置sku属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleOnsale">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleOffSale">下架</el-button>
                </el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="commoditys" highlight-current-row v-loading="listLoading" @row-click="rowClick" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="名称" width="500" sortable>
			</el-table-column>
			<el-table-column prop="brand.name" label="品牌" width="200" sortable>
			</el-table-column>
			<!--有点屌-->
			<el-table-column prop="commodityType.name" label="商品类型" width="180" sortable>
			</el-table-column>
			<el-table-column prop="state" label="状态" width="100" :formatter="formatState" sortable>
			</el-table-column>
			<el-table-column prop="onSaleTime" label="上架时间" width="160" sortable>
			</el-table-column>
			<el-table-column prop="offSaleTime" label="下架时间"  min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<!--<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;"></el-pagination>-->
                <el-pagination  @current-change="handleCurrentChange" :page-size="10" layout="total, prev, pager, next" :total="total" style="float:right;">
                </el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="formVisible" :close-on-click-modal="false">
			<el-form :model="form" label-width="80px" :rules="formRules" ref="form">
				<el-form-item label="名称" prop="name">
					<el-input v-model="form.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="副名称" prop="subName">
					<el-input v-model="form.subName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="commodityTypeId">
					<!--<el-input v-model="form.commodityTypeId" auto-complete="off"></el-input>-->
					<select-tree width="200" :options="commodityTypes" v-model="form.commodityTypeId" />
				</el-form-item>
				<el-form-item label="品牌" prop="brandId">

					<el-select v-model="form.brandId" placeholder="请选择">
						<el-option
								v-for="item in brands"
								:key="item.id"
								:label="item.name"
								:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="medias" prop="medias">
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
				<el-form-item label="简介" prop="description">
					<el-input type="textarea" v-model="form.commodityExt.description" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="详情" prop="richContent">
					<quill-editor
							v-model="form.commodityExt.richContent"
							ref="myQuillEditor"
							:options="editorOption"
							@blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
							@change="onEditorChange($event)">
					</quill-editor>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="formVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
        <!--显示属性编辑界面-->
        <el-dialog title="配置显示属性" v-model="viewPropertiesVisible" :close-on-click-modal="false">
            <el-card class="box-card">
                <div v-for="viewProperty in viewProperties" :key="viewProperty" class="text item">
                    <el-row :gutter="20">
                        <el-col :span="4">{{viewProperty.name}}:</el-col>
                        <el-col :span="20"><el-input auto-complete="off" v-model="viewProperty.selectValue" style="width: 200px"></el-input></el-col>
                    </el-row>
                </div>
            </el-card>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="viewPropertiesVisible = false">取消</el-button>
                <el-button type="primary" @click.native="viewPropertiesSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
	</section>
</template>

<script>
    import Vue from 'vue';
    import  VueQuillEditor from 'vue-quill-editor';
    // require styles 引入样式
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';

    Vue.use(VueQuillEditor);
    import SelectTree from '../SelectTree.vue';
	export default {
	    components:{
	        SelectTree
		},
		data() { //数据
			return {
				filters: {
                    keyword: ''
				},
                editorOption:{},
				viewProperties:[],
				brands:[],
				commodityTypes:[],
				commoditys: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
                fileList2: [],
				formVisible: false,//编辑界面是否显示
                viewPropertiesVisible:false,
                curentRow: null,
				editLoading: false,
				formRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					]
				},
				//编辑界面数据
				form: {
					id: 0,
					name: '',
					subName: '',
					commodityTypeId: 0,
					brandId: '',
					//medias: []//,
					commodityExt:{}
                }
			}
		},
		methods: { //方法
            viewPropertiesSubmit(){
                let commodityId = this.curentRow.id;
                let params = {"commodityId":commodityId,"specifications":this.viewProperties};
                console.log(params);
                this.$http.post("/commodity/commodity/addViewProperties",params)
                    .then(res=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: '设置成功!',
                                type: 'success'
                            });
                            this.viewPropertiesVisible = false;
                        }
                        else{
                            this.$message({
                                message: result.message,
                                type: 'error'
                            });
                        }
                    })
            },
            handleConfigViewProperties(){
                //查询显示属性
                //0 是否选中行
                if(!this.curentRow){
                    this.$message({
                        message: '请选择一行后,再操作!',
                        type: 'warning'
                    });
                    return;
                }
                this.viewPropertiesVisible =true;
                //1 获取当前行commodityId
                let commodityId = this.curentRow.id;
                //2 发送请求获取显示属性数据
                this.$http.get("/commodity/specification/commodity/"+commodityId)
                    .then(res=>{
                        this.viewProperties = res.data;
                        console.log(this.viewProperties);
                    })
                //3 界面双向绑定数据
            },
            handleConfigSkuProperties(){

            },
            handleOnsale(){

            },
            handleOffSale(){

            },
            //性别显示转换
            formatState: function (row, column) {
                return row.state == 1 ? '上架' :"下架";
            },
            handleSuccess(response, file, fileList){
                //上传成功回调
				this.form.logo = file.response.resultObj;
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
			handleCurrentChange(val) {
				this.page = val;
				this.getCommoditys();
			},
			//获取用户列表
            getCommoditys() {
				let para = {
					page: this.page,
					keyword: this.filters.keyword
				};
				this.listLoading = true;

				this.$http.post("/commodity/commodity/json",para)
                    .then((res) => {
                        console.log(this);
                        this.total = res.data.total;
                        this.commoditys = res.data.rows;
                        this.listLoading = false;
                    });
			},
			getBrands(){
                this.listLoading = true;
                this.$http.get("/commodity/brand/list")
                    .then((res) => {
                        this.brands = res.data;
                        this.listLoading = false;
                    });
			},
            getCommodityTypes(){
                this.$http.get("/commodity/commodityType/treeData")
                    .then(res=>{
                        this.commodityTypes = res.data;
                    });
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					// let para = { id: row.id };
					this.$http.delete("/commodity/commodity/"+row.id).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getCommoditys();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.formVisible = true;
				//回显 要提交后台
				console.debug(row);
				this.form = Object.assign({}, row);
				//回显缩略图
				// this.fileList2.push({
				// 	"url":this.$staticIp+row.logo
				// })
			},
			//显示新增界面
			handleAdd: function () {
				this.formVisible = true;
				this.form = {
                    name: '',
                    subName: '',
                    commodityTypeId: 0,
                    brandId: '',
                    //medias: [],
                    commodityExt:{}
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.form.validate((valid) => {
					if (valid) {
                        console.log(this.fileList2);
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.form);
							this.$http.post("/commodity/commodity/save",para).then((res) => {
								this.editLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['form'].resetFields();
								this.formVisible = false;
								this.getCommoditys();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			rowClick: function (row,event,column) {
				console.log(row);
				console.log(row.commodityTypeId);
				this.curentRow = row;

			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					// let para = { ids: ids };
					this.$http.delete("/commodity/commodity/"+ids).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getCommoditys();
					});
				}).catch(() => {

				});
			},
            onEditorBlur(){//失去焦点事件
            },
            onEditorFocus(){//获得焦点事件
            },
            onEditorChange(){//内容改变事件
            }
		}, // $(function()) 加载完毕后执行
		mounted() {
			this.getCommoditys();
			this.getBrands();
			this.getCommodityTypes();
		}
	}

</script>

<style scoped>

</style>