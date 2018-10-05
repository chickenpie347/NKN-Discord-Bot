// Load up the discord.js library
const Discord = require("discord.js");
const axios = require("axios");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

//child process for NKN
var exec = require('child_process').exec, child;
var fs = require('fs');
var nknify = "";

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  if(message.guild !== null) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Let's go with a few common example commands! Feel free to delete or change those.
  
 if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if(command === "botstats") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
message.channel.send("Just got back from the break. HAL 9000 was fun. Everything is perfectly alright! Shoot your questions!");
    }

  if(command === "help") {
    message.channel.send(`+health: network status
+block: current block count of seed node
+balance <wallet address>: check wallet balance 
+tx <hash>: check a transfer with txhash
+nodes: all the nodes on the network
+nodev <ip>: check node version 
+nodestats: stats of seed node
+nodestats i: detailed stats of seed node
+nodestats <ip>: stats of node by IP 
+nodestats <ip> i: detailed stats of node by IP
+multistats <ip>,<ip1>,<ip2>,...: check status of multiple nodes (please use in PM only)
+multiblocks <ip>,<ip1>,<ip2>,...: check block height of multiple nodes (please use in PM only)`);
  }

          if(command === "tx") {
          if(args[0]){
              console.log(`arg: ${args[0]}`);
                exec(`nkn/./nknc --port 30003 info -t ${args[0]}`, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);

              if(stdout){
                var obj = JSON.parse(stdout);
                if(obj['error']){
                  var msg = `:warning: ${obj['error']['message']}`;
                   message.channel.send(msg);
                }

              else {
                if(obj['result']['outputs'][1])
                {
                var msg = `${obj['result']['outputs'][1]['address']} --> ${obj['result']['outputs'][0]['address']}
Amount: ${obj['result']['outputs'][0]['value']} NKN :moneybag:`;
 message.channel.send(msg);
                  }
                else if(obj['result']['outputs'][0]['address']){
                  var sendertx =  obj['result']['inputs'][0]['referTxID'];
                  var rec = obj['result']['outputs'][0]['address'];
                  var nkn = obj['result']['outputs'][0]['value'];

                        exec(`nkn/./nknc --port 30003 info -t ${sendertx}`, (error, stdout, stderr) => {
                        if (error) {
                          console.error(`exec error: ${error}`);
                          return;
                        }
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);
                        if(stdout){
                          var obj= JSON.parse(stdout);
                          if(obj['result']['outputs'][0]['address']){
                            var msg = `${obj['result']['outputs'][0]['address']} --> ${rec}
Amount: ${nkn} NKN :moneybag:`;
 message.channel.send(msg);
                          }

                        }
                      });




                  }
                }
                }
              });    
          }
          else{
              console.log(`noarg`);
              message.channel.send(`Tx Hash Invalid. Gr8 bait m8!`);
          }
  }

      if(command === "nodev") {
      var c = `nkn/./nknc --ip testnet-node-0001.nkn.org --port 30003 info -v`;
      if(args[0]){
      let ip = args[0];
      console.log(ip);
      c = `nkn/./nknc --ip ${ip} --port 30003 info -v`;
    }
    exec(c, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      message.channel.send("Unable to connect. Please try again later.");
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    //parse
    if(stdout){
        var obj = JSON.parse(stdout);
        var msg = `Version: ${obj['result']}`;
    message.channel.send(msg);
  }

  if(stderr){
            message.channel.send("Error!");
          }

          });

            exec(d, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          //parse
          if(stdout){
          var cblock = JSON.parse(stdout);
          var msg = `Current Block: ${cblock['result']}`;
          message.channel.send(msg);
        }
              // And we get the bot to say the thing: 

          });

          }

  if(command === "amirichyet?") {
    message.channel.send(`No, you're still a PLEB!`);
  }


  if(command === "tokenomics") {
axios({
  method: 'get',
  url: 'https://api.coinmarketcap.com/v2/ticker/2780/',
  responseType: 'json'
})
  .then(function(response) {
  console.log(response.data.data.rank);
  message.channel.send(`CMC Rank: ${response.data.data.rank}
Circulating Supply: ${response.data.data.circulating_supply}
Total Supply: ${response.data.data.total_supply}
Max Possible Supply: ${response.data.data.max_supply}`);
});
  }

    if(command === "marketstats") {
axios({
  method: 'get',
  url: 'https://api.coinmarketcap.com/v2/ticker/2780/',
  responseType: 'json'
})
  .then(function(response) {
  console.log(response.data.data.rank);
  message.channel.send(`Price: $${response.data.data.quotes.USD.price.toFixed(3)}
Marketcap: $${response.data.data.quotes.USD.market_cap}
Volume (24h): $${response.data.data.quotes.USD.volume_24h.toFixed(2)}
% Change (24h): ${response.data.data.quotes.USD.percent_change_24h}`);

});
  }
  
  if(command === "nknify") {
    if(args[0]&&args[0]!=="nknify"){
    message.channel.send(`Result: \`New Kind of ${args[0]}\``);
    nknify = `New Kind of ${args[0]}`;
    }
    if(args[0]=="nknify"){
    message.channel.send(`Result: \`New Kind of ${nknify}\``);
    nknify = `New Kind of ${nknify}`;
    }
  }

  if(command === "block") {
  	exec('nkn/./nknc --ip testnet-node-0001.nkn.org --port 30003 info -c', (error, stdout, stderr) => {
     if (error) {
       console.error(`exec error: ${error}`);
       message.channel.send("Unable to connect. Please try again later. Go grab a coffee or something!");
       return;
     }
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
	  //parse
	  if(stdout){
     var obj = JSON.parse(stdout);
     message.channel.send(`Current Block: ${obj['result']}`);
	      // And we get the bot to say the thing: 
      }
    });
  }

   if(command === "balance") {
      if(args[0]!=="NYwTVKqFwDGedRFEBDSTzYEN6z3cskRICH"){
        var wallet = args[0];
              axios.post("http://testnet-node-0001.nkn.org:30003",{"jsonrpc": "2.0","method": "getunspendoutput","params": { "address": wallet , "assetid": "4945ca009174097e6614d306b66e1f9cb1fce586cb857729be9e1c5cc04c9c02"},"id": "1"}).then(function(response){
                  
                  if (response.data.result){
                  console.log("Your Wallet balance is "+ response.data.result.length*10 +".");
                  message.channel.send(`Your balance is: ${response.data.result.length*10} NKN :moneybag:`);
                }
                else {
                  message.channel.send(`Sorry, you don't have any tokens yet. Keep mining and check back later! :money_mouth: `);
                }
                }).catch(function(error) {
                  console.log(error);
              });
          }
          if(args[0]=="NYwTVKqFwDGedRFEBDSTzYEN6z3cskRICH"){
             message.channel.send(`Your balance is: 1,500,430 NKN :moneybag:`);
          }
       }

          if(command === "balanceusd") {
      if(args[0]!=="NYwTVKqFwDGedRFEBDSTzYEN6z3cskRICH"){
        var wallet = args[0];
              axios.post("http://testnet-node-0001.nkn.org:30003",{"jsonrpc": "2.0","method": "getunspendoutput","params": { "address": wallet , "assetid": "4945ca009174097e6614d306b66e1f9cb1fce586cb857729be9e1c5cc04c9c02"},"id": "1"}).then(function(response){
                  
                  if (response.data.result){
                    var bal = response.data.result.length*10;
                                                    axios({
                                method: 'get',
                                url: 'https://api.coinmarketcap.com/v2/ticker/2780/',
                                responseType: 'json'
                              })
                                .then(function(response) {
                                message.channel.send(`Balance: $${response.data.data.quotes.USD.price.toFixed(3)*bal/5} :dollar: 
_*Speculative balance calculated at 5:1 testnet:mainnet ratio, at current market prices. Not to be used to plan your finances, since there is no guarantee you can actually redeem shown balance._`);
                              });
                }
                else {
                  message.channel.send(`Sorry, you don't have any tokens yet. Keep mining and check back later! :money_mouth: `);
                }
                }).catch(function(error) {
                  console.log(error);
              });
          }
          if(args[0]=="NYwTVKqFwDGedRFEBDSTzYEN6z3cskRICH"){
             message.channel.send(`Your balance is: 1,500,430 NKN :moneybag:`);
          }
       }

  if(command === "health") {
    var seed=0;
    var node=0;
  	exec('nkn/./nknc --ip testnet-node-0001.nkn.org --port 30003 info -c', (error, stdout, stderr) => {
     if (error) {
       console.error(`exec error: ${error}`);
       return;
     }
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
     if(stderr){
      message.channel.send(`:red_circle: Seed node is down.`);
    }
	  //parse
	  if(stdout){
      message.channel.send(`:large_blue_circle:  Seed node is up.`);
   }
     });

        exec('nkn/./nknc --ip 138.197.147.97 --port 30003 info -c', (error, stdout, stderr) => {
     if (error) {
       console.error(`exec error: ${error}`);
       return;
     }
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
     if(stderr){
       message.channel.send(`:warning: There may be issues in connecting to the network.`);
    }

    if(stdout){
      message.channel.send(`:zap: Network is currently being tested for bugs and is not open to public.`);
    }
  
     });
  }

  if(command === "nodes") {
  	exec('wc -l < NKNNodeList $(wget http://testnet.nkn.org/node_list/NKNNodeList) && rm NKNNodeList*', (error, stdout, stderr) => {
     if (error) {
       console.error(`exec error: ${error}`);
       message.channel.send("Unable to connect. Please try again later. Go grab a coffee or something!");
       return;
     }
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
	  //parse
	  var msg = `Node Count: ${stdout}`;
   message.channel.send(msg);

	      // And we get the bot to say the thing: 

     });
  }

    /*if(command === "multistats") {
   let ip = args[0];
   var array = ip.split(',');
   var arrayLength = array.length;
      for (var i = 0; i < arrayLength; i++) {
          var c = `nkn/./nknc --ip ${array[i]} --port 30003 info -s`;


         exec(c, (error, stdout, stderr) => {
           if (error) {
             console.error(`exec error: ${error}`);
             message.channel.send("Unable to connect. Please try again later.");
             return;
           }
           console.log(`stdout: ${stdout}`);
           console.log(`stderr: ${stderr}`);
          //parse
          if(stdout){
           var obj = JSON.parse(stdout);
           var msg = `IP: ${obj['result']['Addr']}
      SyncState: ${obj['result']['SyncState']}`;
           message.channel.send(msg);

         }

         if(stderr){
          message.channel.send(`IP: ${array[i]}
      Node not reachable!`);
        }

      });

       }
      }

          if(command === "multifail") {
   let ip = args[0];
   var array = ip.split(',');
   var x ="";
   var arrayLength = array.length;
      for (var i = 0; i < arrayLength; i++) {
        x = array[i].replace(/\s/g, '');
          var c = `nkn/./nknc --ip ${x} --port 30003 info -s`;


         exec(c, (error, stdout, stderr) => {
           if (error) {
             console.error(`exec error: ${error}`);
             message.channel.send("Unable to connect. Please try again later.");
             return;
           }
           console.log(`stdout: ${stdout}`);
           console.log(`stderr: ${stderr}`);
          //parse
          if(stdout){
           var obj = JSON.parse(stdout);
           if(obj['result']['SyncState']=="SyncFinished"){
           var msg = `${obj['result']['Addr']}`;
           message.channel.send(msg);
         }

         }

         if(stderr){
          message.channel.send(`IP: ${x}
      Node not reachable!`);
        }

      });

       }
      }

      if(command === "multiblocks") {
   let ip = args[0];
   var array = ip.split(',');
   var x = "";
   var arrayLength = array.length;
      for (var i = 0; i < arrayLength; i++) {
          x = array[i].replace(/\s/g, '');
          var c = `nkn/./nknc --ip ${x} --port 30003 info -c`;

         exec(c, (error, stdout, stderr) => {
           if (error) {
             console.error(`exec error: ${error}`);
             message.channel.send("Unable to connect. Please try again later.");
             return;
           }
           console.log(`stdout: ${stdout}`);
           console.log(`stderr: ${stderr}`);
          //parse
          if(stdout){
           var cblock = JSON.parse(stdout);
    var msg = `${x}
      Current Block: ${cblock['result']}`;
    message.channel.send(msg);
         }

         if(stderr){
          message.channel.send(`IP: ${x} Node not reachable!`);
        }

      });

       }
      }*/

  if(command === "nodestats") {
   var c = `nkn/./nknc --ip testnet-node-0001.nkn.org --port 30003 info -s`;
   var d = `nkn/./nknc --ip testnet-node-0001.nkn.org --port 30003 info -c`;
   if(args[0]){
     if(args[0]!==`i`){
       let ip = args[0];
       console.log(ip);
       c = `nkn/./nknc --ip ${ip} --port 30003 info -s`;
       d = `nkn/./nknc --ip ${ip} --port 30003 info -c`;
     }
   }
   exec(c, (error, stdout, stderr) => {
     if (error) {
       console.error(`exec error: ${error}`);
       message.channel.send("Unable to connect. Please try again later.");
       return;
     }
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
	  //parse
	  if(stdout){
     var obj = JSON.parse(stdout);
     var msg = `IP: ${obj['result']['Addr']}
SyncState: ${obj['result']['SyncState']}`;

     if(args[1] || args[0]==`i`){
       var msg = `IP: ${obj['result']['Addr']}
SyncState: ${obj['result']['SyncState']}
JSON Port: ${obj['result']['JsonPort']}
Relay: ${obj['result']['Relay']}
Tx Count: ${obj['result']['TxnCnt']}
Rx Txn Count: ${obj['result']['RxTxnCnt']}
ID: ${obj['result']['ID']}
ChordID: ${obj['result']['ChordID']}`;
     }

     message.channel.send(msg);
   }

   if(stderr){
    message.channel.send("Node not reachable!");
  }

});

   exec(d, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  //parse
  if(stdout){
    var cblock = JSON.parse(stdout);
    var msg = `Current Block: ${cblock['result']}`;
    message.channel.send(msg);
  }
      // And we get the bot to say the thing: 

    });



 }
});

client.login(config.token);
