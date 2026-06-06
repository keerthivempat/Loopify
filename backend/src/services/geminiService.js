// Purpose: Encapsulate Gemini chat logic and model interactions
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (name = 'gemini-pro') => genAI.getGenerativeModel({ model: name });

const sendChatMessage = async (formattedHistory, message) => {
  const model = getModel();
  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};

module.exports = { sendChatMessage };
