const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    supplyId: '',
    supply: null,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        supplyId: options.id
      })
      this.loadSupplyDetail(options.id)
    }
  },

  /**
   * 加载物资详情
   */
  loadSupplyDetail(supplyId) {
    // 从应急页面获取物资数据
    const pages = getCurrentPages()
    const emergencyPage = pages.find(page => page.route === 'pages/emergency/emergency')
    
    if (emergencyPage && emergencyPage.data.emergencySupplies) {
      const supply = emergencyPage.data.emergencySupplies.find(s => s.id === supplyId)
      
      if (supply) {
        this.setData({
          supply: supply,
          loading: false
        })
      } else {
        wx.showToast({
          title: '物资不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } else {
      // 如果找不到应急页面，使用模拟数据
      this.loadMockData(supplyId)
    }
  },

  /**
   * 加载模拟数据
   */
  loadMockData(supplyId) {
    const mockSupplies = [
      {
        id: 'ES001',
        name: '担架',
        category: 'medical',
        categoryName: '医疗救护',
        quantity: 5,
        minimumStock: 2,
        unit: '副',
        location: '应急物资仓库A区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-18',
        expiryDate: '无',
        manager: '后勤_刘'
      },
      {
        id: 'ES002',
        name: '应急照明灯',
        category: 'emergency-light',
        categoryName: '应急照明',
        quantity: 10,
        minimumStock: 5,
        unit: '套',
        location: '应急物资仓库B区',
        status: 'warning',
        statusText: '库存不足',
        lastCheckDate: '2024-12-15',
        expiryDate: '无',
        manager: '后勤_刘'
      },
      {
        id: 'ES003',
        name: '手持对讲机',
        category: 'communication',
        categoryName: '通信设备',
        quantity: 8,
        minimumStock: 6,
        unit: '台',
        location: '应急指挥中心',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-20',
        expiryDate: '无',
        manager: '安全主任_李'
      },
      {
        id: 'ES004',
        name: '急救包',
        category: 'medical',
        categoryName: '医疗救护',
        quantity: 3,
        minimumStock: 2,
        unit: '套',
        location: '应急物资仓库A区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-18',
        expiryDate: '2025-06-30',
        manager: '后勤_刘'
      },
      {
        id: 'ES005',
        name: '灭火器',
        category: 'fire',
        categoryName: '消防器材',
        quantity: 20,
        minimumStock: 10,
        unit: '具',
        location: '应急物资仓库C区',
        status: 'normal',
        statusText: '正常',
        lastCheckDate: '2024-12-19',
        expiryDate: '2025-03-15',
        manager: '后勤_刘'
      }
    ]

    const supply = mockSupplies.find(s => s.id === supplyId)
    
    if (supply) {
      this.setData({
        supply: supply,
        loading: false
      })
    } else {
      wx.showToast({
        title: '物资不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 检查物资库存
   */
  checkSupply() {
    wx.showModal({
      title: '物资检查',
      content: `是否确认检查 ${this.data.supply.name} 的库存？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '检查记录已更新',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})