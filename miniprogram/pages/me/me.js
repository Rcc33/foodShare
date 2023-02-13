// pages/me/me.js
const db = wx.cloud.database()
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [],
    activeTab: 0,
    datalist: [],
    datalist1: [],
    openid: '',
    alist: [],
    height1: '',
    nickName: '',
    avatar: '',
    height: '',
    lock: false,
    goodList: [],
    list: [],
    check_button: 0,
    goodList: [],
    collectionList: [],
    tar: !wx.getStorageSync('isLogin'),
    tar1: 0,
    temp: 0,
    temp1: 0
  },

  login: async function (e) {
    var that = this


    //如果没有登录，点击头像登录
    if (!wx.getStorageSync('isLogin')) {
      wx.getUserProfile({
        desc: "获取你的昵称、头像、地区及性别",
        complete: (res) => {
          let errMsg = res.errMsg
          //用户同意授权
          if (errMsg == "getUserProfile:ok") {
            wx.showLoading({
              title: '加载中',
            })
            setTimeout(function () {
              wx.hideLoading()
            }, 2000)
            //存储已登录的状态
            wx.setStorage({
              data: true,
              key: 'isLogin'
            })
            //显示头像和昵称
            let userInfo = res.userInfo
            that.setData({
              nickName: userInfo.nickName,
              avatar: userInfo.avatarUrl,
              tar: false
            })

            //查看用户是否是第一次登录
            wx.cloud.callFunction({
              name: "getOpenid"
            }).then(open => {
              wx.cloud.callFunction({
                name: "getUserInfo",
                data: {
                  openid: open.result.openid
                }
              }).then(info => {
                //用户是第一次登录，把用户信息插入到user表中

                if (info.result.data.length == 0) {
                  db.collection("user").add({
                    data: {
                      nickName: userInfo.nickName,
                      avatar: userInfo.avatarUrl,
                      myCollections: [],
                      myLikes: []
                    }
                  }).then(res => {
                    console.log("首次登录！")

                  })
                } else {
                  that.loginRefresh()
                }
              })
            })

          } else {
            console.log("授权失败！")
          }
        }
      })
    } else {
      // 如果已经是登录状态，点击头像退出登录
      wx.showActionSheet({
        itemList: ['退出登录'], //显示的列表项
        itemColor: '#FF0000',
        success: function (res) { //res.tapIndex点击的列表项
          if (res.tapIndex == 0) {
            wx.setStorage({
              data: false,
              key: 'isLogin',
            })
            wx.getUserInfo({
              success: res => {
                that.setData({
                  avatar: res.userInfo.avatarUrl,
                  nickName: "请点击头像进行登录"
                })
                that.setData({
                  datalist: [],
                  datalist1: [],
                  list: [],
                  tar1: 0,
                  tar: true,
                  temp1:0,
                  temp:0,
                  alist: []
                })
                const tabs = [{
                  title: '我的发布' + ' ' + 0,

                  dataList: []
                }, {
                  title: '我的收藏' + ' ' + 0,
                  dataList: [],

                }]
                that.setData({
                  tabs: tabs
                })
              }

            })
          }
        },
        fail: function (res) {},
        complete: function (res) {}
      })
    }

  },
  asleep: function (n) {
    var start = new Date().getTime();
    while (true)
      if (new Date().getTime() - start > n) break;
  },

  deleteNote: async function (e) {
    var that = this
    // var Noteopenid = ""
    // var useropenid = ""
    var id = e.currentTarget.dataset["id"];
    // wx.cloud.callFunction({
    //   name: "getbyid",
    //   data: {
    //     id: id
    //   }
    // }).then(res => {
    //   console.log(res.result.data[0]._openid)
    //   Noteopenid = res.result.data[0]._openid
    //   console.log(Noteopenid)
    // })
    // await this.sleep(500)
    // wx.cloud.callFunction({
    //   name: "getOpenid",

    // }).then(res => {
    //   console.log(res.result.openid)
    //   useropenid = res.result.openid
    //   console.log(useropenid)
    // })
    // await this.sleep(500)
    // var id = e.currentTarget.dataset["id"];
    // console.log(useropenid == Noteopenid);
    // if (useropenid == Noteopenid) {
      
    // }
    wx.showActionSheet({
      itemList: ["删除笔记"],
      itemColor: '#FF0000',
      success(res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          wx.cloud.callFunction({
            name: "deletemydata",
            data: {
              id: id
            }
          }).then(res => {
            console.log(res)
            wx.cloud.callFunction({
              name:"getMyCollections"
            }).then(users => {
              console.log(users.result.data)
              users.result.data.forEach(user => {
                console.log(user)
                var myCollections = user.myCollections
                myCollections.forEach(noteId => {
                  if(noteId == id) {
                    var i = that.getArrayIndex(myCollections, noteId)
                    myCollections.splice(i,1); 
                  }
                })
                var myLikes = user.myLikes
                myLikes.forEach(noteId => {
                  if(noteId == id) {
                    var i = that.getArrayIndex(myCollections, noteId)
                    myLikes.splice(i,1); 
                  }
                })
                db.collection("user").doc(user._id).update({
                  data: {
                    myCollections: myCollections,
                    myLikes: myLikes
                  }
                })
              });
              that.onLoad()
              
            })
          })
        }
      }
    })

  },

  getArrayIndex:function(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return i;
        }
    }
    return -1;
},

  onchange1: function () {
    if(wx.getStorageSync('isLogin')) {
      this.setData({
        temp1: 0
      })
      if (this.data.datalist == 0) {
        this.setData({
          temp: 1
        })
      } else {
        this.setData({
          temp: 0
        })
      }
    } else {
      this.setData({
        temp:0,
        temp1:0
      })
    }

    this.setData({
      list: this.data.datalist,
      check_button: 0
    })

  },
  onchange2: function () {
    if(wx.getStorageSync('isLogin')) {
      this.setData({
        temp: 0
      })
      if (this.data.alist == 0) {
        this.setData({
          temp1: 1
        })
      } else {
        this.setData({
          temp1: 0
        })
      }
    } else {
      this.setData({
        temp1:0,
        temp:0
      })
    }
    this.setData({
      list: this.data.datalist1,
      check_button: 1
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)

    if (wx.getStorageSync('isLogin')) {
      this.loginRefresh()
    } else {
      const tabs = [{
        title: '我的发布' + ' ' + 0,

        dataList: []
      }, {
        title: '我的收藏' + ' ' + 0,
        dataList: [],

      }]
      that.setData({
        tabs: tabs
      })

    }

  },
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },
  onTabClick(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
  },

  checkNote: function (e) {
    var id = e.currentTarget.dataset["id"];

    wx.navigateTo({
      url: '../viewnote/viewnote?id=' + id,
    })
  },

  getdataList: async function () {
    var that = this
    wx.cloud.callFunction({
      name: "getdatalist",
      data: {
        openid: that.data.openid
      }
    }).then(res => {
      that.setData({
        datalist: res.result.data,
        height1: res.result.data.length * 140,
      })
      if (that.data.check_button == 0) {
        that.setData({
          list: res.result.data
        })
      }
      console.log(that.data.openid)
      wx.cloud.callFunction({
        name: "getalist",
        data: {
          openid: that.data.openid
        }
      }).then(res => {
        console.log(res)
        that.setData({
          alist: res.result.data[0].myCollections,
          goodList: res.result.data[0].myLikes,
        })
        var collections = []
        for (var i = 0; i < that.data.alist.length; i++) {
          var Id = that.data.alist[i]
          wx.cloud.callFunction({
            name: "getbyid",
            data: {
              id: Id
            }
          }).then(res => {
            collections.push(res.result.data[0])
            that.setData({
              datalist1: collections
            })
            if (that.data.check_button == 1) {
              that.setData({
                list: that.data.datalist1
              })
            }
            if (that.data.height1 < 500 && that.data.datalist1.length * 160 < 500) {
              that.setData({
                height: 500
              })
            } else {
              if (that.data.height1 > that.data.datalist1.length * 160) {
                that.setData({
                  height: that.data.height1
                })
              } else {
                that.setData({
                  height: that.data.datalist1.length * 160
                })
              }
            }

          })
        }
        that.setData({
          datalist1: collections
        })
        if (that.data.check_button == 1) {
          that.setData({
            list: that.data.datalist1
          })
        }


      })
    })

  },

  getaList: function () {
    wx.cloud.callFunction({
      name: "getalist",
      data: {
        openid: this.data.openid
      }
    }).then(res => {

      var newData = []
      for (var i = 0; i < res.result.data.length; i++) {
        newData[i] = res.result.data[i].myCollections
      }

      this.setData({
        alist: newData,
      })

      this.getbyid()
    })
  },

  getbyid: async function () {
    for (var i = 0; i < this.data.alist.length; i++) {
      for (var j = 0; j < this.data.alist[i].length; j++) {
        var Id = this.data.alist[i][j]

        wx.cloud.callFunction({
          name: "getbyid",
          data: {
            id: Id
          }
        }).then(res => {
          this.setData({
            datalist1: this.data.datalist1.concat(res.result.data)

          })


        })
      }
    }
    await this.sleep(2000);
    if (this.data.height1 > this.data.datalist1.length * 160) {
      this.setData({
        height: this.data.height1
      })
    } else {
      this.setData({
        height: this.data.datalist1.length * 100
      })
    }
  },

  onChange(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
  },



  handleClick: async function () {
    wx.cloud.callFunction({
      name: 'getOpenid'
    }).then(res => {
      this.setData({
        openid: res.result.openid
      })
      this.getdataList()
    })

    await this.sleep(3000)

  },
  loginRefresh: async function() {
    var that = this
    wx.cloud.callFunction({
      name: 'getOpenid'
    }).then(res => {
      this.setData({
        openid: res.result.openid
      })
      this.getdataList()
    })

    await this.sleep(3000)
    //当前在我的发布页面
    if (that.data.check_button == 0) {
      this.setData({
        temp1: 0
      })
      console.log(this.data.datalist)
      if (this.data.datalist == 0) {
        this.setData({
          temp: 1
        })
      } else {
        this.setData({
          temp: 0
        })
      }

    } else {
      //当前在我的收藏页面
      this.setData({
        temp: 0
      })
      if (this.data.alist == 0) {
        this.setData({
          temp1: 1
        })
      } else {
        this.setData({
          temp1: 0
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    var that = this
    if (!wx.getStorageSync('isLogin')) {
      wx.getUserInfo({
        success: res => {
          that.setData({
            avatar: res.userInfo.avatarUrl,
            nickName: "请点击头像进行登录",

          })
        }
      })
    } else {
      this.loginRefresh()
    
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(open => {
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: open.result.openid
          }
        }).then(userInfo => {
          var avatar = userInfo.result.data[0].avatar
          var nickName = userInfo.result.data[0].nickName

          that.setData({
            avatar: avatar,
            nickName: nickName,
            tar: false
          })

        })
      })
    }

  },

  onPullDownRefresh: function () {
    this.setData({
      datalist: []
    })
    this.getdataList(4, 0, this.data.openid)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})