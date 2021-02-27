const Alexa = require('ask-sdk-core');
const { ecoFacts } = require('../ecoFacts');

module.exports = {
    GetNewFactHandler: {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;

            return (request.type === 'LaunchRequest'
                || (request.type === 'IntentRequest'
                    && request.intent.name === 'GetNewFactIntent'))
        },
        handle(handlerInput) {
            const { speakOutput, help } = ecoFacts.getData();
            console.log('speakOutput: ', speakOutput)


            return handlerInput.responseBuilder
                .speak(`${speakOutput} If you would like to hear another fact, ask me again.`)
                .withShouldEndSession(false)
                .reprompt(help)
                .getResponse();
        },
    }
}
