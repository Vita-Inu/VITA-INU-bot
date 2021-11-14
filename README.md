# VITA INU Discord Bot #

Shows circulating supply of VITE INU in status

# Setting Up #

Set values in config.json

{
	"token": "YOUR DISCORD TOKEN",
	"interval" : 10000,
	"prefix": "vinu!",
	"viteNode" : "https://node.vite.net/gvite",
	"tti" : "tti_3340701118e8a54d34b52355",
	"devWallet" : "vite_1b91ee2619368ee27857c8cc544bc72e92436ba8a029b984e9",
	"clientID" : "909129884171903037",
	"permissions" : "2112"
}

Token is the token ID for your discord bot, found in https://discord.com/developers/applications in the Bot section. Go to the relevant bot and look for "Click to Reveal Token" under the Token heading. Click on it to reveal your 60 character Discord token ID. WARNING: DO NOT SHARE THIS TOKEN ID WITH ANYONE AND BE VERY CAREFUL NOT TO REVEAL IT WHEN UPLOADING YOUR GIT REPOSITORY! If someone acquires this token ID they will be able to run code under your bot's name. 
Interval is how often you want your bot to update the circulating supply status in milliseconds. For example 10000 checks circulating supply every 10 seconds.
Prefix is the prefix for your bot's command. The default is vinu! It can be changed with the set_prefix command.
viteNode is the Vite node you want to use to interact with the Vite network. Both https:// and wss:// are supported. 
tti is the token type ID of the token you want to watch. It is specified to tti_3340701118e8a54d34b52355 by default, which is the token id for VITA INU. However, even though the bot was written for VITA INU, it can support any token ID just by changing the tti value.
devWallet is the address for the hot wallet for that particular tti. This value is needed to look up the circulating supply.
clientID is the 18 digit number found under "APPLICATION ID" in https://discord.com/developers/applications 
permissions is the permissions integer that determines what permissions your bot has on the Discord server. clientID and permissions are only used for generating the invite link.

Once config.json is set up to your preference, you are ready to run the bot. Run the bot with $ npm run start:dev or $ node dist/index.js

# Commands: #
vinu!balance [address] - Shows how many VINUs are in specified account
vinu!circulating - Shows circulating supply and percent of tokens in circulation out of total supply
vinu!total - Shows total amount of tokens 
vinu!token [token=VINU] - Shows token information for VINU, or for another token if a tokenID is passed in
vinu!set_prefix [new_prefix] - Changes bot prefix to new prefix
vinu!invite - Generates invite link to invite to another Discord server
vinu!help - Displays help menu
vinu!bork - BORK BORK!!!
