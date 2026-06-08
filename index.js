const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const commands = [
    {
        name: 'solicitar',
        description: 'Enviar mensagem para solicitar funcional',
    },
    {
        name: 'limpar',
        description: 'Limpar mensagens do canal',
        options: [{
            name: 'quantidade',
            type: 10,
            description: 'Quantidade de mensagens',
            required: false
        }]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async (c) => {
    console.log(`Bot logado como ${c.user.tag}`);
    try {
        console.log('Registrando slash commands...');
        await rest.put(
            Routes.applicationCommands(c.user.id),
            { body: commands }
        );
        console.log('Slash commands registrados!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'solicitar') {
            const embed = new EmbedBuilder()
                .setTitle('Secretária de Segurança Pública – Solicite Sua Funcional')
                .setDescription(
                    'Para solicitar sua funcional de forma prática e eficiente, basta ' +
                    'clicar no botão abaixo. Este processo foi implementado para ' +
                    'facilitar e melhorar sua experiência em nossa cidade.'
                )
                .setColor(0x000000)
                .setFooter({ text: 'Segurança Pública – SAMPA RP – Solicite Sua Funcional' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('solicitar_funcional')
                    .setLabel('Solicitar Funcional')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ Mensagem enviada!', ephemeral: true });
        }

        if (interaction.commandName === 'limpar') {
            if (!interaction.member.permissions.has('ManageMessages')) {
                return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
            }
            const qtd = interaction.options.getInteger('quantidade') || 10;
            const deleted = await interaction.channel.bulkDelete(qtd, true);
            await interaction.reply({ content: `🧹 ${deleted.size} mensagens limpas!`, ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'solicitar_funcional') {
        const modal = new ModalBuilder()
            .setCustomId('modal_funcional')
            .setTitle('Solicitar Funcional');

        const inputPersonagem = new TextInputBuilder()
            .setCustomId('personagem')
            .setLabel('Nome do Personagem')
            .setPlaceholder('Ex: João Silva')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const inputIdade = new TextInputBuilder()
            .setCustomId('idade')
            .setLabel('Idade')
            .setPlaceholder('Ex: 25')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(3)
            .setRequired(true);

        const inputPassaporte = new TextInputBuilder()
            .setCustomId('passaporte')
            .setLabel('Passaporte')
            .setPlaceholder('Ex: 16346')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setRequired(true);

        const inputGuarnicao = new TextInputBuilder()
            .setCustomId('guarnicao')
            .setLabel('Guarnição')
            .setPlaceholder('Ex: GER - DOPE')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const inputPatente = new TextInputBuilder()
            .setCustomId('patente')
            .setLabel('Patente Solicitada')
            .setPlaceholder('Ex: Agente 3° Classe')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputPersonagem),
            new ActionRowBuilder().addComponents(inputIdade),
            new ActionRowBuilder().addComponents(inputPassaporte),
            new ActionRowBuilder().addComponents(inputGuarnicao),
            new ActionRowBuilder().addComponents(inputPatente)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_funcional') {
        const personagem = interaction.fields.getTextInputValue('personagem');
        const idade = interaction.fields.getTextInputValue('idade');
        const passaporte = interaction.fields.getTextInputValue('passaporte');
        const guarnicao = interaction.fields.getTextInputValue('guarnicao');
        const patente = interaction.fields.getTextInputValue('patente');

        const embed = new EmbedBuilder()
            .setTitle('Registro Policial')
            .setDescription('Você recebeu uma nova solicitação de registro.')
            .setColor(0x000000)
            .addFields(
                { name: 'Personagem:', value: `\`\`\`${personagem}\`\`\``, inline: true },
                { name: 'Idade:', value: `\`\`\`${idade} anos\`\`\``, inline: true },
                { name: 'Passaporte:', value: `\`\`\`${passaporte}\`\`\``, inline: true },
                { name: 'Guarnição:', value: `\`\`\`${guarnicao}\`\`\``, inline: false },
                { name: 'Patente Solicitada:', value: `\`\`\`${patente}\`\`\``, inline: false },
                { name: 'Info Registro:', value: '• Selecione abaixo a ação desejada.', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('aprovar_registro')
                .setLabel('Aprovar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('recusar_registro')
                .setLabel('Recusar')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'aprovar_registro') {
            await interaction.reply({ content: '✅ Registro aprovado!', ephemeral: true });
        }
        if (interaction.customId === 'recusar_registro') {
            await interaction.reply({ content: '❌ Registro recusado.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
