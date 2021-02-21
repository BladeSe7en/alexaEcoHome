const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

const { ConnectionsResponsetHandler, CreateReminderIntentHandler } = require('./intents/reminderIntent')
const { GetJokeHandler } = require('./intents/getJokeIntent');
const { GetNewFactHandler } = require('./intents/factsIntent');
const { FactReminderHandler, FactReminderInterceptor } = require('./intents/factReminderIntent');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Eco Home, your personal conservation assistant! You can say help, or set a reminder to get started.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// const LocalizationInterceptor = {
//     process(handlerInput) {
//       // Gets the locale from the request and initializes i18next.
//       const localizationClient = i18n.init({
//         lng: handlerInput.requestEnvelope.request.locale,
//         resources: languageStrings,
//         returnObjects: true
//       });
//       // Creates a localize function to support arguments.
//       localizationClient.localize = function localize() {
//         // gets arguments through and passes them to
//         // i18next using sprintf to replace string placeholders
//         // with arguments.
//         const args = arguments;
//         const value = i18n.t(...args);
//         // If an array is used then a random value is selected
//         if (Array.isArray(value)) {
//           return value[Math.floor(Math.random() * value.length)];
//         }
//         return value;
//       };
//       // this gets the request attributes and save the localize function inside
//       // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
//       const attributes = handlerInput.attributesManager.getRequestAttributes();
//       attributes.t = function translate(...args) {
//         return localizationClient.localize(...args);
//       }
//     }
//   };


const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FallbackHandler = {
    // The FallbackIntent can only be sent in those locales which support it,
    // so this handler will always be skipped in locales where it is not supported.
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('FALLBACK_MESSAGE'))
            .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
            .getResponse();
    },
};




exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ConnectionsResponsetHandler,
        CreateReminderIntentHandler,
        FactReminderHandler,
        GetJokeHandler,
        GetNewFactHandler,
        FallbackHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(FactReminderInterceptor)
    //.addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();

  // if (intent.confirmationStatus === 'CONFIRMED') {
  //   const day = Alexa.getSlotValue(requestEnvelope, 'day');
  //   const year = Alexa.getSlotValue(requestEnvelope, 'year');
  //   const month = Alexa.getSlotValue(requestEnvelope, 'month');
                    