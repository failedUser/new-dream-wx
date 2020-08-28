const app = getApp()
Page({
    data: {
        orderList: [],
        timeStart: "",
        timeEnd: "",
        name: "",
        offset: 0
    },
    onLoad: function (options) {
        this.getInfo()
    },
    getInfo: function (status) {
        app.request("https://newdreamer.cn:8080/api/distributor/getAllInfo").then(data => {
            this.setData(data)
        });
    },
    onShow: function (options) {
        this.getOrderList()
    },
    search: function () {
        this.data.offset = 0
        this.getOrderList()
    },
    getOrderList: function () {
        app.request("https://newdreamer.cn:8080/api/volume/getOrderInfos", {
            timeStart: this.data.timeStart,
            timeEnd: this.data.timeEnd,
            name: this.data.name,
            offset: this.data.offset
        }).then(orderList => {
            this.setData({
                orderList: this.data.orderList.concat(orderList)
            })
        });
    },
    onPullDownRefresh: function () {
        this.setData({
            offset: 0,
            orderList: []
        })
        this.getOrderList()
        this.getInfo()
    },
    onReachBottom: function () {
        this.data.offset++
        this.getOrderList()
    }
})