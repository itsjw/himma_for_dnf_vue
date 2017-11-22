<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" v-waves icon="search" @click="handleFilter">刷新</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="loading" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="序号" width="125">
        <template scope="scope">
          <span>{{scope.id}}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="创建时间">
        <template scope="scope">
          <span>{{scope.row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="100px" label="职业">
        <template scope="scope">
          <span>{{scope.row.workerType | typeFilter}}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="150px" label="角色名称">
        <template scope="scope">
          <span>{{scope.row.workerName}}</span>
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
          <el-button size="small" :disabled="scope.row.pl | judegHimmaFilter" @click="goToHimmaCreate">搬砖gogogo
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
      <el-form class="small-space" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="角色职业">
          <el-select class="filter-item" v-model="temp.type" placeholder="请选择">
            <el-option v-for="item in  calendarTypeOptions" :key="item.code" :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="角色名称">
          <el-input v-model="temp.title"></el-input>
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
                  <el-form class="small-space" :model="temp" label-position="left" label-width="90px">
                    <el-form-item label="魔刹石：">
                      <el-input v-model="startCount.mss" :disabled="temp.status!='1'" style='width: 150px;'></el-input>
                    </el-form-item>
                    <el-form-item label="挑战书：">
                      <el-input v-model="startCount.tzs" :disabled="temp.status!='1'"  style='width: 150px;'></el-input>
                    </el-form-item>
                    <el-form-item label="无色：">
                      <el-input v-model="startCount.ws" :disabled="temp.status!='1'" style='width: 150px;'></el-input>
                    </el-form-item>
                    <el-form-item label="遗忘陨石：">
                      <el-input v-model="startCount.ywys" :disabled="temp.status!='1'" style='width: 150px;'></el-input>
                    </el-form-item>
                    <el-form-item label="起始金币：">
                      <el-input v-model="startCount.jb" :disabled="temp.status!='1'" style='width: 150px;'></el-input>
                    </el-form-item>
                    <el-form-item size="large">
                      <el-button v-if="temp.status=='0'" type="warning" @click="changeHimmaStatus('2')">暂停
                      </el-button>
                      <el-button v-if="temp.status=='1'" type="primary" @click="changeHimmaStatus('0')" round>点击开始搬砖
                      </el-button>
                      <el-button v-if="temp.status=='2'" type="success" @click="changeHimmaStatus('0')">继续
                      </el-button>
                      <el-button v-if="temp.status=='2'" type="danger" @click="changeHimmaStatus('4')">结束
                      </el-button>
                      <el-button v-if="temp.status=='4'" style='color: #bcbcbc;' disabled>已结束
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
                    <el-form class="small-space" :model="temp" label-position="left" label-width="90px" style='width: 400px; margin-left:0px;'>
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
                    <el-form class="small-space" :model="temp" label-position="left" label-width="110px" style='width: 400px; margin-left:0px;'>
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
  import { fetchPv } from '@/api/article'
  import waves from '@/directive/waves/index.js' // 水波纹指令
  import { parseTime } from '@/utils'
  import { getWorkTypeList, createWorker, getWorkerList } from '@/api/himma'
  import { getToken } from '@/utils/auth'

  const calendarTypeOptions = []

  // arr to obj
  const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
    acc[cur.code] = cur.name
    return acc
  }, {})

  export default {
    name: 'table_demo',
    directives: {
      waves
    },
    data() {
      return {
        profit: 0,
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
        list: [
          {
            createdAt: 1511365883615,
            status: 1,
            surplusPl: 188,
            timeUsed: '20:00',
            todayProfit: 220,
            workerName: '888x888x888',
            workerType: 'BHLL'
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
        temp: {
          id: undefined,
          title: '',
          status: '1'
        },
        importanceOptions: [1, 2, 3],
        calendarTypeOptions,
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        dialogFormVisible: false,
        dialogHimmaVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建',
          goToHimma: '搬砖'
        },
        dialogPvVisible: false,
        pvData: [],
        showAuditor: false,
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
      },
      typeFilter(type) {
        return calendarTypeKeyValue[type]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.total = 1
        this.listLoading = false
        getWorkTypeList().then(response => {
          const data = response.data
          this.calendarTypeOptions = data.results
          alert(calendarTypeKeyValue['BHLL'])
        }).catch(() => {
          this.loading = false
        })
        getWorkerList().then(response => {
          const data = response.data
          console.log(data)
        }).catch(() => {
          this.loading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.limit = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
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
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.temp.status = status
      },
      changeEndHimmaStatus(status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.profit = (((this.endCount.mss - this.startCount.mss) * this.price.mss) + ((this.endCount.tzs - this.startCount.tzs) * this.price.tzs) + ((this.endCount.ws - this.startCount.ws) * this.price.ws) + ((this.endCount.ywys - this.startCount.ywys) * this.price.ywys + (this.endCount.jb - this.startCount.jb)) + Number(this.endCount.ywsh))
        this.endCount.status = status
      },
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        alert(calendarTypeKeyValue['BHLL'])
        this.dialogFormVisible = true
      },
      goToHimmaCreate() {
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
        createWorker(this.temp.type, this.temp.title, getToken()).then(response => {
          const data = response.data
          console.log(data)
        }).catch(() => {
          this.loading = false
        })
        console.log(this.temp.type)
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      },
      update() {
        this.temp.timestamp = +this.temp.timestamp
        for (const v of this.list) {
          if (v.id === this.temp.id) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, this.temp)
            break
          }
        }
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          time: 0,
          title: '',
          status: '',
          type: ''
        }
      },
      handleFetchPv(pv) {
        fetchPv(pv).then(response => {
          this.pvData = response.data.pvData
          this.dialogPvVisible = true
        })
      },
      handleDownload() {
        require.ensure([], () => {
          const { export_json_to_excel } = require('vendor/Export2Excel')
          const tHeader = ['时间', '地区', '类型', '标题', '重要性']
          const filterVal = ['timestamp', 'province', 'type', 'title', 'importance']
          const data = this.formatJson(filterVal, this.list)
          export_json_to_excel(tHeader, data, 'table数据')
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
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
