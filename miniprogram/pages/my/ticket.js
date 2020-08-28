const app = getApp()
Page({
    data: {
        tickets: []
    },
    onShow: function() {
        this.getTicket()
    },
    getTicket: function() {
        var that = this
        wx.request({
            url: app.config.RequestUrl + 'youhuiquan/get',
            method: "GET",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                memberID: app.globalData.memberID
            },
            success: function(res) {
                if (res.data.result.status == 200) {
                    var tickets = res.data.data.object
                    for (var i in tickets) {
                        var arr = tickets[i]["huoqu_shijian"].split(/[- :]/);
                        let date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
                        date.setHours(date.getHours() + tickets[i]["youxiao_shijian"])
                        tickets[i]["d"] = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + date.getHours() + "时"
                    }
                    that.setData({
                        tickets: tickets
                    })
                } else {
                    wx.showToast({
                        title: res.data.result.errMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: function(e) {
                wx.showToast({
                    title: e.errMsg,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    }
})