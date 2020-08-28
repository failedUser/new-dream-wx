const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: [],
        orderCount: {
            "toPay": 0,
            "toDeliver": 0,
            "toReceive": 0,
            "toComment": 0,
            "toRefund": 0,
            "toVolume": 1
        },
        AddressAccess: true,
        isVolumer: false,
        phone: ""
    },
    onLoad: function () {
        this.setData({
            isVolumer: app.globalData.isVolumer,
            phone: app.globalData.phone
        })
    },
    onShow: function () {
        this.checkAddressAccess()
        this.getOrderCount()
    },
    getPhoneNumber: function (e) {
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            app.request("https://newdreamer.cn:8080/api/phone/set", e.detail).then(phone => {
                app.globalData.phone = phone
                this.setData({
                    phone: phone
                })
            });
        }
    },
    getOrderCount: function () {
        app.request("https://newdreamer.cn:8080/api/orderCount/get").then(data => {
            this.setData({
                orderCount: data
            })
        });
    },
    checkAddressAccess: function () {
        var that = this
        wx.getSetting({
            success(res) {
                var AddressAccess = res.authSetting['scope.address'] == undefined ? true : res.authSetting['scope.address']
                that.setData({
                    AddressAccess: AddressAccess
                })
            }
        })
    },
    chooseAddress: function (e) {
        var that = this
        wx.chooseAddress({
            fail() {
                if (e.errMsg == "chooseAddress:fail auth deny") {
                    that.setData({
                        AddressAccess: false
                    })
                }
            }
        })
    },
    nav: function (e) {
        if (e.currentTarget.dataset.type == 'switchTab') {
            wx.switchTab({
                url: e.currentTarget.dataset.url,
            })
        } else {
            wx.navigateTo({
                url: e.currentTarget.dataset.url,
            })
        }
    },
    debug: function () {
        if (app.globalData.debug) {
            app.globalData.debug = false
            wx.showToast({
                title: '已关闭调试'
            })
        } else {
            app.globalData.debug = true
            wx.showToast({
                title: '已开启调试'
            })
        }
    }
})