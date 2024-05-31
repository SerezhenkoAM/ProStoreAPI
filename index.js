import express from 'express'
import telegram from 'node-telegram-bot-api'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const app = express();

dotenv.config()
app.use(bodyParser.json())
app.use(cors())

const TelegramBot = telegram
const port = process.env.port
const token = process.env.tg;
const bot = new TelegramBot(token, {polling: true});

const connection = await mysql.createConnection({
  port: process.env.portdb,
  user: process.env.user,
  host: process.env.host,
  database: process.env.db,
  password: process.env.pass
});

bot.on('message', async (msg) => {
  const mess = msg.text
  const chatId = msg.chat.id;
  if (mess == '/start') {
    await bot.sendMessage(chatId, 'Узнать статус заказ 👇', {reply_markup: {inline_keyboard: [[{text: 'Открыть', web_app: {url: process.env.web_url}}]]}});
  }

});

app.post('/auth', async (req,res) => {
  const sql =  `select idEmployee from employee inner join entry on idEntry = entry where login = ${req.body.login} and password = ${req.body.password}`
  try {
    const [result] = await connection.query(sql);
    if (result.length != 0) {
      res.json({ idEmployee: result[0].idEmployee, auth: true})
    } else {
      res.json({auth: false})
    }
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.post('/contracts', async (req,res) => {
  const sql =  `select * from contract inner join good on good.idGood = contract.idGoods inner join employee on contract.idEmployee = employee.idEmployee inner join provider on provider.idProvider = contract.idProvider where employee.idEmployee = ${req.body.idEmployee} and contract.status != 3`
  try {
    const [result] = await connection.query(sql);
    if (result.length != 0) {
      res.send(result)
    } else {
      res.json({request: false})
    }
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})

app.post('/complete_contract', async (req,res) => {
  const sql =  `Update contract set status = 3 where idContract = ${req.body.idContract}`
  try {
    const [result] = await connection.query(sql);
    console.log(result)
    if (result.length != 0) {
      res.json({request: 'success'})
    } else {
      res.json({request: 'error'})
    }
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
  }
})



// app.post('/status_mess', async (req, res) => {
//   await bot.sendMessage(req.body.chatid, `Статус вашего заказа <b>${req.body.brand} ${req.body.model}</b> обновлен на <b>${req.body.status.toLowerCase()}</b>! Проверьте приложение`, {parse_mode: "HTML"})
//     .then(() => {
//       res.status(200)
//     })
//     .catch(error => {
//       console.table(error)
//       res.status(400)
//     })
// })

// app.post('/complete_contract', async (req, res) => {
//   await bot.sendMessage(req.body.chatid, `Статус вашего заказа <b>${req.body.brand} ${req.body.model}</b> обновлен на <b>${req.body.status.toLowerCase()}</b>! Проверьте приложение`, {parse_mode: "HTML"})
//     .then(() => {
//       res.status(200)
//     })
//     .catch(error => {
//       console.table(error)
//       res.status(400)
//     })
// })

// Для теста без выгрузки на сервер



// const auth = async (username) => {
//   const sql = `Select idClient from Client where telegram = "${username}"`
//   try {
//     const [result] = await connection.query(sql);
//     return result.length > 0 ?  true : false
//   } catch (err) {
//     console.table(err)
//     return false
//   }
// }

// const update_chatid = async (chatid, username) => {
//   const sql =  `update Client set telegram_chatid = "${chatid}" where telegram = "${username}"`
//   try {
//     const [result] = await connection.query(sql);
//     return true
//   } catch (err) {
//     console.table(err)
//     return false
//   }
// }

app.listen(port, () => {
  console.log(`Server start working on port: ${port}`)
})