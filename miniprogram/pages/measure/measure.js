const app = getApp()
Page({
    data: {
        vid: -1,
        allowModified: false,
        tab: 0,
        info: {
            "性别": "男",
            "姓名": "",
            "电话": "",
            "量体地址": "",
            "身高": "",
            "体重": "",
            "喜好": "",
            "预计使用时间": '',
            "喜好": ''
        },
        paras: {
            "胸围": "",
            "腰围": "",
            "腰节": "",
            "臀围": "",
            "中腰": "",
            "裤长": "",
            "下摆": "",
            "横档": "",
            "肩宽": "",
            "中档": "",
            "袖长": "",
            "小腿围": "",
            "大臂围": "",
            "脚口": "",
            "小臂围": "",
            "通裆": "",
            "袖口": "",
            "前胸": "",
            "衣长": "",
            "后背": "",
            "领围": "",
            "胸高": "",
            "数据备注": ""
        },
        shape: {
            "肩型": {
                "溜肩": false,
                "前冲肩": false,
                "耸肩": false
            },
            "胸背部": {
                "挺胸体": false,
                "后背高": false
            },
            "肚型": {
                "啤酒肚": false,
                "小蛮腰": false,
                "小腹凸": false
            },
            "臀部": {
                "翘臀": false,
                "平臀": false
            },
            "体型备注": ""
        },
        more: {
            "体型备注": "",
            "量体数据备注": "",
            "体型正面照片": "",
            "体型侧面照片": "",
            "体型背面照片": "",
            /* 下面2个不要了 */
            "量体时间": "",
            "量体师编号": ""
        }
    },
    onLoad: function (options) {
        console.log('---options---', options);
        this.setData({
            allowModified: options.allowModified == undefined ? false : options.allowModified,
            vid: options.vid, // 目前vid进来一定是有值的
            rid: options.rid == undefined ? -1 : options.rid,
        })
        if (options.load != "0") { this.getVolumerInfo() }
    },
    getVolumerInfo: function () {
        if ((!this.data.vid && this.data.rid === -1)) return;
        let url = 'https://newdreamer.cn:8080/api/volume/getVolumeInfo';
        let params = {
            Reservation_Id: this.data.rid
        }
        if (this.data.vid) {
            url = 'https://newdreamer.cn:8080/api/volumer/getVolumeDetailsByVid';
            params = {
                volume_Id: this.data.vid
            }
        }
        app.request(url, params).then(data => {
            let bodyShapeData = { info: this.data.info, paras: this.data.paras, shape: this.data.shape, more: this.data.more }
            for (let item in data) {
                if (bodyShapeData.info[item] != undefined) {
                    bodyShapeData.info[item] = data[item]
                } else if (bodyShapeData.paras[item] != undefined) {
                    bodyShapeData.paras[item] = data[item]
                } else if (bodyShapeData.shape[item] != undefined) {
                    if (item === '体型备注') {
                        bodyShapeData.shape['体型备注'] = data['体型备注'];
                    } else if (data[item]) {
                        for (let i of data[item].split(" ")) {
                            if (i != "") bodyShapeData.shape[item][i] = true
                        }
                    }
                } else if (bodyShapeData.more[item] != undefined) {
                    bodyShapeData.more[item] = data[item]
                }
            }
            this.setData(bodyShapeData)
        });
    },
    onChangeShaopMark(e) {
        const value = e.detail.value;
        const _shape = this.data.shape;
        _shape['体型备注'] = value;
        this.setData({
            shap: _shape
        })
    },
    change: function (e) {
        this.setData({
            [e.currentTarget.dataset.type + "." + e.currentTarget.dataset.key]: e.currentTarget.dataset.range == undefined ? e.detail.value : e.currentTarget.dataset.range[e.detail.value]
        })
        console.log('this.data', this.data);
    },
    choose: function (e) {
        this.setData({
            ["shape." + e.currentTarget.dataset.type + "." + e.currentTarget.dataset.key]: !this.data.shape[e.currentTarget.dataset.type][e.currentTarget.dataset.key]
        })
    },
    preview: function (e) {
        wx.previewImage({
            urls: ["https://cdn.newdreamer.cn/volume/bodyShape/images/" + e.currentTarget.dataset.name + ".jpg"]
        })
    },
    previous: function () {
        if (this.data.tab > 0) {
            this.setData({
                tab: this.data.tab - 1
            })
        }
    },
    next: function () {
        let map = ["info", "paras", "shape", "more"]
        if (this.data.tab < 2) {
            /*
            let list = this.data[map[this.data.tab]]
            for (let k in list) {
                if (list[k] == "") {
                    wx.showToast({
                        title: '你还没有填写' + k,
                        icon: "none"
                    })
                    return
                }
            }
            */
            this.setData({
                tab: this.data.tab + 1
            })
        } else {
            if (!this.data.allowModified) {
                wx.navigateBack()
            } else {
                wx.showModal({
                    title: "提示",
                    content: "确定要提交吗？",
                    success: (res) => {
                        if (res.confirm) {
                            this.upload()
                        }
                    }
                })
            }
        }
    },
    upload: function () {
        let data = Object.assign(this.data.info, this.data.paras, this.data.more)
        let shapes = this.data.shape
        for (let shape in shapes) {
            data[shape] = []
            if (shape === '体型备注') {
                data[shape] = shapes[shape];
                continue;
            }
            for (let key in shapes[shape]) {
                if (shapes[shape][key]) data[shape].push(key)
            }
            data[shape] = data[shape].join(" ")
        }
        if (!this.data.vid) {
            app.request("https://newdreamer.cn:8080/api/sizeInfo/add", {
                Reservation_Id: this.data.rid,
                bodyShapeData: JSON.stringify(data)
            }, true, "POST").then(data => {
                wx.navigateBack()
            });
        } else {
            app.request("https://newdreamer.cn:8080/api/sizeInfo/update", {
                vid: this.data.vid,
                bodyShapeData: JSON.stringify(data)
            }, true, "POST").then(data => {
                wx.navigateBack()
            });
        }
    }
})