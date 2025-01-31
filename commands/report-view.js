const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const CONFIG = require('../models/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-view')
        .setDescription('(Admin) Views bug report configuration settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const data = await CONFIG.findOne({
            guildID: interaction.guild.id
        });
        
        if (!data) return interaction.reply({ content: 'There is no data setup for the server. Please use the `/report-setup` command first!' });

        // Channels
        const configReportsForum = (data.reportsforum !== '') ? `<#${data.reportsforum}>` : 'Unset';
        const configPartnerForum = (data.partnerforum !== '') ? `<#${data.partnerforum}>` : 'Unset';
        const configPartnerRole = (data.partnerrole !== '') ? `<@&${data.partnerrole}>` : 'Unset';
        const configTechForum = (data.techforum !== '') ? `<#${data.techforum}>` : 'Unset';
        const configTransForum = (data.transforum !== '') ? `<#${data.transforum}>` : 'Unset';
        let languageList = '';
        
        if (data.suplang.length <= 0) {
            languageList = 'None';
        } else {
            for (let i = 0; i < data.suplang.length; i++) {
                languageList += `- ${data.suplang[i]}\n`;
            }
        }
        
        const channelEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Channel Configuration', iconURL: interaction.guild.iconURL({ dynamic: true, size: 512 }) })
            .addFields([
                { name: 'Bug Reports Forum', value: configReportsForum, inline: true },
                { name: 'Tech Support Forum', value: configTechForum, inline: true },
                { name: 'Translation Reports Forum', value: configTransForum, inline: true },
                { name: 'Partner Reports Forum', value: configPartnerForum, inline: true },
                { name: 'Partner Role', value: configPartnerRole, inline: true }
            ]);

        const langEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Supported Languages Configuration', iconURL: interaction.guild.iconURL({ dynamic: true, size: 512 }) })
            .setDescription(languageList)
        
        await interaction.reply({ embeds: [channelEmbed, langEmbed] });
    },
};