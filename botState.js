// botState.js (or integrated into your settings.js)

// Default state: Chatbot is ON
let chatbotEnabled = true;

const botState = {
    isEnabled: () => chatbotEnabled,
    toggle: (state) => {
        if (typeof state === 'boolean') {
            chatbotEnabled = state;
        } else {
            chatbotEnabled = !chatbotEnabled; // Toggle if no state is provided
        }
        return chatbotEnabled;
    }
};

export default botState;