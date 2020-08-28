const app = getApp();
Page({
  data: {
    id: '',
    orderInfo: []
  },
  onLoad: function (options) {
   
    var that = this;
    var id = options.id;
    that.setData({
      id: id
    })
    that.requestInit();

  },
  onReady: function () {
    
  },
  //获取订单信息
  requestInit: function (e) {
    var that = this;
    var id = that.data.id;
    var Userid = app.globalData.memberId;
    let url = '/OrderAPI/sinByI';
    let datain = {
      id: id
    };
    app.postRequestU(url, datain, function (res) {
      wx.hideLoading();
      res.data.msg = app.formatProp(res.data.msg);
      if (res.data.code == 0) {
        that.setData({
          orderInfo: res.data.msg
        })
      }
    })

  },
  //提交申请
  formSubmit: function (e) {

    var that = this;
    var content = e.detail.value.content;
    var id = that.data.id;

    var Userid = app.globalData.memberId;
    if (content == '') {
      wx.showToast({
        title: '请输入退款原因',
        icon: 'none'
      });
      return;
    }
    let url = '/OrderAPI/updOByI';
    let datain = {
      id: id,
      refundreason: content
    };
    app.postRequestU(url, datain, function (res) {
      wx.hideLoading();
      if (res.data.code == 0) {
        wx.showToast({
          title: '退款已申请',
          icon: 'none'
        })
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/orderType/orderType',
          })
        }, 1000)
      }
    })



    // wx.request({

    //   url: app.config.hostUrl + '/OrderAPI/updOByI',
    //   method: 'POST',
    //   data: {
    //     id: id,
    //     addresssecond: content
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded',
    //     'Userid': Userid
    //   },
    //   success: function (res) {
    //     console.log(res.data)
    //     if (res.data.code == 0) {
    //       wx.showToast({
    //         title: '退款已申请',
    //         icon: 'none'
    //       })
    //       setTimeout(function () {
    //         wx.navigateTo({
    //           url: '/pages/orderType/orderType?otype=5',
    //         })
    //       }, 1000)
    //     }
    //   }
    // })

  }


})