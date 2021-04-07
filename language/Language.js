const defaultData = require('./json/en-us.json');
const merge = require('../src/functions/deepMerge');

class language {
    constructor(data = defaultData) {  
        this.color = {
            primary: '#e42643',
            blue: '#31c5eb',
            red: '#f7526b',
        };
        
        this.error = {

            message: {
                permission: '', // Invalid Permissions or Missing Permission
                execute: '' , // Wrong command
            },     
    
            answer: { 
                notDraw: '', // haven't draw key/code            
            },
    
            history: {
                teamParams: (param) => this._teamParams(param), // team param
                description: '', // haven't draw
            },
    
            keywords: {
                add: '', // add syntax
                del: '', // del syntax
                update: { 
                    param: '', // update syntax
                    index: '', // invalid index
                }
            },
    
            start: { 
                rounds: '' // rounds < 10
            },
    
            distribute: {
                isNaN: '', 
                noNumber: ''
            },

            language: {
                param: (param) => this._languageParam(param), // language param
            }
            
        };
    
        this.answer = {
            cheat: { 
                person: '', // to cheater
                channels: '', // to both channels
            }, // Someone cheating
            wrong: (arr = []) => this._wrong(arr), // Wrong answer
            encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam), // Represent current team.
            repeat: '' // Sending ans twice times above
        };
    
        this.start = {
            encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam),
        };
    
        this.delete = {
            onGame: '' // Delete channels when game running
        };
    
        this.stop = {
            reset: '',
        };
    
        this.codeChecker = {
            wrong: (arr = []) => this._wrong(arr),
        };
    
        this.distribute = {
            load: {
                loading: '', // Loading
                completed: '',
            },
        }
    
        this.embed = {
            score: {
                color: this.color.primary, 
                title: '',
                fields: {
                    blue: '', // Team blue
                    red: '', // Team Red
                    intToken: '', // Interaction Token
                    misToken: '', // Miscommunication Token 
                }
            }, // scoreEmbed
    
            help: {
                color: this.color.primary, 
                title: '',
                description: '',
            },
    
            descriptions: {
                blue: {
                    color: this.color.blue, 
                    title: '',
                },
                red: {
                    color: this.color.red, 
                    title: '',
                }
            },
    
            scoreboard: {
                color: this.color.primary, 
                title: (totalGames) => this._scoreboardTitle(totalGames),
            },
    
            encrypter: {
                color: (team) => this._encrypterColor(team),
                title: (team) => this._encrypterTitle(team),
                description: (player) => this._encrypterDescription(player),
            },
    
            random: {
                color: this.color.primary,
                title: '',
                fields: {
                    number: (number) => this._randomFieldsNumber(number),
                }
            },
    
            normal: {
                color: this.color.primary,
                title: '',
                description: (blueTeamEmoji, redTeamEmoji) => this._normalDescription(blueTeamEmoji, redTeamEmoji),
            },
    
            result: {
                color: this.color.primary,
                title: '',
                fields: {
                    blue: (blueTeamEmoji) => this._resultBlue(blueTeamEmoji),
                    red: (redTeamEmoji) => this._resultRed(redTeamEmoji),
                }
            },
    
            distribute: {
                color: this.color.primary,
                title: '',
                mode: '',
                rounds: '',
                autoAssign: ''
            },
    
            roundChecker: {
                round: {
                    color: this.color.primary,
                    title: (round) => this._roundCheckerRoundTitle(round),
                },
    
                gameOver: {
                    color: (team) => this._roundCheckerColor(team),
                    title: '',
                    description: (team) => this._roundCheckerDescription(team),
                }
            },

            language: {
                title: '', // new language
                current: '', // curent language
            }
    
        };
    
        this.commands = {
            
        };

        merge(this, data); // set default value to language
    }

    _test = () => console.log(this);
    _teamParams = (param) =>`cannot recognize \'${param}\' as a team`;

    _languageParam = (param) => `cannot recognize \'${param}\' as a language`

    _wrong = (arr = []) => `The codes are: **${arr.join(', ')}**`;

    _encrypterRound = (curEncrypterTeam) => `It's **${curEncrypterTeam} Team Encrypter** round!`

    _scoreboardTitle = (totalGames) => `Total ${totalGames} Games`;   

    _encrypterColor = (team) => this.color[team.toLowerCase()];
    _encrypterTitle = (team) => `${team.toUpperCase()} Team Encrypter`;
    _encrypterDescription = (player) => `${player} is current encrypter!`;

    _randomFieldsNumber = (number) => `Waitting for ${number} Players to Start`;
    _normalDescription = (blueTeamEmoji, redTeamEmoji) => `\n\n${blueTeamEmoji} for blue team\n` 
    + `${redTeamEmoji} for red team`;

    _resultBlue = (blueTeamEmoji) => `${blueTeamEmoji} Blue Team`;
    _resultRed = (redTeamEmoji) => `${redTeamEmoji} Red Team`;

    _roundCheckerColor = (team) => this.color[team.toLowerCase()];
    _roundCheckerRoundTitle = (round) => `Round ${round}`;
    _roundCheckerDescription = (team) => `${team} Team Is Winner!\nType \`scoreboard\` to see your score!`;
}

module.exports = language;