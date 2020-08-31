const app = getApp();
Page({
    data: {
        currentTab: "全部",
        hasOrder: false,
        orderList: []
    },
    onLoad: function (options) {
        var currentTab = options.currentTab == undefined ? "全部" : options.currentTab
        this.setData({
            currentTab: currentTab
        })
    },
    onShow: function () {
        this.getOrder(this.data.currentTab);
    },
    getOrder: function (status) {
        app.request("https://newdreamer.cn:8080/api/order/get", {
            status: status
        }).then(orderList => {
            var hasOrder = orderList.length > 0
            for (var i in orderList) {
                orderList[i].needMeasure = 0
                for (var j in orderList[i].products) {
                    orderList[i].products[j].image = orderList[i].products[j].image ? JSON.parse(orderList[i].products[j].image) || '' : ''
                    if (orderList[i].products[j].crafts != "成衣商品") {
                        orderList[i].needMeasure = 1
                        orderList[i].reservation_Id = orderList[i].products[j].reservation_Id
                        if (orderList[i].products[j].item_Status == "待预约") {
                            orderList[i].needMeasure = 2
                        } else if (orderList[i].products[j].item_Status == "预约中") {
                            orderList[i].needMeasure = 3
                        } else if (orderList[i].products[j].item_Status == "待量体") {
                            orderList[i].needMeasure = 4
                        } else if (orderList[i].products[j].item_Status == "已量体") {
                            orderList[i].needMeasure = 5
                        } else if (orderList[i].products[j].item_Status == "待评价") {
                            orderList[i].needMeasure = 5
                        }
                        break
                    }
                }
            }
            this.setData({
                hasOrder: hasOrder,
                orderList: orderList
            })
        });
    },
    swichNav: function (e) {
        var currentTab = e.target.dataset.tab
        this.setData({
            currentTab: currentTab
        });
        this.getOrder(currentTab);
    },
    setClipboardData: function (e) {
        var data = e.target.dataset.data
        wx.setClipboardData({
            data: data,
            success(res) {
                wx.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    },
    bindOrderDetails: function (e) {
        console.log("bindOrderDetails", e)
        if (e.target.dataset.id) return
        wx.navigateTo({
            url: 'order?id=' + e.currentTarget.dataset.oid
        })
    },
    //预约量体
    reserveMeasure: function (e) {
        console.log("reserveMeasure", e)
        wx.navigateTo({
            url: '/pages/measure/reservation?id=' + e.currentTarget.dataset.id + "&status=" + e.currentTarget.dataset.status
        })
    },
    lookMeasureData: function (e) {
        console.log("lookMeasureData", e)
        wx.switchTab({
            url: '/pages/measure/index',
        })
    },
    //取消订单
    bindCancel: function (e) {
        let id = e.target.dataset.id;
        wx.showModal({
            title: '提示',
            content: '是否取消订单',
            success: (res) => {
                if (res.confirm) {
                    app.request("https://newdreamer.cn:8080/api/order/delete", {
                        "orderID": id
                    }).then(orderList => {
                        this.getOrder(this.data.currentTab);
                    });
                }
            }
        })
    },
    //确认收货
    bindReceive: function (e) {
        let id = e.target.dataset.id;
        wx.showModal({
            title: '提示',
            content: '是否确认收货',
            success: res => {
                if (res.confirm) {
                    app.request("https://newdreamer.cn:8080/api/order/receive", {
                        "orderID": id
                    }).then(orderList => {
                        this.getOrder(this.data.currentTab);
                    });
                }
            }
        })
    },
    //立即支付
    bindPay: function (e) {
        var orderIndex = e.currentTarget.dataset.id;
        var order = this.data.orderList[orderIndex]
        var orderInfo = order.zhifu_xinxi.split(" ")
        wx.requestPayment({
            timeStamp: orderInfo[0],
            nonceStr: orderInfo[1],
            package: orderInfo[2],
            signType: 'MD5',
            paySign: orderInfo[3],
            success: function (res) {
                wx.redirectTo({
                    url: '/pages/order/allOrders?currentTab=待发货',
                })
            }
        })
    },
    comment: function (e) {
        var orderIndex = e.currentTarget.dataset.i;
        let orderID = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: 'operation/comment?orderID=' + orderID + "&product=" + JSON.stringify(this.data.orderList[orderIndex].products[0]),
        })
    }
})