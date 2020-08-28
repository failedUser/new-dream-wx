/**
 * 地址添加和修改页面
 */
const app = getApp()

Page({
  data: {
    id:'',//地址id
    ids:'',//从结算页面传过来的参数
    cityDisabled:true,
    districtDisabled:true,
    addressmsg:{},//地址信息
    provinceInfo:[],//省
    provinceIndex: 0,//省第几个
    cityInfo:[],//市
    cityIndex: 0,//市第几个
    districtInfo: [],//区  
    districtIndex: 0,//区第几个
    truename: '',//真实姓名
    phonenumber: '',//电话号码
    address: '',//地址
  },
  onLoad: function (options) {
    app.showLoading(this);
    var that = this;
    
    if (options.ids){
      that.setData({
        ids: options.ids,
      })
    }

    that.requestInit();
    if (options.id) {
      that.getaddress(options.id);
      that.setData({
        id: options.id
      })
    }
  },
  onReady:function(){
    app.hideLoading(this);
  },
  /**
   * 获取省的信息
   */
  requestInit: function () {
 wx.chooseAddress({
   success:function(res){
     console.log(res);
   }
 })

    var that = this;
    let url = '/AreaAPI/lisByP';
    let datain={
      parentid: 8
    };

    app.postRequestU(url, datain, function (res) {
      let data = res.data;
      if (data.code == 0) {
        that.setData({
          provinceInfo: data.msg,
        });
      }
    })
  },

  /**
   * 根据id获取地址
   */
  getaddress:function(id){
    let that=this;
    let url = '/MemberaddressAPI/sinByI';
    let datain = {
      id: id
    };
    app.postRequestU(url, datain, function (res) {
      let data = res.data;
      
      if (data.code == 0) {
        let addressmsg = data.msg;
        addressmsg.province = '';
        addressmsg.city = '';
        addressmsg.district = '';
        that.setData({
          address: data.msg.address,
          truename: data.msg.truename,
          phonenumber: data.msg.phonenumber,
          addressmsg: addressmsg,
        });
      }
    })
  },

  //选择省
  bindProvinceChange: function (e) {
    var that = this;
    var provinceInfo = that.data.provinceInfo;
    var provinceIndex = e.detail.value;
    var provinceId = provinceInfo[parseInt(provinceIndex)].id;
    let addressmsg = that.data.addressmsg;
    addressmsg.province = provinceId;
    addressmsg.prcnname = provinceInfo[parseInt(provinceIndex)].cnname;
    addressmsg.city = 0;
    addressmsg.district = 0;
    that.setData({
      provinceIndex: provinceIndex,
      cityDisabled: false,
      addressmsg: addressmsg
    });
    let url = '/AreaAPI/lisByP';
    let datain={
      parentid: provinceId
    }
    app.postRequestU(url, datain, function (res) {
      let data = res.data;
      if (data.code == 0) {
        that.setData({
          cityInfo: data.msg,
        });
      }
    })
  },


  //选择市
  bindCityChange:function(e){
    var that = this;
    var cityIndex = e.detail.value;
    var cityInfo = that.data.cityInfo;
    var cityId = cityInfo[parseInt(cityIndex)].id;
    let addressmsg = that.data.addressmsg;

    addressmsg.city = cityId;
    addressmsg.cicnname = cityInfo[parseInt(cityIndex)].cnname;
    addressmsg.district = 0;
    that.setData({
      cityIndex: cityIndex,
      districtDisabled: false,
      addressmsg: addressmsg
    });

    let url = '/AreaAPI/lisByP';
    let datain={
      parentid: cityId
    };
    app.postRequestU(url, datain, function (res) {
      let data = res.data;
      if (data.code == 0) {
        that.setData({
          districtInfo: data.msg,
        });
      }
    })
  },

  //选择区
  bindDistrictChange:function(e){
    var that = this;
    var districtIndex = e.detail.value;
    var districtInfo = that.data.districtInfo;
    var districtId = districtInfo[parseInt(districtIndex)].id;

    let addressmsg = that.data.addressmsg;

    addressmsg.district = districtId;
    addressmsg.dicnname = districtInfo[parseInt(districtIndex)].cnname;
    that.setData({
      districtIndex: districtIndex,
      addressmsg: addressmsg
    });
  },


  //保存收货地址
  saveAddress: function (e) {
    let that=this;
    var telRule = /^1[3|4|5|7|8]\d{9}$/, nameRule = /^[\u2E80-\u9FFF]+$/;
    let truename = e.detail.value.truename;
    let phonenumber = e.detail.value.phonenumber;
    let province = e.detail.value.province;
    let city = e.detail.value.city;
    let district = e.detail.value.district;
    let address = e.detail.value.addressDetails;
    if(truename==''){
      wx.showToast({
        title: '请输入姓名',
        icon:'none'
      })
    }else if(! nameRule.test(truename)){
      wx.showToast({
        title: '请输入中文名',
        icon: 'none'
      })
    }else if(phonenumber==''){
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
    }else if(! telRule.test(phonenumber)){
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
    }else if(province==''){
      wx.showToast({
        title: '请选择省',
        icon: 'none'
      })
    }else if(city==''){
      wx.showToast({
        title: '请选择市',
        icon: 'none'
      })
    }else if(district==''){
      wx.showToast({
        title: '请选择区',
        icon: 'none'
      })
    }else if(address==''){
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
    }else{
      let url = '/MemberaddressAPI/insMsg';
      let datain={
        id:that.data.id,
        truename: truename,
        phonenumber:phonenumber,
        province: province,
        city: city,
        district: district,
        address: address
      }
      app.postRequestU(url, datain, function (res) {
        let data = res.data;
        let ids=that.data.ids;
        let id = data.msg;
        let title,url;
        if (id){
          title='修改成功';
        }else{
          title = '保存成功';
        }
        if (ids){
          url = '/pages/confirmOrder/confirmOrder?ids=' + ids + '&&addressid=' + id;
        }else{
          url = '/pages/address/address';
        }
        if (data.code == 0) {
          wx.hideLoading();
          wx.showToast({
            title: title,
          })
          setTimeout(function () {
            //跳转地址
            wx.redirectTo({
              url: url,
            })
          }, 1000)
        }
      })
    }
  }
})