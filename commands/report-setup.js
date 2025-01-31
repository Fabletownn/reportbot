const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const CONFIG = require('../models/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-setup')
        .setDescription('(Staff) Sets up (or resets) bug report configuration settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const data = await CONFIG.findOne({
            guildID: interaction.guild.id
        });
        
        if (!data) {
            const newConfigData = new CONFIG({
                guildID: interaction.guild.id,
                reportsforum: '',
                partnerforum: '',
                partnerrole: '',
                techforum: '',
                transforum: '',
                suplang: []
            });
            
            await newConfigData.save()
                .catch((err) => console.log(err))
                .then(() => interaction.reply({ content: 'Successfully set up data for the server. To view configuration settings, use `/report-view`. To edit configuration settings, use `/report-edit`.' }))
        } else {
            const resetButton = new ButtonBuilder()
                .setCustomId('config-reset')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
            
            const denyButton = new ButtonBuilder()
                .setCustomId('config-deny')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
            
            const resetRow = new ActionRowBuilder()
                .addComponents(resetButton, denyButton);
            
            await interaction.reply({ content: 'There is already existing data set up for the server. Reset all configuration?', components: [resetRow] });
        }
    },
};