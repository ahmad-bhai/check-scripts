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
      ctx.replyWithMarkdown(`👋 *Hy Dear ${firstName}*\n\nPlease enter your Quotex Account ID (only numbers), after successful verification we will add you to the VIP group.\n\n*REGISTRATION LINK*\n👇👇👇\nhttps://market-qx.trade/sign-up/?lid=2056722`);
    });

    // --- Account Command ---
    bot.command('account', (ctx) => {
      ctx.replyWithMarkdown(`*How to create Quotex account?*\n\n1st step: Withdraw all your funds.\n2nd step: Delete your old Quotex account.\n3rd step: Open this link:\nhttps://broker-qx.pro/sign-up/?lid=2056722\n\n4th step: Select your country, enter your NEW email and secure password, agree to terms, and click Register.\n\n🎉 *Congratulations!* Your account is created. Now enter your Trader ID (only numbers).`);
    });

    // --- Support Command ---
    bot.command('support', (ctx) => {
      ctx.replyWithMarkdown(`*RQA OFFICIAL SUPPORT TEAM*`, 
        Markup.inlineKeyboard([
          Markup.button.url("📞 Contact Support", "https://t.me/RQA_OFFICIAL")
        ])
      );
    });

    // --- ID Verification Handler ---
    bot.on('text', async (ctx) => {
      const trader_id = ctx.message.text.trim();
      const isNumbersOnly = /^\d+$/.test(trader_id);
      const telegramId = ctx.from.id.toString();

      if (!isNumbersOnly) {
        return ctx.replyWithMarkdown("❌ *Not a valid ID. Please enter numbers only.*");
      }

      // Lock checking
      const alreadyUsedBy = lockedIds[trader_id];
      if (alreadyUsedBy && alreadyUsedBy !== telegramId) {
        return ctx.replyWithMarkdown("⚠️ *Access Denied!*\n\nThis ID is already registered with another user.");
      }

      await ctx.replyWithMarkdown(`🔍 *Verifying Trader ID:* \`${trader_id}\`...`);

      try {
        const response = await axios({
          method: 'post',
          url: 'https://affiliate-verify.vercel.app/api/postback',
          data: { checkId: trader_id },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 12000
        });

        const data = response.data;

        if (data && data.success && data.trader) {
          const trader = data.trader;
          
          // Updated parameters from API structure
          const depositAmount = parseFloat(trader.total_deposit || trader.balance || trader.last_deposit_amount || 0);
          const withdrawAmount = parseFloat(trader.total_withdrawal || trader.withdraw || trader.last_withdrawal_amount || 0);
          const region = trader.country || "Unknown";
          const status = (trader.status || "REGISTERED").toUpperCase();

          // 1. Common Info Text (Yeh Har Haal Mein Show Hogi)
          const infoText = `📊 *ACCOUNT PROFILE INFO*\n━━━━━━━━━━━━━━━━━━\n🆔 *Trader ID:* \`${trader.uid || trader_id}\`\n💰 *Total Deposit:* $${depositAmount.toFixed(2)}\n💸 *Total Withdrawal:* $${withdrawAmount.toFixed(2)}\n🌍 *Region:* ${region}\n📌 *Status:* ${status}\n━━━━━━━━━━━━━━━━━━`;

          // 2. Conditional Handling Base on Deposit Amount
          if (depositAmount >= 10) {
            // Lock ID in temporary instance memory
            lockedIds[trader_id] = telegramId;

            await ctx.replyWithMarkdown(`${infoText}\n\n✨ *Account Status: Qualified for VIP!*`);

            // Generate One-time Private Invite Link
            const channel_id = "-1003779200483"; 
            try {
              const inviteLinkObj = await ctx.telegram.createChatInviteLink(channel_id, {
                member_limit: 1,
                name: `Member: ${trader.uid || trader_id}`
              });

              const invite_link = inviteLinkObj.invite_link;
              const welcomeMsg = `🏆 *Congratulations!*\n\nYou have been granted full access to our *VIP Signals Channel*.\n\n⚠️ *Note:* This link is for *one-time use only* and will expire once you join.`;
              
              await ctx.replyWithMarkdown(welcomeMsg, Markup.inlineKeyboard([
                Markup.button.url("🚀 JOIN VIP CHANNEL NOW", invite_link)
              ]));

            } catch (linkErr) {
              console.error("Link Gen Error:", linkErr.message);
              ctx.replyWithMarkdown("⚠️ *Note:* Your account is verified, but invite link generation failed. Ensure Bot is Admin in Channel with 'Invite Users' rights.");
            }

          } else {
            // Balance $0 ya < $10 ke case mein Warning + Profile Info
            const depositWarning = `⚠️ *Deposit Required to Unlock VIP*\n\nYour Trader ID is correctly registered under our link, but your total deposit is *$${depositAmount.toFixed(2)}*.\n\n👉 *Requirement:* Make a minimum deposit of *$10* to get the VIP Channel link.\n\nAfter depositing, send your ID again to get instant VIP access!`;
            
            await ctx.replyWithMarkdown(`${infoText}\n\n${depositWarning}`);
          }

        } else {
          // Account Not Found under affiliate link
          const failMsg = `❌ *Account Not Found*\n\nYour account is not registered under our official partner link.\n\n👇 *Follow these steps to join VIP:* \n\n1️⃣ Create a new Quotex account using this link:\nhttps://broker-qx.pro/sign-up/?lid=2056722\n\n2️⃣ Deposit minimum *$10*.\n3️⃣ Send your new Trader ID here for verification.`;
          ctx.replyWithMarkdown(failMsg, { disable_web_page_preview: true });
        }

      } catch (error) {
        if (error.response && error.response.status === 404) {
          const failMsg = `❌ *Account Not Found*\n\nYour account is not registered under our official partner link.\n\n👇 *Follow these steps to join VIP:* \n\n1️⃣ Create a new Quotex account using this link:\nhttps://market-qx.trade/sign-up/?lid=2056722\n\n2️⃣ Deposit minimum *$10*.\n3️⃣ Send your new Trader ID here for verification.`;
          return ctx.replyWithMarkdown(failMsg, { disable_web_page_preview: true });
        }

        console.error("API Fetch Error Details:", error.message);
        ctx.replyWithMarkdown(`⚠️ *System Error*\n\nUnable to connect to verification server.\n\n*Reason:* \`${error.message}\`\n\nPlease try again in a few moments.`);
      }
    });

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
