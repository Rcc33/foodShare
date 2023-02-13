// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var num = event.num
  var page = event.page
  r_data = await db.collection("note").orderBy("time", "desc").limit(num).skip(page).get()
  return r_data
}