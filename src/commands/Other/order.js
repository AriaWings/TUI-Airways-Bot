const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'order',
    description: 'Collects answers to questions and sends an order request to the designated channel.',
    async execute(message, args, client) {
        const questionsFile = 'questions.json';
        const responsesFile = 'responses.json';
        const orderAppResponseId = process.env.ORDER_APP_RESPONSE_ID;
        const roleId = 1326183694725283920;
        const userId = message.author.id;

        const loadQuestions = () => {
            try {
                if (fs.existsSync(questionsFile)) {
                    return JSON.parse(fs.readFileSync(questionsFile, 'utf-8')).questions || [];
                } else {
                    console.error('Questions file not found!');
                    return [];
                }
            } catch (error) {
                console.error('Error reading questions file:', error);
                return [];
            }
        };        

        const loadResponses = () => {
            if (fs.existsSync(responsesFile)) {
                return JSON.parse(fs.readFileSync(responsesFile, 'utf-8'));
            }
            return {};
        };

        const questions = loadQuestions();
        const responses = loadResponses();

        let currentQuestionIndex = 0;
        let userResponses = [];

        if (questions.length === 0) {
            return message.channel.send('No questions found.');
        }

        const askQuestion = async () => {
            if (currentQuestionIndex < questions.length) {
                const currentQuestion = questions[currentQuestionIndex];
                let questionText = currentQuestion.question;
        
                if (currentQuestion.description) {
                    questionText += `\n${currentQuestion.description}`;
                }
        
                await message.author.send(questionText);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#28a745')
                    .setTitle('Order Request Sent Successfully!')
                    .setDescription('Your order request has been successfully submitted.');
        
                await message.author.send({ embeds: [embed] });
        
                const orderEmbed = new EmbedBuilder()
                    .setColor('#F71D25')
                    .setTitle('New Order Application')
                    .setDescription(`Order request from <@${message.author.id}>`);
        
                const tickButton = new ButtonBuilder()
                    .setCustomId('tick')
                    .setLabel('✔️')
                    .setStyle(ButtonStyle.Success);
        
                const crossButton = new ButtonBuilder()
                    .setCustomId('cross')
                    .setLabel('❌')
                    .setStyle(ButtonStyle.Danger);
        
                const row = new ActionRowBuilder().addComponents(tickButton, crossButton);
        
                const applicationMessage = await client.channels.cache.get(orderAppResponseId).send({
                    embeds: [orderEmbed],
                    components: [row],
                });
        
                responses[userId] = { answers: userResponses, applicationMessageId: applicationMessage.id };
                fs.writeFileSync(responsesFile, JSON.stringify(responses, null, 4));
            }
        };        

        const collectResponse = async (collectedMessage) => {
            userResponses.push(collectedMessage.content);
            currentQuestionIndex++;
            await askQuestion();
        };

        const filter = (m) => m.author.id === userId;

        await message.author.send('Please answer the following questions:');

        const collector = message.author.dmChannel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', collectResponse);

        collector.on('end', () => {
            if (currentQuestionIndex === questions.length) {
                askQuestion();
            }
        });

        const votes = {};

        const trackVotes = (interaction) => {
            const userId = interaction.user.id;
            const customId = interaction.customId;
        
            if (!interaction.member.roles.cache.has(roleId)) return;
        
            if (votes[userId]) {
                if (votes[userId] === customId) {
                    votes[userId] = null;
                    interaction.update({ components: [interaction.message.components[0]] });
                }
            } else {
                votes[userId] = customId;
                interaction.update({ components: [interaction.message.components[0]] });
            }
        
            const tickVotes = Object.values(votes).filter(vote => vote === 'tick').length;
            const crossVotes = Object.values(votes).filter(vote => vote === 'cross').length;
        
            if (tickVotes > crossVotes) {
                const successEmbed = new EmbedBuilder()
                    .setColor('#28a745')
                    .setTitle('Order Approved!')
                    .setDescription(`Your order request has been approved.`);
                message.author.send({ embeds: [successEmbed] });
            } else if (crossVotes > tickVotes) {
                const deniedEmbed = new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('Order Denied!')
                    .setDescription(`Your order request has been denied.`);
                message.author.send({ embeds: [deniedEmbed] });
            }
        };        

        client.on('interactionCreate', (interaction) => {
            if (interaction.isButton()) {
                trackVotes(interaction);
            }
        });
    }
};