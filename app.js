const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const fs = require('fs');
const bot = new Telegraf("");
const translate = require('./translate.json');
const SHA3 = require('crypto-js/sha3');

let bountyData = {
  telegramUserId: '',
  twitterNickName: '',
  telegramNickName: '',
  ethAddress: '',
  selectedLanguage: '',
  referalMembers: []
}

let referalId = 0;

let totalTokensForBounty = 2200000; //2.2m

let sha3 = (value) => {
  return SHA3(value, {
    outputLength: 256
  }).toString();
}

function isAddress (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
    }
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return true;
    }
    else {
        return isChecksumAddress(address);
    }
};

function isChecksumAddress (address) {
    address = address.replace('0x','');
    let addressHash = sha3(address.toLowerCase());

    for (let i = 0; i < 40; i++ ) {
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
            (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

bot.hears('💾 My info', (ctx) => {
  fs.readFile('./members.json', 'utf-8', function(err, data) {
    if (err) {
      return ctx.reply('Bot error, write /start to start over')
    }

    let membersList = JSON.parse(data)

    let searchUserFromFile = ""

    if(membersList.members.length !== 0) {
      searchUserFromFile = membersList.members.find(user => user.telegramUserId === ctx.update.message.from.id)
    }

    bountyData.selectedLanguage = searchUserFromFile.selectedLanguage
      ctx.reply(`${translate[bountyData.selectedLanguage].alreadyJoin.twitter.title} - @${searchUserFromFile.twitterNickName}\n\n${translate[bountyData.selectedLanguage].alreadyJoin.telegram.title} - @${searchUserFromFile.telegramNickName}\n\n${translate[bountyData.selectedLanguage].alreadyJoin.ethereum.title} - ${searchUserFromFile.ethAddress}`, Markup.keyboard([
        ['💰 Balance', '👥 My referals'],
        ['💾 My info', '❓ FAQ'],
        ['ℹ️ About Alehub']
      ]).oneTime().resize().extra())
  })
});

bot.hears('Total referall', (ctx) => {
  fs.readFile('./members.json', 'utf-8', function(err, data) {
    if (err) {
      return ctx.reply('Bot error, write /start to start over')
    }
    let membersList = JSON.parse(data)
    let searchUserFromFile = ""
    if(membersList.members.length !== 0) {
      searchUserFromFile = membersList.members.find(user => user.telegramUserId === ctx.update.message.from.id)
    }
    bountyData.selectedLanguage = searchUserFromFile.selectedLanguage

    if(ctx.update.message.from.username === 'voroncov') {

      let membersCount = 0;
      let referalsCount = 0;

      for(let i=0;i<membersList.members.length;i++) {
        membersCount = membersCount+1
        for(let j=0;j<membersList.members[i].referalMembers.length;j++) {
          referalsCount = referalsCount+1
        }
      }

      ctx.reply(`Members - ${membersCount}\n\nReferals - ${referalsCount}`, Markup.keyboard([
        ['💰 Balance', '👥 My referals'],
        ['💾 My info', '❓ FAQ'],
        ['ℹ️ About Alehub']
      ]).oneTime().resize().extra())
    } else {
      ctx.reply('Total referall', Markup.keyboard([
          ['💰 Balance', '👥 My referals'],
          ['💾 My info', '❓ FAQ'],
          ['ℹ️ About Alehub']
        ]).oneTime().resize().extra())
    }

  })
})

bot.hears('👥 My referals', (ctx) => {

  let totalReferals = 0;

  fs.readFile('./members.json', 'utf-8', function(err, data) {
    if (err) {
      return ctx.reply('Bot error, write /start to start over')
    }

    let membersList = JSON.parse(data)

    let searchUserFromFile = ""

    if(membersList.members.length !== 0) {
      searchUserFromFile = membersList.members.find(user => user.telegramUserId === ctx.update.message.from.id)
    }
    bountyData.selectedLanguage = searchUserFromFile.selectedLanguage
    totalReferals = Number(searchUserFromFile.referalMembers.length)


    let totalUsersWithReferal = 0;

    for(let i=0;i<membersList.members.length;i++) {
        totalUsersWithReferal = totalUsersWithReferal+30;
        for(let j=0;j<membersList.members[i].referalMembers.length;j++) {
          totalUsersWithReferal = totalUsersWithReferal+10;
        }
      }

      if(totalUsersWithReferal >= totalTokensForBounty) {
        ctx.reply(`${translate[bountyData.selectedLanguage].bounty.isOver}`)
      } else {
        let botLink = "https://t.me/alehubtest_bot?start";
        ctx.reply(`${translate[bountyData.selectedLanguage].bounty.referalLink} - ${botLink}=${ctx.update.message.from.id}`)
      }

      ctx.reply(`${translate[bountyData.selectedLanguage].bounty.invite.begin} ${totalReferals} ${translate[bountyData.selectedLanguage].bounty.invite.middle} ${totalReferals*10} ${translate[bountyData.selectedLanguage].bounty.invite.end}`, Markup.keyboard([
        ['💰 Balance', '👥 My referals'],
        ['💾 My info', '❓ FAQ'],
        ['ℹ️ About Alehub']
      ]).oneTime().resize().extra())

  })
});

bot.hears('💰 Balance', (ctx) => {

  let totalBalance = 0;

  fs.readFile('./members.json', 'utf-8', function(err, data) {
    if (err) {
      return ctx.reply('Bot error, write /start to start over')
    }

    let membersList = JSON.parse(data)

    let searchUserFromFile = 0

    if(membersList.members.length !== 0) {
      searchUserFromFile = membersList.members.find(user => user.telegramUserId === ctx.update.message.from.id)
      totalBalance = Number(searchUserFromFile.referalMembers.length*10+30)
    }
    bountyData.selectedLanguage = searchUserFromFile.selectedLanguage

    ctx.reply(`${translate[bountyData.selectedLanguage].userData.balance.title} ${totalBalance} ${translate[bountyData.selectedLanguage].userData.balance.subtitle}`, Markup.keyboard([
        ['💰 Balance', '👥 My referals'],
        ['💾 My info', '❓ FAQ'],
        ['ℹ️ About Alehub']
      ]).oneTime().resize().extra())
  })
});

bot.hears('❓ FAQ', (ctx) => {
  ctx.replyWithMarkdown('**Ask:** What distinguishes Alehub? from other similar projects?\n**Answer:** Alehub is compatible with all world project management methodologies. Supports various methods of encryption of sensitive data to comply with the laws of developed countries. Supports multi-faceted smart contracts for interaction with trusted third parties (TTP)\n\n**Ask:** Is Ale coin ERC20-compliant?\n**Answer:** Yes\n\n**Ask:** How to create an ethereum wallet?\n**Answer:** visit https://www.myetherwallet.com/\n\n\nDid not find the answer to your question? Ask him in the official group - @alehub', Markup.keyboard([
    ['💰 Balance', '👥 My referals'],
    ['💾 My info', '❓ FAQ'],
    ['ℹ️ About Alehub']
  ]).oneTime().resize().extra())
});

bot.hears('FAQ', (ctx) => {
  ctx.replyWithMarkdown('**Ask:** What distinguishes Alehub? from other similar projects?\n**Answer:** Alehub is compatible with all world project management methodologies. Supports various methods of encryption of sensitive data to comply with the laws of developed countries. Supports multi-faceted smart contracts for interaction with trusted third parties (TTP)\n\n**Ask:** Is Ale coin ERC20-compliant?\n**Answer:** Yes\n\n**Ask:** How to create an ethereum wallet?\n**Answer:** visit https://www.myetherwallet.com/\n\n\nDid not find the answer to your question? Ask him in the official group - @alehub', Markup.keyboard([
    ['About Alehub', 'FAQ']
  ]).oneTime().resize().extra())
});

bot.hears('ℹ️ About Alehub', (ctx) => {
  ctx.reply(`👥 WELCOME TO OFFICIAL CHAT OF ALEHUB. THE FUTURE OF THE HR INDUSTRY! 👥\n\n👥 ALEHUB COMMUNITY 👥\n\n✅ Telegram news channel: https://t.me/alehubnews\n✅ Website: https://alehub.io\n✅ Github: https://goo.gl/GoELvP\n✅ Twitter: https://goo.gl/K212vC\n✅ Instagram https://goo.gl/zq72Tq\n✅ Facebook: https://goo.gl/oDW47a\n✅ Youtube: https://goo.gl/DUQyc1\n\n👥  ⁉️ WHAT IS ALEHUB? 👥\n\nThe ALE product is primarily a service for consumers to find counterparties for projects in the IT field and to manage these projects at the management and financial level.\n\nOn the one hand, they are programmers or their associations, and on the other hand, they are IT Customers.\n\nALE in this sense is an online distributed information and financial platform / project management system, the location and interaction of project parties (in the first stage of IT projects).\n\n👥 ALEHUB PARTNERS 👥\n\n🤝 Serokell: https://goo.gl/v1fnyC\n🤝 ITMO University: https://goo.gl/XPjeLg\n🤝 Crypto b2b: https://goo.gl/HLUddx\n🤝 BEA(R) Blockchain Experts Association: https://goo.gl/iso5bb\n\n👥 ALEHUB IN MEDIA 👥\n\n📄 GOLOS: https://goo.gl/z3kNGP\n📄 Crypto.Pro {Russian language}: https://goo.gl/zdt3Z1\n\nFor any inquiries please contact us:\n📩 Marketing & PR: pr@alehub.io\n📩 Support: support@alehub.io\n📩 Bounty: bounty@alehub.io\n\n🆕  Stay tuned for more upcoming news about ALEHUB!  🆕\n\n👥 ALEHUB. ATTRACTING BLOCKCHAIN TECHNOLOGY IN THE WORLD OF HR 👥`, Markup.keyboard([
    ['💰 Balance', '👥 My referals'],
    ['💾 My info', '❓ FAQ'],
    ['ℹ️ About Alehub']
  ]).oneTime().resize().extra())
});

bot.hears('About Alehub', (ctx) => {
  ctx.reply(`👥 WELCOME TO OFFICIAL CHAT OF ALEHUB. THE FUTURE OF THE HR INDUSTRY! 👥\n\n👥 ALEHUB COMMUNITY 👥\n\n✅ Telegram news channel: https://t.me/alehubnews\n✅ Website: https://alehub.io\n✅ Github: https://goo.gl/GoELvP\n✅ Twitter: https://goo.gl/K212vC\n✅ Instagram https://goo.gl/zq72Tq\n✅ Facebook: https://goo.gl/oDW47a\n✅ Youtube: https://goo.gl/DUQyc1\n\n👥  ⁉️ WHAT IS ALEHUB? 👥\n\nThe ALE product is primarily a service for consumers to find counterparties for projects in the IT field and to manage these projects at the management and financial level.\n\nOn the one hand, they are programmers or their associations, and on the other hand, they are IT Customers.\n\nALE in this sense is an online distributed information and financial platform / project management system, the location and interaction of project parties (in the first stage of IT projects).\n\n👥 ALEHUB PARTNERS 👥\n\n🤝 Serokell: https://goo.gl/v1fnyC\n🤝 ITMO University: https://goo.gl/XPjeLg\n🤝 Crypto b2b: https://goo.gl/HLUddx\n🤝 BEA(R) Blockchain Experts Association: https://goo.gl/iso5bb\n\n👥 ALEHUB IN MEDIA 👥\n\n📄 GOLOS: https://goo.gl/z3kNGP\n📄 Crypto.Pro {Russian language}: https://goo.gl/zdt3Z1\n\nFor any inquiries please contact us:\n📩 Marketing & PR: pr@alehub.io\n📩 Support: support@alehub.io\n📩 Bounty: bounty@alehub.io\n\n🆕  Stay tuned for more upcoming news about ALEHUB!  🆕\n\n👥 ALEHUB. ATTRACTING BLOCKCHAIN TECHNOLOGY IN THE WORLD OF HR 👥`, Markup.keyboard([
    ['About Alehub', 'FAQ']
  ]).oneTime().resize().extra())
});

const stepHandler = new Composer()

stepHandler.action('next', (ctx) => {
  ctx.telegram.getChatMember(-1001335559714, ctx.update.callback_query.from.id).then(result => {
    if(result.status !== 'member' && result.status !== 'creator') {
      ctx.reply(`${translate[bountyData.selectedLanguage].telegram.notJoin}`)
    } else {
      bountyData.telegramNickName = ctx.update.callback_query.from.username
      ctx.reply(`${translate[bountyData.selectedLanguage].telegram.ethAddress}`)
      return ctx.wizard.next()
    }
  }).catch(err => {
    ctx.reply(`${translate[bountyData.selectedLanguage].telegram.notJoin}`)
  })
})
stepHandler.command('next', (ctx) => {
  ctx.telegram.getChatMember(-1001335559714, ctx.update.message.from.id).then(result => {
    if(result.user.status !== 'member' && result.user.status !== 'creator') {
      ctx.reply(`${translate[bountyData.selectedLanguage].telegram.notJoin}`)
    } else {
      bountyData.telegramNickName = ctx.update.message.from.username
      ctx.reply(`${translate[bountyData.selectedLanguage].telegram.ethAddress}`)
      return ctx.wizard.next()
    }
  }).catch(err => {
    ctx.reply(`${translate[bountyData.selectedLanguage].telegram.notJoin}`)
  })
})
stepHandler.use((ctx) => ctx.reply(`${translate[bountyData.selectedLanguage].telegram.hint}`))

const superWizard = new WizardScene('super-wizard',
  (ctx) => {

    if(ctx.update.message.chat.type !== undefined) {
      if(ctx.update.message.chat.type !== 'private') {
        return ctx.reply(`Hi, ${ctx.update.message.from.first_name}!`, Markup.removeKeyboard().extra())
      } else {
        referalId = Number(ctx.update.message.text.split('/start ')[1])
      }
    } else if(ctx.update.callback_query.message.chat.type !== undefined) {
      if(ctx.update.callback_query.message.chat.type !== 'private') {
        return ctx.reply(`Hi, ${ctx.update.message.from.first_name}!`, Markup.removeKeyboard().extra())
      } else {
        referalId = Number(ctx.update.callback_query.message.text.split('/start ')[1])
      }
    }

    fs.readFile('./members.json', 'utf-8', function(err, data) {
      if (err) {
        return ctx.reply('Bot error, write /start to start over')
      }

      let membersList = JSON.parse(data)

      let searchUserFromFile = ""

      if(membersList.members.length !== 0) {
        searchUserFromFile = membersList.members.find(user => user.telegramUserId === ctx.update.message.from.id)
      }

      if(searchUserFromFile === undefined || searchUserFromFile.length === 0) {

        fs.readFile('./members.json', 'utf-8', function(err, data) {
          if (err) {
            return ctx.reply('Bot error, write /start to start over')
          }

          let membersList = JSON.parse(data);

          let totalUsersWithReferal = 0;

          for(let i=0;i<membersList.members.length;i++) {
            totalUsersWithReferal = totalUsersWithReferal+30;
            for(let j=0;j<membersList.members[i].referalMembers.length;j++) {
              totalUsersWithReferal = totalUsersWithReferal+10;
            }
          }

          if(totalUsersWithReferal >= totalTokensForBounty) {
            return ctx.reply('Bounty program is over', Markup.keyboard([
                ['About Alehub', 'FAQ']
              ]).oneTime().resize().extra())
          } else {
            ctx.reply('Select language', Markup.keyboard([
              Markup.callbackButton('🇺🇸 English', 'next'),
              Markup.callbackButton('🇷🇺 Russian', 'next'),
              Markup.callbackButton('🇨🇳 Chinese', 'next'),
              Markup.callbackButton('🇩🇪 German', 'next'),
              Markup.callbackButton('🇪🇸 Spanish', 'next'),
              Markup.callbackButton('🇰🇷 Korean', 'next'),
              Markup.callbackButton('🇯🇵 Japanese', 'next')
            ]).oneTime().resize().extra())
            return ctx.wizard.next()
          }

        })
      } else {
        bountyData.selectedLanguage = searchUserFromFile.selectedLanguage
        ctx.reply(`${translate[bountyData.selectedLanguage].alreadyJoin.twitter.title} - @${searchUserFromFile.twitterNickName}\n\n${translate[bountyData.selectedLanguage].alreadyJoin.telegram.title} - @${searchUserFromFile.telegramNickName}\n\n${translate[bountyData.selectedLanguage].alreadyJoin.ethereum.title} - ${searchUserFromFile.ethAddress}`, Markup.keyboard([
          ['💰 Balance', '👥 My referals'],
          ['💾 My info', '❓ FAQ'],
          ['ℹ️ About Alehub']
        ]).oneTime().resize().extra())
      }
    })
  },
  (ctx) => {

    if(ctx.update.message.text.indexOf('English') !== -1) {
      bountyData.selectedLanguage = 'en'
      ctx.reply('🇺🇸 English language is selected', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('Russian') !== -1) {
      bountyData.selectedLanguage = 'ru'
      ctx.reply('🇷🇺 Выбран русский язык', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('Chinese') !== -1) {
      bountyData.selectedLanguage = 'ch'
      ctx.reply('🇨🇳 中文被選中', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('German') !== -1) {
      bountyData.selectedLanguage = 'de'
      ctx.reply('🇩🇪 Die deutsche Sprache ist ausgewählt', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('Spanish') !== -1) {
      bountyData.selectedLanguage = 'ec'
      ctx.reply('🇪🇸 El idioma español es seleccionado', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('Korean') !== -1) {
      bountyData.selectedLanguage = 'kr'
      ctx.reply('🇰🇷 한국어가 선택되었습니다.', Markup.removeKeyboard().extra());

    } else if(ctx.update.message.text.indexOf('Japanese') !== -1) {
      bountyData.selectedLanguage = 'jp'
      ctx.reply('🇯🇵 日本語が選択されている', Markup.removeKeyboard().extra());

    } else {
      return ctx.reply('Select language please')
    }

    setTimeout(function() {
      ctx.reply(`${translate[bountyData.selectedLanguage].twitter.title} https://twitter.com/alehub_io ${translate[bountyData.selectedLanguage].twitter.subtitle}`, Markup.inlineKeyboard([
        Markup.urlButton('Twitter', 'https://twitter.com/alehub_io')
        ]).oneTime().resize().extra())
      return ctx.wizard.next()
    }, 300)
    
  },
  (ctx) => {
    if(bountyData.selectedLanguage.length === 0) {
      return ctx.scene.back()
    }


    fs.readFile('./members.json', 'utf-8', function(err, data) {
      if (err) {
        return ctx.reply('Bot error, write /start to start over')
      }
      var arrayOfObjects = JSON.parse(data)
      let checkIsNewTwitter = arrayOfObjects.members.filter(item => {
        return item.twitterNickName === ctx.update.message.text
      })
      if(checkIsNewTwitter.length !== 0) {
        ctx.reply(`${translate[bountyData.selectedLanguage].twitter.exist}`)
      } else {
        bountyData.twitterNickName = ctx.update.message.text
        ctx.reply(`${translate[bountyData.selectedLanguage].telegram.condition}`, Markup.inlineKeyboard([
          Markup.urlButton('Join to group', 'https://t.me/alehub'),
          Markup.callbackButton('➡️ Next', 'next')
        ]).extra())
        return ctx.wizard.next()
      }
    })
  },
  stepHandler,
  (ctx) => {
    if(ctx.update.message.text !== undefined || ctx.update.callback_query.message.text !== undefined) {

      let address = "";
      if(ctx.update.message.text !== undefined) {
        address = ctx.update.message.text
      } else if(ctx.update.callback_query.message.text !== undefined) {
        address = ctx.update.callback_query.message.text
      }

      if(isAddress(address)) {
        bountyData.ethAddress = ctx.update.message.text
        bountyData.telegramUserId = ctx.update.message.from.id

        fs.readFile('./members.json', 'utf-8', function(err, data) {
          if (err) {
            return ctx.reply('Bot error, write /start to start over')
          }
          var arrayOfObjects = JSON.parse(data)
          let checkIsNewAddress = arrayOfObjects.members.filter(item => {
            return item.ethAddress === bountyData.ethAddress
          })
          if(checkIsNewAddress.length !== 0) {
            ctx.reply(`${translate[bountyData.selectedLanguage].ethereum.exist}`)
          } else {
            ctx.reply(`${translate[bountyData.selectedLanguage].ethereum.changeData}`)

            ctx.reply(`${translate[bountyData.selectedLanguage].alreadyJoin.twitter.title} - ${bountyData.twitterNickName}\n${translate[bountyData.selectedLanguage].alreadyJoin.telegram.title} - ${bountyData.telegramNickName}\n${translate[bountyData.selectedLanguage].alreadyJoin.ethereum.title} - ${bountyData.ethAddress}`, Markup.keyboard([
                Markup.callbackButton('Confirm data', 'next'),
                Markup.callbackButton('Start over', 'next')
              ]).oneTime().resize().extra())
            return ctx.wizard.next()
          }
        })
      } else {
        ctx.reply(`${translate[bountyData.selectedLanguage].ethereum.correct}`)
      }
    } else {
      ctx.reply(`${translate[bountyData.selectedLanguage].ethereum.correct}`)
    }
  },
  (ctx) => {
    if(ctx.update.message.text === 'Confirm data') {
      fs.readFile('./members.json', 'utf-8', function(err, data) {
        if (err) {
          return ctx.reply('Bot error, write /start to start over')
        }

        var arrayOfObjects = JSON.parse(data)
        arrayOfObjects.members.push(bountyData)

        if(Number(referalId) !== 0) {
          let checkisNotReferal = arrayOfObjects.members.filter(item => {
            return item.referalMembers.indexOf(Number(referalId)) !== -1
          })
          if(checkisNotReferal.length === 0) {
            arrayOfObjects.members.filter(member => {
              if(Number(member.telegramUserId) === Number(referalId)) {
                member.referalMembers.push(bountyData.telegramUserId)
              }
            })
          }
        }

        fs.writeFile('./members.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
          if (err) {
            return ctx.reply('Bot error, write /start to start over')
          }
          ctx.reply(`${translate[bountyData.selectedLanguage].success.title}`, Markup.keyboard([
            ['💰 Balance', '👥 My referals'],
            ['💾 My info', '❓ FAQ'],
            ['ℹ️ About Alehub']
          ]).oneTime().resize().extra())
          return ctx.scene.leave()
        })
      })
    } else if(ctx.update.message.text === 'Start over') {
      ctx.reply(`${bountyData.telegramNickName}\n${translate[bountyData.selectedLanguage].startOver.title}`, Markup.removeKeyboard().extra())
      return ctx.scene.leave()
    }
  }
)

const stage = new Stage([superWizard], { default: 'super-wizard' })
bot.use(session())
bot.use(stage.middleware())
bot.startPolling()