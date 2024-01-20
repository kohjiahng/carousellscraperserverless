import { globalHandler } from 'handler.js'
const action = async (body) => {
  return {
    "content": "Starting bot..."
  }
}
exports.handler = (event) => {
  globalHandler(event, action);
}