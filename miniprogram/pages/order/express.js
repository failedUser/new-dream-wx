const app = getApp();
Page({
    data: {
        expressInfo: [],
        deliverID: "暂无单号"
    },
    onLoad: function(options) {
        this.setData({
            deliverID: options.deliverID
        })
    },
    //查询物流信息
    express: function(e) {
        wx.showLoading({
            title: '查询中',
        })
    }
})