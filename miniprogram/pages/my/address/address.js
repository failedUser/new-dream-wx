/**
 * 地址列表页
 */
const app = getApp();
Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    address: [],//地址信息
    ids: '',//结算页面过来参数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.showLoading(this);
    this.requestInit();
    this.initSystemInfo();
    if (options.ids) {
      this.setData({
        ids: options.ids
      })
    }

  },
  onReady: function () {
    app.hideLoading(this);
  },
  /**
   * 获取用户地址
   */
  requestInit: function (e) {
    let that = this;
    let url = '/MemberaddressAPI/lisByM';
    let datain = {};
    //获取用户的所有收货地址
    app.postRequestU(url, datain, function (res) {
      var data = res.data;
      if (res.data.code === 0) {
        that.setData({
          address: res.data.msg
        })
      }
    })
  },
  //获取设备信息
  initSystemInfo: function (e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  //点击设为默认地址
  bindDefault: function (e) {
    let that = this;
    if (!that.data.ids) {
      let id = e.currentTarget.dataset.id;
      let addressIndex = e.currentTarget.dataset.addressindex;
      let url = '/MemberaddressAPI/updIByI';
      let datain = {
        id: id
      }
      let address = that.data.address;

      if (address[addressIndex].isdefault == 1) {
        return false;
      }
      if (address[addressIndex].isdefault == 0) {
        app.postRequestU(url, datain, function (res) {
          let data = res.data;
          if (data.code === 0) {
            for (let i in address) {
              if (i == addressIndex) {
                address[i].isdefault = 1;
              } else {
                address[i].isdefault = 0;
              }
            }

            that.setData({
              address: address
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '设置失败',
            })
          }
        })
      }
    }
  },

  //删除地址
  delete: function (e) {
    let that = this;
    if (!that.data.ids) {
      let id = e.target.dataset.id;
      let addressindex = e.currentTarget.dataset.addressindex;
      let url = '/MemberaddressAPI/delByI';
      let datain = {
        id: id
      }

      app.postRequestU(url, datain, function (res) {
        let data = res.data;
        let address = that.data.address;
        let newaddress = [];
        if (res.data.code === 0) {
          wx.showToast({
            title: '删除成功',
          })
          for (let i in address) {
            if (i != addressindex) {
              newaddress.push(address[i])
            }
          }

          that.setData({
            address: newaddress
          })

        } else {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
        }
      })
    }
  },

  //编辑地址
  edit: function (e) {
    var that = this;
    if (!that.data.ids) {
      var Userid = app.globalData.memberId;
      var id = e.target.dataset.id;
      wx.navigateTo({
        url: '/pages/newAddress/newAddress?id=' + id,
      })
    }
  },

  /**
   * 选择地址
   */
  choseaddress: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (that.data.ids) {

      wx.redirectTo({
        url: '/pages/confirmOrder/confirmOrder?ids=' + that.data.ids + '&&addressid=' + id,
      })
    }
  },
  //跳转添加地址页面
  addAddress: function (e) {
    let ids = this.data.ids;
    wx.redirectTo({
      url: '/pages/newAddress/newAddress?ids=' + ids,
    })
  }
})