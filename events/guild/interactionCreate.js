const MSGS = require('../../models/messages.json');
const INT = require('../../functions/interaction_functions.js');
const BUTN = require('../../functions/button_functions.js');

module.exports = async (Discord, client, interaction) => {
    if (interaction.isButton()) {
        const buttonCID = interaction.customId.toLowerCase();
        const isConfig = buttonCID.startsWith('config-');
        const isHandle = buttonCID.startsWith('bughandle-');
        
        if (isConfig)
            await INT.handleConfigInteraction(interaction);
        else if (isHandle)
            await BUTN.handleBugReport(interaction, interaction.channel, buttonCID);
        else
            await INT.handleReportInteraction(interaction);
    }
    
    else if (interaction.isStringSelectMenu()) {
        const selectCID = interaction.values[0].toLowerCase();
        const needsAdditionalDropdown = selectCID === 'bugreport' || 
            selectCID === 'bugreport-translation' || 
            selectCID === 'bugreport-vr';
        
        if (selectCID === 'assist-savebadge') return interaction.update({
            content: MSGS.SAVE_BADGE.SELECT,
            components: []
        });
        
        if (needsAdditionalDropdown)
            await INT.handleAdditionalDropdown(interaction);
        else 
            await INT.openReportModal(interaction);
    }
    
    else if (interaction.isModalSubmit()) {
        await INT.handleModalSubmit(interaction);
    }
};
