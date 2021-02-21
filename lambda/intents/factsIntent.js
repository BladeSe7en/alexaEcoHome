const Alexa = require('ask-sdk-core');
const { ecoFacts } = require('../ecoFacts');

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
      
            const speakOutput = ecoFacts();
            // const speakOutput = 'this is a test'
            console.log('speakOutput: ', speakOutput)

            return handlerInput.responseBuilder
                //.speak(`${speakOutput} If you would like to hear another fact, ask me again.` )
                .speak(`${speakOutput} If you would like to hear another fact, ask me again.`)

                // Uncomment the next line if you want to keep the session open so you can
                // ask for another fact without first re-opening the skill
                .withShouldEndSession(false)
                .reprompt(data.HELP_REPROMPT)
                .getResponse();
        },
    }
}
