// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var comment_pr_id= event.comment_pr_id
  var reply_if = event.reply_if
  return await db.collection('comment').where({
    comment_pr_id: comment_pr_id,
    reply_if: reply_if,
  }).orderBy("comment_time", "desc").get()
}