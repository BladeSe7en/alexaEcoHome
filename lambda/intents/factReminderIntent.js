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

            return handlerInput.responseBuilder.getResponse();
        }
    },


    FactReminderHandler: {
        canHandle(handlerInput) {
            const { request } = handlerInput.requestEnvelope;
            return request.type === 'IntentRequest' && request.intent.name === 'FactReminderIntent';
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
                const time = Alexa.getSlotValue(requestEnvelope, 'time')
                const frequency = Alexa.getSlotValue(requestEnvelope, 'frequency')

                let today = moment().tz("America/Los_Angeles").format();

                let startOfToday = moment(today).startOf('day')

                // Convert a time in hh:mm format to minutes
                var minutes
                const timeToMins = (time) => {
                    minutes = time.split(':');
                    return minutes[0] * 60 + +minutes[1];
                }

                //formats the correct frequency, time, and day of the week to create the reminder
                let scheduledDateTime = moment(startOfToday).add(timeToMins(time), 'minutes')
                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                const { speakOutput } = ecoFacts.getData();
                let dayOfWeek = startOfToday.format('dddd')
                let dayAbv = dayOfWeek.slice(0, 2).toUpperCase()
                let freq = frequency.toUpperCase();
                let startDate;

                //Selects the months to include in the reminder
                const monthSelector = (frequency) => {
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

                await ReminderManagementServiceClient.createReminder(reminderPayload);
                return responseBuilder
                    .speak(speechText)
                    .getResponse();

            } catch (error) {
                console.error(error);
                return responseBuilder
                    .speak(error.message)
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
