const app = getApp();
Page({
    data: {
        orderInfo: {},
        itemInfos: [],
        isSelf: true,
        distritutor_Discount: 0
    },
    onLoad: function (options) {
        console.log(options);
        this.setData({
            "orderInfo.order_Id": options.id,
            isSelf: options.isSelf != 0
        })
        this.refresh()
    },
    refresh: function () {
        app.request("https://newdreamer.cn:8080/api/items/get", {
            orderID: this.data.orderInfo.order_Id
        }).then(data => {
            // data.orderInfo.shipment_Id =  'SF1032683095520';
            let distritutor_Discount = 0;
            for (var j in data.itemInfos) {
                distritutor_Discount += parseFloat(data.itemInfos[j].distributor_Deduction) || 0
                data.itemInfos[j].image = data.itemInfos[j].image ? JSON.parse(data.itemInfos[j].image) || '' : ''
                if (data.itemInfos[j].crafts == "成衣商品") {
                    data.itemInfos[j].needMeasure = 0
                } else {
                    data.itemInfos[j].needMeasure = 1
                    if (data.itemInfos[j].item_Status == "待预约") {
                        data.itemInfos[j].needMeasure = 2
                    } else if (data.itemInfos[j].item_Status == "预约中") {
                        data.itemInfos[j].needMeasure = 3
                    } else if (data.itemInfos[j].item_Status == "待量体") {
                        data.itemInfos[j].needMeasure = 4
                    } else if (data.itemInfos[j].item_Status == "已量体") {
                        data.itemInfos[j].needMeasure = 5
                    } else if (data.itemInfos[j].item_Status == "待评价") {
                        data.itemInfos[j].needMeasure = 5
                    } else if (data.itemInfos[j].item_Status == "已完成") {
                        data.itemInfos[j].needMeasure = 5
                    }
                }
            }
            distritutor_Discount = parseFloat(Number(distritutor_Discount).toFixed(2))
            console.log('---distritutor_Discount--', distritutor_Discount);
            this.setData({...data, distritutor_Discount})
        });
    },
    //预约量体
    reserveMeasure: function (e) {
        wx.navigateTo({
            url: '/pages/measure/reservation?id=' + e.currentTarget.dataset.id + "&status=" + e.currentTarget.dataset.status
        })
    },
    moveToMyMeasture() {
        wx.switchTab({
          url: '/pages/measure/index',
        })
    },      
    lookMeasureData: function (e) {
        wx.navigateTo({
            url: '/pages/measure/measure?rid=' + e.currentTarget.dataset.id,
        })
    },
    refund: function (e) {
        let id = e.target.dataset.id;
        wx.showModal({
            title: '提示',
            content: '是否申请退款',
            success: (res) => {
                if (res.confirm) {
                    //authority
                    app.request("https://newdreamer.cn:8080/api/refund/get", {
                        OrderId: this.data.orderInfo.order_Id,
                        ItemId: id,
                        refundRemark: ""
                    }).then(orderList => {
                        wx.showToast({
                            title: '申请提交成功'
                        })
                        this.refresh()
                    });
                }
            }
        })
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
})