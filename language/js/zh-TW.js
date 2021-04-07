const language = require('../Language');
const data = require('../json/zh-tw.json');

class zh_TW extends language {
    constructor() {
        super(data);
    }

    _teamParams = (param) =>`無法識別隊伍： \'${param}\'`;
    _languageParam = (param) => `無法識別語言： \'${param}\'`;

    _wrong = (arr = []) => `正確密碼為： **${arr.join(', ')}**`;

    _encrypterRound = (curEncrypterTeam) => `輪到**${curEncrypterTeam}隊加密者**回合!`

    _scoreboardTitle = (totalGames) => `生涯共${totalGames}場遊戲`;

    _encrypterColor = (team) => this.color[team.toLowerCase()];
    _encrypterTitle = (team) => `${team.toUpperCase()}隊的加密者`;
    _encrypterDescription = (player) => `${player}是當前的加密者`;

    _randomFieldsNumber = (number) => `等待${number}位玩家加入`;
    _normalDescription = (blueTeamEmoji, redTeamEmoji) => `\n\n${blueTeamEmoji} 表情代表藍隊\n`
    + `${redTeamEmoji} 表情代表紅隊`;

    _resultBlue = (blueTeamEmoji) => `${blueTeamEmoji} 藍隊`;
    _resultRed = (redTeamEmoji) => `${redTeamEmoji} 紅隊`;

    _roundCheckerRoundTitle = (round) => `第${round}回合`;
    _roundCheckerDescription = (team) => `${team}隊獲勝!\n輸入\`scoreboard\`查看生涯戰績!`;
}

module.exports = zh_TW;