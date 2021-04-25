const app = getApp()
Page({
    data: {
        measureData: null,
        status: '',
        sizeShow: [
            {title: '身高', field: 'height'},
            {title: '体重', field: 'weight'},
            {title: '胸围', field: 'bust'},
            {title: '中腰', field: 'middle_Waist'},
            {title: '腰围', field: 'waistline'},
            {title: '臀围', field: 'hips'},
            {title: '量体师', field: 'volumer_Name'},

        ]
    },
    onShow: function (options) {
        this.getMeasureData()
    },
    getMeasureData: function () {
        app.request("https://newdreamer.cn:8080/api/volume/getCustomerVolumeInfos").then(data => {
            if (data && (data.reservations.length || data.sizeInfos.length) ) {
                this.setData({
                    measureData:[ ...data.sizeInfos ||[]]
                })
                return ;
            }
            this.setData({
                status: '待预约'
            })
            wx.setNavigationBarTitle({
              title: '预约量体，免费上门',
            })
            
        }).catch(e => {
            this.setData({
                measureData: []
            })
        })
    },
    OnReservationSuccess() {
        console.log('预约成功了');
        this.getMeasureData()
    },
    //预约量体
    reserveMeasure: function (e) {
        wx.navigateTo({
            url: '/pages/measure/reservation?id=' + e.currentTarget.dataset.id + "&status=" + e.currentTarget.dataset.status
        })
    },
    lookMeasureData: function (e) {
        wx.navigateTo({
            url: '/pages/measure/measure?vid=' + e.currentTarget.dataset.id,
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