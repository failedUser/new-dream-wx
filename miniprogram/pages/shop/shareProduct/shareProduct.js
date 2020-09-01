// miniprogram/pages/shareProduct.js
const app = getApp();
const global = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.showShareImage().then(data => {
      this.setData({
        shareModal: global.shareModal,
        qrcode:data
      })
    })
    
  },
  showShareImage: function () {
    const shareModal = global.shareModal;
    return app.request('https://newdreamer.cn:8080/api/QRcode/get', {
        path: shareModal.path,
        scene: shareModal.scene,
        width: 100
    }).then(data => {
        return 'data:image/png;base64,' + data
    })
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})