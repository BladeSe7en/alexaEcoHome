const Alexa = require('ask-sdk-core');


module.exports = {
    NoIntentHandler: {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
        },
        handle(handlerInput) {
            const speakOutput = 'Ok, you can say tell me a joke, set a reminder or create a repeating fact reminder. What would you like to try?';
            const repromptOutput = 'You can say set a reminder, give me a fact, or set a repeating fact reminder.'
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
                .getResponse();
        }
    },


    YesIntentHandler: {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
        },
        handle(handlerInput) {
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'GetNewFactIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
        }
    }
}
