const defaultData = require('./json/en-us.json');
const merge = require('../src/functions/deepMerge');

class language {
    constructor(data = defaultData) {
        this.color = {
            primary: '#e42643',
            blue: '#31c5eb',
            red: '#f7526b',
        };
        this.events = {
            message: {
                error: { 
                    permission: "Missing Permissions: ", 
                    execute: "There was an error trying to execute that command!"
                }
            }
        };

        this.commands = {
            about: {
                description: "About me",
                error: {},
                embed: {
                    title: "About Me",
                    fields: {
                        author: "Author",
                        version: "Version",
                        description: "Description",
                        descriptionValue: ""
                    }
                }
            },
            answer: {
                description: "",
                error: {
                    notDraw: "Some team haven't draw codes/keywords yet"
                },
                embed: {
                    score: {
                        color: this.color.primary, 
                        title: "Current Tokens",
                        fields: {
                            blue: "Blue",
                            red: "Red",
                            intToken: "✅ Int Token",
                            misToken: "😥 Mis Token"
                        }
                    }
                },
                cheat: {
                    channels: (id) => this._cheatChannels(id),
                    person: "Why you cheating huh?"
                },
                repeat: "Don't send the answer 2 times",
                wrong: (arr = []) => this._wrong(arr), // Wrong answer
                encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam), // Represent current team.
            },
            balance: {
                description: "Show player balance",
                error: {},
                embed: {
                    title: ""
                }
            },
            delete: {
                description: "Quick delete game rooms and roles",
                error: {
                    onGame: "Please do not use this command while game is still playing"
                },
                embed: {
                    title: ""
                }
            },
            deposits: {
                description: "Deposits money to bank",
                error: {
                    money: "Please enter money you want to deposits",
                    number: "Please enter real number!",
                    valid: "Please enter valid amount!"
                },
                embed: {
                    title: ""
                },
                depositMoney: (amount) => this.depositMoney(amount)
            },
            draw: {
                description: "Draw codes or keywords",
                error: {
                    onGame: "You're not in game!",
                    channel: "Please type in Game Channels!(Under Decrypto category)",
                    syntax: (prefix) => this._drawSyntax(prefix),
                    isDrew: "Keywords have been drew!",
                    notEncrypter: "You're not current encrypter!",
                    drawCode: (id) => this._drawCode(id)
                },
                embed: {
                    key: {
                        color: this.color.primary,
                        title: "Keywords",
                    },
                    code: {
                        color: this.color.primary,
                        title: "Codes"
                    }
                },
                drawRounds: (rounds) => this._drawRounds(rounds)
            },
            help: {
                description: "Help command",
                error: {},
                embed: {
                    color: this.color.primary, 
                    title: "All Commands",
                    description: (prefix) => this._helpDescription(prefix)
                }
            },
            history: {
                description: "List descriptions history [red/blue] or list current descriptions",
                error: {
                    isDescribe: "Current encrypter haven't send descriptions yet."
                },
                embed: {
                    blue: {
                        color: this.color.blue, 
                        title: "Blue Team Descriptions"
                    },
                    red: {
                        color: this.color.red, 
                        title: "Red Team Descriptions"
                    }
                },
                teamParams: (param) => this._teamParams(param), // team param
            },
            keywords: {
                description: "Keywords Query, Update, Delete, Add, `$help keywords` for more help",
                error: {
                    syntax: {
                        add: (prefix) => this._keywordsAdd(prefix),
                        del: (prefix) => this._keywordsDel(prefix),
                        update: (prefix) => this._keywordsUpdate(prefix)
                    },
                    index: "Please check your index number!"
                },
                embed: {
                    title: ""
                }
            },
            language: {
                description: "Change server language setting",
                error: {},
                embed: {
                    color: this.color.primary,
                    setting: "Language set to English(US)",
                    current: "Current language is English(US)"
                },
                param: (param) => this._languageParam(param), // language param
            },
            ping: {
                description: "Ping! Pong?",
                error: {},
                embed: {
                    title: ""
                }
            },
            report: {
                description: "Report someone to bot and launch a vote",
                error: {},
                embed: {
                    title: ""
                }
            },
            scoreboard: {
                description: "Show the career",
                error: {},
                embed: {
                    color: this.color.primary, 
                    title: (totalGames) => this._scoreboardTitle(totalGames),
                }
            },
            start: {
                description: "Start the decrypto game! (normal / random)",
                error: {
                    rounds: "Cannot set over 10 rounds. Rounds set to 3 now."
                },
                embed: {
                    title: ""
                },
                encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam),
            },
            stop: {
                description: "Quick stop the game and reset all elem includes players' and server's",
                error: {},
                embed: {
                    title: ""
                },
                reset: "All elem has been reset."
            },
            unpin: {
                description: "Quick unpin the message",
                error: {},
                embed: {
                    title: ""
                }
            }
        };
        this.functions = {
            codeChecker: {
                error: {},
                embed: {},
                wrong: (arr = []) => this._wrong(arr),
            },
            deepMerge: {
                error: {},
                embed: {}
            },
            delay: {
                error: {},
                embed: {}
            },
            distribute: {
                error: {
                    isNaN: "Please Enter the number.",
                    noNumber: "Please Enter how many players will join!"
                },
                embed: {
                    random: {
                        color: this.color.primary,
                        title: "React to join!",
                        fields: {
                            number: (number) => this._randomFieldsNumber(number),
                        }
                    },
                    normal: {
                        color: this.color.primary,
                        title: "Choose your TEAM!",
                        description: (blueTeamEmoji, redTeamEmoji) => this._normalDescription(blueTeamEmoji, redTeamEmoji),
                    },
                    result: {
                        color: this.color.primary,
                        title: "Final Result",
                        fields: {
                            blue: (blueTeamEmoji) => this._resultBlue(blueTeamEmoji),
                            red: (redTeamEmoji) => this._resultRed(redTeamEmoji),
                        }
                    },
                    distribute: {
                        color: this.color.primary,
                        title: "Options",
                        mode: "Game Mode",
                        rounds: "Rounds",
                        autoAssign: "Auto Assign"
                    },
                    encrypter: {
                        color: (team) => this._encrypterColor(team),
                        title: (team) => this._encrypterTitle(team),
                        description: (player) => this._encrypterDescription(player),
                    },
                },
                load: {
                    loading: "Loading",
                    completed: "Loading Completed!"
                },
                encrypterRound: (curEncrypterTeam) => this._encrypterRound(curEncrypterTeam)
            },
            DM: {
                error: {},
                embed: {}
            },
            gameDB: {
                error: {},
                embed: {}
            },
            gameRooms: {
                error: {},
                embed: {}
            },
            playerDB: {
                error: {},
                embed: {}
            },
            roundChecker: {
                error: {},
                embed: {
                    round: {
                        color: this.color.primary,
                        title: (round) => this._roundCheckerRoundTitle(round),
                    },
                    gameOver: {
                        color: (team) => this._roundCheckerColor(team),
                        title: "Game Over",
                        description: (team) => this._roundCheckerDescription(team),
                    }
                }
            },
            serverDB: {
                error: {},
                embed: {}
            }
        };
        this.DM = {}
        
        merge(this, data); // set select language to this language
    }
    
    _teamParams = (param) => `cannot recognize \'${param}\' as a team`;
    _languageParam = (param) => `cannot recognize \'${param}\' as a language`

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

    // answer.js
    _cheatChannels = (id) => `<@${id}> cheating!!\nCodes have been reset!`;
    _wrong = (arr = []) => `The codes are: **${arr.join(', ')}**`;
    _encrypterRound = (curEncrypterTeam) => `It's **${curEncrypterTeam} Team Encrypter** round!`

    // deposits.js
    _depositMoney = (amount) => ` you deposited \`${amount}\` **coins** to your bank!`;

    // draw.js
    _drawSyntax = (prefix) => `Enter \`${prefix}draw (key/code)\` to execute the command.`;
    _drawCode = (id) => `<@${id}> has drew the codes already`;
    _drawRounds = (rounds) => `Game ${rounds}`;

    // help.js
    _helpDescription = (prefix) => `Prefix: ${prefix}`;

    // keywords.js
    _keywordsAdd = (prefix) => `Please follow this syntax \`${prefix}kw a (keyword) index(option)\``;
    _keywordsDel = (prefix) => `Please follow this syntax \`${prefix}kw d (index || keyword)\``;
    _keywordsUpdate = (prefix) => `Please follow this syntax \`${prefix}kw u (index) (keyword)\``;
}

module.exports = language;