const app = getApp()
Page({
    data: {
        index: {},
        gender: "男",
        authes: ['userInfo']
    },

    onShow: function (options) {
        this.request()
    },
    onAuthError() {
        console.log('授权失败了');
    }, 
    onAuthSuccess() {
        console.log('授权成功了');
    },
    onLoad: function (options) {
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
                "id": 4,
                "text": "配饰"
            }, {
                "id": 2,
                "text": "裤子"
            }]
            const { manModules, womenModules } = data;
            const list = [manModules.suits, manModules.shirt, manModules.accessories, womenModules.suits, womenModules.shirt, womenModules.accessories].filter(item => {
                return item && item.products
            }).map(item => {
                
                item.products = item.products.filter(i => i).map(pro => {
                    pro.image = pro.images ? JSON.parse(pro.images)[0] || '' : '';
                    return pro;
                })
                return item;
            })

            this.setData({
                index: index,
                photos: data.photos ? JSON.parse(data.photos) : [],
                notice: data.notice ? JSON.parse(data.notice) : [],
                modules: list
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