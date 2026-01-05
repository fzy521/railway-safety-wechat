Page({
  data: {
    faqs: [
      {
        id: '1',
        question: '如何进行风险识别？',
        answer: '进入"风险"页面，点击"风险识别"按钮，填写风险点信息、风险等级、控制措施等信息后提交即可。',
        expanded: false
      },
      {
        id: '2',
        question: '隐患如何上报？',
        answer: '进入"隐患"页面，点击"上报隐患"按钮，填写隐患位置、描述、等级等信息，并可上传照片作为附件。',
        expanded: false
      },
      {
        id: '3',
        question: '如何查看巡检记录？',
        answer: '在"监控"页面可以查看所有的巡检记录，点击某条记录可查看详细信息，包括巡检时间、地点、结果等。',
        expanded: false
      },
      {
        id: '4',
        question: '风险预警是什么？',
        answer: '风险预警是系统根据风险等级和检查周期自动生成的提醒，当风险点需要检查或风险等级变化时会发送通知。',
        expanded: false
      },
      {
        id: '5',
        question: '如何修改个人信息？',
        answer: '进入"我的"页面，点击用户信息卡片上的"编辑资料"按钮，可以修改姓名、手机号、部门、职位等信息。',
        expanded: false
      }
    ],
    guides: [
      {
        id: '1',
        icon: '/images/exclamationcircle-f.png',
        title: '风险管控流程',
        desc: '了解如何进行风险识别、评估和控制'
      },
      {
        id: '2',
        icon: '/images/bug-report.png',
        title: '隐患排查流程',
        desc: '掌握隐患上报、整改和验收的完整流程'
      },
      {
        id: '3',
        icon: '/images/check-circle-fill.png',
        title: '巡检操作指南',
        desc: '学习如何进行日常巡检和记录'
      },
      {
        id: '4',
        icon: '/images/lightbulb-fill.png',
        title: '应急管理指南',
        desc: '了解应急预案的创建和管理'
      }
    ],
    searchKeyword: ''
  },

  get filteredFaqs() {
    const { faqs, searchKeyword } = this.data
    if (!searchKeyword) {
      return faqs
    }
    return faqs.filter(faq =>
      faq.question.includes(searchKeyword) || faq.answer.includes(searchKeyword)
    )
  },

  onSearchInput(event) {
    this.setData({
      searchKeyword: event.detail.value
    })
  },

  toggleFaq(event) {
    const id = event.currentTarget.dataset.id
    const faqs = this.data.faqs.map(faq => {
      if (faq.id === id) {
        return { ...faq, expanded: !faq.expanded }
      }
      return { ...faq, expanded: false }
    })
    this.setData({ faqs })
  },

  viewGuide(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/help/guide-detail?id=${id}`
    })
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：周一至周五 9:00-18:00',
      showCancel: true,
      cancelText: '取消',
      confirmText: '拨打',
      success: res => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
  }
})