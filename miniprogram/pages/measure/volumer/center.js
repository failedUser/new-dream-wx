const app = getApp()
Page({
    data: {
        new: false
    },
    onLoad: function (options) {
        if (options.new) {
            this.setData({
                new: true
            })
        }
    },
    onShow: function () {
        this.getInfo()
    },
    getInfo: function (status) {
        app.request("https://newdreamer.cn:8080/api/volumer/getAllInfo").then(data => {
            this.setData(data)
        });
    },
    onPullDownRefresh: function () {
        this.getInfo()
    }
})