const language = require('../Language');
const data = require('../json/zh-cn.json');

class zh_CN extends language {
    constructor() {
        super(data);
        this.teamObj = {
            blue: '蓝',
            red: '红'
        }
    }

    _teamParams = (param) =>`无法识别队伍： \'${param}\'`;
    _languageParam = (param) => `无法识别语言： \'${param}\'`;

    _wrong = (arr = []) => `正确密码为： **${arr.join(', ')}**`;

    _cheatChannels = (id) => `这小b崽子<@${id}>作弊！\n加密者密码已重置，请重新抽取！`;

    _encrypterRound = (curEncrypterTeam) => `轮到**${this.teamObj[curEncrypterTeam.toLowerCase()]}队加密者**回合!`

    _scoreboardTitle = (totalGames) => `生涯共${totalGames}场游戏`;   

    _encrypterColor = (team) => this.color[team.toLowerCase()];
    _encrypterTitle = (team) => `${this.teamObj[team.toLowerCase()]}队的加密者`;
    _encrypterDescription = (player) => `${player}是当前的加密者`;

    _randomFieldsNumber = (number) => `等待${number}位玩家加入`;
    _normalDescription = (blueTeamEmoji, redTeamEmoji) => `\n\n${blueTeamEmoji} 表情代表蓝队\n` 
    + `${redTeamEmoji} 表情代表红队`;

    _resultBlue = (blueTeamEmoji) => `${blueTeamEmoji} 蓝队`;
    _resultRed = (redTeamEmoji) => `${redTeamEmoji} 红队`;

    _roundCheckerRoundTitle = (round) => `第${round}回合`;
    _roundCheckerDescription = (team) => `${this.teamObj[team.toLowerCase()]}队获胜!\n输入\`$scoreboard\`查看生涯战绩!`;
    
}

module.exports = zh_CN;