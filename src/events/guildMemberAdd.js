const CombinedInvite = require('../models/CombinedInvite');
const CoinReward = require('../models/CoinReward');
const User = require('../models/User');
const { Collection } = require('discord.js');

const invites = new Collection();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
        try {
      const newInvites = await member.guild.invites.fetch();

      const oldInvites = invites.get(member.guild.id);

      const usedInvite = newInvites.find(inv => {
        const oldInvite = oldInvites && oldInvites.get(inv.code);
        return !oldInvite || oldInvite.uses < inv.uses;
      });

      invites.set(member.guild.id, newInvites);

      if (!usedInvite) return;

      const coinRewardSettings = await CoinReward.findOne({ guildId: member.guild.id });

      if (!coinRewardSettings || coinRewardSettings.coinsPerInvite === 0) {
        console.log(`Invites are not rewarded in ${member.guild.name}.`);
        return;
      }

      await CombinedInvite.create({
        guildId: member.guild.id,
        inviterId: usedInvite.inviter.id,
        inviteeId: member.id,
      });

      const updatedUser = await User.findOneAndUpdate(
        { userId: usedInvite.inviter.id },
        {
          $inc: { coins: coinRewardSettings.coinsPerInvite, invites: 1 },
        },
        { upsert: true, new: true }
      );

        const inviterUser = await client.users.fetch(usedInvite.inviter.id);
        await inviterUser.send(`You received ${coinRewardSettings.coinsPerInvite} coins for inviting ${member.user.tag} to ${member.guild.name}.`);

        const logChannelId = process.env.logChannelId;
        if (logChannelId) {
          const logChannel = await member.guild.channels.fetch(logChannelId);
          logChannel.send(`${inviterUser.tag} got ${coinRewardSettings.coinsPerInvite} coins for inviting ${member.user.tag}.`);
        }

        console.log(`${member.user.tag} joined using the invite from ${usedInvite.inviter.tag}.`);
    } catch (error) {
      console.error('Error tracking invite:', error);
    }
  },
};