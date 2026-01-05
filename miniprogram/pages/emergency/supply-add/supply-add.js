Page({
  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      name: '',
      categoryIndex: '',
      specification: '',
      quantity: '',
      unit: '',
      minimumStock: '',
      location: '',
      manager: '',
      managerPhone: '',
      lastCheckDate: '',
      expiryDate: '',
      statusIndex: 0,
      remarks: ''
    },
    supplyCategories: [
      { label: '医疗救护', value: 'medical' },
      { label: '通讯设备', value: 'communication' },
      { label: '照明设备', value: 'lighting' },
      { label: '个人防护', value: 'protection' },
      { label: '救援工具', value: 'tools' },
      { label: '消防器材', value: 'fire' },
      { label: '生活保障', value: 'supplies' },
      { label: '其他', value: 'other' }
    ],
    supplyStatuses: [
      { label: '正常', value: 'normal' },
      { label: '预警', value: 'warning' },
      { label: '过期', value: 'expired' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置默认日期
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    this.setData({
      'formData.lastCheckDate': todayStr
    })
  },

  /**
   * 表单输入变化
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 物资类别选择
   */
  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.categoryIndex': index
    })
  },

  /**
   * 最后检查日期选择
   */
  onLastCheckDateChange(e) {
    this.setData({
      'formData.lastCheckDate': e.detail.value
    })
  },

  /**
   * 有效期选择
   */
  onExpiryDateChange(e) {
    this.setData({
      'formData.expiryDate': e.detail.value
    })
  },

  /**
   * 物资状态选择
   */
  onStatusChange(e) {
    const index = e.detail.value
    this.setData({
      'formData.statusIndex': index
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData, supplyCategories } = this.data

    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入物资名称', icon: 'none' })
      return false
    }

    if (formData.categoryIndex === '') {
      wx.showToast({ title: '请选择物资类别', icon: 'none' })
      return false
    }

    if (!formData.quantity || formData.quantity <= 0) {
      wx.showToast({ title: '请输入有效的当前数量', icon: 'none' })
      return false
    }

    if (!formData.unit.trim()) {
      wx.showToast({ title: '请输入单位', icon: 'none' })
      return false
    }

    if (!formData.minimumStock || formData.minimumStock < 0) {
      wx.showToast({ title: '请输入有效的最低库存', icon: 'none' })
      return false
    }

    if (!formData.location.trim()) {
      wx.showToast({ title: '请输入存放位置', icon: 'none' })
      return false
    }

    return true
  },

  /**
   * 提交表单
   */
  handleSubmit(e) {
    if (!this.validateForm()) {
      return
    }

    const { formData, supplyCategories, supplyStatuses } = this.data

    // 生成物资ID
    const supplyId = 'ES' + String(Date.now()).slice(-6)

    // 计算物资状态
    const quantity = parseInt(formData.quantity)
    const minimumStock = parseInt(formData.minimumStock)
    let status = 'normal'

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        status = 'expired'
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring'
      }
    }

    if (quantity <= minimumStock && status !== 'expired') {
      status = 'warning'
    }

    // 构建物资数据
    const supplyData = {
      id: supplyId,
      name: formData.name,
      category: supplyCategories[formData.categoryIndex].value,
      categoryName: supplyCategories[formData.categoryIndex].label,
      specification: formData.specification,
      quantity: quantity,
      minimumStock: minimumStock,
      unit: formData.unit,
      location: formData.location,
      manager: formData.manager,
      managerPhone: formData.managerPhone,
      lastCheckDate: formData.lastCheckDate,
      expiryDate: formData.expiryDate,
      status: status,
      statusText: this.getStatusText(status),
      remarks: formData.remarks,
      createTime: new Date().toISOString()
    }

    // 保存物资数据
    this.saveSupply(supplyData)
  },

  /**
   * 保存物资
   */
  saveSupply(supplyData) {
    // TODO: 调用云函数保存到数据库
    wx.showLoading({ title: '保存中...' })

    // 模拟保存
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '物资添加成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'normal': '正常',
      'warning': '预警',
      'expiring': '即将过期',
      'expired': '已过期'
    }
    return statusMap[status] || '未知'
  },

  /**
   * 取消操作
   */
  handleCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要取消添加物资吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})