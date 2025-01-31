const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } = require('discord.js');
const CONFIG = require('../models/config.js');

// ************************************
// Report handling button functionality
// ************************************
async function handleBugReport(interaction, channel, id) {
    const buttonId = id.replace('bughandle-', '');
    const channelTags = channel.appliedTags;
    
    const data = await CONFIG.findOne({
        guildID: interaction.guild.id
    });
    
    if (!data) return;
    
    // Platform Tags
    const pcTag = await findTag(interaction, channel, 'pc');
    const xboxTag = await findTag(interaction, channel, 'xbox');
    const psTag = await findTag(interaction, channel, 'playstation');
    const vrTag = await findTag(interaction, channel, 'vr');
    
    const postTags = channelTags.filter((tagId) =>
        tagId === pcTag ||
        tagId === xboxTag ||
        tagId === psTag ||
        tagId === vrTag);
    
    await changeButton(interaction, id);
    
    switch (buttonId) {
        case "noted":
            const notedTag = await findTag(interaction, channel, 'noted');
            
            await channel.setAppliedTags([...postTags, notedTag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "known":
            const knownTag = await findTag(interaction, channel, 'known issue');
            
            await channel.setAppliedTags([...postTags, knownTag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "replicate":
            const replicateTag = await findTag(interaction, channel, 'cannot replicate');
            
            await channel.setAppliedTags([...postTags, replicateTag]).catch(() => {});
            await channel.setArchived(false);
            break;
        case "log":
            const infoTag = await findTag(interaction, channel, 'not enough info');
            
            await channel.setAppliedTags([...postTags, infoTag]).catch(() => {});
            await channel.setArchived(false);
            break;
        case "notbug":
            const notbugTag = await findTag(interaction, channel, 'not a bug');
            
            await channel.setAppliedTags([...postTags, notbugTag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "nf":
            const nfTag = await findTag(interaction, channel, 'needs fixed');
            
            await channel.setAppliedTags([nfTag]).catch(() => {});
            await channel.setArchived(false);
            break;
        case "fixed":
            const fixedTag = await findTag(interaction, channel, 'fixed');
            
            await channel.setAppliedTags([fixedTag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "transnotbug":
            const notissueTag = await findTag(interaction, channel, 'not an issue');
            
            await channel.setAppliedTags([notissueTag]).catch(() => {});
            await channel.setArchived(true);
            break;
        default:
            break;
    }
}

// **************************************************
// Changes button color depending on what was pressed
// **************************************************
async function changeButton(interaction, id) {
    const row = interaction.message.components[0];
    const buttons = row.components;
    
    const updatedButtons = await buttons.map((button) => {
        if (button.customId === id) {
            if (id === 'bughandle-notbug' || id === 'bughandle-transnotbug') {
                return ButtonBuilder.from(button)
                    .setStyle(ButtonStyle.Danger);
            } else {
                return ButtonBuilder.from(button)
                    .setStyle(ButtonStyle.Success);
            }
        }
        
        return ButtonBuilder.from(button)
            .setStyle(ButtonStyle.Secondary);
    });
    
    const updatedRow = new ActionRowBuilder().addComponents(updatedButtons);
    await interaction.update({ components: [updatedRow] });
}

// *****************************
// Finds and returns a forum tag
// *****************************
async function findTag(interaction, channel, tagname) {
    const tagChannel = (channel.type === ChannelType.GuildForum ? channel : channel.parent); // Get the channel "parent" (the forum, not the thread/post)
    const foundTag = tagChannel.availableTags.find((tag) => tag.name.toLowerCase() === tagname); // Filtered found tag

    // Return the tag ID if found
    return foundTag ? foundTag.id : null;
}

// ***************************
// Bug report handling buttons
// ***************************
const notedButton = new ButtonBuilder()
    .setCustomId('bughandle-noted')
    .setLabel('Noted')
    .setStyle(ButtonStyle.Secondary)

const knownButton = new ButtonBuilder()
    .setCustomId('bughandle-known')
    .setLabel('Known Issue')
    .setStyle(ButtonStyle.Secondary)

const repButton = new ButtonBuilder()
    .setCustomId('bughandle-replicate')
    .setLabel('Cannot Replicate')
    .setStyle(ButtonStyle.Secondary)

const logButton = new ButtonBuilder()
    .setCustomId('bughandle-log')
    .setLabel('Needs More Info')
    .setStyle(ButtonStyle.Secondary)

const xButton = new ButtonBuilder()
    .setCustomId('bughandle-notbug')
    .setLabel('X')
    .setStyle(ButtonStyle.Secondary)

const handleRow = new ActionRowBuilder()
    .addComponents(notedButton)
    .addComponents(knownButton)
    .addComponents(repButton)
    .addComponents(logButton)
    .addComponents(xButton);

// ***********************************
// Translation report handling buttons
// ***********************************
const nfButton = new ButtonBuilder()
    .setCustomId('bughandle-nf')
    .setLabel('Needs Fixed')
    .setStyle(ButtonStyle.Secondary)

const fixedButton = new ButtonBuilder()
    .setCustomId('bughandle-fixed')
    .setLabel('Fixed')
    .setStyle(ButtonStyle.Secondary)

const txButton = new ButtonBuilder()
    .setCustomId('bughandle-transnotbug')
    .setLabel('X')
    .setStyle(ButtonStyle.Secondary)

const transRow = new ActionRowBuilder()
    .addComponents(nfButton)
    .addComponents(fixedButton)
    .addComponents(txButton);

module.exports = {
    handleBugReport,
    handleRow,
    transRow,
    findTag
}