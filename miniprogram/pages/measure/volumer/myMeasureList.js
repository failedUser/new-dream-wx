const app = getApp()
Page({
    data: {
        status: "派单中",
        measureList: []
    },
    onLoad: function (options) {
        this.setData({
            status: options.status
        })
        wx.setNavigationBarTitle({
            title: options.title
        })
    },
    onShow: function () {
        this.data.measureList = []
        this.getMeasureList(this.data.status)
        if (this.data.status == "派单中") {
            this.getMeasureList("已接单")
        }
    },
    getMeasureList: function (status) {
        app.request("https://newdreamer.cn:8080/api/volumer/getVolumeInfo", {
            status: status
        }).then(measureList => {
            this.setData({
                measureList: this.data.measureList.concat(measureList)
            })
        });
    },
    onPullDownRefresh: function () {
        this.data.measureList = []
        this.getMeasureList(this.data.status)
    },

    acceptOrder: function (e) {
        app.request("https://newdreamer.cn:8080/api/volume/confirmReservation", {
            Reservation_Id: e.currentTarget.dataset.id
        }).then(data => {
            wx.showToast({
                title: '接单成功'
            })
            this.data.measureList = []
            this.getMeasureList(this.data.status)
            if (this.data.status == "派单中") {
                this.getMeasureList("已接单")
            }
        });
    },
})