const app = getApp();
Page({
    data: {
        id: '',
        orderInfo: []
    },
    onLoad: function(options) {

        var that = this;
        var id = options.id;
        that.setData({
            id: id
        })
        that.requestInit();
    },
    onReady: function() {

    },
    requestInit: function(e) {
        //获取订单信息
        var that = this;
        var id = that.data.id;
        var Userid = app.globalData.memberId;
        let url = '/OrderAPI/sinByI';
        let datain = {
            id: id
        };
        app.postRequestU(url, datain, function(res) {
            wx.hideLoading();
            res.data.msg = app.formatProp(res.data.msg);
            if (res.data.code === 0) {
                that.setData({
                    orderInfo: res.data.msg
                })
            }
        })
    }


})