// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    var user_id = event.user_id
    var note_id = event.note_id
    const _ = db.command
    var user_add_id
    var note_add_num
    var temp = event.collectionList
    await temp.splice(temp.findIndex(function (d) {
        return d == note_id;
      }),1)
    user_add_id = await db.collection('user').doc(user_id).update({
        data: {
            myCollections: temp
        }
    })
    note_add_num = await db.collection('note').doc(note_id).update({
        data: {
            collection_num: _.inc(-1)
        }
    })
    return {
        user_add_id: user_add_id,
        note_add_num: note_add_num
    }
}