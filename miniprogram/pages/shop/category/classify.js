const app = getApp()
Page({
    data: {
        categories: [],
        products: [],
        currentCategory: 0,
        showCategorySelecter: false,
        sortType: [{
            title: '推荐',
            key: 'recommand'
        }, {
            title: '销量',
            key: 'sale'
        }, {
            title: '价格',
            key: 'price'
        }],
        activeSort: 0,
        sortOrder: 1,
        gender: "男"
    },
    onShow: function () {
        var that = this
        wx.getStorage({
            key: "currentCategory",
            success(res) {
                that.setData({
                    currentCategory: res.data
                })
                wx.removeStorage({
                    key: "currentCategory"
                })
            }
        })
        this.request()
    },
    request: function () {
        app.request("https://newdreamer.cn:8080/api/Classification/get").then(data => {
            this.setData({
                categories: data,
                products: data[this.data.currentCategory] == undefined ? [] : this.getProductsByGender(data[this.data.currentCategory].products, this.data.gender)
            })
        });
    },
    navTap: function (e) {
        var currentCategory = e.currentTarget.dataset.tab
        this.setData({
            currentCategory: currentCategory,
            products:  this.getProductsByGender(this.data.categories[currentCategory]['products'], this.data.gender)
        })
    },
    bindCategorySelecter: function () {
        this.setData({
            showCategorySelecter: !this.data.showCategorySelecter
        })
    },
    getProductsByGender (list ,gender) {
        return list.filter(item => {
            return item.gender == gender
        })
    },
    switchGender: function () {
        let gender = this.data.gender == "女" ? "男" : "女"
        this.setData({
            gender: gender,
            products: this.getProductsByGender(this.data.categories[this.data.currentCategory]['products'], gender)
        })
    },
    //点击排序类别
    active: function (e) {
        var activeSort = this.data.activeSort
        var id = parseInt(e.currentTarget.id)
        var key = e.target.dataset.key
        var sortOrder = this.data.sortOrder
        if (key == "recommand") {
            var products = this.data.categories[id]["products"]
        } else {
            if (activeSort == id) sortOrder = -sortOrder
            var products = this.data.products
            products.sort(function (a, b) {
                a = a[key] + ""
                b = b[key] + ""
                return a.localeCompare(b, 'zh-CN') * sortOrder
            })
        }
        this.setData({
            activeSort: id,
            products: products,
            sortOrder: sortOrder
        })

    }
});