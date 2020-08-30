const app = getApp();
Page({
    data: {
        from: "unknown",
        products: [],
        selectedProducts: [],
        cart: [],
        address: {
            "userName": "请选择地址",
            "provinceName": "选择地址后才可以进行结算"
        },
        summary: {
            allCount: 0, //总件数
            allPrice: 0, //商品总价
            deliverPrice: 0, //运费
            discount: 0, //折扣
            price: 0 //用户需要支付的价格
        },
        remark: "",
        tip: "",
        AddressAccess: true
    },
    onLoad: function (options) {
        const products = JSON.parse(options.products);
        const menu = ['量身定制', '高级定制'];
        const isDIY = products.find(product => menu.indexOf(product.measureID) >= 0); // 判断是不是定制
        this.setData({
            products: JSON.parse(options.products),
            from: options.from,
            isDIY: !!isDIY
        })
        if (options.from == "cart") {
            this.setData({
                selectedProducts: JSON.parse(options.selectedProducts),
                cart: JSON.parse(options.cart)
            })
        }
        this.summary(true)
    },
    onShow: function () {
        this.checkAddressAccess()
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
    summary: function (initial = false) {
        var summary = this.data.summary
        if (initial) {
            var products = this.data.products
            for (var i in products) {
                let price = parseFloat(products[i].price)
                let p0 = price
                if (products[i].Distributor_Wechat_Id != '' || products[i].scene != '') {
                    let dd = parseFloat(products[i].Distributor_Deduction)
                    console.log(p0, dd)
                    p0 -= dd
                    console.log(p0, dd)
                    summary.discount += dd * products[i]["count"]
                }
                products[i]["color"] = "默认"
                summary.allCount += products[i]["count"]
                summary.allPrice += products[i]["count"] * price
                summary.price += products[i]["count"] * p0
                console.log(price, p0)
            }
            this.setData({
                products: products
            })
        }
        if (summary.price <= 0) {
            this.setData({
                tip: "最少支付0.01元"
            })
            summary.price = 0.01
        } else {
            this.setData({
                tip: ""
            })
        }
        this.setData({
            summary: summary
        })
    },
    //修改订单留言
    onRemarkChange: function (e) {
        this.setData({
            remark: e.detail.value
        })
    },
    //跳转微信收货地址
    chooseAddress: function (e) {
        var that = this;
        wx.chooseAddress({
            success: function (res) {
                that.setData({
                    address: res
                })
            },
            fail(e) {
                if (e.errMsg == "chooseAddress:fail auth deny") {
                    that.setData({
                        AddressAccess: false
                    })
                }
            }
        })
    },
    //添加订单
    orderAdd: function () {
        var address = this.data.address;
        if (address.userName == "请选择地址") {
            wx.showToast({
                icon: 'none',
                title: '请选择地址！',
            })
            return;
        }
        wx.showLoading({
            title: '支付请求中',
            mask: true
        })
        let from = this.data.from
        app.request("https://newdreamer.cn:8080/api/pay/get", {
            price: this.data.summary.price * 100,
            order: {
                products: this.data.products,
                address: this.data.address,
                summary: this.data.summary,
                remark: this.data.remark
            }
        }).then(data => {
            wx.requestPayment({
                timeStamp: data.timeStamp,
                nonceStr: data.nonceStr,
                package: data.package,
                signType: 'MD5',
                paySign: data.paySign,
                success: (res) => {
                    console.log(res, data);
                    if (this.data.isDIY) {
                        wx.redirectTo({
                            url: '/pages/measure/reservation?id=' + data.orderId + "&status=待预约"
                        })
                    } else {
                        wx.redirectTo({
                            url: '/pages/order/allOrders?currentTab=待发货',
                        })
                    }
                    
                },
                fail: (e) => {
                    wx.redirectTo({
                        url: '/pages/order/allOrders?currentTab=待支付',
                    })
                },
                complete: (res) => {
                    if (from == "cart") {
                        var cart = this.data.cart
                        var selectedProducts = this.data.selectedProducts
                        for (var i in cart) {
                            i = parseInt(i)
                            if (selectedProducts.indexOf(i) != -1) {
                                cart.splice(i, 1, -1)
                            }
                        }
                        cart = cart.filter(function (val) {
                            return val != -1
                        })
                        app.request("https://newdreamer.cn:8080/api/shopping_cart_info/update", {
                            cart: JSON.stringify(cart)
                        });
                    }
                }
            })
        });
    }
})