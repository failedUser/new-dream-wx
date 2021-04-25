// components/sizeCard/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    sizeShow: [
      {title: '身高', field: 'height'},
      {title: '体重', field: 'weight'},
      {title: '胸围', field: 'bust'},
      {title: '中腰', field: 'middle_Waist'},
      {title: '腰围', field: 'waistline'},
      {title: '臀围', field: 'hips'},
      {title: '量体师', field: 'volumer_Name'},
  ]
  },
  attached(options) {
    console.log('----', this.properties);
    this.setData({
      data: this.properties.data
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
