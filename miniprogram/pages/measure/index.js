const app = getApp()
Page({
    data: {
        measureData: []
    },
    onShow: function (options) {
        this.getMeasureData()
    },
    getMeasureData: function () {
        app.request("https://newdreamer.cn:8080/api/volume/getCustomerReservations").then(data => {
            this.setData({
                measureData: data
            })
        });
    },
    //预约量体
    reserveMeasure: function (e) {
        wx.navigateTo({
            url: '/pages/measure/reservation?id=' + e.currentTarget.dataset.id + "&status=" + e.currentTarget.dataset.status
        })
    },
    lookMeasureData: function (e) {
        wx.navigateTo({
            url: '/pages/measure/measure?rid=' + e.currentTarget.dataset.id,
        })
    },
    cancelReservation: function (e) {
        wx.showModal({
            title: '提示',
            content: '确定要取消预约吗？',
            success: (res) => {
                if (res.confirm) {
                    app.request("https://newdreamer.cn:8080/api/Reservation/delete", {
                        reservation_Id: e.currentTarget.dataset.id
                    }).then(data => {
                        wx.showToast({
                            title: '取消成功'
                        })
                        this.getMeasureData()
                    });
                }
            }
        })

    },
    call: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    }
})