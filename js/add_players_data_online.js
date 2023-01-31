//note = pour simplifier la chose => creer un tableau avec tout les ip qui doivent etre dans le graphique
const sqlite3 = require('sqlite3')
const fetch = require('node-fetch');
const { text } = require('express');

let db = new sqlite3.Database('players_online.sqlite', err => {
  if (err) throw err
  console.log('data base "player_online.sqlite" bien active')
})

async function add_serveur_api(name,ip,couleur){
  await db.run('CREATE TABLE IF NOT EXISTS serveur_api(name VARCHAR, ip VARCHAR,couleur VARCHAR)')
  db.all('SELECT * FROM serveur_api', async (err, data) => {
    validator = 0
    for (let i = 0; i < data.length; i++) {
      if(data[i].ip === ip) {
        console.log("Cette ip est déjà en place dans l'api")
        validator = 1
      }
    }
    if(validator==0){
      db.run('INSERT INTO serveur_api(name,ip,couleur) VALUES(?,?,?)', [name, ip,couleur]);
      db.run('CREATE TABLE IF NOT EXISTS ' + name + '_players_online(hour VARCHAR, players BLOB)')
      db.all('SELECT * FROM serveur_api', async (err, data) => {
      })
    }
    else {
      return 0
    }
  })
}
add_serveur_api("plutonium","mcpe.plutonium.best"," #9d8692")
add_serveur_api("histeria","play.histeria.fr","#1E90FF")

getdata_ip()
async function getdata_ip(){
  let heure = new Date().getMinutes();
  if (heure % 5 === 0) {
    db.all('SELECT * FROM serveur_api', async (err, data) => {
      for (let i = 0; i < data.length; i++) {
        await add_players_data(data[i].name,data[i].ip)
      }
    })
    setInterval(() => {
      db.all('SELECT * FROM serveur_api', async (err, data) => {
        for (let i = 0; i < data.length; i++) {
          await add_players_data(data[i].name,data[i].ip)
        }
      })
    }, 300000);
  } else {
    setTimeout(getdata_ip,30000)
  }
}


async function add_players_data(name,ip){
  try {
    await fetch(
        `https://api.mcstatus.io/v2/status/bedrock/` + ip)
        .then(res => res.json())
        .then( async (text) => {
          db.run('INSERT INTO ' + name + '_players_online(hour,players) VALUES(?,?)', [ await getDateFormatted(), text.players.online]);
          db.all('SELECT * FROM ' + name + '_players_online', (err, data) => {
            if (err)
              throw err
          })
        })
  }catch{
    console.log(err)
  }
}

function getDateFormatted() {
  var now = new Date();
  var hour = (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
  var minutes = (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes())
  return hour + ":" + minutes;
}