// components/Logistics.js


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '查看物流'
    },
    shipmentId: {
      type: String,
      value: ''
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false
  },
  observers: {
    shipmentId(value) {
      if (!value) return;
      getApp().request("https://newdreamer.cn:8080/api/getDeliveryDetails", {
        shipmentId: value,
    }).then(data => {
      try {
          let info = JSON.parse(data).json[0];
          info.routeResponseRouteList = info.routeResponseRouteList.map(item => {
            let s = item.acceptTime.split(' ');
            item.date = s[0].split('-').slice(1).join('-');
            item.time = s[1].split(':').slice(0, 2).join(':');
            if (item.remark === '派送成功') {
              item.success = true;
            }
            return item;
          })
          console.log(info.routeResponseRouteList);
          this.setData({
            mailNo: info.mailNo,
            logInfo: info.routeResponseRouteList.reverse()
          })
      } catch (error) {
        wx.showToast({
          title: '查询物流失败',
        })
      }
    });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    copy() {
      wx.setClipboardData({
        data: this.data.mailNo,
        success() {
          wx.showToast({
            title: '复制运单号成功',
          })
        }
      })
    },
    changeVisible() {
      if (!this.data.logInfo) {
        return ;
      }
      this.setData({
        visible: !this.data.visible
      })
    }
  }
})
