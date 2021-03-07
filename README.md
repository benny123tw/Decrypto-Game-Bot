# [Decrypto] Decrypto解碼遊戲
## Decrypto - Discord Game Bot with Node.js
Playing decrypto on discord!

**All the system is based on [Decrypto Game Rules](https://www.gokids.com.tw/tsaiss/gokids/rules/DECRYPTO_EN_RULES_09nov2017.pdf "game rules").**

## To Do
- [x] Automatic create 2 text channels and 2 roles for game.
- [x] Normal and random grouping.
- [x] Embed keywords and pin it.
- [x] Sending answer will automatic add reaction on it. (Correct :white_check_mark: or Incorrect :x:)
- [x] Design the game system based on original [Game Rules](https://www.gokids.com.tw/tsaiss/gokids/rules/DECRYPTO_EN_RULES_09nov2017.pdf "game rules").
- [ ] Assign encrypter to palyer every round.
- [ ] Anti-cheat(Current encrypter not allow to tpye anything).
	- [x] If encrypter type any words it will reset the codes and sending message to both game channels "someone cheating".
	- [ ] Current encrypter will add temp muted role.
- [x] Carrer
- [ ] Economic system.
	- [x] Bank system (deposite and draw money)
	- [x] Player balance
	- [ ] Bet

## Requirements

- [Node.js](http://nodejs.org/)
- [Discord](https://discordapp.com/) account

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
```

## License
This software is published under the MIT license
