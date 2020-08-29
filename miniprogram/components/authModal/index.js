Component({

options: {
  multipleSlots:true
},
    properties: {
      visible: {
        type: Boolean,
        value: 0,
      },
      authes: {
          type: Array,
          value: []
      },
      type: { // 授权类型，如果是shareBtn的话，那么先不默认获取授权信息
        type: String,
        value: ''
      }
    },
    data: {

    },
    observers: {
      visible(value) {
        value
        ? wx.hideTabBar({  animation: true, })
        : wx.showTabBar({ animation: true })
      },
      authes() {
        if (this.properties.type === 'share') {
            this.initShareBtn();
            return;
        }
        this.requestForAuth();
      }
    },
    methods: {
      cancel() {
        this.triggerEvent('authError');
        let auth = this.data.currentType;
        let resolveAuth = this.data.resolveAuth;
        resolveAuth.push(auth);
        this.setData({
          visible: false,
          resolveAuth
        })
      },
      startAuth() {
        let { needUserInfo, needPhoneNumebr } = this.data;

        let authes = this.data.resolveAuth;
        if (authes.length === 0) {
          return ;
        }
        let type = authes.pop();
        if (type === 'userInfo') {
          if (needUserInfo) {
            this.setData({
              authType: 'userInfo',
              currentType: 'userInfo',
              title: '新梦想家希望获取你的头像，昵称等用户信息',
              visible: true,
              resolveAuth: authes
  ,          })
              return ;
          }
          if (authes.length === 0) { return ; }
          type = authes.pop();
          
        }
        if (type === 'phoneNumber') {
          if (needPhoneNumebr) {
            this.setData({
              authType: 'getPhoneNumber',
              currentType: 'phoneNumber',
              title: '新梦想家希望获取你的手机号',
              visible: true,
              resolveAuth: authes
            })
            return 
          }
          if (authes.length === 0) { return ; }
          type = authes.pop();
        }
      },
      getAuthInfoFromRequest() {
        return new Promise((res,rej) => {
          this.setData({
            resolveAuth: this.properties.authes.reverse(),
            needUserInfo: true,
            needPhoneNumebr: true
          }, res);
        })
      },
      initShareBtn() {
        let { authes } = this.properties;
        if (authes.length === 0) {
          this.setData({
            showShareBtn: true
          })
        } else {
          this.getAuthInfoFromRequest().then(() => {
            const {needUserInfo, needPhoneNumebr} = this.data;
            let status = true;
           authes.forEach(auth => {
             if (!status) {
              return;
             }
              if (auth === 'userInfo' && needUserInfo) {
                status = false;
              }
              if (auth === 'phoneNumber' && needPhoneNumebr) {
                status = false;
              }
           })
           this.setData({
            showShareBtn: status
           })
          })
           
        }
      },
      requestForAuth() { //  请求判断是否需要授权
        if (!this.properties.authes.length) {
          return ;
        }
        this.getAuthInfoFromRequest().then(this.startAuth.bind(this))          
      },
      onGetUserInfo(e) {
        /**
         * cloudID,encryptedData,iv,rawData,signature,
         * userInfo
         */
        console.log(e.detail);
        if (e.detail.errMsg !== 'getUserInfo:ok') {
          this.cancel();
        } else {
          this.checkAuth();
          this.startAuth();
        }
        
      },
      checkAuth() {
        if (this.data.resolveAuth.length === 0) {
          this.triggerEvent('authSuccess');
          this.setData({
            showShareBtn: true
          })
        }
      },
      onGetPhoneNumber(e) {
        console.log(e.detail);
        if (e.detail.errMsg !== 'getPhoneNumber:ok') {
          this.cancel();
        } else {
          this.checkAuth();
          this.startAuth();
        }
        
      },
      handleConfirmBtn() {
        this.setData({
          visible: false
        })
      }
    }
  })