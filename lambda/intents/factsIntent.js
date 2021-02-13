const Alexa = require('ask-sdk-core');

// core functionality for fact skill
module.exports = {
    GetNewFactHandler: {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;
            // checks request type
            return request.type === 'LaunchRequest'
                || (request.type === 'IntentRequest'
                    && request.intent.name === 'GetNewFactIntent');
        },
        handle(handlerInput) {
            var data = {
                translation: {
                    SKILL_NAME: 'Eco Home',
                    GET_FACT_MESSAGE: 'Here\'s your fact: ',
                    HELP_MESSAGE: 'You can say tell me a space fact, or, you can say exit... What can I help you with?',
                    HELP_REPROMPT: 'What can I help you with?',
                    FALLBACK_MESSAGE: 'The Space Facts skill can\'t help you with that.  It can help you discover facts about space if you say tell me a space fact. What can I help you with?',
                    FALLBACK_REPROMPT: 'What can I help you with?',
                    ERROR_MESSAGE: 'Sorry, an error occurred.',
                    STOP_MESSAGE: 'Goodbye!',
                    FACTS:
                        [
                            'A year on Mercury is just 88 days long.',
                            'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
                            'On Mars, the Sun appears about half the size as it does on Earth.',
                            'Jupiter has the shortest day of all the planets.',
                            'The Sun is an almost perfect sphere.',
                        ],
                },
            };
            
            var index = Math.floor(Math.random() * data.translation.FACTS.length)
            console.log('index: ',index)
           // const speakOutput =  data.translation.FACTS[index];
           const speakOutput = 'this is a test'
            console.log('speakOutput: ',speakOutput)

            return handlerInput.responseBuilder
                .speak(speakOutput)
                // Uncomment the next line if you want to keep the session open so you can
                // ask for another fact without first re-opening the skill
                // .reprompt(requestAttributes.t('HELP_REPROMPT'))
                .getResponse();
        },
    }
}


