const { EmbedBuilder, ThreadAutoArchiveDuration, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { handleRow, transRow } = require('../functions/button_functions');
const CONFIG = require('../models/config.js');
const MSGS = require('../models/messages.json');
const EMBEDS = require('../functions/report_embed_functions.js');

// *********************************************************************************************
// Creates the bug report forum, sets embed body, applies proper tags when a report is submitted
// *********************************************************************************************
async function createBugReport(interaction, description, difficulty, mapWeather, steps, platform, ghostType, headset = 0) {
    const bugReports = await getReportsChannel(interaction);

    const fullTitle = `${description}`;
    const forumTitle = fullTitle.length >= 100 ? `${fullTitle.slice(0, 96)}...` : fullTitle;
    const embedFooter = `Platform: ${platform}  •  Submitted by @${interaction.user.username} (${interaction.user.id})`;

    const reportEmbed = new EmbedBuilder()
        .setFooter({
            text: embedFooter,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

    await EMBEDS.setEmbedBody(reportEmbed, platform);
    await EMBEDS.addEmbedFields(reportEmbed, description, steps, difficulty, mapWeather, ghostType, 0, headset, 0);

    try {
        const report = await bugReports.threads.create({
            name: forumTitle,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            message: {
                embeds: [reportEmbed],
                components: [handleRow]
            },
            reason: `${interaction.user.id} submitted report`
        });

        await EMBEDS.setPlatformTag(interaction, report, platform);

        const evidenceButton = new ButtonBuilder()
            .setLabel('Add Evidence to Report')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('report-add-evidence')

        const evidenceRow = new ActionRowBuilder()
            .addComponents(evidenceButton);

        await interaction.update({
            content: MSGS.BUG_REPORT.SUCCESS.replace('{ID}', report.id),
            components: [evidenceRow],
            ephemeral: true
        });
    } catch (err) {
        console.log(err);
        return interaction.reply({
            content: MSGS.BUG_REPORT.ERROR,
            ephemeral: true
        });
    }
}

// *********************************************************************************************************
// Creates the bug report forum, sets embed body, applies proper tags when a translation report is submitted
// *********************************************************************************************************
async function createTranslationReport(interaction, language, issue, edit) {
    const transReports = await getTranslationChannel(interaction);
    const fullTitle = `[${language}] ${issue}`;
    const forumTitle = fullTitle.length >= 100 ? `${fullTitle.slice(0, 96)}...` : fullTitle;

    if (transReports) {
        const transEmbed = new EmbedBuilder()
            .setFooter({
                text: `Submitted by @${interaction.user.username} (${interaction.user.id})`,
                iconURL: interaction.user.displayAvatarURL({ size: 1024, dynamic: true })
            });

        const evidenceButton = new ButtonBuilder()
            .setLabel('Add Evidence URL to Report')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('report-add-evidence')

        const evidenceRow = new ActionRowBuilder()
            .addComponents(evidenceButton);

        await EMBEDS.setEmbedBody(transEmbed, 'translation');
        await EMBEDS.addEmbedFields(transEmbed, issue, 0, 0, 0, 0, edit, 0, language);

        try {
            const report = await transReports.threads.create({
                name: forumTitle,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                message: {
                    embeds: [transEmbed],
                    components: [transRow]
                },
                reason: `${interaction.user.id} submitted report`
            });

            await interaction.update({
                content: MSGS.BUG_REPORT.TRANSLATION.SUCCESS.replace('{ID}', report.id),
                components: [evidenceRow],
                ephemeral: true
            });
        } catch (err) {
            console.log(err);
            return interaction.reply({
                content: MSGS.BUG_REPORT.ERROR,
                ephemeral: true
            });
        }
    } else {
        return interaction.reply({
            content: MSGS.BUG_REPORT.ERROR,
            ephemeral: true
        });
    }
}

// *****************************************************************************
// Creates a post in the tech-support channel when a non-bug report is submitted
// *****************************************************************************
async function createTechPost(interaction, issue) {
    const techSupport = await getTechChannel(interaction);
    const forumTitle = issue.length >= 70 ? `${issue.slice(0, 70)}...` : issue;
    const forumPost = `${interaction.user} is requesting assistance with an in-game issue.\n\`\`\`${issue}\`\`\``;
    
    try {
        const techHelp = await techSupport.threads.create({
            name: forumTitle,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            message: {
                content: forumPost,
            },
            reason: `${interaction.user.id} submitted tech bug report`
        });

        await techHelp.send({
            content: MSGS.TECH_SUPPORT.STARTER
        });

        await interaction.update({
            content: MSGS.TECH_SUPPORT.SUCCESS.replace('{CHANNEL}', `<#${techHelp.id}>`),
            components: [],
            ephemeral: true
        });
    } catch (err) {
        console.log(err);
        
        return interaction.reply({
            content: MSGS.TECH_SUPPORT.ERROR,
            ephemeral: true
        });
    }
}

// *******************************
// Returns the bug reports channel
// *******************************
async function getReportsChannel(interaction) {
    try {
        const data = await CONFIG.findOne({ guildID: interaction.guild.id });

        if (data)
            return interaction.guild.channels.cache.get(data.reportsforum);
        else
            return null;
    } catch (error) {
        return null;
    }
}

// ********************************
// Returns the tech support channel
// ********************************
async function getTechChannel(interaction) {
    try {
        const data = await CONFIG.findOne({ guildID: interaction.guild.id });

        if (data) {
            return interaction.guild.channels.cache.get(data.techforum);
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

// ***************************************
// Returns the translation reports channel
// ***************************************
async function getTranslationChannel(interaction) {
    try {
        const data = await CONFIG.findOne({ guildID: interaction.guild.id });

        if (data)
            return interaction.guild.channels.cache.get(data.transforum);
        else
            return null;
    } catch (error) {
        return null;
    }
}

// *********************************************************************************************
// Returns linked but truncated evidence if it's an improper link, otherwise links and embeds it
// *********************************************************************************************
function formatEvidence(evidence) {
    const lowerEvidence = evidence.toLowerCase();
    const slashlessEvidence = lowerEvidence.replace(/\//g, '');
    const properEvidenceFormats = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'];
    const isEvidenceProper = properEvidenceFormats.some((form) => slashlessEvidence.endsWith(form));
    const isEvidenceLink = slashlessEvidence.startsWith('http');

    return isEvidenceLink ? (isEvidenceProper ? `[Evidence Provided](${evidence})` : `Evidence Provided: <${evidence}>`) : '';
}

module.exports = {
    createBugReport,
    createTranslationReport,
    createTechPost,
    formatEvidence
};