const { StringSelectMenuBuilder,  StringSelectMenuOptionBuilder,  ActionRowBuilder, ModalBuilder } = require('discord.js');
const { describeText, stepsText, difficultyText, mapWeatherText, ghostTypeText, evidenceText, VR_headsetText, VR_dmwText, TC_issueText, TL_issueText, TL_editText } = require('../functions/input_builders.js');
const CONFIG = require('../models/config.js');
const MSGS = require('../models/messages.json');
const EMBEDF = require('./report_embed_functions.js');
const REPORT = require('./report_functions.js');

// *************************************************************
// Resets data or cancels data reset if configuration is (re)set
// *************************************************************
async function handleConfigInteraction(interaction) {
    switch (interaction.customId) {
        // Called when "confirm" is clicked on resetting config data
        case "config-reset":
            await CONFIG.findOneAndDelete({
                guildID: interaction.guild.id
            }).then(async () => {
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
                    .then(() => interaction.message.edit({
                            content: MSGS.CONFIG.RESET,
                            components: []
                        })
                    );
            });
            break;

        // Called when "deny" is clicked on resetting config data    
        case "config-deny":
            await interaction.message.edit({
                content: MSGS.CONFIG.CANCEL,
                components: []
            });
            break;

        default:
            break;
    }
}

// ****************************************************************
// Creates a report (or tech post) depending on the modal submitted
// ****************************************************************
async function handleReportInteraction(interaction) {
    switch (interaction.customId) {
        // Dropdown when the "Report" button is clicked
        case "report-bug":
            const bugDropdown = new StringSelectMenuBuilder()
                .setCustomId('report-dropdown')
                .setPlaceholder('Report Issue')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Bug Report')
                        .setDescription('Report a bug')
                        .setValue('bugreport'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Translation Issue')
                        .setDescription('Report a translation issue')
                        .setValue('bugreport-translation'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Save File/Badge Issue')
                        .setDescription('Receive assistance for save files and badge issues')
                        .setValue('assist-savebadge'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Audio, Connection, Crashing')
                        .setDescription('Receive assistance for audio, connection, and crashes')
                        .setValue('assist-tech')
                );

            const bugRow = new ActionRowBuilder()
                .addComponents(bugDropdown);

            await interaction.reply({
                content: MSGS.INTERACTION.MAKE_SELECTION,
                components: [bugRow],
                ephemeral: true
            });
            break;

        // When the "Add Evidence" button is clicked after reporting    
        case "report-add-evidence":
            const channelId = interaction.message.content.split(' ').slice(-1)[0]; // Get last word in message, as it'll be the channel ID to post in
            const reportThread = interaction.guild.channels.cache.get(channelId);

            if (!reportThread) return interaction.reply({
                content: MSGS.EVIDENCE.ERROR,
                ephemeral: true
            });

            const evidenceModal = new ModalBuilder()
                .setCustomId(`evidence-modal-${channelId}`)
                .setTitle(`Add Evidence to Report`)
                .addComponents([
                    new ActionRowBuilder().addComponents(evidenceText),
                ]);

            await interaction.showModal(evidenceModal);
            break;

        default:
            break;
    }
}

// ****************************************************************************************************************************
// Adds an additional dropdown depending on the selected string menu, if it needs one (e.g. VR headsets, translation languages)
// ****************************************************************************************************************************
async function handleAdditionalDropdown(interaction) {
    switch (interaction.values[0].toLowerCase()) {
        case "bugreport":
            const expandDropdown = new StringSelectMenuBuilder()
                .setCustomId('report-dropdown')
                .setPlaceholder('Report bug..')
                .addOptions([
                    new StringSelectMenuOptionBuilder()
                        .setLabel('PC Bug Report')
                        .setDescription('Report a non-VR bug')
                        .setValue('bugreport-pc'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('XBox Bug Report')
                        .setDescription('Report an XBox bug')
                        .setValue('bugreport-xbox'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('PlayStation Bug Report')
                        .setDescription('Report a PlayStation bug')
                        .setValue('bugreport-playstation'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('VR Bug Report')
                        .setDescription('Report a VR bug')
                        .setValue('bugreport-vr'),
                ]);

            const expandRow = new ActionRowBuilder()
                .addComponents(expandDropdown);

            await interaction.update({
                content: MSGS.INTERACTION.PLATFORM_SELECTION,
                components: [expandRow]
            });
            break;

        // Dropdown when "Translation Issue" is selected    
        case "bugreport-translation":
            const cData = await CONFIG.findOne({
                guildID: interaction.guild.id
            });

            let supportedLanguages = [];
            let languageLeftovers = [];
            let row;

            if (cData) {
                let langCounter = 0;

                // Get the first 25 languages if there are more
                for (let i = 0; i < cData?.suplang.length; i++) {
                    const languageOption = new StringSelectMenuOptionBuilder()
                        .setLabel(cData?.suplang[i])
                        .setDescription('Report an issue with ' + cData?.suplang[i])
                        .setValue(`trissue-${cData?.suplang[i].toLowerCase()}`);

                    if (langCounter < 25) {  // Discord limit of 25 options per select menu
                        supportedLanguages.push(languageOption);
                        langCounter++;
                    } else {
                        languageLeftovers.push(languageOption);
                    }
                }

                // First dropdown with supported languages
                const translateDropdown = new StringSelectMenuBuilder()
                    .setCustomId('trans-dropdown')
                    .setPlaceholder('Language..')
                    .addOptions(supportedLanguages);

                // Second dropdown with languages if there are more than 25
                if (languageLeftovers.length > 0) {
                    const translateDropdown2 = new StringSelectMenuBuilder()
                        .setCustomId('trans-dropdown-2')
                        .setPlaceholder('More languages..')
                        .addOptions(languageLeftovers);

                    const translateRow = new ActionRowBuilder().addComponents(translateDropdown);
                    const translateRow2 = new ActionRowBuilder().addComponents(translateDropdown2);

                    row = [translateRow, translateRow2]; // Combine rows
                } else {
                    // Otherwise only one row
                    const translateRow = new ActionRowBuilder().addComponents(translateDropdown);
                    row = [translateRow];
                }

                await interaction.update({
                    content: MSGS.INTERACTION.LANGUAGE_SELECTION,
                    components: row
                });
            }
            break;

        case "bugreport-vr":
            const vrDropdown = new StringSelectMenuBuilder()
                .setCustomId('report-dropdown')
                .setPlaceholder('Report bug..')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Meta Quest')
                        .setDescription('This happened on the Meta Quest')
                        .setValue('vrheadset-meta-quest'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Oculus Rift')
                        .setDescription('This happened on the Oculus Rift')
                        .setValue('vrheadset-oculus-rift'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Valve Index')
                        .setDescription('This happened on the Valve Index')
                        .setValue('vrheadset-valve-index'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('HTC Vive Series')
                        .setDescription('This happened on the HTC Vive Series')
                        .setValue('vrheadset-htc-vive-series'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('PSVR2')
                        .setDescription('This happened on the PSVR2')
                        .setValue('vrheadset-psvr2'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pico')
                        .setDescription('This happened on the Pico')
                        .setValue('vrheadset-pico'),

                    new StringSelectMenuOptionBuilder()
                        .setLabel('Other')
                        .setDescription('This happened on a headset not listed here')
                        .setValue('vrheadset-other')
                );

            const vrRow = new ActionRowBuilder()
                .addComponents(vrDropdown);

            await interaction.update({
                content: MSGS.INTERACTION.HEADSET_SELECTION,
                components: [vrRow]
            });
            break;

        default:
            break;
    }
}

// ****************************************************************
// Creates a report (or tech post) depending on the modal submitted
// ****************************************************************
async function handleModalSubmit(interaction) {
    const optionId = interaction.customId.toLowerCase();

    // When a Translation report is submitted
    if (optionId.startsWith('report-modal-translation')) {
        const modalLanguage = EMBEDF.capLetters(optionId, 3);
        const modalIssue = interaction.fields.getTextInputValue('mreport-transissue');
        const modalEdit = interaction.fields.getTextInputValue('mreport-edit');

        await REPORT.createTranslationReport(interaction, modalLanguage, modalIssue, modalEdit);

    // When a VR report is submitted
    } else if (optionId.startsWith('vrreport-')) {
        const modalDescription = interaction.fields.getTextInputValue('mreport-description');
        const modalSteps = interaction.fields.getTextInputValue('mreport-steps');
        const modalGhostType = interaction.fields.getTextInputValue('mreport-ghosttype');
        let headset = optionId.replace('vrreport-modal-', '');
        let headsetWords = headset.split('-');
        let headsetResult = headsetWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        let headsetName = headsetResult
            .replace('Psvr2', 'PSVR2')
            .replace('Htc Vive Series', 'HTC Vive Series')
            .replace('Other', 'VR');

        // Create a report with the inquired VR Headset if they selected 'Other'
        if (optionId === 'vrreport-modal-other') {
            const modalHeadset = interaction.fields.getTextInputValue('mreport-headset');
            const modalDMW = interaction.fields.getTextInputValue('mreport-dmw');

            await REPORT.createBugReport(interaction, modalDescription, modalDMW, modalDMW, modalSteps, 'VR', modalGhostType, modalHeadset)
        } else { // Otherwise create a standard report
            const modalDifficulty = interaction.fields.getTextInputValue('mreport-difficulty');
            const modalMapWeather = interaction.fields.getTextInputValue('mreport-mapweather');

            await REPORT.createBugReport(interaction, modalDescription, modalDifficulty, modalMapWeather, modalSteps, 'VR', modalGhostType, headsetName);
        }

    // When evidence for a report is submitted
    } else if (optionId.startsWith('evidence-modal')) {
        const channelId = optionId.split('-')[2];
        const reportChannel = interaction.guild.channels.cache.get(channelId);
        const modalEvidenceURL = interaction.fields.getTextInputValue('mevidence-url');
        const currentDate = Math.round((Date.now()) / 1000);
        const reportEvidence = REPORT.formatEvidence(modalEvidenceURL);

        if (!reportChannel) return interaction.reply({
            content: MSGS.EVIDENCE.ERROR,
            ephemeral: true
        });

        if (reportEvidence) await reportChannel.send({
            content: `[<t:${currentDate}:F>]\n\n${reportEvidence}`
        });

        await interaction.reply({
            content: MSGS.EVIDENCE.SUCCESS,
            ephemeral: true
        });
    } else {
        switch (optionId) {
            // When a VR report is submitted
            case "report-modal-vr":
                const VR_modalPlatform = EMBEDF.capPlatformId(EMBEDF.capCustomId(optionId, 2));
                const VR_modalHeadset = optionId === 'report-modal-vr' ? interaction.fields.getTextInputValue('mreport-headset') : 0;
                const VR_modalDescription = interaction.fields.getTextInputValue('mreport-description');
                const VR_modalSteps = interaction.fields.getTextInputValue('mreport-steps');
                const VR_modalDMW = interaction.fields.getTextInputValue('mreport-dmw');
                const VR_modalGhostType = interaction.fields.getTextInputValue('mreport-ghosttype');

                await REPORT.createBugReport(interaction, VR_modalDescription, VR_modalDMW, VR_modalDMW, VR_modalSteps, VR_modalPlatform, VR_modalGhostType, VR_modalHeadset);
                break;

            // When a tech report is submitted    
            case "report-modal-tech":
                const modalIssue = interaction.fields.getTextInputValue('mreport-techissue');

                await REPORT.createTechPost(interaction, modalIssue);
                break;

            // When a non-VR/console report is submitted    
            default:
                if (!optionId.startsWith('report-modal')) return;

                const modalPlatform = EMBEDF.capPlatformId(EMBEDF.capCustomId(optionId, 2));
                const modalDescription = interaction.fields.getTextInputValue('mreport-description');
                const modalSteps = interaction.fields.getTextInputValue('mreport-steps');
                const modalDifficulty = interaction.fields.getTextInputValue('mreport-difficulty');
                const modalMW = interaction.fields.getTextInputValue('mreport-mapweather');
                const modalGhostType = interaction.fields.getTextInputValue('mreport-ghosttype');

                await REPORT.createBugReport(interaction, modalDescription, modalDifficulty, modalMW, modalSteps, modalPlatform, modalGhostType, 0);
                break;
        }
    }
}

// *************************************************************
// Opens a modal depending on the type of report being submitted
// *************************************************************
async function openReportModal(interaction) {
    const optionId = interaction.customId.toLowerCase();
    const selectId = interaction.values[0].toLowerCase();

    if (optionId.startsWith('trans-')) {
        const transId = selectId.toLowerCase().replace(/\s/g, '-');
        const repLanguage = EMBEDF.capLetters(transId, 1);

        const translationReportModal = new ModalBuilder()
            .setCustomId(`report-modal-translation-${transId.replace('trissue-', '')}`)
            .setTitle(`Submit ${repLanguage} Report`)
            .addComponents([
                new ActionRowBuilder().addComponents(TL_issueText),
                new ActionRowBuilder().addComponents(TL_editText)
            ]);

        await interaction.showModal(translationReportModal);
    } else {
        switch (selectId) {
            case "assist-tech":
                const techReportModal = new ModalBuilder()
                    .setCustomId(`report-modal-tech`)
                    .setTitle(`Create Tech Support Thread`)
                    .addComponents([
                        new ActionRowBuilder().addComponents(TC_issueText),
                    ]);

                await interaction.showModal(techReportModal);
                break;

            // Modal when PC, PlayStation, XBox, or VR Headset is selected    
            default:
                let reportType = selectId.split('-')[1];
                let cutId = selectId.replace('vrheadset-', '');

                if (selectId.startsWith('vrheadset-')) {
                    let headset = selectId.replace('vrheadset-', '');
                    let headsetWords = headset.split('-');
                    let headsetResult = headsetWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

                    reportType = headsetResult
                        .replace('Psvr2', 'PSVR2')
                        .replace('Htc Vive Series', 'HTC Vive Series')
                        .replace('Other', 'VR');
                }

                // Modal given when a platform is chosen, and not a VR headset
                const defaultReportModal = new ModalBuilder()
                    .setCustomId(`report-modal-${reportType.toLowerCase()}`)
                    .setTitle(`Submit ${EMBEDF.capPlatformId(reportType)} Bug Report`)
                    .addComponents([
                        new ActionRowBuilder().addComponents(describeText),
                        new ActionRowBuilder().addComponents(stepsText),
                        new ActionRowBuilder().addComponents(difficultyText),
                        new ActionRowBuilder().addComponents(mapWeatherText),
                        new ActionRowBuilder().addComponents(ghostTypeText),
                    ]);

                // Modal given when a listed VR headset is chosen
                const vrReportModal = new ModalBuilder()
                    .setCustomId(`vrreport-modal-${cutId}`)
                    .setTitle(`Submit ${EMBEDF.capPlatformId(reportType)} Bug Report`)
                    .addComponents([
                        new ActionRowBuilder().addComponents(describeText),
                        new ActionRowBuilder().addComponents(stepsText),
                        new ActionRowBuilder().addComponents(difficultyText),
                        new ActionRowBuilder().addComponents(mapWeatherText),
                        new ActionRowBuilder().addComponents(ghostTypeText),
                    ]);

                // Modal given when a VR headset is chosen but not as listed
                const otherReportModal = new ModalBuilder()
                    .setCustomId(`vrreport-modal-other`)
                    .setTitle(`Submit ${EMBEDF.capPlatformId(reportType)} Bug Report`)
                    .addComponents([
                        new ActionRowBuilder().addComponents(VR_headsetText),
                        new ActionRowBuilder().addComponents(describeText),
                        new ActionRowBuilder().addComponents(stepsText),
                        new ActionRowBuilder().addComponents(VR_dmwText),
                        new ActionRowBuilder().addComponents(ghostTypeText),
                    ]);

                if (reportType === 'VR') // If report type is 'Other' (VR)
                    await interaction.showModal(otherReportModal);
                else if (selectId.startsWith('vrheadset-'))
                    await interaction.showModal(vrReportModal);
                else
                    await interaction.showModal(defaultReportModal);
                break;
        }
    }
}

module.exports = {
    handleConfigInteraction,
    handleReportInteraction,
    handleAdditionalDropdown,
    handleModalSubmit,
    openReportModal
}