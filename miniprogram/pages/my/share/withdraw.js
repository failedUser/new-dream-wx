const app = getApp();
Page({
    data: {
        min: 0.01,
        total: 0,
        count: null,
        tip: "可提现金额￥0.00",
        records: []
    },

    onLoad: function (options) {
        this.getInfo()
        app.request("https://newdreamer.cn:8080/api/distributor/withDrawList").then(data => {
            this.setData({
                records: data
            })
        })
    },

    getInfo: function () {
        app.request("https://newdreamer.cn:8080/api/distributor/getAllInfo").then(data => {
            this.setData({
                count:null,
                min: data.lowestWithdrawl,
                total: data.withdrawableAvaliable,
                tip: "可提现金额￥" + data.withdrawableAvaliable
            })
        });
    },

    change: function (e) {
        this.setData({
            count: e.detail.value,
            tip: e.detail.value > this.data.total ? false : ("可提现金额￥" + this.data.total)
        })
    },

    submit: function (e) {
        if (!this.data.count || !this.data.tip) {
            wx.showToast({
                title: '请输入正确的提现金额',
                icon: 'none'
            })
            return
        }
        if (this.data.count < this.data.min) {
            wx.showToast({
                title: '单次最少提现' + this.data.min + '元',
                icon: 'none'
            })
            return
        }
        app.request("https://newdreamer.cn:8080/api/distributor/withDraw", {
            withDrawAmount: this.data.count
        }).then(data => {
            this.getInfo()
            wx.showToast({
                title: '申请成功'
            })
        })
    }
})