class language {
    constructor(data) {
        this.language = data.language;
        this.color = {
            primary: '#e42643',
            blue: '#31c5eb',
            red: '#f7526b',
        };
        
        this.error = {
            message: {
                permission: data.error.message.permission, // Invalid Permissions or Missing Permission
                execute: data.error.message.execute, // Wrong command
            },     
    
            answer: { 
                notDraw: data.error.answer.notDraw, // haven't draw key/code            
            },
    
            history: {
                teamParams: (param) =>`cannot recognize \'${param}\' as a team`, // team param
                description: data.error.history.description, // haven't draw
            },
    
            keywords: {
                add: data.error.keywords.add, // add syntax
                del: data.error.keywords.del, // del syntax
                update: { 
                    param: data.error.keywords.update.param, // update syntax
                    index: data.error.keywords.update.index, // invalid index
                }
            },
    
            start: { 
                rounds: data.error.start.rounds // rounds < 10
            },
    
            distribute: {
                isNaN: data.error.distribute.isNaN, 
                noNumber: data.error.distribute.isNaN
            },
            
        };
    
        this.answer = {
            cheat: { 
                person: data.answer.cheat.person, // to cheater
                channels: data.answer.cheat.channels, // to both channels
            }, // Someone cheating
            wrong: (arr = []) => this._wrong(arr), // Wrong answer
            encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam), // Represent current team.
            repeat: data.answer.repeat // Sending ans twice times above
        };
    
        this.start = {
            encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam),
        };
    
        this.delete = {
            onGame: data.delete.onGame // Delete channels when game running
        };
    
        this.stop = {
            reset: data.stop.reset,
        };
    
        this.codeChecker = {
            wrong: (arr = []) => this._wrong(arr),
        };
    
        this.distribute = {
            load: {
                loading: data.distribute.load.loading, // Loading
                completed: data.distribute.load.completed,
            },
        }
    
        this.embed = {
            score: {
                color: this.color.primary, 
                title: data.embed.score.title,
                fields: {
                    blue: data.embed.score.fields.blue, // Team blue
                    red: data.embed.score.fields.red, // Team Red
                    intToken: data.embed.score.fields.intToken, // Interaction Token
                    misToken: data.embed.score.fields.misToken, // Miscommunication Token 
                }
            }, // scoreEmbed
    
            help: {
                color: this.color.primary, 
                title: data.embed.help.title,
                description: data.embed.help.description,
            },
    
            descriptions: {
                blue: {
                    color: this.color.blue, 
                    title: data.embed.descriptions.blue.title,
                },
                red: {
                    color: this.color.red, 
                    title: data.embed.descriptions.red.title,
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
                title: data.embed.random.title,
                fields: {
                    number: (number) => this._randomFieldsNumber(number),
                }
            },
    
            normal: {
                color: this.color.primary,
                title: data.embed.normal.title,
                description: (blueTeamEmoji, redTeamEmoji) => this._normalDescription(blueTeamEmoji, redTeamEmoji),
            },
    
            result: {
                color: this.color.primary,
                title: data.embed.result.title,
                fields: {
                    blue: (blueTeamEmoji) => this._resultBlue(blueTeamEmoji),
                    red: (redTeamEmoji) => this._resultRed(redTeamEmoji),
                }
            },
    
            distribute: {
                color: this.color.primary,
                title: data.embed.distribute.title,
                mode: data.embed.distribute.mode,
                rounds: data.embed.distribute.rounds,
                autoAssign: data.embed.distribute.autoAssign
            },
    
            roundChecker: {
                round: {
                    color: this.color.primary,
                    title: (round) => this._roundCheckerRoundTitle(round),
                },
    
                gameOver: {
                    color: (team) => this._roundCheckerColor(team),
                    title: data.embed.roundChecker.gameOver.title,
                    description: (team) => this._roundCheckerDescription(team),
                }
            }
    
        };
    
        this.commands = {
            
        };
    }

    _teamParams = (param) =>`cannot recognize \'${param}\' as a team`;

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