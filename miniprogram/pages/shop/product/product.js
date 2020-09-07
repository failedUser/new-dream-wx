//获取应用实例
const app = getApp()
Page({
    data: {
        barcode: null,
        tabID: 0,
        cart: [], //购物车
        products: {},
        measureData: {},
        price: {
            "min": 0,
            "max": 0
        },
        shareFromSelf: false,
        mainProduct: 0,
        selectProduct: 0,
        selectSize: -1,
        selectSizeName: "无尺寸",
        currentImage: 1,
        count: 1,
        showSpec: 0,
        specText: '点击开始定制',
        //默认属性
        comments: [], //评论
        topFixedTop: 700,
        isFixedTop: false,
        isAdding: false,
        sales: "无",
        Distributor_Wechat_Id: "",
        Distributor_Wechat_Name: "",
        scene: app.globalData.share,
        phone: "",
        authes: ['userInfo', 'phoneNumber'],
        showShareCanvas: false,
        shareDialogVisible: false
    },
    onLoad: function (options) {
        const barcode = options.b || options.barcode;
        this.setData({
            barcode: barcode
        })
        let scene = decodeURIComponent(options.s || options.scene || '');
        console.log(scene);
        if (scene) {
            app.globalData.scene = scene
            this.data.scene = scene;
        }
        this.getProduct(barcode)
        //this.getProductComment(options.barcode)
        const query = wx.createSelectorQuery()
        query.select('#nav').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
            this.setData({
                topFixedTop: res[0].top
            })
        })
    },

    toShare () {
        this.setData({
            shareDialogVisible: true
        })
    },

    onShareBtnClick() {
        const price = this.data.price;
        const main = this.data.products[this.data.mainProduct];
        const shareModal = {
            path: '/pages/shop/product/product',
            scene: `b=${this.data.barcode}&s=s_${app.globalData.memberId}`, // b代表barcode， s是scene
            image: main.image[0],
            price: price.max,
            sharePrice: price.maxShare,
            title: main.product_Name
        }
        app.globalData.shareModal = shareModal;
        wx.navigateTo({
          url: '/pages/shop/shareProduct/shareProduct',
        })
        this.setData({
            shareDialogVisible: false
        })
    },
    onShow: function () {
        this.getCart()
    },
    onHide: function () {
        this.setData({
            showSpec: 0,
        });
    },
    // onPageScroll: function (e) {
    //     this.setData({
    //         isFixedTop: e.scrollTop > this.data.topFixedTop
    //     })
    // },
    bindSwiper: function (e) {
        this.setData({
            currentImage: e.detail.current + 1
        })
    },
    navTap: function (e) {
        this.setData({
            tabID: e.currentTarget.dataset.tab
        });
    },
    //获取商品
    getProduct: function (barcode) {
        app.request("https://newdreamer.cn:8080/api/productInfo/get", { 
            Barcode: barcode, 
            scene: app.globalData.scene || false
         }).then(data => {
            let products = data.products
            let mainProduct = 0
            let price = {
                "min": 99999,
                "max": 0,
                "minShare": 0,
                "maxShare": 0
            }
            for (let i in products) {
                if (barcode == products[i]["barcode"]) mainProduct = i
                products[i].size = products[i].size.split(" ")
                if (products[i].price < price.min) {
                    price.min = products[i].price
                    price.minShare = products[i].price - (products[i].singleDistributionDeducation || 0)
                }
                if (products[i].price > price.max) {
                    price.max = products[i].price
                    price.maxShare = products[i].price - (products[i].singleDistributionDeducation || 0)
                } 
                products[i].image = products[i].image ? JSON.parse(products[i].image) || '' : ''
                products[i].detailImages = products[i].detailImages ? JSON.parse(products[i].detailImages) || '' : ''
            }
            this.setData({
                sales: data.sale_count,
                mainProduct: mainProduct,
                products: products,
                price: price,
                phone: app.globalData.phone,
                shareFromSelf: data.shareFromSelf || false
            })
            this.getProductComment(products[mainProduct].barcode)
            if (this.data.Distributor_Wechat_Name == app.globalData.userInfo && app.globalData.userInfo.nickName) {
                this.setData({
                    Distributor_Wechat_Id: "",
                    Distributor_Wechat_Name: ""
                })
            }
        });
    },
    //获取商品评价
    getProductComment: function (Barcode_Main) {
        app.request("https://newdreamer.cn:8080/api/evaluation/get", { Barcode_Main: Barcode_Main }).then(data => {
            this.setData({
                comments: data.object
            })
        });
    },
    getCart: function () {
        app.request("https://newdreamer.cn:8080/api/shopping_cart_info/get").then(cart => {
            cart = cart == "" ? [] : JSON.parse(cart)
            for (var i in cart) {
                cart[i]["price"] = parseFloat(cart[i]["price"]).toFixed(2)
            }
            this.setData({
                cart: cart
            })
        });
    },
    //点击收藏产品
    bindCollect: function (e) {
        var that = this
        wx.request({
            url: app.config.RequestUrl + 'shoucangjia/' + (that.data.products[that.data.mainProduct].isCollect ? "delete" : "add"),
            method: "GET",
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                memberId: app.globalData.memberId,
                barcode: that.data.products[that.data.mainProduct].barcode
            },
            success: function (res) {
                if (res.data.result.status == 200) {
                    var products = that.data.products
                    products[that.data.mainProduct].isCollect = !products[that.data.mainProduct].isCollect
                    that.setData({
                        products: products
                    })
                } else {
                    wx.showToast({
                        title: res.data.result.errMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: function (e) {
                wx.showToast({
                    title: e.errMsg,
                    icon: 'none',
                    duration: 2000
                })
            },
            complete: function (e) {
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        })
    },
    //点击购物车
    bindCart: function () {
        wx.switchTab({
            url: '/pages/my/cart',
        })
    },
    //选择规格商品加减
    onProductCountChange: function (e) {
        var delta = parseInt(e.currentTarget.dataset.delta);
        var count = this.data.count
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
            count = count + delta
        }
        this.setData({
            count: count
        })
    },
    //点击遮罩层，选择规格隐藏
    distpickerCancel: function (e) {
        this.setData({
            showSpec: 0
        })
    },
    //选择子产品
    choseProduct: function (e) {
        this.setData({
            selectProduct: e.currentTarget.dataset.pid
        })
    },
    //选择尺寸
    choseSize: function (e) {
        this.setData({
            selectSize: e.currentTarget.dataset.did,
            selectSizeName: e.currentTarget.dataset.name,
            image: ''
        })
    },
    //跳转
    addSize: function () {
        wx.switchTab({
            url: '/pages/yltmeasure/index',
        })
    },
    bindChooseSpec: function (e) {
        this.setData({
            showSpec: e.currentTarget.dataset.buynow
        })
    },
    //选择属性
    choseProperty: function (e) {
        var subpropertyid = e.currentTarget.dataset.subpropertyid; //产品属性id
        var propertyid = e.currentTarget.dataset.propertyid; //属性id
        var defaultproperty = ''; //显示选择的属性
        var productSpec = this.data.productDetails.productSpec;
        for (var index in productSpec) {
            var insproductSpec = [];
            var subproperty = productSpec[index].subproperty;
            for (var indexin in subproperty) {
                var subpropertyin = subproperty[indexin];
                if (propertyid == subpropertyin.propertyid) {
                    subpropertyin.ischosein = 0;
                }
                if (subpropertyid == subpropertyin.id) {
                    subpropertyin.ischosein = 1;
                }
                if (subpropertyin.ischosein == 1) {
                    defaultproperty += ' "' + subpropertyin.nametrue + '"';
                }
                insproductSpec.push(subpropertyin);
            }
            productSpec[index].subproperty = insproductSpec;
        }
        var productDetails = this.data.productDetails
        productDetails["productSpec"] = productSpec
        this.setData({
            defaultproperty: defaultproperty,
            productDetails: productDetails
        })
    },
    //添加到购物车
    submit: function () {
        if (this.data.selectProduct == -1) {
            wx.showToast({
                title: '请选择产品',
                icon: "none"
            })
            return
        }
        if (this.data.selectSize == -1) {
            wx.showToast({
                title: '请选择尺寸',
                icon: "none"
            })
            return
        }
        var cart = this.data.cart
        var product = {
            "barcode": this.data.products[this.data.selectProduct].barcode,
            "barcode_Main": this.data.products[this.data.mainProduct].barcode,
            "product_Name": this.data.products[this.data.selectProduct].product_Name,
            "image": this.data.products[this.data.mainProduct].image[0],
            "price": this.data.products[this.data.selectProduct].price,
            "count": this.data.count,
            "measureID": this.data.selectSize,
            "measureName": this.data.selectSizeName,
            "Distributor_Deduction": this.data.products[this.data.selectProduct].distributor_Deduction,
            "Distributor_Wechat_Id": this.data.Distributor_Wechat_Id,
            "Distributor_Wechat_Name": this.data.Distributor_Wechat_Name,
            "scene": this.data.scene
        }

        if (this.data.showSpec == 1) {
            var isInCart = false
            for (var i in cart) {
                if (isObjectValueEqual(product, cart[i], true)) {
                    cart[i]["price"] = product.price
                    cart[i]["count"] += product.count
                    isInCart = true
                    break
                }
            }
            if (!isInCart) cart.push(product)
            app.request("https://newdreamer.cn:8080/api/shopping_cart_info/update", {
                cart: JSON.stringify(cart)
            }).then(data => {
                this.setData({
                    cart: cart,
                    selectSize: -1,
                    selectSizeName: "无尺寸"
                })
                this.distpickerCancel()
                wx.showToast({
                    title: '已加入购物车',
                })
            }, err => {});
        } else if (this.data.showSpec == 2) {
            wx.navigateTo({
                url: '/pages/order/operation/confirmOrder?from=product&products=' + JSON.stringify([product])
            })
        }

        /* 对象比较器 */
        function isObjectValueEqual(a, b, debug = false) {
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);
            if (aProps.length != bProps.length) {
                if (debug) console.log("长度不符")
                return false;
            }
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                var propA = a[propName];
                var propB = b[propName];
                if (typeof propA === "object") {
                    if (!isObjectValueEqual(propA, propB, debug)) {
                        if (debug) console.log("对象不匹配：", propName, propA, propB)
                        return false;
                    }
                } else if (propName == "count" || propName == "price") {
                    continue
                } else if (propA !== propB) {
                    if (debug) console.log("对象不匹配：", propName, propA, propB)
                    return false;
                }
            }
            if (debug) console.log("对象匹配：", a, b)
            return true;
        }
    },

    closeShareDialog() {
        this.setData({
            shareDialogVisible: false
        })
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

    shareUrl: function () {
        return `/pages/shop/product/product?barcode=${this.data.barcode}&scene=${encodeURIComponent(`b=${this.data.barcode}&s=s_${app.globalData.memberId}`)}`
    },

    onShareAppMessage: function (res) {
        return {
            path: this.shareUrl(),
            imageUrl: this.data.products[this.data.mainProduct].image[0]
        }
    }
})