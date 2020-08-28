const app = getApp();
Page({
    data: {
        selectedProducts: [],
        cart: [], //购物车信息
        total: 0.00, //价格总计
    },
    onShow: function () {
        this.getCart();
    },
    //获取购物车信息
    getCart: function () {
        app.request("https://newdreamer.cn:8080/api/shopping_cart_info/get").then(cart => {
            cart = cart == "" ? [] : JSON.parse(cart)
            for (var i in cart) {
                cart[i]["price"] = parseFloat(cart[i]["price"]).toFixed(2)
            }
            this.setData({
                selectedProducts: [],
                cart: cart
            })
            this.sum()
        });
    },
    //更新购物车信息
    updateCart: function () {
        app.request("https://newdreamer.cn:8080/api/shopping_cart_info/update", {
            cart: JSON.stringify(this.data.cart)
        }).then(data => {
            this.setData({
                cart: this.data.cart
            })
        });
    },
    // 数量加减
    onProductCountChange: function (e) {
        var delta = parseInt(e.currentTarget.dataset.delta);
        var index = e.currentTarget.dataset.index;
        var cart = this.data.cart
        var count = parseInt(cart[index]["count"])
        if (count <= 1 && delta < 0) {
            wx.showToast({
                title: "数量已到达下限",
                icon: 'none',
                duration: 3000
            })
        } else if (count >= 99 && delta > 0) {
            wx.showToast({
                title: "数量已到达上限",
                icon: 'none',
                duration: 3000
            })
        } else {
            cart[index]["count"] = count + delta
        }
        this.setData({
            cart: cart
        })
        this.sum()
        this.updateCart()
    },
    deleteCart: function (e) {
        var that = this
        wx.showModal({
            title: '提示',
            content: '是否确定删除',
            success(res) {
                if (res.confirm) {
                    var index = e.currentTarget.dataset.index;
                    var cart = that.data.cart
                    cart.splice(index, 1)
                    var selectedProducts = that.data.selectedProducts
                    for (var i in selectedProducts) {
                        var sp = selectedProducts[i]
                        if (sp == index) {
                            selectedProducts.splice(i, 1, -1)
                        } else if (sp > index) {
                            selectedProducts.splice(i, 1, sp - 1)
                        }
                    }
                    selectedProducts = selectedProducts.filter(function (val) {
                        return val != -1
                    })
                    that.setData({
                        selectedProducts: selectedProducts,
                        cart: cart
                    })
                    that.sum()
                    that.updateCart()
                }
            }
        })
    },
    /**
     * 单个选择
     */
    onProductSelected: function (e) {
        var index = e.currentTarget.dataset.index; //序号
        var selectedProducts = this.data.selectedProducts
        var loc = selectedProducts.indexOf(index)
        if (loc == -1) {
            selectedProducts.push(index)
            selectedProducts.sort()
        } else {
            selectedProducts.splice(loc, 1)
        }
        this.setData({
            selectedProducts: selectedProducts
        })
        this.sum()
    },
    /**
     * 全选
     */
    onAllSelected: function (e) {
        var arr = []
        if (this.data.selectedProducts.length < this.data.cart.length) {
            for (var i = 0; i < this.data.cart.length; i++) arr.push(i)
        }
        this.setData({
            selectedProducts: arr
        })
        this.sum()
    },
    /**
     * 统计
     */
    sum: function (e) {
        var cart = this.data.cart;
        var selectedProducts = this.data.selectedProducts
        var total = 0;
        for (var i in selectedProducts) {
            if (cart[i] == undefined) continue
            i = selectedProducts[i]
            let price = cart[i]["price"]
            if (cart[i].Distributor_Wechat_Id != '' || cart[i].scene != '') {
                price -= cart[i].Distributor_Deduction
            }
            total += cart[i]["count"] * price;
        }
        this.setData({
            total: total.toFixed(2)
        })
    },
    //结算，判断选中并跳转
    bindBalance: function () {
        var selectedProducts = this.data.selectedProducts
        var cart = this.data.cart;
        var products = [];
        for (var i in selectedProducts) {
            products.push(cart[selectedProducts[i]]);
        }
        if (products.length <= 0) {
            wx.showToast({
                title: '未选择结算产品！',
                icon: "none"
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/order/operation/confirmOrder?from=cart&products=' + JSON.stringify(products) + "&cart=" + JSON.stringify(cart) + "&selectedProducts=" + JSON.stringify(selectedProducts)
        })
    }
});