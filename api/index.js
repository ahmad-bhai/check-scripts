const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Local instance memory for temporary ID locking
const lockedIds = {}; 

module.exports = async (req, res) => {
  const { token } = req.query;

  // 1. WEBHOOK SETUP URL: /api?token=BOT_TOKEN
  if (token && req.method === 'GET') {
    try {
      const bot = new Telegraf(token);
      const webhookUrl = `https://${req.headers.host}/api?token=${token}`;
      await bot.telegram.setWebhook(webhookUrl);
      return res.status(200).send(`✅ Webhook Successfully Set for Bot! URL: ${webhookUrl}`);
    } catch (err) {
      return res.status(500).send(`❌ Error setting webhook: ${err.message}`);
    }
  }

  // 2. BOT HANDLING (POST Request)
  if (token && req.method === 'POST') {
    const bot = new Telegraf(token);

    // --- Start Command ---
    bot.start((ctx) => {
      const firstName = ctx.from.first_name || "Dear";
      ctx.replyWithMarkdown(`👋*Hy Dear ${firstName}*\n\n*Please enter your Quotex Account ID (only numbers), after successful verification we will add you to the VIP group*`);
    });

    // --- Account Command ---
    bot.command('account', (ctx) => {
      ctx.replyWithMarkdown(`*How to create Quotex account?\n\n1st step: Withdrawal your all funds.\n\n2nd step: Delete your old Quotex account.\n\n3rd step: Open this link\n\nhttps://broker-qx.pro/sign-up/?lid=2056722\n\n4th step: Select your country then enter your New email and enter your secure password agree terms and conditions and click on Register blue button.\n\n Congratulations 🎉\n\n Your account is created now enter you trader ID (only numbers).*`);
    });

    // --- Support Command ---
    bot.command('support', (ctx) => {
      ctx.replyWithMarkdown(`* RQA OFFICIAL SUPPORT TEAM *`, 
        Markup.inlineKeyboard([
          Markup.button.url("📞 Contact", "https://t.me/RQA_OFFICIAL")
        ])
      );
    });

    // --- ID Verification Handler ---
    bot.on('text', async (ctx) => {
      const trader_id = ctx.message.text.trim();
      const isNumbersOnly = /^\d+$/.test(trader_id);
      const telegramId = ctx.from.id.toString();

      if (!isNumbersOnly) {
        return ctx.replyWithMarkdown("*❌ Not a valid ID enter (only numbers) ID*");
      }
      if (trader_id.length !== 8) {
        return ctx.replyWithMarkdown("*🚫 Please enter only 8 digits numbers ID*");
      }

      // Check if ID is already used in local memory
      const alreadyUsedBy = lockedIds[trader_id];
      if (alreadyUsedBy && alreadyUsedBy !== telegramId) {
        return ctx.replyWithMarkdown("⚠️ *Access Denied!*\n\nThis ID is already registered with another user.");
      }

      await ctx.replyWithMarkdown(`🔍 *Verifying ID:* ${trader_id}...`);

      try {
        // Full Fixed Affiliate API Post Request with Headers
        const response = await axios({
          method: 'post',
          url: 'https://affiliate-verify.vercel.app/api/postback',
          data: { checkId: trader_id },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 12000 // 12 seconds max waiting time
        });

        const data = response.data;

        if (data && data.success) {
          const amount = parseFloat(data.deposit || data.balance || 0);

          if (amount > 0) {
            // Memory mein lock lagayein
            lockedIds[trader_id] = telegramId;

            // Success Output Message
            const msg = `✅ *Account Verified!*\n━━━━━━━━━━━━━━━━━━\n💰 *Total Deposit:* $${amount.toFixed(2)}\n💸 *Withdrawal:* $${data.withdraw || "0.00"}\n🌍 *Region:* ${data.country || "Unknown"}\n📊 *Status:* ${(data.status || "ACTIVE").toUpperCase()}\n━━━━━━━━━━━━━━━━━━\n✨ Your account is active under our academy.`;
            await ctx.replyWithMarkdown(msg);

            // Channel Invite Link Generation
            const channel_id = "-1003779200483"; 
            try {
              const inviteLinkObj = await ctx.telegram.createChatInviteLink(channel_id, {
                member_limit: 1,
                name: `Member: ${data.id || trader_id}`
              });

              const invite_link = inviteLinkObj.invite_link;
              const welcomeMsg = `🏆 *Congratulations!*\n\nYou have been granted access to our *VIP Signals Channel*.\n\n⚠️ *Note:* This link is for *one-time use only* and will expire once you join.`;
              
              await ctx.replyWithMarkdown(welcomeMsg, Markup.inlineKeyboard([
                Markup.button.url("🚀 JOIN VIP CHANNEL", invite_link)
              ]));

            } catch (linkErr) {
              ctx.replyWithMarkdown("⚠️ *Note:* Account verified but invite link could not be generated. Make sure the bot is an Admin in the channel with Invite Users rights.");
            }

          } else {
            ctx.replyWithMarkdown(`⚠️ *No Deposit Detected!*\n\nYour account is verified✅, but your balance is currently *$0.00*.\n\nTo get access to the VIP Channel, please make a minimum deposit of *$10* and check your ID again.`);
          }

        } else {
          // Agar response aaye par success na ho tab ke liye fail message
          const failMsg = `❌ Your Account Is Not Created With My Link\n\n👇 𝗙𝗼𝗹𝗹𝗼𝘄 𝗧𝗵𝗶𝘀 𝗽𝗿ο𝗰𝗲𝘀𝘀 𝘁𝗼 𝗷𝗼𝗶𝗻 𝗩𝗶𝗽\n\n🔹Create '𝗤𝘂𝗼𝘁𝗲𝘅' With The Link -👇\n\nhttps://broker-qx.pro/sign-up/?lid=2056722\n\n👉Deposit Minimum = 10$ Or Much As Possible`;
          ctx.replyWithMarkdown(failMsg, { disable_web_page_preview: true });
        }

      } catch (error) {
        // AGAR API NE 404 RESPONSE DIYA (ID NOT FOUND)
        if (error.response && error.response.status === 404) {
          const failMsg = `❌ Your Account Is Not Created With My Link\n\n👇 𝗙𝗼𝗹𝗹𝗼𝘄 𝗧𝗵𝗶𝘀 𝗽𝗿𝗼𝗰𝗲𝘀𝘀 𝘁𝗼 𝗷𝗼𝗶𝗻 𝗩𝗶𝗽\n\n🔹Create '𝗤𝘂𝗼𝘁𝗲𝘅' With The Link -👇\n\nhttps://market-qx.trade/sign-up/?lid=2056722\n\n👉Deposit Minimum = 10$ Or Much As Possible`;
          return ctx.replyWithMarkdown(failMsg, { disable_web_page_preview: true });
        }

        // Baki aane wale asli system errors ke liye (Jaise timeout)
        let errorDetails = error.message;
        if (error.response) {
          errorDetails = `Status: ${error.response.status}`;
        }
        console.error("API Fetch Error Details:", errorDetails);

        ctx.replyWithMarkdown(`⚠️ *System Error*\n\nUnable to connect to the verification server.\n\n*Reason:* \`${error.message}\`\n\nPlease try again later or contact support.`);
      }
    });

    // Handling Telegram main updates object
    try {
      await bot.handleUpdate(req.body, res);
    } catch (err) {
      console.error("Handle Update Error:", err);
      if (!res.headersSent) res.sendStatus(500);
    }
  } else {
    if (!res.headersSent) res.status(403).send("Invalid Request.");
  }
};
