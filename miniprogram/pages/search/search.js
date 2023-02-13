Page({

  /**
   * 页面的初始数据
   */
  data: {
    noteList: [],
    // 模糊查询时长
    timer: 0,
    // 点击结果项之后替换到文本框的值
    inputValue: '',
    // 是否隐藏模糊查询的面板
    hideScroll: true,
    // 历史查询记录
    historySearch: wx.getStorageSync('historySearch') || [],
    // 模糊查询结果
    searchTip: [],
    hideHistory: false,
    goodList: [],
    collectionList: [],
    user_id: '',
    uid: '',
    hasNotes: true
  },

  getInf(str, key) {
    return str
      .replace(new RegExp(`${key}`, 'g'), `%%${key}%%`)
      .split('%%')
      .filter(item => {
        if (item) {
          return true
        }
        return false
      })
  },
  onInput(e) {
    var that = this
    const inputValue = e.detail.value
    clearTimeout(that.data.timer)
    let timer = setTimeout(() => {
      if (inputValue) {
        wx.request({
          url: 'https://home.meishichina.com/ajax/ajax.php?ac=commondata&op=searchTips&q=' + inputValue + '',
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            // success 
            var tips = new Array()
            const rTips = res.data.data
            for (var i = 0; i < rTips.length; i++) {
              tips.push(rTips[i])
            }
            if (tips.indexOf('[') != -1) {
              tips.splice(tips.indexOf('['), 1)
            }
            if (tips.indexOf(']') != -1) {
              tips.splice(tips.indexOf(']'), 1)
            }
            if (tips.length != 0) {
              if (tips.indexOf(inputValue) == -1) {
                tips.unshift(inputValue)
              }
            } else {
              tips.push(inputValue)
            }
            const newTips = tips.map(item => {
              const tip = item
              const newTip = that.getInf(tip, inputValue)
              return newTip
            })
            that.setData({
              inputValue: inputValue,
              searchTip: newTips,
              hideScroll: false
            })
            return
          }
        })
      }
      // 如果为空，则收起
      that.setData({
        searchTip: [],
        hideScroll: true,
        inputValue: ''
      })
    }, 600)

    that.data.timer = timer
  },

  tapSearchBar: function () {
    var that = this
    var inputValue = that.data.inputValue
    if (inputValue) {
      wx.request({
        url: 'https://home.meishichina.com/ajax/ajax.php?ac=commondata&op=searchTips&q=' + inputValue + '',
        data: {},
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          // success 
          var tips = new Array()
          const rTips = res.data.data
          for (var i = 0; i < rTips.length; i++) {
            tips.push(rTips[i])
          }
          if (tips.indexOf('[') != -1) {
            tips.splice(tips.indexOf('['), 1)
          }
          if (tips.indexOf(']') != -1) {
            tips.splice(tips.indexOf(']'), 1)
          }
          if (tips.length != 0) {
            if (tips.indexOf(inputValue) == -1) {
              tips.unshift(inputValue)
            }
          } else {
            tips.push(inputValue)
          }
          const newTips = tips.map(item => {
            const tip = item
            const newTip = that.getInf(tip, inputValue)
            return newTip
          })
          that.setData({
            noteList: [],
            hideScroll: false,
            searchTip: newTips
          })
          return
        }
      })
    }
  },


  goodUp: function (e) {
    var noteid = e.currentTarget.dataset['noteid']
    var that = this

    if (wx.getStorageSync('isLogin')) {
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        that.setData({
          user_id: res.result.openid
        })
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: res.result.openid
          }
        }).then(res => {
          that.setData({
            uid: res.result.data[0]._id,
            goodList: res.result.data[0].myLikes,
            collectionList: res.result.data[0].myCollections
          })
          console.log("goodList_before:" + that.data.goodList)
          wx.cloud.callFunction({
            name: "upGoodNum",
            data: {
              note_id: noteid,
              user_id: that.data.uid,
              goodlist: that.data.goodList
            },
            success(res) {
              var temp = that.data.goodList
              temp.push(noteid)
              that.setData({
                goodList: temp
              })
              console.log("更改成功！", res)
              wx.cloud.callFunction({
                name: "updateSearchNote",
                data: {
                  num: that.data.noteList.length,
                  keyword: that.data.inputValue,
                  city: that.data.city
                }
              }).then(res => {
                that.setData({
                  noteList: res.result.data
                })
                console.log(that.data.noteList)
              })
            },
            fail(res) {
              console.log("更改失败！", res)
            }
          })
        })
      })
    } else {
      wx.showModal({
        title: '点赞',
        content: '请到个人中心登录，登录后方可进行操作',
        showCancel: true, //是否显示取消按钮
        confirmText: "去登录", //默认是“确定”
        success: function (res) {
          if (res.cancel) {
            //点击取消,默认隐藏弹框
          } else {
            //点击确定
            wx.switchTab({
              url: '/pages/me/me'
            })
            wx.cloud.callFunction({
              name: "getUserInfo",
              data: {
                openid: res.result.openid
              }
            }).then(res => {
              that.setData({
                goodList: res.result.data[0].myLikes,
                collectionList: res.result.data[0].myCollections
              })
            })
          }
        },
        fail: function (res) {}, //接口调用失败的回调函数
        complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
      })
    }
  },

  goodDown: function (e) {
    var noteid = e.currentTarget.dataset['noteid']
    var that = this

    if (wx.getStorageSync('isLogin')) {
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        that.setData({
          user_id: res.result.openid
        })
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: res.result.openid
          }
        }).then(res => {
          that.setData({
            uid: res.result.data[0]._id,
            goodList: res.result.data[0].myLikes,
            collectionList: res.result.data[0].myCollections
          })
          console.log("goodList_before:" + that.data.goodList)
          wx.cloud.callFunction({
            name: "downGoodNum",
            data: {
              note_id: noteid,
              user_id: that.data.uid,
              goodlist: that.data.goodList,
            },
            success(res) {
              var temp = that.data.goodList
              console.log(temp)
              console.log(noteid)
              temp.splice(temp.findIndex(function (d) {
                return d == noteid;
              }), 1)
              console.log(temp)
              that.setData({
                goodList: temp
              })
              console.log("更改成功！", res)
              wx.cloud.callFunction({
                name: "updateSearchNote",
                data: {
                  num: that.data.noteList.length,
                  keyword: that.data.inputValue,
                  city: that.data.city
                }
              }).then(res => {
                that.setData({
                  noteList: res.result.data
                })
                console.log(that.data.noteList)
              })
            },
            fail(res) {
              console.log("更改失败！", res)
            }
          })
        })
      })
    } else {
      wx.showModal({
        title: '取消点赞',
        content: '请到个人中心登录，登录后方可进行操作',
        showCancel: true, //是否显示取消按钮
        confirmText: "去登录", //默认是“确定”
        success: function (res) {
          if (res.cancel) {
            //点击取消,默认隐藏弹框
          } else {
            //点击确定
            wx.switchTab({
              url: '/pages/me/me'
            })
          }
        },
        fail: function (res) {}, //接口调用失败的回调函数
        complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
      })
    }
  },

  collectionUp: function (e) {
    var noteid = e.currentTarget.dataset['noteid']
    var that = this
    if (wx.getStorageSync('isLogin')) {
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        that.setData({
          user_id: res.result.openid
        })
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: res.result.openid
          }
        }).then(res => {
          that.setData({
            uid: res.result.data[0]._id,
            goodList: res.result.data[0].myLikes,
            collectionList: res.result.data[0].myCollections
          })
          console.log("colList_before:" + that.data.collectionList)
          wx.cloud.callFunction({
            name: "upColNum",
            data: {
              note_id: noteid,
              user_id: that.data.uid,
              collist: that.data.collectionList
            },
            success(res) {
              var temp = that.data.collectionList
              temp.push(noteid)
              that.setData({
                collectionList: temp
              })
              console.log("更改成功！", res)
              wx.cloud.callFunction({
                name: "updateSearchNote",
                data: {
                  keyword: that.data.inputValue,
                  num: that.data.noteList.length,
                  city: that.data.city
                }
              }).then(res => {
                that.setData({
                  noteList: res.result.data
                })
                console.log(that.data.noteList)
              })
            },
            fail(res) {
              console.log("更改失败！", res)
            }
          })
        })
      })
    } else {
      wx.showModal({
        title: '收藏',
        content: '请到个人中心登录，登录后方可进行操作',
        showCancel: true, //是否显示取消按钮
        confirmText: "去登录", //默认是“确定”
        success: function (res) {
          if (res.cancel) {
            //点击取消,默认隐藏弹框
          } else {
            //点击确定
            wx.switchTab({
              url: '/pages/me/me'
            })
          }
        },
        fail: function (res) {}, //接口调用失败的回调函数
        complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
      })
    }
  },

  collectionDown: function (e) {
    var noteid = e.currentTarget.dataset['noteid']
    var that = this

    if (wx.getStorageSync('isLogin')) {
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        that.setData({
          user_id: res.result.openid
        })
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: res.result.openid
          }
        }).then(res => {
          that.setData({
            uid: res.result.data[0]._id,
            goodList: res.result.data[0].myLikes,
            collectionList: res.result.data[0].myCollections
          })
          console.log("colList_before:" + that.data.collectionList)
          wx.cloud.callFunction({
            name: "downColNum",
            data: {
              note_id: noteid,
              user_id: that.data.uid,
              collectionList: that.data.collectionList,
            },
            success(res) {
              var temp = that.data.collectionList
              console.log(temp)
              console.log(noteid)
              temp.splice(temp.findIndex(function (d) {
                return d == noteid;
              }), 1)
              console.log(temp)
              that.setData({
                collectionList: temp
              })
              console.log("更改成功！", res)
              wx.cloud.callFunction({
                name: "updateSearchNote",
                data: {
                  keyword: that.data.inputValue,
                  num: that.data.noteList.length,
                  city: that.data.city
                }
              }).then(res => {
                that.setData({
                  noteList: res.result.data
                })
                console.log(that.data.noteList)
              })
            },
            fail(res) {
              console.log("更改失败！", res)
            }
          })
        })
      })
    } else {
      wx.showModal({
        title: '取消收藏',
        content: '请到个人中心登录，登录后方可进行操作',
        showCancel: true, //是否显示取消按钮
        confirmText: "去登录", //默认是“确定”
        success: function (res) {
          if (res.cancel) {
            //点击取消,默认隐藏弹框
          } else {
            //点击确定
            wx.switchTab({
              url: '/pages/me/me'
            })
          }
        },
        fail: function (res) {}, //接口调用失败的回调函数
        complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
      })
    }
  },


  itemtap(e) {
    const {
      info
    } = e.currentTarget.dataset
    this.setData({
      // 将点击选择的值展示在input框中
      inputValue: info.join(''),
      // 当用户选择某个联想词，隐藏下拉列表
      hideScroll: true
    })
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    this.addHistorySearch(this.data.inputValue)
    // 发起请求，获取查询结果
    this.searchByKeyWord(this.data.inputValue, 6, 0, this.data.city)
    
  },
  searchByKeyWord(info, num = 6, page = 0, city) {
    wx.cloud.callFunction({
      name: "searchNotes",
      data: {
        keyword: info,
        num: num,
        page: page,
        city: city
      }
    }).then(res => {
      var resArr = res.result.data
      if(resArr.length != 0) {
        this.setData({
          hasNotes: true
        })
      } else {
        this.setData({
          hasNotes: false
        })
      }
      var oldData = this.data.noteList
      var newData = oldData.concat(res.result.data)
      this.setData({
        noteList: newData
      })
    })
  },
  addHistorySearch(value) {
    const historySearch = wx.getStorageSync('historySearch') || []

    // 是否有重复的历史记录
    let has = false
    for (let history of historySearch) {
      const content = history
      if (value === content) {
        has = true
        break
      }
    }
    if (has) {
      return
    }
    const len = historySearch.length
    if (len >= 16) {
      historySearch.pop()
    }
    historySearch.unshift(value)
    wx.setStorage({
      key: 'historySearch',
      data: historySearch,
      success: () => {
        this.setData({
          historySearch: historySearch
        })
      }
    })
  },

  checkNote: function (e) {
    var id = e.currentTarget.dataset["id"];
    console.log(id);
    wx.navigateTo({
      url: '../viewnote/viewnote?id=' + id,
    })
  },

  search: function (e) {

  },
  searchHistory: function (e) {
    // this.setData({
    //   hideHistory: true
    // })
    const info = e.currentTarget.dataset
    this.setData({
      inputValue: info.info
    })
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
    this.searchByKeyWord(this.data.inputValue, 6, 0, this.data.city)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      historySearch: wx.getStorageSync('historySearch'),
      city: wx.getStorageSync('city')
    })
    var that = this
    if (wx.getStorageSync('isLogin')) {
      wx.cloud.callFunction({
        name: "getOpenid"
      }).then(res => {
        that.setData({
          user_id: res.result.openid
        })
        wx.cloud.callFunction({
          name: "getUserInfo",
          data: {
            openid: res.result.openid
          }
        }).then(res => {
          that.setData({
            uid: res.result.data[0]._id,
            goodList: res.result.data[0].myLikes,
            collectionList: res.result.data[0].myCollections
          })
          console.log(that.data.inputValue)
          if (that.data.inputValue) {
            wx.cloud.callFunction({
              name: "updateSearchNote",
              data: {
                keyword: that.data.inputValue,
                num: that.data.noteList.length,
                city: that.data.city
              }
            }).then(res => {
              that.setData({
                noteList: res.result.data
              })
              console.log(that.data.noteList)
            })
          }
        })
      })
    }
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
    if (this.data.hideHistory && this.data.hideScroll) {
      var page = this.data.noteList.length
      this.searchByKeyWord(this.data.inputValue, 6, page, this.data.city)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})