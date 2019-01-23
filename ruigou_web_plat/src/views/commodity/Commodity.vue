<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getCommoditys" class="fa fa-search">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd" class="fa fa-plus">新增</el-button>
				</el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleConfigViewProperties" class="fa fa-gear">配置显示属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="info" @click="handleConfigSkuProperties" class="fa fa-gears">配置sku属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="handleOnsale" class="fa fa-arrow-circle-up">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning" @click="handleOffSale" class="fa fa-arrow-circle-down">下架</el-button>
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
			<el-table-column label="操作" width="180">
				<template scope="scope">
					<el-button size="small" class="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">修改</el-button>
					<el-button type="danger" size="small" class="el-icon-delete" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
				<el-form-item label="图片" prop="medias">
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

        <!--sku属性对话框界面-->
        <el-dialog title="配置sku属性" v-model="skuPropertiesVisible" :close-on-click-modal="false">
            <el-card class="box-card" style="width: auto;margin-left: 1px">
                <!--属性选择-->
				<div v-for="skuProperty in skuProperties" :key="skuProperty" class="text item">
					{{skuProperty.name}}:
					<!--
					   1 以后skuValue如果有多个需要设置多个input
					   2 输入一行后要要能自动加入下一行.
					     比如 v-for="i in 10"，你会得到1~10   v-for="i in 2" 1~2
					-->
					<div v-for="i in skuProperty.skuValues.length+1" :key="i" class="text item">
						<el-input auto-complete="off" v-model="skuProperty.skuValues[i-1]" style="width: 90%"></el-input>
						<!--删除i-1(i从1开始,而索引是从零开始)这一个-->
						<el-button type="danger" @click="skuProperty.skuValues.splice(i-1,1)" icon="el-icon-delete" plain>删除</el-button>
					</div>
				</div>
            </el-card>
            <!--动态表格-->
            <el-table :data="skuDatas">
                <!--cols一堆列,col哪一列-->
                <template v-for="(col ,index) in cols">
                    <el-table-column :prop="col.prop" sortable :label="col.label" v-if="['price','state','stock'].includes(col.prop)">
                        <template scope="scope">
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].price"  style="width: auto" v-if="'price'===col.prop"/>
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].stock" style="width: auto" v-if="'stock'===col.prop"/>
                            <el-checkbox v-model="skuDatas[scope.$index].state" v-if="col.prop==='state'">备选项</el-checkbox>
                        </template>
                    </el-table-column>
                    <!--只做显示-->
                    <el-table-column :prop="col.prop" sortable :label="col.label" v-if="!['price','state','stock'].includes(col.prop)">
                    </el-table-column>
                    <!--<el-table-column :prop="col.prop" sortable :label="col.label">-->
                    <!--</el-table-column>-->
                </template>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="skuPropertiesVisible = false">取消</el-button>
                <el-button type="primary" @click.native="skuPropertiesSubmit" :loading="editLoading">提交</el-button>
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
                skuIsNull:true,
                skuDatas:[],
                cols:[],
				filters: {
                    keyword: ''
				},
                editorOption:{},
				viewProperties:[],
                skuProperties:[],
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
                skuPropertiesVisible:false,
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
					medias: '',
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
            skuPropertiesSubmit(){
                //Map{"commodityId":1,viewPro perties:[]}
                let commodityId = this.curentRow.id;
                let params = {"commodityId":commodityId,"skuProperties":this.skuProperties,"skuDatas":this.skuDatas};
                this.$http.post("/commodity/commodity/addSkus",params)
                    .then(res=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: '设置成功!',
                                type: 'success'
                            });
                            this.skuPropertiesVisible = false;
                        }
                        else{
                            this.$message({
                                message: result.message,
                                type: 'error'
                            });
                        }
                    })
            },
            handleConfigSkuProperties(){
                //查询显示属性
                //0 是否选中行
                if(!this.curentRow){
                    this.$message({
                        message: '请选择一行后,再操作!',
                        type: 'warning'
                    });
                    return;
                }
                this.skuPropertiesVisible =true;
                //1 获取当前行commodityId
                let commodityId = this.curentRow.id;
                //2 发送请求获取显示属性数据
                this.$http.get("/commodity/specification/commodity/skuProperties/"+commodityId)
                    .then(res=>{
                        this.skuProperties = res.data;
                    })
                //查询sku值做回显
                this.$http.get("/commodity/commodity/skus/"+commodityId)
                    .then(res=>{
                        if( res.data.length > 0)
                        {
                            this.skuIsNull = false;
                            this.skuDatas = res.data;
                        }

                    })
            },
			onsale(opr){ //上下架处理
				var ids = this.sels.map(item => item.id).toString(); //1,2,3,4
				console.log(ids);
				this.$confirm('确认上架选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids,onSale:opr }; //map<ids,opr>
					this.$http.post("/commodity/commodity/onSale",para).then((res) => {
						this.listLoading = false;
						if(res.data.success){
							this.$message({
								message: '操作成功',
								type: 'success'
							});
						}else{
							this.$message({
								message: res.data.message,
								type: 'error'
							});
						}
						this.getCommoditys();
					});

				}).catch(() => {

				});
			},
            handleOnsale(){
				//上架
				this.onsale(1);
            },
            handleOffSale(){
				//下架
				this.onsale(0);
            },
            //性别显示转换
            formatState: function (row, column) {
                return row.state == 1 ? '上架' :"下架";
            },
            handleSuccess(response, file, fileList){
                //上传成功回调
				this.form.medias = this.form.medias+file.response.resultObj+",";
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
				this.form = {
					name: '',
					subName: '',
					commodityTypeId: 0,
					brandId: '',
					medias: '',
					commodityExt:{}
				};
				//回显 要提交后台
				this.form = Object.assign({}, row);

				this.fileList2 = [];
				//回显缩略图
				let temps =  row.medias.split(",");
				temps.forEach(img=>{
					if(img==null|| img===''){
						return;
					}
					this.fileList2.push({
						"url":this.$staticIp+img
					})
				});
				console.log(this.fileList2);
			},
			//显示新增界面
			handleAdd: function () {
				this.formVisible = true;
				this.form = {
                    name: '',
                    subName: '',
                    commodityTypeId: 0,
                    brandId: '',
                    medias: '',
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
		},
        //件事属性值变化
        watch:{
            skuProperties:{
                handler(curVal,oldVal){
                    //1 确实是第一次从数据库查询值
                    //2 第二次修改属性
                    if(!this.skuIsNull){ //不为null
                        this.skuIsNull = true;
                    }else{
                        // 过滤掉用户没有填写数据的规格参数
                        const arr = this.skuProperties.filter(s => s.skuValues.length > 0);
                        // 通过reduce进行累加笛卡尔积
                        var skus =  arr.reduce((last, spec) => {
                            const result = [];
                            last.forEach(o => {
                                spec.skuValues.forEach(option => {
                                    // option //一个一一个值 黄皮肤
                                    const obj = {};
                                    Object.assign(obj, o);
                                    obj[spec.name] = option;
                                    result.push(obj);
                                })
                            })
                            return result
                        }, [{}]);
                        //假数据测试是否能够绑定数据
                        skus.forEach(function (item) {
                            item['price'] = '';
                            item['stock'] = '';
                            item['state'] = 0;
                        })
                        this.skuDatas = skus;
                        console.log(skus);
                    }
                    let headers = [];
                    //现在没有一定有字段 库存 价格 是否可用 颜色
                    //skus [{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0},{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0}]
                    Object.keys(this.skuDatas[0]).forEach(sku=>{
                        let value = sku;
                        if(sku=='price'){
                            value = '价格'
                        }
                        if(sku=='stock'){
                            value = '库存'
                        }
                        if(sku=='state'){
                            value = '启用'
                        }
                        let col =  {"label":value,"prop":sku};
                        headers.push(col);
                    });
                    this.cols = headers;
                },
                deep:true
            }
        }
	}

</script>

<style scoped>

</style>