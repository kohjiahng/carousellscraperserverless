require('dotenv').config()
const axios = require('axios').default;

let url = `https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`

const headers = {
  "Authorization": `Bot ${process.env.BOT_TOKEN}`,
  "Content-Type": "application/json"
}

let commands = [
  {
    "name": "start",
    "type": 1,
    "description": "Starts the scraper",
  },
  {
    "name": "status",
    "type": 1,
    "description": "Checks if the scraper is running"
  },
  {
    "name": "stop",
    "type": 1,
    "description": "Stops the scraper"
  }
]
commands.forEach(async (command_data) => {
  axios.post(url, JSON.stringify(command_data), {
    headers: headers,
  }).then(
    response => console.log(`Registered ${command_data.name}!`)
  ).catch(
    err => console.log(err)
  )
})