const language = require('./Language');
const data = require('./zh-cn.json');
class zh_CN extends language {
    constructor() {
        super(data);
    }

    _teamParams = (param) =>`无法识别队伍： \'${param}\'`;

    _wrong = (arr = []) => `正确密码为： **${arr.join(', ')}**`;

    _encrypterRound = (curEncrypterTeam) => `轮到**${curEncrypterTeam}队加密者**回合!`

    _scoreboardTitle = (totalGames) => `生涯共${totalGames}场游戏`;   

    _encrypterColor = (team) => this.color[team.toLowerCase()];
    _encrypterTitle = (team) => `${team.toUpperCase()}队的加密者`;
    _encrypterDescription = (player) => `${player}是当前的加密者`;

    _randomFieldsNumber = (number) => `等待${number}位玩家加入`;
    _normalDescription = (blueTeamEmoji, redTeamEmoji) => `\n\n${blueTeamEmoji} 表情代表蓝队\n` 
    + `${redTeamEmoji} 表情代表红队`;

    _resultBlue = (blueTeamEmoji) => `${blueTeamEmoji} 蓝队`;
    _resultRed = (redTeamEmoji) => `${redTeamEmoji} 红队`;

    _roundCheckerRoundTitle = (round) => `第${round}回合`;
    _roundCheckerDescription = (team) => `${team}队获胜!\n输入\`scoreboard\`查看生涯战绩!`;
}

module.exports = zh_CN;