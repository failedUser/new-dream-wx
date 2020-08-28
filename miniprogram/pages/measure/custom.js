const app = getApp()
Page({
    data: {
        ItemId: -1,
        category: "",
        fabrics: [],
        fabricID: "",
        otherFabric: "",
        otherFabricTmp: "",
        styles: {},
        userData: {},
        allowModified: true,
        isShowConfirm: false
    },
    onLoad: function (options) {
        let itemID = options.id
        app.request("https://newdreamer.cn:8080/api/cusromize/get", {
            ItemId: itemID
        }).then(data => {
            let styles = {}
            let userData = data.styleChosen
            for (let style in data.style) {
                styles[style] = data.style[style].split(" ")
                if (userData[style] == undefined) userData[style] = ""
            }
            this.setData({
                ItemId: itemID,
                fabrics: data.fabric,
                fabricID: data.fabricChosen,
                styles: styles,
                userData: userData,
                category: data['分类'],
                allowModified: options.allowModified != 0
            })
        });
    },
    onFabricChage: function (e) {
        if (!this.data.allowModified) return
        this.setData({
            fabricID: e.currentTarget.dataset.value
        })
    },
    otherFabric: function () {
        if (!this.data.allowModified) return
        this.setData({
            isShowConfirm: true
        })
    },
    setValue: function (e) {
        this.setData({
            otherFabricTmp: e.detail.value
        })
    },
    cancel: function () {
        this.setData({
            isShowConfirm: false,
        })
    },
    confirmAcceptance: function () {
        this.setData({
            isShowConfirm: false,
            fabricID: -1,
            otherFabric: this.data.otherFabricTmp
        })
    },
    onPicChage: function (e) {
        if (!this.data.allowModified) return
        this.setData({
            ["userData." + e.currentTarget.dataset.key]: e.currentTarget.dataset.value,
            otherFabric: false
        })
    },
    submit: function () {
        app.request("https://newdreamer.cn:8080/api/cusromize/getChosen", {
            ItemId: this.data.ItemId,
            fabric: this.data.fabricID !== -1 ? this.data.fabricID : this.data.otherFabric,
            styles: JSON.stringify(this.data.userData)
        }).then(data => {
            wx.showModal({
                title: '提交成功',
                showCancel: false,
                success(res) {
                    wx.navigateBack()
                }
            })
        });
    }
})