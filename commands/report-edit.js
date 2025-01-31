const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CONFIG = require('../models/config.js');

const configOptions = ([
    { name: 'Bug Reports Forum (Channel)', value: 'bugreports' },
    { name: 'Partner Bug Reports Forum (Channel)', value: 'partnerbugreports' },
    { name: 'Partner Role (Role)', value: 'partnerrole' },
    { name: 'Tech Support Forum (Channel)', value: 'techsupport' },
    { name: 'Translation Reports Forum (Channel)', value: 'transforum' },
    { name: 'Add Supported Language (String)', value: 'addlang' },
    { name: 'Remove Supported Language (String)', value: 'removelang' }
]);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-edit')
        .setDescription('(Admin) Edits bug report configuration settings')
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
        )
        .addRoleOption((option) =>
            option.setName('role')
                .setDescription('(If configuration requires role) The role that it will be set to')
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        const configOption = interaction.options.getString('config');
        const channelOption = interaction.options.getChannel('channel');
        const stringOption = interaction.options.getString('string');
        const roleOption = interaction.options.getRole('role');
        
        if (!channelOption && !stringOption && !roleOption) return interaction.reply({ content: 'Please fill out a configuration value depending on what it requires. The option is labeled in parenthesis after the configuration option (e.g. "Partner Role (Role)" needs the "role" option filled out).' });
        
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
            case "partnerbugreports":
                if (!channelOption) return interaction.reply({ content: 'This configuration option requires a "channel" parameter to be filled out.' });

                data.partnerforum = channelOption.id;
                data.save()
                    .catch((err) => console.log(err))
                    .then(() => interaction.reply({ content: `Set the Partner bug reports forum to the channel ${channelOption} successfully.` }));
                break;
            case "partnerrole":
                if (!roleOption) return interaction.reply({ content: 'This configuration option requires a "role" parameter to be filled out.' });

                data.partnerrole = roleOption.id;
                data.save()
                    .catch((err) => console.log(err))
                    .then(() => interaction.reply({ content: `Set the Partner role to <@&${roleOption.id}> successfully.`, allowedMentions: { parse: [] } }));
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
                await interaction.reply({ content: `That is not a configuration option.` });
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