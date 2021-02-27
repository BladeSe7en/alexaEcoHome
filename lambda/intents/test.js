const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const moment = require('moment-timezone');
const { ecoFacts } = require('../ecoFacts');
moment().tz("America/Los_Angeles").format();


module.exports = {
    RepeatingFactsHandler: {
        canHandle(handlerInput) {
            const { request } = handlerInput.requestEnvelope;

            return request.type === 'IntentRequest' && request.intent.name === 'RepeatingFactsIntent';

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
                let todayMoment = moment().tz("America/Los_Angeles")
                console.log('this is today: ', today)


                let startOfToday = moment(today).startOf('day')
                console.log('this is start of today: ', startOfToday)


                // Convert a time in hh:mm format to minutes
                var minutes
                const timeToMins = (time) => {
                    minutes = time.split(':');
                    return minutes[0] * 60 + +minutes[1];
                }


                let scheduledDateTime = moment(startOfToday).add(timeToMins(time), 'minutes')
                console.log('this is scheduledDateTime: ', scheduledDateTime.format())
                console.log('this is time to minutes', timeToMins(time))

                const ReminderManagementServiceClient = serviceClientFactory.getReminderManagementServiceClient();


                const { speakOutput } = ecoFacts.getData();

                let dayOfWeek = startOfToday.format('dddd')

                console.log('this is dayOfWeek: ', dayOfWeek)
                let targetMonthDate = startOfToday.clone().add(1, 'months').add(timeToMins(time), 'minutes')
                let targetYearDate = startOfToday.clone().add(1, 'years').add(timeToMins(time), 'minutes')
                console.log('-=-=-=this is still start of today-=-=-: ', startOfToday)

                console.log('THIS IS TARGETMONTHDATE: ', targetMonthDate)
                console.log('THIS IS TARGETYEARDATE: ', targetYearDate)

                let dayAbv = dayOfWeek.slice(0, 2).toUpperCase()
                console.log('this is dayAbv: ', dayAbv)

                let freq = frequency.toUpperCase();
                let startDate;
                const monthSelector = (frequency) => {
                    console.log('this is the frequency param: ', frequency)
                    switch (frequency) {
                        case 'daily':
                            return freq = `${freq};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
                        case 'weekly':
                            return freq = `${freq};BYDAY=${dayAbv};BYHOUR=${minutes[0]};BYMINUTE=${minutes[1]};BYSECOND=0;INTERVAL=1;`, startDate = scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss');
                        case 'monthly':
                            return freq, startDate = targetMonthDate.format('YYYY-MM-DDTHH:mm:ss');
                        case 'yearly':
                            return freq, startDate = targetYearDate.format('YYYY-MM-DDTHH:mm:ss');
                            uuj
                        default:
                            return 12;
                    }
                }

                monthSelector(frequency)

                console.log('this is freq: ', freq)





                let reminderPayload = null


                reminderPayload = {
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
                //  } else return

                const targetDate = {
                    "year": year,
                    "month": month,
                    "day": day

                };

                console.log('what is the final result of reminderPayload: ', reminderPayload.trigger.scheduledTime, ' freq: ', reminderPayload.trigger.recurrence.recurrenceRules[0])

                attributesManager.setPersistentAttributes(targetDate);
                await attributesManager.savePersistentAttributes();


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









ontime({
    cycle: '8:00:00'
}, function (ot) {

    ot.done()
    return
})