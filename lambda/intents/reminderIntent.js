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
                let yesterdayUTC = moment(today).subtract(1, 'days').format()
                console.log('yesterdayUTC: ', yesterdayUTC)
                let yesterday = moment(yesterdayUTC).tz("America/Los_Angeles").format();
                console.log('this is today: ', today)
                console.log('yesterday: ', yesterday)

                // let scheduledDateTime = moment(scheduledDate).add()


                // Convert a time in hh:mm format to minutes
                function timeToMins(time) {
                    var b = time.split(':');
                    return b[0] * 60 + +b[1];
                }

                let scheduledDateTime = moment(scheduledDate).add(timeToMins(time), 'minutes')
                console.log('this is scheduledDateTime: ',scheduledDateTime)

                // Convert minutes to a time in format hh:mm
                // Returned value is in range 00  to 24 hrs
                // function timeFromMins(mins) {
                //     function z(n) { return (n < 10 ? '0' : '') + n; }
                //     var h = (mins / 60 | 0) % 24;
                //     var m = mins % 60;
                //     return z(h) + ':' + z(m);
                // }

                // // Add two times in hh:mm format
                // function addTimes(t0, t1) {
                //     return timeFromMins(timeToMins(t0) + timeToMins(t1));
                // }

                // console.log(addTimes('12:13', '01:42')); // 13:55
                // console.log(addTimes('12:13', '13:42')); // 01:55
                // console.log(addTimes('02:43', '03:42')); // 06:25

                console.log('this is time to minutes', timeToMins(time))



























                // let days

                // const calculateSeconds = (yesterday, scheduledDate) => {

                //     //let startTime = moment(today, 'YYYY-MM-DD HH:mm:ss');

                //     // let endTime = moment(reminderDate, 'YYYY-MM-DD HH:mm:ss');
                //     let duration = moment.duration(scheduledDate.diff(yesterday));
                //     days = duration.asDays();
                //     if (days < 0) {
                //         console.error('this is in the past. alexa should error here')
                //     } else if (days > 0 && days < 1) {
                //         console.log('scheduled date is today')
                //     }
                //     else {
                //         console.log('scheduled date is a valid date')
                //     }
                //     return days;
                // }
                // let secondsToReminder = calculateSeconds(yesterday, scheduledDate)
                // console.log('------------calculateSeconds(today, date): ', calculateSeconds(yesterday, scheduledDate))












                // let startDate = moment().format()

                // const task = Alexa.getSlotValue(requestEnvelope, 'firstName')
                // let date = Alexa.getSlotValue(requestEnvelope, 'date')
                // const time = Alexa.getSlotValue(requestEnvelope, 'time')
                // console.log('------------task: ', task)
                // console.log('------------date ', date)
                // console.log('------------time ', time)
                // console.log('------------startDate ', startDate)


                // const calculateSeconds = (startDate, endDate) => {
                //     //let startTime = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
                //     let startTime = moment(startDate, 'YYYY-MM-DD');

                //    // let endTime = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
                //     let endTime = moment(endDate, 'YYYY-MM-DD');

                //     console.log('------------startTime ', startTime)
                //     console.log('------------endTime ', endTime)
                //     let duration = moment.duration(endTime.diff(startTime));
                //     let seconds = duration.asSeconds();
                //     return seconds;
                // }
                // let secondsToReminder = calculateSeconds(startDate, date)
                // console.log('------------calculateSeconds(startDate, date): ', calculateSeconds(startDate, date))



                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                let test = 'testing'

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

                const reminderPayload = {
                    'trigger': {
                        'type': 'SCHEDULED_RELATIVE',
                        'offsetInSeconds': '10',
                        'timeZoneId': 'America/Los_Angeles'
                    },
                    'alertInfo': {
                        'spokenInfo': {
                            'content': [{
                                'locale': 'en-US',
                                'text': 'time: ' + time + ' date: ' + scheduledDate + ' task: ' + task + ' startDate: ' + startDate + ' secondsToReminder: ' + secondsToReminder,
                                'ssml': `<speak>${time + ' ' + scheduledDate + ' ' + task}</speak>`
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
                    .speak('Something went wrong.')
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