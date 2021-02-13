const Alexa = require('ask-sdk-core');

module.exports = {
    ConnectionsResponsetHandler: {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response';
        },
        handle(handlerInput) {
            const { permissions } = handlerInput.requestEnvelope.context.System.user;
            const status = handlerInput.requestEnvelope.request.payload.status;
            //console.log(JSON.stringify(handlerInput.requestEnvelope));
            //console.log(handlerInput.requestEnvelope.request.payload.status);

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
    },


    CreateReminderIntentHandler: {
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

              const currentTime = moment().tz("America/Los_Angeles"), // Use Moment Timezone to get the current time in Pacific Time
              const reminderRequest = {
                requestTime: currentTime.format("YYYY-MM-DDTHH:mm:ss"), // Add requestTime
                trigger: {
                  type: "SCHEDULED_ABSOLUTE", // Update from SCHEDULED_RELATIVE
                  scheduledTime: currentTime.add(20, "seconds").format("YYYY-MM-DDTHH:mm:ss"),
                  timeZoneId: "America/Los_Angeles", // Set timeZoneId to Pacific Time
                  recurrence: {                     
                    freq : "DAILY" // Set recurrence and frequency
                  }
                },
                alertInfo: {
                  spokenInfo: {
                    content: [{
                      locale: "en-US",
                      text: "",
                    }]
                  }
                },
                pushNotification: {
                  status: "ENABLED"
                }
              }
                const speechText = "Alright! I've scheduled a reminder for you.";

                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                // const reminderPayload = {
                //     "trigger": {
                //         "type": "SCHEDULED_RELATIVE",
                //         "offsetInSeconds": "10",
                //         "timeZoneId": "America/New_York"
                //     },
                //     "alertInfo": {
                //         "spokenInfo": {
                //             "content": [{
                //                 "locale": "en-US",
                //                 "text": "learn about reminders"
                //             }]
                //         }
                //     },
                //     "pushNotification": {
                //         "status": "ENABLED"
                //     }
                // };
                //await ReminderManagementServiceClient.createReminder(reminderPayload)

                await ReminderManagementServiceClient.createReminder(reminderRequest);
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
    }
}


// const CreateReminderIntentHandler = {
//   canHandle(handlerInput) { 
//   ... // can handle logic 
//   },
//   async handle(handlerInput) {
//     ... // Variable declarations
//     ... // Code to check for permissions
//     const currentTime = moment().tz("America/Los_Angeles"), // Use Moment Timezone to get the current time in Pacific Time
//       reminderRequest = {
//         requestTime: currentTime.format("YYYY-MM-DDTHH:mm:ss"), // Add requestTime
//         trigger: {
//           type: "SCHEDULED_ABSOLUTE", // Update from SCHEDULED_RELATIVE
//           scheduledTime: currentTime.set({
//             hour: "13",
//             minute: "00",
//             second: "00"
//           }).format("YYYY-MM-DDTHH:mm:ss"),
//           timeZoneId: "America/Los_Angeles", // Set timeZoneId to Pacific Time
//           recurrence: {                     
//             freq : "DAILY" // Set recurrence and frequency
//           }
//         },
//         alertInfo: {
//           spokenInfo: {
//             content: [{
//               locale: "en-US",
//               text: "Time to get yo daily banana. You better go before the banistas pack up.",
//             }]
//           }
//         },
//         pushNotification: {
//           status: "ENABLED"
//         }
//       }
//   }
//   ... // Code to create reminders
// }