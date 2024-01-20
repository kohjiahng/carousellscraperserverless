import axios from 'axios'
exports.globalHandler = async (event, action) => {
  /*
   * Should be changed to respond differently depending on interaction type.
   * Now it only edits "Loading..." message, therefore only answers to
   * text interactions.
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