const { globalHandler } = require('../handlerpackage')
const AWS = require("aws-sdk")

const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" })
const action = async (body) => {
  channel_id = body.channel_id
  target_url = "https://www.carousell.sg/categories/cameras-1863/?cameras_type=TYPE_POINT_AND_SHOOT%2CTYPE_DSLR%2CTYPE_MIRRORLESS&searchId=kkZNPc&canChangeKeyword=false&price_end=250&includeSuggestions=false&sort_by=3"

  const params = {
    TableName: process.env.TABLE_ARN,
    Key: {
      channel_id: { S: channel_id }
    }
  }

  getPromise = new Promise((resolve, reject) => {
    dynamodb.getItem(params, (err, data) => {
      if (data) {
        console.log(data)
        resolve(data);
      } else { reject(err) }
    })
  })

  getPromise = getPromise.then((response) => {
    if (response.Item) {
      return { "content": "Bot is running!" }
    } else {
      return { "content": "Bot is not running!" }
    }
  }).catch((err) => {
    console.log(err)
    return { "content": "Something went wrong :(" }
  })

  return await getPromise
}
exports.handler = (event) => {
  globalHandler(event, action);
}