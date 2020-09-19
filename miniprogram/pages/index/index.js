const app = getApp()
Page({
    data: {
        index: {},
        gender: "男",
        authes: ['userInfo'],
        collegePartList: [],
        showDialog: false,
        oneButton: [{text: '确定'}],
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
        const scene = options.scene;
        if (scene) { app.globalData.scene = scene }
        app.request("https://newdreamer.cn:8080/api/collegeInfo/get").then(data => {
            const list = Object.keys(data).reduce((result, college) => {
                let part = data[college];
                part.forEach(p => {
                    result.push(`${college}:${p}`);
                })
                return result;
            },[])
            this.setData({
                collegePartList: list,
                showDialog: true
            })
        });
    },
    tapDialogButton() {
        this.setData({
            showDialog: false
        })
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
                "id": 3,
                "text": "配饰"
            }, {
                "id": 2,
                "text": "其他"
            }]
            const { manModules, womenModules } = data;
            const list = [manModules.suits, manModules.shirt, manModules.accessories, womenModules.suits, womenModules.shirt, womenModules.accessories].map(item => {
                if (!item || !item.products) {
                    return {};
                }
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
    bindClassifyIconTapWidthIndex(e) {
        var currentCategory = e.currentTarget.dataset.id;
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
    bindClassifyIconTap: function (e) {
        var currentCategory = e.currentTarget.dataset.id;
        const gender = currentCategory > 2 ? '女' : '男';
        wx.setStorageSync('currentGender', gender);
        wx.setStorage({
            key: "currentCategory",
            data: currentCategory > 2 ? currentCategory - 3 : currentCategory,
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