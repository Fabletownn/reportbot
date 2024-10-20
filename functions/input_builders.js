const { TextInputBuilder, TextInputStyle } = require('discord.js');

////////////////////////////////////////////////////////////////
// Standard
////////////////////////////////////////////////////////////////
const describeText = new TextInputBuilder()
    .setCustomId('mreport-description')
    .setLabel('Describe The Bug')
    .setPlaceholder('Description..')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2500)

const stepsText = new TextInputBuilder()
    .setCustomId('mreport-steps')
    .setLabel('Steps to Recreate')
    .setPlaceholder('Steps to recreate..')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2500)

const difficultyText = new TextInputBuilder()
    .setCustomId('mreport-difficulty')
    .setLabel('Difficulty')
    .setPlaceholder('Difficulty..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

const mapWeatherText = new TextInputBuilder()
    .setCustomId('mreport-mapweather')
    .setLabel('Map & Weather')
    .setPlaceholder('Map name, weather..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

const ghostTypeText = new TextInputBuilder()
    .setCustomId('mreport-ghosttype')
    .setLabel('Ghost Type')
    .setPlaceholder('Ghost type..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

const evidenceText = new TextInputBuilder()
    .setCustomId(`mevidence-url`)
    .setLabel('Image/Video Evidence URL')
    .setPlaceholder('Link to screenshot or video..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200)

////////////////////////////////////////////////////////////////
// VR
////////////////////////////////////////////////////////////////
const VR_dmwText = new TextInputBuilder()
    .setCustomId('mreport-dmw')
    .setLabel('Difficulty & Map & Weather')
    .setPlaceholder('Difficulty, map name, weather..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

const VR_headsetText = new TextInputBuilder()
    .setCustomId('mreport-headset')
    .setLabel('VR Headset')
    .setPlaceholder('VR headset name..')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

////////////////////////////////////////////////////////////////
// Translation
////////////////////////////////////////////////////////////////
const TL_issueText = new TextInputBuilder()
    .setCustomId('mreport-transissue')
    .setLabel('Issue')
    .setPlaceholder('Translation issue..')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2500)

const TL_editText = new TextInputBuilder()
    .setCustomId('mreport-edit')
    .setLabel('Suggested Edit')
    .setPlaceholder('Suggested translation edit..')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2500)

////////////////////////////////////////////////////////////////
// Tech Support
////////////////////////////////////////////////////////////////
const TC_issueText = new TextInputBuilder()
    .setCustomId('mreport-techissue')
    .setLabel('Describe The Issue You\'re Experiencing')
    .setPlaceholder('Issue in detail..')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1900)

module.exports = {
    describeText,
    stepsText,
    difficultyText,
    mapWeatherText,
    ghostTypeText,
    evidenceText,
    VR_dmwText,
    VR_headsetText,
    TC_issueText,
    TL_issueText,
    TL_editText
}