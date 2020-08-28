const app = getApp()
Page({
    data: {
        orderList: [],
        volumerRewardInfos: [],
        timeStart: "",
        timeEnd: "",
        name: "",
        offset: 0
    },
    onShow: function (options) {
        this.getOrderList()
    },
    search: function () {
        this.data.offset = 0
        this.data.orderList = []
        this.data.volumerRewardInfos = []
        this.getOrderList()
    },
    getOrderList: function () {
        app.request("https://newdreamer.cn:8080/api/volume/getOrderInfos", {
            timeStart: this.data.timeStart,
            timeEnd: this.data.timeEnd,
            name: this.data.name,
            offset: this.data.offset
        }).then(data => {
            this.setData({
                orderList: this.data.orderList.concat(data.orders),
                volumerRewardInfos: this.data.volumerRewardInfos.concat(data.volumerRewardInfos)
            })
        });
    },
    onPullDownRefresh: function () {
        this.setData({
            offset: 0,
            orderList: [],
            volumerRewardInfos: []
        })
        this.getOrderList()
    },
    setClipboardData: function (e) {
        var data = e.target.dataset.data
        wx.setClipboardData({
            data: data,
            success(res) {
                wx.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    },
    bindOrderDetails: function (e) {
        wx.navigateTo({
            url: '/pages/order/order?isSelf=0&id=' + e.currentTarget.dataset.id
        })
    },
    bindChange: function (e) {
        console.log(e)
        this.setData({
            [e.currentTarget.dataset.key]: e.detail.value
        })
    },
    onReachBottom: function () {
        this.data.offset++
        this.getOrderList()
    }
})