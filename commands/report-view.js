const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const CONFIG = require('../models/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-view')
        .setDescription('(Staff) Views bug report configuration settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const data = await CONFIG.findOne({
            guildID: interaction.guild.id
        });
        
        if (!data) return interaction.reply({ content: 'There is no data setup for the server. Please use the `/report-setup` command first!' });

        // Channels
        const configReportsForum = (data.reportsforum !== '') ? `<#${data.reportsforum}>` : 'Unset';
        const configTechForum = (data.techforum !== '') ? `<#${data.techforum}>` : 'Unset';
        const configTransForum = (data.transforum !== '') ? `<#${data.transforum}>` : 'Unset';
        let languageList = '';

        // Platform Tags
        const configPCTag = (data.pctag !== '') ? 'Set' : 'Unset';
        const configVRTag = (data.vrtag !== '') ? 'Set' : 'Unset';
        const configXBTag = (data.xboxtag !== '') ? 'Set' : 'Unset';
        const configPSTag = (data.pstag !== '') ? 'Set' : 'Unset';
        
        // Standard Handle Tags
        const configNotedTag = (data.notedtag !== '') ? 'Set' : 'Unset';
        const configKnownTag = (data.knowntag !== '') ? 'Set' : 'Unset';
        const configRepTag = (data.reptag !== '') ? 'Set' : 'Unset';
        const configLogTag = (data.logtag !== '') ? 'Set' : 'Unset';
        const configXTag = (data.xtag !== '') ? 'Set' : 'Unset';

        // Translation Handle Tags
        const configNFTag = (data.nftag !== '') ? 'Set' : 'Unset';
        const configFixedTag = (data.fixedtag !== '') ? 'Set' : 'Unset';
        const configTXTag = (data.txtag !== '') ? 'Set' : 'Unset';
        
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
                { name: 'Translation Reports Forum', value: configTransForum, inline: true }
            ]);
        
        const tagEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Bug Reports Forum Tag Configuration', iconURL: interaction.guild.iconURL({ dynamic: true, size: 512 }) })
            .addFields([
                { name: 'PC', value: configPCTag, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: 'VR', value: configVRTag, inline: true },
                { name: 'XBox', value: configXBTag, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: 'PlayStation', value: configPSTag, inline: true }
            ]);

        const handleEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Report Handling Forum Tag Configuration', iconURL: interaction.guild.iconURL({ dynamic: true, size: 512 }) })
            .addFields([
                { name: 'Noted', value: configNotedTag, inline: true },
                { name: 'Known', value: configKnownTag, inline: true },
                { name: 'Cannot Replicate', value: configRepTag, inline: true },
                { name: 'Needs More Info', value: configLogTag, inline: true },
                { name: 'Not A Bug', value: configXTag, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '[T] Needs Fixed', value: configNFTag, inline: true },
                { name: '[T] Fixed', value: configFixedTag, inline: true },
                { name: '[T] Not A Bug', value: configTXTag, inline: true },
            ])
            .setFooter({ text: '[T] = Translation' });

        const langEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Supported Languages Configuration', iconURL: interaction.guild.iconURL({ dynamic: true, size: 512 }) })
            .setDescription(languageList)
        
        await interaction.reply({ embeds: [channelEmbed, tagEmbed, handleEmbed, langEmbed] });
    },
};