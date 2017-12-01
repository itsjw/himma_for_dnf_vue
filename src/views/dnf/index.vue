<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" v-waves icon="search" @click="handleFilter">刷新</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>

    <el-table :key='tableKey' :data="himmaList" v-loading="listLoading" element-loading-text="loading" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="序号" width="125">
        <template scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="创建时间">
        <template scope="scope">
          <span>{{scope.row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="100px" label="职业">
        <template scope="scope">
          <span>{{scope.row.type}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="150px" label="角色名称">
        <template scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="疲劳值">
        <template scope="scope">
            <el-progress :text-inside="true" :status="scope.row.surplusPl | plStatusFilter" :stroke-width="13" :percentage="scope.row.surplusPl"></el-progress>
        </template>
      </el-table-column>

      <el-table-column min-width="100px" label="当天收益">
        <template scope="scope">
          <span>{{scope.row.todayProfit}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="130px" label="耗时">
        <template scope="scope">
          <span>{{scope.row.timeUsed}}</span>
        </template>
      </el-table-column>


      <el-table-column min-width="300px" label="开始">
        <template scope="scope">
          <el-button size="small" :disabled="scope.row.surplusPl | judegHimmaFilter" @click="goToHimmaCreate(scope.row.id)">搬砖gogogo
          </el-button>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="150">
        <template scope="scope">
          <el-tag :type="scope.row.status | statusFilter">
            <div v-if="scope.row.status == 0">
              删除
            </div>
            <div v-else>
              正常
            </div>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="150">
        <template scope="scope">
          <el-button v-if="scope.row.status=='0'" value="正常" size="small" @click="handleModifyStatus(scope.row,'1')">恢复
          </el-button>
          <el-button v-if="scope.row.status=='1'" value="正常" size="small" type="danger" @click="handleModifyStatus(scope.row,'0')">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="himmaType" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="角色职业">
          <el-select class="filter-item" v-model="himmaType.id" placeholder="请选择">
            <el-option v-for="item in  himmaTypeList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="角色名称">
          <el-input v-model="himmaType.name"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create">确 定</el-button>
        <el-button v-else type="primary" @click="update">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogHimmaVisible">
      <el-container>
        <el-header>
          <h1>总收益：{{this.himma.profit}}</h1>
        </el-header>
        <el-main>
          <el-row :gutter="20">
            <el-col :span="6" style='width: 300px;height: 520px'>
              <el-card class="box-card" style='width: 288px;height: 520px'>
                <div slot="header" class="clearfix">
                  <h2 align="center">起始</h2>
                </div>
                <div class="text item">
                  <el-form class="small-space" :model="himma" ref="himma">
                    <el-form-item size="large" v-for="(item,index) in himma.materialItems" :key="item.id" prop="materialItems">
                      <el-select v-model="himma.materialItems[index].materialId" :disabled="himma.status!='1'" placeholder="请选择" style='width: 100px;'>
                        <el-option
                          v-for="item in materialOptions"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id">
                        </el-option>
                      </el-select>
                      <el-input v-model="himma.materialItems[index].startValue"  :disabled="himma.status!='1'" style='width: 140px;'></el-input>
                    </el-form-item>
                    <el-form-item label="起始金币：" label-position="left" label-width="105px">
                      <el-input v-model="himma.startMoney" :disabled="himma.status!='1'" style="width: 140px;"></el-input>
                    </el-form-item>
                    <el-form-item size="large" prop="status">
                      <el-button type="primary" :disabled="himma.status!='1'" @click="addOption()">添加
                      </el-button>
                    </el-form-item>
                    <el-form-item size="large" prop="status">
                      <el-button v-if="himma.status===0" type="warning" @click="changeHimmaStatus(2)">暂停
                      </el-button>
                      <el-button v-if="himma.status===1" type="primary" @click="changeHimmaStatus(0)" round>点击开始搬砖
                      </el-button>
                      <el-button v-if="himma.status===2" type="success" @click="changeHimmaStatus(0)">继续
                      </el-button>
                      <el-button v-if="himma.status===0||himma.status===2" type="danger" @click="changeHimmaStatus(4)">结束
                      </el-button>
                      <el-button v-if="himma.status===4" style='color: #bcbcbc;' disabled>已结束
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6" style='width: 300px;height: 520px'>
              <el-card class="box-card" style='width: 288px;height: 520px'>
                <div slot="header" class="clearfix">
                  <h2 align="center">完成</h2>
                </div>
                <div class="text item">
                    <el-form class="small-space" :model="himma" label-position="left" style='width: 400px; margin-left:0px;'>
                      <el-form-item size="large" v-if="himma.status===4||himma.status===5" v-for="(item,index) in himma.materialItems" :key="item.id">
                        <el-select v-model="himma.materialItems[index].materialId" :disabled="himma.status!='4'" placeholder="请选择" style='width: 100px;'>
                          <el-option
                            v-for="item in materialOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                            :disabled="true">
                          </el-option>
                        </el-select>
                        <el-input v-model="himma.materialItems[index].endValue"  :disabled="himma.status!=4" style='width: 140px;'></el-input>
                      </el-form-item>
                      <el-form-item label="意外收获：" v-if="himma.status===4||himma.status===5" label-position="left" label-width="105px">
                        <el-input v-model="himma.windfall" :disabled="himma.status!=4" style="width: 140px;"></el-input>
                      </el-form-item>
                      <el-form-item label="结束金币：" v-if="himma.status===4||himma.status===5" label-position="left" label-width="105px">
                        <el-input v-model="himma.endMoney" :disabled="himma.status!=4" style="width: 140px;"></el-input>
                      </el-form-item>
                      <el-form-item size="large">
                        <el-button type="info" v-if="himma.status===4"  @click="changeHimmaStatus(5)">确定
                        </el-button>
                        <el-button v-if="himma.status===5" style='color: #bcbcbc;' disabled>已结束
                        </el-button>
                      </el-form-item>
                    </el-form>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6" style='width: 300px;height: 520px'>
              <el-card class="box-card" style='width: 288px;height: 520px'>
                <div slot="header" class="clearfix">
                  <h2 align="center">价格</h2>
                </div>
                <div class="text item">
                    <el-form class="small-space" :model="price" label-position="left">
                      <el-form-item size="large" v-for="item in materialOptions" :key="item.id">
                          <el-form-item :label="item.name" label-position="left" label-width="105px">
                            <el-input v-model="item.price" style="width: 140px;"></el-input>
                          </el-form-item>
                      </el-form-item>
                      <el-form-item size="large">
                        <el-button type="info" @click="changeMaterialPrice()">确定
                        </el-button>
                      </el-form-item>
                    </el-form>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-dialog>

  </div>
</template>

<script>
  import waves from '@/directive/waves/index.js' // 水波纹指令
  import { getHimmaTypeList, createHimma, getHimmaList, startHimma, endHimma, getMaterialInfo, changeMaterialPrice } from '@/api/himma'

  export default {
    name: 'table_demo',
    directives: {
      waves
    },
    data() {
      return {
        himmaId: 0,
        // 材料价格
        price: {},
        // 列表
        himmaList: [
          {
            id: 1,
            createdAt: 1511365883615,
            status: 1,
            surplusPl: 188,
            timeUsed: '20:00',
            todayProfit: 220,
            name: '888x888x888',
            type: 'BHLL'
          }
        ],
        // 下拉框选择材料
        materialOptions: [
          {
            id: 0,
            name: '',
            price: 0
          }
        ],
        // 搬砖工人对应的属性
        himma: {
          status: 1,
          profit: 0,
          startMoney: 0,
          endMoney: 0,
          windfall: 0,
          materialItems: [
            { materialId: 1, startValue: 0, endValue: 0 }
          ]
        },
        // 下拉框职业类型的获取
        himmaType: {
          id: undefined,
          name: ''
        },
        himmaTypeList: [],
        // dialog属性
        dialogFormVisible: false,
        dialogHimmaVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建',
          goToHimma: '搬砖'
        },
        tableKey: 0,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        }
      }
    },
    filters: {
      plStatusFilter(status) {
        const plStatusMap = {
          1: 'success',
          0: 'exception'
        }
        if (status >= 20) {
          return plStatusMap[1]
        }
        return plStatusMap[0]
      },
      judegHimmaFilter(pl) {
        if (pl >= 5) {
          return false
        }
        return true
      },
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          0: 'danger'
        }
        return statusMap[status]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.total = 1
        this.listLoading = false
        getHimmaTypeList().then(response => {
          const data = response.data
          this.himmaTypeList = data.results
        }).catch(() => {
          this.loading = false
        })
        getHimmaList().then(response => {
          const data = response.data
          this.himmaList = data.results
        }).catch(() => {
          this.loading = false
        })
        getMaterialInfo().then(response => {
          const data = response.data
          this.materialOptions = data.results
        }).catch(() => {
          this.loading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      timeFilter(time) {
        if (!time[0]) {
          this.listQuery.start = undefined
          this.listQuery.end = undefined
          return
        }
        this.listQuery.start = parseInt(+time[0] / 1000)
        this.listQuery.end = parseInt((+time[1] + 3600 * 1000 * 24) / 1000)
      },
      changeHimmaStatus(status) {
        // 开始搬砖
        if (status === 0) {
          const materialIds = []
          this.himma.materialItems.forEach(function(item) {
            materialIds.push(item.materialId)
          })
          if (this.isRepeat(materialIds)) {
            this.$message({
              message: '材料选择不能重复',
              type: 'warning'
            })
            return
          }
          startHimma(this.himmaId).then(response => {
            const data = response.data
            console.log(data.results)
          }).catch(() => {
            this.loading = false
          })
        }
        // 搬砖结束
        if (status === 5) {
          endHimma(JSON.stringify(this.himma), this.himmaId).then(response => {
            const data = response.data
            this.handleFilter()
            this.himma.profit = data.results
          }).catch(() => {
            this.loading = false
          })
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        }
        this.himma.status = status
      },
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
      },
      goToHimmaCreate(id) {
        this.himma.profit = 0
        this.resetForm('himma')
        this.himmaId = id
        this.dialogStatus = 'goToHimma'
        this.dialogHimmaVisible = true
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
      },
      handleDelete(row) {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      },
      create() {
        createHimma(this.himmaType.id, this.himmaType.name).then(response => {
          const data = response.data
          if (data.results === false) {
            this.$notify({
              title: '添加失败',
              message: '人员名字重复',
              type: 'warning',
              duration: 2000
            })
            return
          } else {
            this.handleFilter()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          }
        }).catch(() => {
          this.loading = false
        })
      },
      update() {
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      },
      addOption() {
        if (this.himma.materialItems.length === 5) {
          this.$message({
            message: '最多只能添加5个',
            type: 'warning'
          })
          return
        }
        const materialSelected = { materialId: 1, startValue: 0, endValue: 0 }
        this.himma.materialItems.push(materialSelected)
      },
      isRepeat(arr) {
        const hash = {}
        for (const i in arr) {
          if (hash[arr[i]]) {
            return true
          }
          // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
          hash[arr[i]] = true
        }
        return false
      },
      resetForm(himma) {
        if (this.$refs[himma] !== undefined) {
          this.$refs[himma].resetFields()
        }
      },
      changeMaterialPrice() {
        changeMaterialPrice(JSON.stringify(this.materialOptions)).then(response => {
          this.$message({
            message: '修改价格成功',
            type: 'success'
          })
        }).catch(() => {
          this.loading = false
        })
      }
    }
  }
</script>

<style>
  .el-row {
    margin-bottom: 20px;
  &:last-child {
     margin-bottom: 0;
   }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
