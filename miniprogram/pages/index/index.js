const app = getApp()
Page({
    data: {
        index: {},
        gender: "男"
    },

    onShow: function (options) {
        this.request()
    },

    request: function () {
        app.request("https://newdreamer.cn:8080/api/home/get").then(data => {
            var index = data
            index["classify"] = [{
                "id": 0,
                "text": "西服"
            }, {
                "id": 1,
                "text": "衬衫"
            }, {
                "id": 2,
                "text": "裤子"
            }, {
                "id": 4,
                "text": "配饰"
            }]
            this.setData({
                index: index
            })
        });
    },
    switchGender: function () {
        this.setData({
            gender: this.data.gender == "女" ? "男" : "女"
        })
    },
    fixedIconTap: function (e) {
        var url = e.currentTarget.dataset.url
        wx.navigateTo({
            url: url,
        })
    },
    bindClassifyIconTap: function (e) {
        var currentCategory = e.currentTarget.dataset.id
        wx.setStorage({
            key: "currentCategory",
            data: currentCategory,
            success: function () {
                wx.switchTab({
                    url: '/pages/shop/category/classify',
                })
            }
        })
    },
    onShareAppMessage: function () {
        return {}
    }
})