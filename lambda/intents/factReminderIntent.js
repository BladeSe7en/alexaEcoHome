// const Alexa = require('ask-sdk-core');
// const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
// const moment = require('moment-timezone');
// const { ecoFacts } = require('../ecoFacts');
// moment().tz("America/Los_Angeles").format();


// module.exports = {
//     ConnectionsResponsetHandler: {
//         canHandle(handlerInput) {
//             return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response';
//         },

//         handle(handlerInput) {
//             const { permissions } = handlerInput.requestEnvelope.context.System.user;
//             const status = handlerInput.requestEnvelope.request.payload.status;

//             if (!permissions) {
//                 return handlerInput.responseBuilder
//                     .speak("I didn't hear your answer. This skill requires your permission.")
//                     .addDirective({
//                         type: 'Connections.SendRequest',
//                         name: 'AskFor',
//                         payload: {
//                             '@type': 'AskForPermissionsConsentRequest',
//                             '@version': '1',
//                             'permissionScope': 'alexa::alerts:reminders:skill:readwrite'
//                         },
//                         token: 'user-id-could-go-here'
//                     })
//                     .getResponse();
//             }

//             switch (status) {
//                 case 'ACCEPTED':
//                     handlerInput.responseBuilder
//                         .speak("Now that you've provided permission - you can say: set a reminder.")
//                         .reprompt('To set a reminder say: set a reminder.')
//                     break;
//                 case 'DENIED':
//                     handlerInput.responseBuilder
//                         .speak("Without permissions, I can't set a reminder. So I guess that's goodbye.");
//                     break;
//                 case 'NOT_ANSWERED':

//                     break;
//                 default:
//                     handlerInput.responseBuilder
//                         .speak("Now that you've provided permission - you can say: set a reminder.")
//                         .reprompt('To set a reminder say: set a reminder.')
//             }

//             return handlerInput.responseBuilder.getResponse();
//         }
//     },


//     FactReminderHandler: {
//         canHandle(handlerInput) {
//             const { request } = handlerInput.requestEnvelope;
//             return request.type === 'IntentRequest' && request.intent.name === 'FactReminderIntent';
//         },

//         async handle(handlerInput) {
//             const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

//             const consentToken = requestEnvelope.context.System.user.permissions
//                 && requestEnvelope.context.System.user.permissions.consentToken;
//             if (!consentToken) {
//                 return responseBuilder
//                     .speak('Please enable reminders permission in the Amazon Alexa app.')
//                     .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
//                     .getResponse();
//             }

//             try {
//                 const speechText = "Alright! I've scheduled a reminder for you.";
//                 const time = Alexa.getSlotValue(requestEnvelope, 'time')
//                 const frequency = Alexa.getSlotValue(requestEnvelope, 'frequency')

//                 let today = moment().tz("America/Los_Angeles").format();

//                 let startOfToday = moment(today).startOf('day')

//                 // Convert a time in hh:mm format to minutes
//                 var minutes
//                 const timeToMins = (time) => {
//                     minutes = time.split(':');
//                     return minutes[0] * 60 + +minutes[1];
//                 }

//                 //formats the correct frequency, time, and day of the week to create the reminder
//                 let scheduledDateTime = moment(startOfToday).add(timeToMins(time), 'minutes')
//                 const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
//                 const { speakOutput } = ecoFacts.getData();
//                 let dayOfWeek = startOfToday.format('dddd')
//                 let dayAbv = dayOfWeek.slice(0, 2).toUpperCase()
//                 let freq = frequency.toUpperCase();
//                 let startDate;

//                 //Selects the months to include in the reminder
//                 const monthSelector = (frequency) => {
//                     switch (frequency) {
//                         case 'daily':
//                             return freq = `${freq};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
//                         case 'weekly':
//                             return freq = `${freq};BYDAY=${dayAbv};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
//                         default:
//                             return 12;
//                     }
//                 }


//                 monthSelector(frequency)

//                 let reminderPayload = {
//                     "trigger": {
//                         "type": "SCHEDULED_ABSOLUTE",
//                         "scheduledTime": scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss'),
//                         "timeZoneId": "America/Los_Angeles",
//                         "recurrence": {
//                             "startDateTime": today,
//                             "recurrenceRules": [
//                                 `FREQ=${freq}`,
//                             ]
//                         }
//                     },
//                     'alertInfo': {
//                         'spokenInfo': {
//                             'content': [{
//                                 'locale': 'en-US',
//                                 'text': speakOutput,
//                                 'ssml': speakOutput
//                             }]
//                         }
//                     },
//                     'pushNotification': {
//                         'status': 'ENABLED'
//                     }
//                 };

//                 await ReminderManagementServiceClient.createReminder(reminderPayload);
//                 return responseBuilder
//                     .speak(speechText)
//                     .getResponse();

//             } catch (error) {
//                 console.error(error);
//                 return responseBuilder
//                     .speak(error.message)
//                     .getResponse();
//             }
//         }
//     },


//     FactReminderInterceptor: {
//         async process(handlerInput) {
//             const attributesManager = handlerInput.attributesManager;
//             const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

//             const year = sessionAttributes.hasOwnProperty('year') ? sessionAttributes.year : 0;
//             const month = sessionAttributes.hasOwnProperty('month') ? sessionAttributes.month : 0;
//             const day = sessionAttributes.hasOwnProperty('day') ? sessionAttributes.day : 0;

//             if (year && month && day) {
//                 attributesManager.setSessionAttributes(sessionAttributes);
//             }
//         }
//     }
// }




const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const moment = require('moment-timezone');
const { ecoFacts } = require('../ecoFacts');
moment().tz("America/Los_Angeles").format();


module.exports = {
    ConnectionsResponsetHandler: {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response';
        },

        handle(handlerInput) {
            const { permissions } = handlerInput.requestEnvelope.context.System.user;
            const status = handlerInput.requestEnvelope.request.payload.status;

            if (!permissions) {
                return handlerInput.responseBuilder
                    .speak("I didn't hear your answer. This skill requires your permission.")
                    .addDirective({
                        type: 'Connections.SendRequest',
                        name: 'AskFor',
                        payload: {
                            '@type': 'AskForPermissionsConsentRequest',
                            '@version': '1',
                            'permissionScope': 'alexa::alerts:reminders:skill:readwrite'
                        },
                        token: 'user-id-could-go-here'
                    })
                    .getResponse();
            }

            switch (status) {
                case 'ACCEPTED':
                    handlerInput.responseBuilder
                        .speak("Now that you've provided permission - you can say: set a reminder.")
                        .reprompt('To set a reminder say: set a reminder.')
                    break;
                case 'DENIED':
                    handlerInput.responseBuilder
                        .speak("Without permissions, I can't set a reminder. So I guess that's goodbye.");
                    break;
                case 'NOT_ANSWERED':

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


    FactReminderHandler: {
        canHandle(handlerInput) {
            const { request } = handlerInput.requestEnvelope;
            return request.type === 'IntentRequest' && request.intent.name === 'FactReminderIntent';
        },

        async handle(handlerInput) {
            const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes() || {};

            const year = sessionAttributes.hasOwnProperty('year') ? sessionAttributes.year : 0;
            const month = sessionAttributes.hasOwnProperty('month') ? sessionAttributes.month : 0;
            const day = sessionAttributes.hasOwnProperty('day') ? sessionAttributes.day : 0;
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
                const time = Alexa.getSlotValue(requestEnvelope, 'time')
                const frequency = Alexa.getSlotValue(requestEnvelope, 'frequency')
                console.log('========where is this log facts log-===========')
                console.log('------------time ', time)
                console.log('------------frequency ', frequency.toUpperCase())


                let today = moment().tz("America/Los_Angeles").format();
                console.log('this is today: ', today)

               //       [^T]*$
                let startOfToday = moment(today.slice(0, 11) + '00:00:00-08:00').tz("America/Los_Angeles")




                let todayMoment = moment().tz("America/Los_Angeles")

                let yesterdayUTC = moment(today).subtract(1, 'days').format()
                let yesterday = moment(yesterdayUTC).tz("America/Los_Angeles").format();
                console.log('this is yesterdayUTC: ', yesterdayUTC)
                console.log('this is yesterday: ', yesterday)


                //let startOfToday = moment(today).startOf('day')
                console.log('this is start of today: ', startOfToday)


                // Convert a time in hh:mm format to minutes
                var minutes
                const timeToMins = (time) => {
                    minutes = time.split(':');
                    return minutes[0] * 60 + +minutes[1];
                }


                let scheduledDateTime = moment(startOfToday).add(timeToMins(time), 'minutes')
                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                const { speakOutput } = ecoFacts.getData();
                console.log('this is speakOutput: ',speakOutput)
                let dayOfWeek = startOfToday.format('dddd')
                console.log('this is dayOfWeek: ', dayOfWeek)
                
                let targetMonthDate = startOfToday.clone().add(1, 'months').add(timeToMins(time), 'minutes')
                console.log('THIS IS TARGETMONTHDATE: ', targetMonthDate)
                let targetYearDate = startOfToday.clone().add(1, 'years').add(timeToMins(time), 'minutes')
                console.log('THIS IS TARGETYEARDATE: ', targetYearDate)
                let dayAbv = dayOfWeek.slice(0, 2).toUpperCase()
                console.log('this is dayAbv: ', dayAbv)
                
                console.log('-=-=-=this is still start of today-=-=-: ', startOfToday)
                console.log('this is scheduledDateTime: ', scheduledDateTime.format())
                console.log('this is time to minutes', timeToMins(time))

                let freq = frequency.toUpperCase();
                let startDate;
                const monthSelector = (frequency) => {
                    console.log('this is the frequency param: ', frequency)
                    switch (frequency) {
                        case 'daily':
                            return freq = `${freq};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
                        case 'weekly':
                            return freq = `${freq};BYDAY=${dayAbv};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
                        default:
                            return 12;
                    }
                }

                monthSelector(frequency)

                console.log('this is freq: ', freq)

                let reminderPayload = {
                    "trigger": {
                        "type": "SCHEDULED_ABSOLUTE",
                        "scheduledTime": scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                        "timeZoneId": "America/Los_Angeles",
                        "recurrence": {
                            "startDateTime": today,
                            "recurrenceRules": [
                                `FREQ=${freq}`,
                            ]
                        }
                    },
                    'alertInfo': {
                        'spokenInfo': {
                            'content': [{
                                'locale': 'en-US',
                                'text': speakOutput,
                                'ssml': speakOutput
                            }]
                        }
                    },
                    'pushNotification': {
                        'status': 'ENABLED'
                    }
                };

                const targetDate = {
                    "year": year,
                    "month": month,
                    "day": day

                };
                console.log('scheduledDateTime: ', scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss'))
                console.log('this is targetDate: ',targetDate)
                console.log('what is the final result of reminderPayload: ', reminderPayload.trigger.scheduledTime, ' freq: ', reminderPayload.trigger.recurrence.recurrenceRules[0])
                console.log('what is the final result of reminderPayload.trigger: ', reminderPayload.trigger, ' alertInfo: ', reminderPayload.alertInfo.spokenInfo.content)


                await ReminderManagementServiceClient.createReminder(reminderPayload);
                return responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(true)
                    .getResponse();

            } catch (error) {
                console.error(error);
                return responseBuilder
                    .speak(error.message)
                    .withShouldEndSession(true)
                    .getResponse();
            }
        }
    },


    FactReminderInterceptor: {
        async process(handlerInput) {
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

            const year = sessionAttributes.hasOwnProperty('year') ? sessionAttributes.year : 0;
            const month = sessionAttributes.hasOwnProperty('month') ? sessionAttributes.month : 0;
            const day = sessionAttributes.hasOwnProperty('day') ? sessionAttributes.day : 0;

            if (year && month && day) {
                attributesManager.setSessionAttributes(sessionAttributes);
            }
        }
    }
}



