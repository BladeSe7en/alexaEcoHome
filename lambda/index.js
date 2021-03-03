const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const { ConnectionsResponsetHandler, CreateReminderIntentHandler } = require('./intents/reminderIntent');
const { GetJokeHandler } = require('./intents/getJokeIntent');
const { GetNewFactHandler } = require('./intents/factsIntent');
const { FactReminderHandler, FactReminderInterceptor } = require('./intents/factReminderIntent');
const { YesIntentHandler, NoIntentHandler } = require('./intents/yesNoIntent');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Eco P A, your personal conservation assistant! You can say help, tell me a new fact, or set a reminder to get started.';

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
        const speakOutput = 'Eco Home can set reminders, give you a fact, ask for a joke, or set a repeating fact directly device. What would you like to try?';
        const repromptOutput = 'You can say set a reminder, give me a fact, tell me a joke, or set a repeating fact reminder.'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};


const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("If you're unsure what to ask, say help.")
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


// const DialogManagementStateInterceptor = {
//     process(handlerInput) {
    
//         const currentIntent = handlerInput.requestEnvelope.request.intent;
        
//         if (handlerInput.requestEnvelope.request.type === "IntentRequest"
//             && handlerInput.requestEnvelope.request.dialogState !== "COMPLETED") {
            
//             const attributesManager = handlerInput.attributesManager;
//             const sessionAttributes = attributesManager.getSessionAttributes();
            
//             // If there are no session attributes we've never entered dialog management
//             // for this intent before.
            
//             if (sessionAttributes[currentIntent.name]) {
//                 let savedSlots = sessionAttributes[currentIntent.name].slots;
            
//                 for (let key in savedSlots) {
//                     // we let the current intent's values override the session attributes
//                     // that way the user can override previously given values.
//                     // this includes anything we have previously stored in their profile.
//                     if (!currentIntent.slots[key].value && savedSlots[key].value) {
//                         currentIntent.slots[key] = savedSlots[key];
//                     }
//                 }    
//             }
//             sessionAttributes[currentIntent.name] = currentIntent;
//             attributesManager.setSessionAttributes(sessionAttributes);
//         }
//     }
// };


exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({ bucketName: process.env.S3_PERSISTENCE_BUCKET })
    )
    .addRequestHandlers(
        LaunchRequestHandler,
        ConnectionsResponsetHandler,
        CreateReminderIntentHandler,
        FactReminderHandler,
        YesIntentHandler,
        NoIntentHandler,
        GetJokeHandler,
        GetNewFactHandler,
        FallbackHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(FactReminderInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();


