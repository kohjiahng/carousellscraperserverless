/* Handler to edit "Bot is thinking..." message */

const axios = require('axios')
exports.globalHandler = async (event, action) => {
  /*
   * Retrieves body from SNS event, then passes it to the action function
   * Edits the message identified by body.application_id and body.token to the output of action
  */

  const body = JSON.parse(event.Records[0].Sns.Message)
  const response = await action(body)
  console.log(`https://discord.com/api/v10/webhooks/${body.application_id}/${body.token}/messages/@original`,)
  axios.patch(`https://discord.com/api/v10/webhooks/${body.application_id}/${body.token}/messages/@original`, response)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
}