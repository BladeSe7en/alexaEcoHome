const Alexa = require('ask-sdk-core');
const logic = require('./logic'); // this file encapsulates all "business" logic


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










const RemindBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemindBirthdayIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, serviceClientFactory, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month'];
        const year = sessionAttributes['year'];
        const name = sessionAttributes['name'] || '';
        let timezone = sessionAttributes['timezone'];
        const message = Alexa.getSlotValue(requestEnvelope, 'message');

        if (intent.confirmationStatus !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak(handlerInput.t('CANCEL_MSG') + handlerInput.t('REPROMPT_MSG'))
                .reprompt(handlerInput.t('REPROMPT_MSG'))
                .getResponse();
        }

        let speechText = '';
        const dateAvailable = day && month && year;
        if (dateAvailable){
            if (!timezone){
                //timezone = 'Europe/Rome';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
                return handlerInput.responseBuilder
                    .speak(handlerInput.t('NO_TIMEZONE_MSG'))
                    .getResponse();
            }

            const birthdayData = logic.getBirthdayData(day, month, year, timezone);

            // let's create a reminder via the Reminders API
            // don't forget to enable this permission in your skill configuratiuon (Build tab -> Permissions)
            // or you'll get a SessionEnndedRequest with an ERROR of type INVALID_RESPONSE
            try {
                const {permissions} = requestEnvelope.context.System.user;
                if (!(permissions && permissions.consentToken))
                    throw { statusCode: 401, message: 'No permissions available' }; // there are zero permissions, no point in intializing the API
                const reminderServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                // reminders are retained for 3 days after they 'remind' the customer before being deleted
                const remindersList = await reminderServiceClient.getReminders();
                console.log('Current reminders: ' + JSON.stringify(remindersList));
                // delete previous reminder if present
                const previousReminder = sessionAttributes['reminderId'];
                if (previousReminder){
                    try {
                        if (remindersList.totalCount !== "0") {
                            await reminderServiceClient.deleteReminder(previousReminder);
                            delete sessionAttributes['reminderId'];
                            console.log('Deleted previous reminder token: ' + previousReminder);
                        }
                    } catch (error) {
                        // fail silently as this means the reminder does not exist or there was a problem with deletion
                        // either way, we can move on and create the new reminder
                        console.log('Failed to delete reminder: ' + previousReminder + ' via ' + JSON.stringify(error));
                    }
                }
                // create reminder structure
                const reminder = logic.createBirthdayReminder(
                    birthdayData.daysUntilBirthday,
                    timezone,
                    Alexa.getLocale(requestEnvelope),
                    message);
                const reminderResponse = await reminderServiceClient.createReminder(reminder); // the response will include an "alertToken" which you can use to refer to this reminder
                // save reminder id in session attributes
                sessionAttributes['reminderId'] = reminderResponse.alertToken;
                console.log('Reminder created with token: ' + reminderResponse.alertToken);
                speechText = handlerInput.t('REMINDER_CREATED_MSG', {name: name});
                speechText += handlerInput.t('POST_REMINDER_HELP_MSG');
            } catch (error) {
                console.log(JSON.stringify(error));
                switch (error.statusCode) {
                    case 401: // the user has to enable the permissions for reminders, let's attach a permissions card to the response
                        handlerInput.responseBuilder.withAskForPermissionsConsentCard(constants.REMINDERS_PERMISSION);
                        speechText = handlerInput.t('MISSING_PERMISSION_MSG');
                        break;
                    case 403: // devices such as the simulator do not support reminder management
                        speechText = handlerInput.t('UNSUPPORTED_DEVICE_MSG');
                        break;
                    //case 405: METHOD_NOT_ALLOWED, please contact the Alexa team
                    default:
                        speechText = handlerInput.t('REMINDER_ERROR_MSG');
                }
                speechText += handlerInput.t('REPROMPT_MSG');
            }
        } else {
            speechText += handlerInput.t('MISSING_MSG');
            // we use intent chaining to trigger the birthday registration multi-turn
            handlerInput.responseBuilder.addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            });
        }

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('REPROMPT_MSG'))
            .getResponse();
    }
};












const ReminderPermissionsHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && handlerInput.type === 'IntentRequest' && handlerInput.intent.name === 'ReminderPermissionsIntent';
  },
  handle(handlerInput) {
    const { permissions } = handlerInput.requestEnvelope.context.System.user;

    // if (!permissions) {

    //   handlerInput.responseBuilder
    //     .speak("This skill needs permission to access your reminders.")
    //     .addDirective({
    //       type: "Connections.SendRequest",
    //       name: "AskFor",
    //       payload: {
    //         "@type": "AskForPermissionsConsentRequest",
    //         "@version": "1",
    //         "permissionScope": "alexa::alerts:reminders:skill:readwrite"
    //       },
    //       token: ""
    //     });

    // } else {
    //   handlerInput.responseBuilder
    //     .speak("Hello. You can say 'remind me' to set a reminder.")
    //     .reprompt("Say: 'remind me' to set a reminder.")
    // }
   handlerInput.responseBuilder
       const speakOutput = "This is a test"
    return handlerInput.responseBuilder
     .speak(speakOutput)
      .getResponse();
  }
};

const ConnectionsResponsetHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response';
  },
  handle(handlerInput) {
    const { permissions } = handlerInput.requestEnvelope.context.System.user;

    //console.log(JSON.stringify(handlerInput.requestEnvelope));
    //console.log(handlerInput.requestEnvelope.request.payload.status);

    const status = handlerInput.requestEnvelope.request.payload.status;


    if (!permissions) {
      return handlerInput.responseBuilder
        .speak("I didn't hear your answer. This skill requires your permission.")
        .addDirective({
          type: "Connections.SendRequest",
          name: "AskFor",
          payload: {
            "@type": "AskForPermissionsConsentRequest",
            "@version": "1",
            "permissionScope": "alexa::alerts:reminders:skill:readwrite"
          },
          token: "user-id-could-go-here"
        })
        .getResponse();
    }

    switch (status) {
      case "ACCEPTED":
        handlerInput.responseBuilder
          .speak("Now that you've provided permission - you can say: set a reminder.")
          .reprompt('To set a reminder say: set a reminder.')
        break;
      case "DENIED":
        handlerInput.responseBuilder
          .speak("Without permissions, I can't set a reminder. So I guess that's goodbye.");
        break;
      case "NOT_ANSWERED":

        break;
      default:
        handlerInput.responseBuilder
          .speak("Now that you've provided permission - you can say: set a reminder.")
          .reprompt('To set a reminder say: set a reminder.')
    }

    return handlerInput.responseBuilder
      .getResponse();
  }
};

// const HelpIntentHandler = {
//     canHandle(handlerInput) {
//       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
//         && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
//     },
//     handle(handlerInput) {
//       const speakOutput = 'You can say hello to me! How can I help?';
  
//       return handlerInput.responseBuilder
//         .speak(speakOutput)
//         .reprompt(speakOutput)
//         .getResponse();
//     }
//   };

const CreateReminderIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
    const consentToken = requestEnvelope.context.System.user.permissions
      && requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak('Please enable reminders permission in the Amazon Alexa app.')
        .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
        .getResponse();
    }

    try {
      const speechText = "Alright! I've scheduled a reminder for you.";

      const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
      const reminderPayload = {
        "trigger": {
          "type": "SCHEDULED_RELATIVE",
          "offsetInSeconds": "10",
          "timeZoneId": "America/New_York"
        },
        "alertInfo": {
          "spokenInfo": {
            "content": [{
              "locale": "en-US",
              "text": "learn about reminders"
            }]
          }
        },
        "pushNotification": {
          "status": "ENABLED"
        }
      };

      await ReminderManagementServiceClient.createReminder(reminderPayload);
      return responseBuilder
        .speak(speechText)
        .getResponse();

    } catch (error) {
      console.error(error);
      return responseBuilder
        .speak('Something went wrong.')
        .getResponse();
    }
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

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('you can say create a reminder.')
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

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ReminderPermissionsHandler,
    ConnectionsResponsetHandler,
    CreateReminderIntentHandler,
    RemindBirthdayIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(
    ErrorHandler,
  )

const CreateReminderIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
    const consentToken = requestEnvelope.context.System.user.permissions
      && requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak('Please enable reminders permission in the Amazon Alexa app.')
        .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
        .getResponse();
    }

    try {
      const speechText = "Alright! I've scheduled a reminder for you.";

      const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
      const reminderPayload = {
        "trigger": {
          "type": "SCHEDULED_RELATIVE",
          "offsetInSeconds": "10",
          "timeZoneId": "America/New_York"
        },
        "alertInfo": {
          "spokenInfo": {
            "content": [{
              "locale": "en-US",
              "text": "learn about reminders"
            }]
          }
        },
        "pushNotification": {
          "status": "ENABLED"
        }
      };

      await ReminderManagementServiceClient.createReminder(reminderPayload);
      return responseBuilder
        .speak(speechText)
        .getResponse();

    } catch (error) {
      console.error(error);
      return responseBuilder
        .speak('Something went wrong.')
        .getResponse();
    }
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

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('you can say create a reminder.')
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

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ReminderPermissionsHandler,
    ConnectionsResponsetHandler,
    CreateReminderIntentHandler,
    RemindBirthdayIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(
    ErrorHandler,
  )

const CreateReminderIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
    const consentToken = requestEnvelope.context.System.user.permissions
      && requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak('Please enable reminders permission in the Amazon Alexa app.')
        .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
        .getResponse();
    }

    try {
      const speechText = "Alright! I've scheduled a reminder for you.";

      const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
      const reminderPayload = {
        "trigger": {
          "type": "SCHEDULED_RELATIVE",
          "offsetInSeconds": "10",
          "timeZoneId": "America/New_York"
        },
        "alertInfo": {
          "spokenInfo": {
            "content": [{
              "locale": "en-US",
              "text": "learn about reminders"
            }]
          }
        },
        "pushNotification": {
          "status": "ENABLED"
        }
      };

      await ReminderManagementServiceClient.createReminder(reminderPayload);
      return responseBuilder
        .speak(speechText)
        .getResponse();

    } catch (error) {
      console.error(error);
      return responseBuilder
        .speak('Something went wrong.')
        .getResponse();
    }
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

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('you can say create a reminder.')
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

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ReminderPermissionsHandler,
    ConnectionsResponsetHandler,
    CreateReminderIntentHandler,
    RemindBirthdayIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
