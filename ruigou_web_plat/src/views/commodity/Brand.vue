<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getBrands">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="商品名称" width="180" sortable>
			</el-table-column>
			<el-table-column prop="englishName" label="英文名" width="200" sortable>
			</el-table-column>
			<!--有点屌-->
			<el-table-column prop="commodityType.name" label="商品类型" width="180" sortable>
			</el-table-column>
			<el-table-column prop="description" label="描述"  min-width="250" sortable>
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
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="formVisible" :close-on-click-modal="false" @close="editDialog=false,resetForm('editForm')" >
			<el-form :model="form" label-width="80px" :rules="formRules" ref="form" name="editForm">
				<el-form-item label="名称" prop="name">
					<el-input v-model="form.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="英文名" prop="englishName">
					<el-input v-model="form.englishName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="logo" prop="logo">
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
				<el-form-item label="排序号" prop="sortIndex">
					<el-input v-model="form.sortIndex" auto-complete="off"></el-input>
				</el-form-item>
				<!--<el-form-item label="商品类型">-->
					<!--<el-cascader v-model="form.commodityTypeId" placeholder="搜索类型" :options="options" :props="props" ref="cascader" filterable clearable change-on-select></el-cascader>-->
				<!--</el-form-item>-->
				<el-form-item label="商品类型">
					<select-tree :options="options" :props="defaultProps" v-model="form.commodityTypeId" />
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="form.description"></el-input>
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
	import SelectTree from '../SelectTree.vue';
	export default {
		components: {
			SelectTree,
		},
		data() { //数据
			return {
				// options: [],
				// props: {
				//     value: "id",
				//     label: "name",
				//     children: "children"
				// },
				options: [],
				filters: {
                    keyword: ''
				},
				brands: [],
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
					name: '',
					englishName: '',
					sortIndex: '',
					description: '',
					logo: '',
					// 默认选中值
					commodityTypeId: '',
					options: [],
					// options: [],
					// props: {
					//     value: "id",
					//     label: "name",
					//     children: "children"
					// }
				}
			}
		},
		methods: {
			resetForm(formName) {
				this.$refs[formName].resetFields();
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
			//方法
			handleCurrentChange(val) {
				this.page = val;
				this.getBrands();
			},
			//获取用户列表
            getBrands() {
				let para = {
					page: this.page,
					keyword: this.filters.keyword
				};
				this.listLoading = true;

				this.$http.post("/commodity/brand/json",para)
                    .then((res) => {
                        console.log(this);
                        this.total = res.data.total;
                        this.brands = res.data.rows;
                        this.listLoading = false;
                    });
			},
			beforeCreate() {
				console.log(this);
				this.$http.get("/commodity/commodityType/treeData")
						.then(res=>{
							console.log(this);
							this.options = res.data;
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
					this.$http.delete("/commodity/brand/"+row.id).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getBrands();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.beforeCreate();
				this.formVisible = true;
				//回显
				this.form = Object.assign({}, row);
				//回显缩略图
				this.fileList2.push({
					"url":this.$staticIp+row.logo
				})
			},
			//显示新增界面
			handleAdd: function () {
				// ClearForm("eid");
				this.beforeCreate();
				this.formVisible = true;
				this.form = {
                    name: '',
                    englishName: '',
                    sortIndex: '',
                    description: '',
                    logo: '',
					commodityTypeId: '',
					options: [],
					// options: [],
					// props: {
					// 	value: "id",
					// 	label: "name",
					// 	children: "children"
					// }
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.form.validate((valid) => {
					console.log(this.fileList2);
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							// var arr =this.form.commodityTypeId;
							// if (arr>1){
							// 	for (let lastTypeId of arr) {
							// 		this.form.commodityTypeId=lastTypeId;
							// 	}
							// }
							let para = Object.assign({}, this.form);
							this.$http.post("/commodity/brand/save",para).then((res) => {
								this.editLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['form'].resetFields();
								this.formVisible = false;
								this.getBrands();
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
					//NProgress.start();
					// let para = { ids: ids };
					this.$http.delete("/commodity/brand/"+ids).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getBrands();
					});
				}).catch(() => {

				});
			}
		}, // $(function()) 加载完毕后执行
		mounted() {
			this.getBrands();
		}
	}
	// function ClearForm(id) {
	// 	var objId = document.getElementById(id);
	// 	if (objId == undefined) {
	// 		return;
	// 	}
	// 	for (var i = 0; i < objId.elements.length; i++) {
	// 		if (objId.elements[i].type == "text") {
	// 			objId.elements[i].value = "";
	// 		}
	// 		else if (objId.elements[i].type == "password") {
	// 			objId.elements[i].value = "";
	// 		}
	// 		else if (objId.elements[i].type == "radio") {
	// 			objId.elements[i].checked = false;
	// 		}
	// 		else if (objId.elements[i].type == "checkbox") {
	// 			objId.elements[i].checked = false;
	// 		}
	// 		else if (objId.elements[i].type == "select-one") {
	// 			objId.elements[i].options[0].selected = true;
	// 		}
	// 		else if (objId.elements[i].type == "select-multiple") {
	// 			for (var j = 0; j < objId.elements[i].options.length; j++) {
	// 				objId.elements[i].options[j].selected = false;
	// 			}
	// 		}
	// 		else if (objId.elements[i].type == "textarea") {
	// 			objId.elements[i].value = "";
	// 		}
	//
	// 	}
	// }
</script>


<style scoped>

</style>