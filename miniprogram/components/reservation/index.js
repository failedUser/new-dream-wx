// components/reservation/index.js
const app = getApp()

function getDay(days) {
  var today = new Date();
  let arr = []
  for (let day = 1; day <= days; day++) {
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24;
    today.setTime(targetday_milliseconds); //注意，这行是关键代码
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = doHandleMonth(tMonth + 1);
    tDate = doHandleMonth(tDate);
    arr.push(tYear + "-" + tMonth + "-" + tDate);
  }
  return arr
}

function doHandleMonth(month) {
  var m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}

function getAllTime_Short(begin, end) {
  let t1 = begin.split(":");
  let t2 = end.split(":");
  let arr = [];
  if (parseInt(t1[1]) < 15) arr.push(t1[0] + ":00")
  if (parseInt(t1[1]) < 45) arr.push(t1[0] + ":30")
  for (var t = parseInt(t1[0]) + 1; t < parseInt(t2[0]); t++) {
    arr.push(getT(t) + ":00")
    arr.push(getT(t) + ":30")
  }
  arr.push(t2[0] + ":00")
  if (parseInt(t2[1]) >= 15) arr.push(t2[0] + ":30")
  if (parseInt(t1[1]) >= 45) arr.push(getT(parseInt(t2[0]) + 1) + ":00")
  return arr
}

function getT(t) {
  return t < 10 ? ("0" + t) : t;
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    orderID: -1,
    rid: -1,
    status: "",
    info: {
      "性别": "男",
      "姓名": "",
      "手机": "",
      "高校": "",
      "校区": "",
      "宿舍": '',
      "量体时间": ""
    },
    VolumerInfo: {},
    reservationInfo: {},
    multiArray: [],
    college: '',
    collegeArray: [],
    part: '',
    partArray: [],
    multiIndex: [0, 0],
    room: ''

  },
  ready() {
    this.getCollegeInfo()
    this.setData({
      status: this.properties.status,
      multiArray: [
        getDay(5),
        getAllTime_Short("9:00", "21:00")
      ]
    })
    this.setData({
      "info.量体时间": this.data.multiArray[0][0] + " " + this.data.multiArray[1][0]
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getCollegeInfo(e) {
      app.request("https://newdreamer.cn:8080/api/collegeInfo/get").then(data => {
        this.setData({
          collegeInfo: data,
          collegeArray: Object.keys(data)
        })
      });
    },
    onSelectedCollege(e) {
      let info = this.data.info;
      const value = e.detail.value
      console.log(this.data.collegeArray, value);
      info['高校'] = this.data.collegeArray[value]
      this.setData({
        college: value,
        info,
        partArray: this.data.collegeInfo[this.data.collegeArray[value]],
        part: ''
      })
    },
    onChangeRoom(e) {
      let value = e.detail.value;
      let info = this.data.info;
      info['宿舍'] = value;
      this.setData({
        info,
        room: value
      })
    },
    change: function (e) {
      this.setData({
        [e.currentTarget.dataset.type + "." + e.currentTarget.dataset.key]: e.currentTarget.dataset.range == undefined ? e.detail.value : e.currentTarget.dataset.range[e.detail.value]
      })
    },
    choose: function (e) {
      this.setData({
        ["shape." + e.currentTarget.dataset.type + "." + e.currentTarget.dataset.key]: !this.data.shape[e.currentTarget.dataset.type][e.currentTarget.dataset.key]
      })
    },
    onSelectedPart(e) {
      let info = this.data.info;
      info['校区'] = this.data.partArray[e.detail.value]
      console.log(this.data.partArray);
      this.setData({
        part: e.detail.value,
        info
      })
    },
    upload: function () {
      app.request("https://newdreamer.cn:8080/api/volume/reservation", {
          Data: JSON.stringify(this.data.info)
      }).then(data => {
        this.triggerEvent('OnReservationSuccess');
          // wx.switchTab({
          //     url: '/pages/measure/index',
          // })
      });
  },

    next: function () {
      let info = this.data.info
      for (let key in info) {
        if (info[key] == "") {
          wx.showToast({
            title: '请填写' + key,
            icon: "none"
          })
          return
        }
      }
      wx.showModal({
        title: "提示",
        content: "确定要提交吗？",
        success: (res) => {
          if (res.confirm) {
            this.upload()
          }
        }
      })
    },
  }
})