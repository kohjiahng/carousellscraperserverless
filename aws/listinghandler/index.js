async function processRecord(record) {
  if (record.eventName != "INSERT") {
    return;
  }
  const item = record.dynamodb.NewImage;
  const listing_id = item.listing_id.S;
  const webhook_url = item.webhook_url.S;
  const channel_id = item.channel_id.S;

  /* TODO: scrape for details of listing_id and create message to send to webhook_url */
}
exports.handler = async (event) => {
  console.log(event.Records[0].dynamodb);
  // await Promise.allSettled(event.Records.map(processRecord));
};
