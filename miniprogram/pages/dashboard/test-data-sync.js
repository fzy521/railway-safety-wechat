// 数据同步测试脚本
// 用于验证小程序和Web后台之间的数据同步

const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    testResults: [],
    isTesting: false
  },

  onLoad() {
    console.log('数据同步测试页面加载');
  },

  // 开始测试
  async startTest() {
    this.setData({ isTesting: true, testResults: [] });

    try {
      // 测试1：创建测试数据
      await this.testCreateData();

      // 测试2：查询数据
      await this.testQueryData();

      // 测试3：更新数据
      await this.testUpdateData();

      // 测试4：删除数据
      await this.testDeleteData();

      // 测试5：实时监听
      await this.testRealtimeWatch();

      wx.showToast({
        title: '所有测试完成',
        icon: 'success'
      });
    } catch (error) {
      console.error('测试失败:', error);
      this.addTestResult('测试异常', false, error.message);
    } finally {
      this.setData({ isTesting: false });
    }
  },

  // 测试1：创建测试数据
  async testCreateData() {
    const testName = '创建测试数据';
    console.log(`开始测试: ${testName}`);

    try {
      // 创建测试风险记录
      const result = await db.collection('risk_library').add({
        data: {
          riskName: '测试风险-数据同步',
          riskType: '设备风险',
          riskLevel: 2,
          riskGrade: '较大风险',
          location: '测试区域',
          manageDept: '测试部门',
          status: 'active',
          createdAt: new Date(),
          testFlag: true // 标记为测试数据
        }
      });

      this.testRiskId = result._id;
      this.addTestResult(testName, true, `创建成功，ID: ${result._id}`);
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  },

  // 测试2：查询数据
  async testQueryData() {
    const testName = '查询测试数据';
    console.log(`开始测试: ${testName}`);

    try {
      const result = await db.collection('risk_library')
        .where({ testFlag: true })
        .get();

      if (result.data.length > 0) {
        this.addTestResult(testName, true, `查询成功，找到${result.data.length}条记录`);
      } else {
        this.addTestResult(testName, false, '未找到测试数据');
      }
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  },

  // 测试3：更新数据
  async testUpdateData() {
    const testName = '更新测试数据';
    console.log(`开始测试: ${testName}`);

    if (!this.testRiskId) {
      this.addTestResult(testName, false, '没有可更新的测试数据');
      return;
    }

    try {
      await db.collection('risk_library').doc(this.testRiskId).update({
        data: {
          riskName: '测试风险-已更新',
          updatedAt: new Date()
        }
      });

      this.addTestResult(testName, true, '更新成功');
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  },

  // 测试4：删除数据
  async testDeleteData() {
    const testName = '删除测试数据';
    console.log(`开始测试: ${testName}`);

    if (!this.testRiskId) {
      this.addTestResult(testName, false, '没有可删除的测试数据');
      return;
    }

    try {
      await db.collection('risk_library').doc(this.testRiskId).remove();

      this.addTestResult(testName, true, '删除成功');
    } catch (error) {
      this.addTestResult(testName, false, error.message);
    }
  },

  // 测试5：实时监听
  async testRealtimeWatch() {
    const testName = '实时监听测试';
    console.log(`开始测试: ${testName}`);

    return new Promise((resolve) => {
      try {
        let updateCount = 0;
        const watcher = db.collection('risk_library')
          .where({ testFlag: true })
          .watch({
            onChange: (snapshot) => {
              console.log('实时监听到变化:', snapshot);
              updateCount++;

              if (updateCount >= 2) {
                // 监听到2次变化后关闭
                watcher.close();
                this.addTestResult(testName, true, `实时监听正常，收到${updateCount}次更新`);
                resolve();
              }
            },
            onError: (err) => {
              console.error('实时监听失败:', err);
              this.addTestResult(testName, false, err.message);
              watcher.close();
              resolve();
            }
          });

        // 触发数据变化
        setTimeout(async () => {
          try {
            const result = await db.collection('risk_library').add({
              data: {
                riskName: '实时监听测试数据',
                riskType: '测试',
                riskLevel: 3,
                testFlag: true,
                createdAt: new Date()
              }
            });

            // 更新数据
            setTimeout(async () => {
              await db.collection('risk_library').doc(result._id).update({
                data: { riskName: '实时监听测试数据-已更新' }
              });
            }, 1000);
          } catch (error) {
            console.error('触发数据变化失败:', error);
          }
        }, 1000);

        // 超时处理
        setTimeout(() => {
          if (updateCount < 2) {
            watcher.close();
            this.addTestResult(testName, false, '实时监听超时');
            resolve();
          }
        }, 10000);
      } catch (error) {
        this.addTestResult(testName, false, error.message);
        resolve();
      }
    });
  },

  // 添加测试结果
  addTestResult(testName, success, message) {
    const result = {
      name: testName,
      success: success,
      message: message,
      time: new Date().toLocaleTimeString()
    };

    this.setData({
      testResults: [...this.data.testResults, result]
    });

    console.log(`测试结果: ${testName} - ${success ? '✅ 通过' : '❌ 失败'} - ${message}`);
  },

  // 清理测试数据
  async cleanupTestData() {
    wx.showLoading({ title: '清理中...' });

    try {
      const result = await db.collection('risk_library')
        .where({ testFlag: true })
        .get();

      for (const doc of result.data) {
        await db.collection('risk_library').doc(doc._id).remove();
      }

      wx.hideLoading();
      wx.showToast({
        title: `清理了${result.data.length}条测试数据`,
        icon: 'success'
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '清理失败',
        icon: 'error'
      });
    }
  }
});