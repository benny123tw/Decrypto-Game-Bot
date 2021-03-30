# [Decrypto] Decrypto解碼遊戲
## Decrypto - Discord Game Bot with Node.js
Playing decrypto board game on discord!

**All the system is based on [Decrypto Game Rules](https://www.gokids.com.tw/tsaiss/gokids/rules/DECRYPTO_EN_RULES_09nov2017.pdf "game rules").**

## To Do
- [x] Automatic create 2 text channels and 2 roles for game.
- [x] Normal and random grouping.
- [x] Embed keywords and pin it.
- [x] Sending answer will automatic add reaction on it. (Correct :white_check_mark: or Incorrect :x:)
- [x] Design the game system based on original [Game Rules](https://www.gokids.com.tw/tsaiss/gokids/rules/DECRYPTO_EN_RULES_09nov2017.pdf "game rules").
- [x] Scalable keywords (insert, view, edit, delete)
- [x] Assign encrypter to palyer every round.
	- [x] ~~random with repeat~~
	- [x] random with no repeat (loop)
- [x] Encrypter sending their descriptions to bot(PM) will store the descriptions data and passing to both game text channels.
    - [x] DM execute commands (DM commands handler)
- [x] Check if encrypter's description is repeat.
- [x] history commands list all descriptions.
- [ ] Create 3 voice channel. 1 for players who are join. 2 for team.
- [ ] Anti-cheat(Current encrypter not allow to tpye anything).
	- [x] If encrypter type any words it will reset the codes and sending message to both game channels "@username cheating".
	- [ ] Current encrypter will add temp muted role. that means can't type and speak in their team channels.
- [ ] DM Help center.
    - [x] sending cusotm DM to user with bot (id, content).
    - [ ] navigation guide.
- [x] Carrer
- [ ] Economic system.
	- [x] Bank system (deposite and draw money)
	- [x] Player balance
	- [ ] Bet

## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account
- [MongoDB](https://www.mongodb.com/) account and SRV
- 4~8 players at least (current version doesn't support 3 players)

## Installation Steps

0. Register new bot with Discord Developer Portal 
1. Clone repo
2. Run `npm install`
3. Add Discord Bot credentials in a `.env` file
3. Run `npm start` or `node index.js`
4. Interact with your Discord bot via text messages on Discord

### .env file template
```
TOKEN_[BOT_TAG]=your-bot-token
MONGODB_SRV=your-mongoDB-cluster
```

## License
This software is published under the MIT license
