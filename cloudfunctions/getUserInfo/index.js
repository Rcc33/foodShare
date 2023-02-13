// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var openid = event.openid
  return await db.collection("user").where({
    _openid: openid
  }).get()
}