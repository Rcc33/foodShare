// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  db.collection('note').doc(event.id).remove({
    success(res){
      console.log("成功删除")
    },
    fail(res){
      console.log("删除失败")
    }
  })

}