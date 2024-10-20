const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CONFIG = require('../models/config.js');

const configOptions = ([
    { name: 'Bug Reports Forum (Channel)', value: 'bugreports' },
    { name: 'Tech Support Forum (Channel)', value: 'techsupport' },
    { name: 'Translation Reports Forum (Channel)', value: 'transforum' },
    { name: 'Add Supported Language (String)', value: 'addlang' },
    { name: 'Remove Supported Language (String)', value: 'removelang' },
    { name: 'PC Forum Tag (String)', value: 'pctag' },
    { name: 'VR Forum Tag (String)', value: 'vrtag' },
    { name: 'XBox Forum Tag (String)', value: 'xboxtag' },
    { name: 'PlayStation Forum Tag (String)', value: 'pstag' },
    { name: 'Noted Forum Tag (String)', value: 'notedtag' },
    { name: 'Known Issue Forum Tag (String)', value: 'knowntag' },
    { name: 'Cannot Replicate Forum Tag (String)', value: 'reptag' },
    { name: 'Needs More Info Forum Tag (String)', value: 'logtag' },
    { name: 'Not A Bug Forum Tag (String)', value: 'xtag' },
    { name: '[Translation] Needs Fixed Forum Tag (String)', value: 'nftag' },
    { name: '[Translation] Fixed Forum Tag (String)', value: 'fixedtag' },
    { name: '[Translation] Not A Bug (String)', value: 'txtag' },
]);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-edit')
        .setDescription('(Staff) Edits bug report configuration settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option.setName('config')
                .setDescription('The configuration option that will be edited')
                .addChoices(...configOptions)
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('(If configuration requires channel) The forum that it will be set to')
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option.setName('string')
                .setDescription('(If configuration requires string) The string that it will be set to')
                .setRequired(false)
        ),
    async execute(interaction) {
        const configOption = interaction.options.getString('config');
        const channelOption = interaction.options.getChannel('channel');
        const stringOption = interaction.options.getString('string');
        
        if (!channelOption && !stringOption) return interaction.reply({ content: 'Please fill out a configuration value depending on what it requires. The option is labeled in parenthesis after the configuration option (e.g. "PC Forum Tag (ID)" requires "id" option filled out).' });
        
        const data = await CONFIG.findOne({
            guildID: interaction.guild.id
        });
        
        if (!data) return interaction.reply({ content: 'There is no data setup for the server. Please use the `/report-setup` command first!'});
        
        switch (configOption) {
            case "bugreports":
                if (!channelOption) return interaction.reply({ content: 'This configuration option requires a "channel" parameter to be filled out.' });
                
                data.reportsforum = channelOption.id;
                data.save()
                    .catch((err) => console.log(err))
                    .then(() => interaction.reply({ content: `Set the bug reports forum to the channel ${channelOption} successfully.` }));
                break;
            case "techsupport":
                if (!channelOption) return interaction.reply({ content: 'This configuration option requires a "channel" parameter to be filled out.' });
                
                data.techforum = channelOption.id;
                data.save()
                    .catch((err) => console.log(err))
                    .then(() => interaction.reply({ content: `Set the tech support forum to the channel ${channelOption} successfully.` }));
                break;
            case "transforum":
                if (!channelOption) return interaction.reply({ content: 'This configuration option requires a "channel" parameter to be filled out.' });

                data.transforum = channelOption.id;
                data.save()
                    .catch((err) => console.log(err))
                    .then(() => interaction.reply({ content: `Set the translation reports forum to the channel ${channelOption} successfully.` }));
                break;
            case "addlang":
                if (!stringOption) return interaction.reply({ content: 'This configuration option requires a "string" parameter to be filled out.' });
                
                const languagesListed = stringOption.split(",").map((lang) => lang.trim());
                const isMultiple = languagesListed.length > 1;
                
                if (isMultiple) {
                    await interaction.deferReply();
                    
                    let addedCounter = 0;
                    
                    for (let i = 0; i < languagesListed.length; i++) {
                        const languageAdd = languagesListed[i];
                        const addedMultLanguage = await addLanguage(interaction, languageAdd);
                        
                        if (addedMultLanguage)
                            addedCounter++;
                    }
                    
                    await interaction.followUp({ content: `Added **${addedCounter}**/**${languagesListed.length}** languages successfully.` });
                } else {
                    const addedLanguage = await addLanguage(interaction, stringOption);
                    
                    if (addedLanguage)
                        await interaction.reply({ content: `Added \`${stringOption}\` as a supported translation issue language successfully.` });
                    else
                        await interaction.reply({ content: `Something went wrong trying to add that as a language!` });
                }
                break;
            case "removelang":
                if (!stringOption) return interaction.reply({ content: 'This configuration option requires a "string" parameter to be filled out.' });

                const languagesToRemove = stringOption.split(",").map((lang) => lang.trim());
                const isMultipleRemovals = languagesToRemove.length > 1;

                if (isMultipleRemovals) {
                    await interaction.deferReply();

                    let removedCounter = 0;

                    for (let i = 0; i < languagesToRemove.length; i++) {
                        const languageToRemove = languagesToRemove[i];
                        const langIndex = data.suplang.indexOf(languageToRemove);

                        if (langIndex !== -1) {
                            data.suplang.splice(langIndex, 1);
                            removedCounter++;
                        }
                    }

                    data.save()
                        .catch((err) => console.log(err));
                    
                    await interaction.followUp({ content: `Removed **${removedCounter}**/**${languagesToRemove.length}** languages successfully.` });
                } else {
                    const langIndex = data.suplang.indexOf(stringOption.trim());

                    if (langIndex === -1) return interaction.reply({ content: `There is no supported language with the name \`${stringOption}\`.` });

                    data.suplang.splice(langIndex, 1);
                    await data.save()
                        .catch((err) => console.log(err));
                    
                    await interaction.reply({ content: `Removed \`${stringOption}\` from the supported translation issue languages successfully.` });
                }
                break;
            default:
                if (!configOption.endsWith('tag')) return interaction.reply({ content: 'Failed to set configuration value as something went wrong with the command.' });
                
                const tagName = configOption.split('tag')[0].toUpperCase();
                const shownName = tagName === 'PS' ? 'PlayStation' : tagName === 'XBOX' ? 'XBox' : tagName ?
                                               tagName === 'NOTED' ? 'Noted' : tagName === 'KNOWN' ? 'Known Issue' : 
                                                   tagName === 'REP' ? 'Cannot Replicate' : tagName === 'LOG' ? 'Needs More Info' : 
                                                       tagName === 'NF' ? 'Needs Fixed' : tagName === 'FIXED' ? 'Fixed' :
                                                           tagName === 'TX' ? '[Translation] X' : tagName : tagName;
                
                if (!stringOption) return interaction.reply({ content: 'This configuration option requires a "string" parameter to be filled out.' });
                if (!data.reportsforum) return interaction.reply({ content: 'This configuration option requires the bug reports forum to be set first.' });
                if (!data.transforum) return interaction.reply({ content: 'This configuration option requires the translation reports forum to be set first.' })
                
                const bugChannel = interaction.guild.channels.cache.get(data.reportsforum);
                const bugTags = bugChannel.availableTags;
                
                for (let i = 0; i < bugTags.length; i++) {
                    if (bugTags[i].id !== stringOption) continue;
                    
                    switch (shownName) {
                        case "PC":
                            data.pctag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "VR":
                            data.vrtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "XBox":
                            data.xboxtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "PlayStation":
                            data.pstag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "Noted":
                            data.notedtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "Known Issue":
                            data.knowntag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "Cannot Replicate":
                            data.reptag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "Needs More Info":
                            data.logtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "X":
                            data.xtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        default:
                            return interaction.reply({ content: 'Failed to set that data as something went wrong.' });
                    }
                    
                    return interaction.reply({ content: `Set the ${shownName} forum tag to the \`${bugTags[i].name}\` tag successfully.` });
                }

                const transChannel = interaction.guild.channels.cache.get(data.transforum);
                const transTags = transChannel.availableTags;

                for (let i = 0; i < transTags.length; i++) {
                    if (transTags[i].id !== stringOption) continue;
                    
                    switch (shownName) {
                        case "Needs Fixed":
                            data.nftag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "Fixed":
                            data.fixedtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        case "[Translation] X":
                            data.txtag = stringOption;
                            data.save()
                                .catch((err) => console.log(err));
                            break;
                        default:
                            return interaction.reply({ content: 'Failed to set that data as something went wrong.' });
                    }

                    return interaction.reply({ content: `Set the ${shownName} forum tag to the \`${transTags[i].name}\` tag successfully.` });
                }
                
                await interaction.reply({ content: `Failed to find a forum tag with that ID.` });
                break;
        }
    },
};

async function addLanguage(interaction, language, amount) {
    const data = await CONFIG.findOne({
        guildID: interaction.guild.id
    });

    const existIndex = data.suplang.indexOf(language);
    if (existIndex !== -1) return false;
    
    if (amount > 1) {
        for (let i = 0; i < amount; i++) {
            data.suplang.push(language);
        }

        data.save()
            .catch((err) => console.log(err));

        return true;
    } else {
        data.suplang.push(language);
        data.save()
            .catch((err) => console.log(err));

        return true;
    }
}