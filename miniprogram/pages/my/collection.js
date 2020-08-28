const app = getApp();
Page({
    data: {
        collection: [],
        products: {}
    },
    onLoad: function(option) {
        this.getCollection()
    },
    //获取收藏夹
    getCollection: function() {
        var that = this
        wx.request({
            url: app.config.RequestUrl + 'shoucangjia/get',
            method: "GET",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                memberID: app.globalData.memberID
            },
            success: function(res) {
                if (res.data.result.status == 200) {
                    var data = res.data.data.object
                    var products = data.products
                    var productsObject = {}
                    for (var product in products) {
                        product = products[product]
                        productsObject[product["barcode"]] = product
                    }
                    that.setData({
                        collection: data.collection,
                        products: productsObject
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
            },
            complete: function(e) {
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        })
    },
    deleteCollection: function(e) {
        var that = this;
        var barcode = e.currentTarget.dataset.id;
        var memberID = app.globalData.memberID;
        wx.showModal({
            title: '删除收藏',
            content: '是否删除此收藏的产品？',
            success: function(res) {
                if (res.confirm) {
                    //取消收藏

                }
            }
        })
    }
})