const Alexa = require('ask-sdk-core');
const AmazonDateParser = require('amazon-date-parser');
const moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();
var { DateTime } = require('luxon');


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
            // console.log('this is handlerInput: ',handlerInput)


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
                const speechText = "Alright! I've scheduled a reminder for you.";
                const task = Alexa.getSlotValue(requestEnvelope, 'firstName')
                let reminderDate = Alexa.getSlotValue(requestEnvelope, 'date')
                const time = Alexa.getSlotValue(requestEnvelope, 'time')
                console.log('------------where is this log------------')
                console.log('------------task: ', task)
                console.log('------------reminderDate ', reminderDate)
                console.log('------------time ', time)

                let today = moment().tz("America/Los_Angeles").format();
                console.log('this is today: ', today)


                let scheduledDate = moment(reminderDate)
                console.log('scheduledDate: ', scheduledDate)
                //let yesterdayUTC = moment(today).subtract(1, 'days').format()
               // let = = moment(yesterdayUTC).tz("America/Los_Angeles").format();
                console.log('this is today: ', today)

                // Convert a time in hh:mm format to minutes
                const timeToMins = (time) => {
                    var b = time.split(':');
                    return b[0] * 60 + +b[1];
                }


                let scheduledDateTime = moment(scheduledDate).add( timeToMins(time), 'minutes')
                console.log('this is scheduledDateTime: ', scheduledDateTime.format())
                console.log('this is time to minutes', timeToMins(time))

                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();

                const reminderPayload = {
                    "trigger": {
                        "type": "SCHEDULED_ABSOLUTE",
                        "scheduledTime": scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss'),
                        "timeZoneId": "America/Los_Angeles",
                        // "recurrence": {
                        //     "startDateTime": "2019-05-10T6:00:00.000",
                        //     "endDateTime": "2019-08-10T10:00:00.000",
                        //     "recurrenceRules": [
                        //         "FREQ=DAILY;BYHOUR=6;BYMINUTE=10;BYSECOND=0;INTERVAL=1;",
                        //         "FREQ=DAILY;BYHOUR=17;BYMINUTE=15;BYSECOND=0;INTERVAL=1;",
                        //         "FREQ=DAILY;BYHOUR=22;BYMINUTE=45;BYSECOND=0;INTERVAL=1;"
                        //     ]
                        // }
                    },
                    'alertInfo': {
                        'spokenInfo': {
                            'content': [{
                                'locale': 'en-US',
                                //'text': 'scheduledDateTime: ' + scheduledDateTime.format('YYYY-MM-DDThh:mm:ss') + ' task: ' + task + ' startDate: ',
                                'text': task,
                                'ssml': `<speak>${task}</speak>`
                                //'ssml': '<speak> Hey look, I am speaking to you </speak>'
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
    }
}


// how to access slots 
// var AmazonDateParser = require('amazon-date-parser');
// var date = new AmazonDateParser('2017-W48');
// console.log(date);
/* returns:
{ endDate: Sun Dec 03 2017 23:59:59 GMT+0000 (GMT),
startDate: Mon Nov 27 2017 00:00:00 GMT+0000 (GMT) }
*/


      // const reminderPayload = {
                //     trigger: {
                //         type: 'SCHEDULED_ABSOLUTE',
                //         scheduledTime: currentDateTime.set({
                //             hour: '13',
                //             minute: '00',
                //             second: '00'
                //         }).format('YYYY-MM-DDTHH:mm:ss'),
                //         timeZoneId: 'America/Los_Angeles',
                //         recurrence: {
                //             freq: 'DAILY'
                //         }
                //       }
                // }

                // let currentDate = moment("13.04.2016", "DD.MM.YYYY");
                // let reminderDate = moment("28.04.2016", "DD.MM.YYYY");

                // let seconds = reminderDate.diff(currentDate, 'seconds');

                // let testDate = new AmazonDateParser(date);
                // console.log(testDate);
                /* returns:
                { endDate: Sun Dec 03 2017 23:59:59 GMT+0000 (GMT),
                startDate: Mon Nov 27 2017 00:00:00 GMT+0000 (GMT) }
                */