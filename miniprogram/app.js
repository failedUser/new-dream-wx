App({
    config: {
        RequestUrl: 'https://newdreamer.cn:8080/api/'
    },
    globalData: {
        userInfo: null,
        phone: "",
        debug: false,
        share: false
    },
    onLaunch: function (data) {
        this.checkVersion().then(
            data => {
                console.info("[启动] 小程序已是最新版本！");
            },
            error => {
                this.warn(error);
            }
        );
        this.login().then(res => {}, err => {
            wx.hideLoading()
            console.log(err)
        });
        wx.getUserInfo({
            success: (res) => {
                this.globalData.userInfo = res.userInfo
            }
        })
        if (!wx.cloud) {
            wx.showModal({
                title: "提示",
                content: "您的微信版本过低，使用中可能遇到不可预知的问题，建议您更新微信版本。",
                showCancel: false
            });
            console.error("[警告] 请使用 2.2.3 或以上的基础库以使用云能力");
        } else {
            wx.cloud.init({
                env: "sfxmt-cloud",
                traceUser: true
            });
        }
    },

    onShow: function (data) {
        if (data.query.scene) {
            this.globalData.share = data.query.scene
        }
    },

    onUnhandledRejection: function (e) {
        console.info("Unhandled Rejection:", e)
    },

    login: function () {
        console.info("[启动]已发送登陆请求...");
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.request("https://newdreamer.cn:8080/api/login", {
                            sc_code: res.code
                        }, false).then(data => {
                            this.globalData.EncodeID = data.EncodeID
                            this.globalData.memberId = data.memberId
                            this.globalData.memberID = data.memberId
                            this.globalData.openId = data.openId
                            this.globalData.sessionKey = data.sessionKey
                            this.globalData.phone = data.phone == undefined ? "" : data.phone
                            this.globalData.isVolumer = data.isVolumer == "YES"
                            resolve(true);
                        }, error => {
                            this.globalData.EncodeID = false
                            resolve(false);
                        });
                    } else {
                        this.globalData.EncodeID = false;
                        reject("登录请求失败：" + res.errMsg);
                    }
                },
                fail: e => {
                    this.globalData.EncodeID = false;
                    reject("登录请求失败：" + e);
                }
            });
        });
    },

    checkVersion: function () {
        return new Promise((resolve, reject) => {
            if (wx.canIUse("getUpdateManager")) {
                const updateManager = wx.getUpdateManager();
                updateManager.onCheckForUpdate((res) => {
                    if (!res.hasUpdate) {
                        resolve(true);
                    } else {
                        this.log("info", "checkVersion", "VERSION", {
                            ErrMsh: "检测到新版本"
                        })
                    }
                });
                updateManager.onUpdateReady(() => {
                    updateManager.applyUpdate();
                    reject("新版本已经上线！请确认升级！");
                    this.log("info", "checkVersion", "VERSION", {
                        ErrMsh: "新版本下载成功"
                    })
                });
                updateManager.onUpdateFailed(() => {
                    reject("新版本已经上线！请重新打开小程序！");
                    this.log("warn", "checkVersion", "VERSION", {
                        ErrMsh: "新版本下载失败"
                    })
                });
            } else {
                reject("无法接入小程序版本管理...请重试...");
                this.log("error", "checkVersion", "VERSION", {
                    ErrMsh: "无法接入版本管理"
                })
            }
        });
    },

    request: function (url, data = {}, forceReg = true, method = "GET") {
        data = Object.assign(data, {
            _t: Math.random(),
            EncodeID: this.globalData.EncodeID,
            sessionKey: this.globalData.sessionKey
        })
        return new Promise((resolve, reject) => {
            if (this.globalData.EncodeID || !forceReg) {
                wx.request({
                    url: url,
                    method: method,
                    header: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                    data: data,
                    success: res => {
                        if (res.data.result.status === 200) {
                            resolve(res.data.data);
                        } else {
                            this.warn(res.data.result.showErrMsg);
                            this.log("warn", "REQUEST", { RESPONSE: res.data.result })
                            reject(this.globalData.debug ? JSON.stringify(res.data) : res.data.result.showErrMsg);
                        }
                    },
                    fail: e => {
                        this.warn(e.errMsg);
                        this.log("error", "REQUEST", { ERROR: e })
                        reject(e.errMsg);
                    },
                    complete: () => {
                        wx.hideLoading();
                        wx.hideNavigationBarLoading();
                        wx.stopPullDownRefresh();
                    }
                });
            } else {
                switch (this.globalData.EncodeID) {
                    //登录接口还在请求
                case undefined:
                    wx.showLoading({
                        title: "登陆中...",
                        mask: true
                    });
                    console.log("登陆中")
                    setTimeout(() => {
                        resolve(this.request(url, data, forceReg, method));
                    }, 500);
                    break;
                    //登录接口请求完成，未注册
                case false:
                    this.warn("登录异常！");
                    return;
                }
            }
        });
    },

    warn: function (e) {
        wx.showModal({
            title: "警告",
            content: e,
            showCancel: false
        });
    },

    onUnhandledRejection: function (e) {
        console.warn("unhandledRejection", e)
    },

    onPageNotFound: function (res) {
        wx.redirectTo({
            url: 'pages/index/404'
        })
    },
    /* 封装LOGGER */

    log: function (type, key, data, dataToLocal = {}) {
        var base = {
            Type: key,
            UserID: this.globalData.EncodeID ? this.globalData.EncodeID : "UN-LOG-IN"
        }
        var RealTimeLogger = wx.canIUse('wx.getRealtimeLogManager') ? wx.getRealtimeLogManager() : null
        var LocalLogger = wx.canIUse('wx.getLogManager()') ? wx.getLogManager() : null
        switch (type) {
        case "info":
            if (RealTimeLogger) {
                if (RealTimeLogger.setFilterMsg) RealTimeLogger.setFilterMsg(key)
                RealTimeLogger.info(Object.assign(base, data))
            }
            if (LocalLogger) {
                LocalLogger.info(Object.assign(base, data, dataToLocal))
            }
            break;
        case "warn":
            if (RealTimeLogger) {
                if (RealTimeLogger.setFilterMsg) RealTimeLogger.setFilterMsg(key)
                RealTimeLogger.warn(Object.assign(base, data))
            }
            if (LocalLogger) {
                LocalLogger.warn(Object.assign(base, data, dataToLocal))
            }
            break;
        case "error":
            if (RealTimeLogger) {
                if (RealTimeLogger.setFilterMsg) RealTimeLogger.setFilterMsg(key)
                RealTimeLogger.error(Object.assign(base, data))
            }
            if (LocalLogger) {
                LocalLogger.error(Object.assign(base, data, dataToLocal))
            }
            break;
        default:
            console.warn("[警告] 你正在使用不支持的LOG类型")
        }
    },
})