const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const embedOptions = ([
    { name: 'Bug Report', value: 'Report a bug you found in-game.' },
    { name: 'Translation Issue', value: 'Report an issue with in-game translation, or suggest better alternatives.' },
    { name: 'Save File/Badge Issue', value: 'Receive assistance with an issue with your save file or badge.' },
    { name: 'Audio, Connection, Crashing Issues', value: 'Receive assistance with audio, connection, or crashing issues.' }
]);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-send-embed')
        .setDescription('(Admin) Sends the bug report submit embed to the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption((option) =>
            option.setName('partner-version')
                .setDescription('Partner version of the bug report submit embed')
                .setRequired(true)
        ),
    async execute(interaction) {
        const isPartnerEmbed = interaction.options.getBoolean('partner-version');
        const embedTitle = isPartnerEmbed ? 'Partners Report System' : 'Report System';
        const embedColor = isPartnerEmbed ? '#CD2546' : null;
        
        const reportEmbed = new EmbedBuilder()
            .setTitle(embedTitle)
            .addFields(...embedOptions)
            .setColor(embedColor)

        const warningEmbed = new EmbedBuilder()
            .setTitle('Important')
            .setDescription('To create a report, click the **Report** button. Follow the dropdown menu to select the option that best describes your issue. ' +
                            'For technical support, save file issues, or badge-related concerns, do not use the Bug Report option. There are dedicated options available for your type of issue.')
            .setColor('#FA4E4E')
        
        const reportButton = new ButtonBuilder()
            .setCustomId('report-bug')
            .setEmoji('🐛')
            .setLabel('Report')
            .setStyle(ButtonStyle.Primary)
        
        const reportRow = new ActionRowBuilder()
            .addComponents(reportButton);
        
        await interaction.channel.send({ embeds: [reportEmbed, warningEmbed], components: [reportRow] });
        await interaction.reply({ content: 'The report embed has been sent.', ephemeral: true });
    },
};