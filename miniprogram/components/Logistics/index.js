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
    cleanDefault: {
      type: Boolean,
      value: false
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
        if (!this.properties.shipmentId) {
            wx.showToast({
              title: '运单号不存在',
            })
            return ;
        }
        if (!this.data.visible) {
            getApp().request("https://newdreamer.cn:8080/api/getDeliveryDetails", {
                shipmentId: this.properties.shipmentId,
            }).then(data => {
            try {
                let info = JSON.parse(data).json[0];
                console.log(info);
                if (!info.routeResponseRouteList || !info.mailNo) {
                    wx.setClipboardData({
                        data: this.properties.shipmentId,
                        success() {
                            wx.showToast({
                                title: '已复制运单号，可至顺丰小程序查询运单信息',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                    return ;
                }
                info.routeResponseRouteList = info.routeResponseRouteList.map(item => {
                    let s = item.acceptTime.split(' ');
                    item.date = s[0].split('-').slice(1).join('-');
                    item.time = s[1].split(':').slice(0, 2).join(':');
                    if (item.remark === '派送成功') {
                    item.success = true;
                    }
                    return item;
                })
                
                this.setData({
                    mailNo: info.mailNo,
                    logInfo: info.routeResponseRouteList.reverse(),
                    visible: true
                })
            } catch (error) {
                wx.setClipboardData({
                    data: this.properties.shipmentId,
                    success() {
                        wx.showToast({
                            title: '已复制运单号，可至顺丰小程序查询运单信息',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                })
                
            }
        });
    } else {
        this.setData({
            visible: !this.data.visible
        })
    }
    }
}
})
