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
          <h1>总收益：{{profit}}</h1>
        </el-header>
        <el-main>
          <el-row :gutter="20">
            <el-col :span="6" style='width: 300px;height: 520px'>
              <el-card class="box-card" style='width: 288px;height: 520px'>
                <div slot="header" class="clearfix">
                  <h2 align="center">起始</h2>
                </div>
                <div class="text item">
                  <el-form class="small-space" :model="himma" label-position="left" label-width="0px">
                    <el-form-item size="large" v-for="option in options">
                      <el-select v-model="value" placeholder="请选择" style='width: 100px;'>
                        <el-option
                          v-for="item in option"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                      <el-input v-model="startCount.mss" :disabled="himma.status!='1'" style='width: 140px;'></el-input>
                    </el-form-item>
                    <el-form-item size="large">
                      <el-button type="primary" @click="addOption()">添加
                      </el-button>
                    </el-form-item>
                    <el-form-item size="large">
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
                  <el-col :span="6">
                    <el-form class="small-space" :model="himma" label-position="left" label-width="90px" style='width: 400px; margin-left:0px;'>
                      <el-form-item label="魔刹石：">
                        <el-input v-model="endCount.mss" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item label="挑战书：">
                        <el-input v-model="endCount.tzs" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item label="无色：">
                        <el-input v-model="endCount.ws" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item label="遗忘陨石：">
                        <el-input v-model="endCount.ywys" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item label="意外收获：">
                        <el-input v-model="endCount.ywsh" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item label="结束金币：">
                        <el-input v-model="endCount.jb" :disabled="endCount.status!='1'" style='width: 150px;'></el-input>
                      </el-form-item>
                      <el-form-item size="large">
                        <el-button type="info" v-if="endCount.status=='1'" @click="changeEndHimmaStatus('0')">确定
                        </el-button>
                        <el-button v-if="endCount.status=='0'" style='color: #bcbcbc;' disabled>已结束
                        </el-button>
                      </el-form-item>
                    </el-form>
                  </el-col>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6" style='width: 300px;height: 520px'>
              <el-card class="box-card" style='width: 288px;height: 520px'>
                <div slot="header" class="clearfix">
                  <h2 align="center">价格</h2>
                </div>
                <div class="text item">
                  <el-col :span="6" style='width: 300px;'>
                    <el-form class="small-space" :model="himma" label-position="left" label-width="110px" style='width: 400px; margin-left:0px;'>
                      <el-form-item label="魔刹石：">
                        <el-input v-model="price.mss" :disabled="0!='1'" style='width: 100px;'></el-input>
                      </el-form-item>
                      <el-form-item label="挑战书：">
                        <el-input v-model="price.tzs" :disabled="0!='1'" style='width: 100px;'></el-input>
                      </el-form-item>
                      <el-form-item label="无色：">
                        <el-input v-model="price.ws" :disabled="0!='1'" style='width: 100px;'></el-input>
                      </el-form-item>
                      <el-form-item label="遗忘陨石：">
                        <el-input v-model="price.ywys" :disabled="0!='1'" style='width: 100px;'></el-input>
                      </el-form-item>
                    </el-form>
                  </el-col>
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
  import { getHimmaTypeList, createHimma, getHimmaList, startHimma, endHimma } from '@/api/himma'

  export default {
    name: 'table_demo',
    directives: {
      waves
    },
    data() {
      return {
        options: [
          [{
            value: '选项1',
            label: '黄金糕'
          }, {
            value: '选项2',
            label: '双皮奶'
          }, {
            value: '选项3',
            label: '蚵仔煎'
          }, {
            value: '选项4',
            label: '龙须面'
          }, {
            value: '选项5',
            label: '北京烤鸭'
          }],
          [{
            value: '选项1',
            label: '黄金糕'
          }, {
            value: '选项2',
            label: '双皮奶'
          }, {
            value: '选项3',
            label: '蚵仔煎'
          }, {
            value: '选项4',
            label: '龙须面'
          }, {
            value: '选项5',
            label: '北京烤鸭'
          }]
        ],
        value: '',
        himmaId: 0,
        profit: 0,
        himmaInfo: {
          mssCount: 0,
          tzsCount: 0,
          wsCount: 0,
          ywys: 0,
          ywsh: 0,
          jb: 0
        },
        startCount: {
          mss: 0,
          tzs: 0,
          ws: 0,
          ywys: 0,
          jb: 0,
          status: 1
        },
        endCount: {
          mss: 0,
          tzs: 0,
          ws: 0,
          ywys: 3,
          ywsh: 2,
          jb: 0,
          status: 1
        },
        price: {
          mss: 5000,
          tzs: 27000,
          ws: 95,
          ywys: 500
        },
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
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          importance: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        },
        himmaType: {
          id: undefined,
          name: ''
        },
        himma: {
          status: 1
        },
        himmaTypeList: [],
        dialogFormVisible: false,
        dialogHimmaVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建',
          goToHimma: '搬砖'
        },
        tableKey: 0
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
      changeEndHimmaStatus(status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.profit = (((this.endCount.mss - this.startCount.mss) * this.price.mss) + ((this.endCount.tzs - this.startCount.tzs) * this.price.tzs) + ((this.endCount.ws - this.startCount.ws) * this.price.ws) + ((this.endCount.ywys - this.startCount.ywys) * this.price.ywys + (this.endCount.jb - this.startCount.jb)) + Number(this.endCount.ywsh))
        this.endCount.status = status
        endHimma(JSON.stringify(this.himmaInfo), this.himmaId).then(response => {
          const data = response.data
          alert(2)
          console.log(data.results)
        }).catch(() => {
          this.loading = false
        })
      },
      changeHimmaStatus(status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.himma.status = status
        // 开始搬砖
        if (status === 0) {
          startHimma(this.himmaId).then(response => {
            const data = response.data
            console.log(data.results)
          }).catch(() => {
            this.loading = false
          })
        }
        // 结束搬砖
        if (status === 4) {
          alert(1)
        }
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
          this.handleFilter()
        }).catch(() => {
          this.loading = false
        })
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
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
        this.options.push(this.options)
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
