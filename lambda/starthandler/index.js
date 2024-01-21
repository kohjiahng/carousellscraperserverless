const { globalHandler } = require('./handler.js')
const action = async (body) => {
  console.log(body)
  return {
    "content": "Starting bot..."
  }
}
exports.handler = (event) => {
  globalHandler(event, action);
}