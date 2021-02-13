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
            let data = {
                SKILL_NAME: 'Eco Home',
                GET_FACT_MESSAGE: 'Here\'s your fact: ',
                HELP_MESSAGE: 'You can say tell me a fact, or, you can say exit... What can I help you with?',
                HELP_REPROMPT: 'Would you like to hear another fact? Say tell me a fact.',
                FALLBACK_MESSAGE: 'The Conservation Facts skill can\'t help you with that.  It can help you discover facts about conservation if you say tell me a new fact. What can I help you with?',
                FALLBACK_REPROMPT: 'Would you like to hear another fact?',
                ERROR_MESSAGE: 'Sorry, an error occurred.',
                STOP_MESSAGE: 'Goodbye!',
                FACTS:
                    [
                        'Only 1% of the earths water is available for drinking water. Two percent is frozen.',
                        'The human body is about 75% water.',
                        'A person can survive about a month without food, but only 5 to 7 days without water.',
                        'According to the EPA, the average household leak wastes 10,000 gallons on water each year. However, 1 in 10 homes waste at least 90 gallons of water each day in leaks. A leaky faucet dripping one drop per second can waste more than 3,000 gallons a year, and a leaky shower with 10 drips per minute can waste over 500 gallons of water per year. If you find and fix these leaks, you can save 10% on your water bill.',
                         'Every day in the United States, we drink about 110 million gallons of water.',
                         'Showering and bathing are the largest indoor uses (27%) of water domestically.',
                         'The average American uses 140-170 gallons of water per day.',
                         'Turning off the water when brushing your teeth saves 80% of the amount of water you would normally use, according to The Water Project. You can turn on the water to wet your toothbrush, but you should make sure you turn it off until you are ready to rinse the toothpaste out of your mouth.  According to Conserveh20, if you do this, you could save 2.5 gallons a minute.',
                        'If every household in America had a faucet that dripped once each second, 928 million gallons of water a day would leak away.',
                        'There are 7.48 gallons in a cubic foot of water. Therefore, 2000 cubic feet of water is 14,960 gallons.',
                        'Changing how you shave can save about 60% of the water you would normally use, reveals The Water Project. Just like teeth brushing, a lot of the waste from shaving comes as people leave faucets running. Instead of letting the water run continuously, fill the sink partially or less, and use that water for shaving. When you need to clean your razors, cut the water on for a few seconds and then turn it back off.   ',
                        'It takes 3.3 acre feet of water to grow enough food for an average family for a year.',
                        'Replacing old toilets can save 16,000 gallons of water per year (for a family of four). If you have not replaced your toilets in a while and your home was built before 1992, consider switching to a WaterSense-labeled model, which uses 1.28 gallons or less per flush. You can even consider putting in a dual flush toilet, which allow you to adjust the amount of water used per flush to further conserve.',
                        'A leaky faucet can waste 100 gallons a day.',
                        'Approximately 50% of all indoor water is used in the bathroom. Another WaterSense water conservation fact: the toilet accounts for 19% of your total water use, so do not use the toilet as a trashcan. The toilet was designed for specific items that need to be flushed away. This does not include (for example) wiping off your lipstick and flushing the tissue paper down the commode, as there will likely be a trashcan nearby for that.',
                        'One flush of the toilet uses 3 ½ gallons of water (on average).',
                        'You can save 700 gallons of water per year by replacing old, inefficient faucets and aerators with WaterSense-labeled models. You can install an aerator on the bathroom faucet that you already have (to reduce the flow of water), and either option is 30% more efficient than a standard faucet. And many efficient aerators can also maintain water pressure, while still cutting back on water flow.',
                        'An average bath requires 37 gallons of water.',
                        'An average family of four uses 881 gallons of water per week just by flushing the toilet.',
                        'A bathtub can hold a lot of water, but your bath should be shallow – no more than 3 inches of water according to the City of San Diego’s Water Conservation site. Filling the tub to almost overflowing and adding bubble bath might sound relaxing, but you are needlessly wasting a lot of water.',
                        'The average 5-minute shower takes 15-25 gallons of water--around 40 gallons are used in 10 minutes.',
                        'You use about 5 gallons of water if you leave the water running while brushing your teeth.',
                        'Do not assume that taking a shower saves more money than taking a bath. According to Consumer Reports, it depends on how much water you use in the bathtub vs. how long you would normally shower and it also depends on what type of showerhead you use. Like the faucet aerator, there are low flow shower heads that can be installed to allow you to reduce the amount of water used with each cleaning. ',
                        'If you water your grass and trees more heavily, but less often, this saves water and builds stronger roots.',
                        'If you cut a 10-minute shower in half (down to 5 minutes) and you use a shower head with a flow rate of 2.5 gallons of water per minute, you can save 12.5 gallons of water according to Home Water Works. If you cut the water off while you are lathering up or shaving your legs, you can save even more water.',
                        'An automatic dishwasher uses 9 to 12 gallons of water while hand washing dishes can use up to 20 gallons.',
                        'Public water suppliers process 38 billion gallons of water per day for domestic and public use.',
                        'Approximately 1 million miles of pipelines and aqueducts carry water in the U.S. & Canada. Thats enough pipe to circle the earth 40 times.',
                        'About 800,000 water wells are drilled each year in the United States for domestic, farming, commercial, and water testing purposes.',
                        'More than 13 million households get their water from their own private wells and are responsible for treating and pumping the water themselves.',
                        'Washers built before 2011 use approximately 40 gallons of water per load, no matter the size of the load. If this describes your washing machine, Home Water Works advises against using it unless you have enough laundry to fill up the washer.  Otherwise, you are just wasting water with meager loads.',
                        'Industries released 197 million pounds of toxic chemicals into waterways in 1990.',
                        'You can refill an 8-oz glass of water approximately 15,000 times for the same cost as a six-pack of soda pop.',
                        'If you replace your old clothes washer with a more efficient model, you could end up using as little as 15 gallons per load, according to Home Water Works. Even better, with the newer, more intuitive models, water levels are able to adjust automatically to the size of the load. That means smaller loads will not use as much water.',
                        'If you wash dishes by hand, keeping the water running while you wash and rinse consumes unnecessary water. Letting it run for 10 minutes can waste 10 gallons of water. Instead, one of the Home Water Works water conservation recommendations is to fill the sink with enough water to cover the dishes, and then cut the water off.',
                        'A dairy cow must drink four gallons of water to produce one gallon of milk.',
                        'You’ll save more water by washing your dishes in your dishwater than in the sink. That is another water saving fact from the EPA, which states that you could save almost 5,000 gallons of water a year. When you the combine the cost of both water and energy, you could save $431 over the lifespan of the dishwasher. Before loading your dishes, scrape your plates well so you will not have to rinse them. According to conservh2o, rinsing can waste 2.5 gallons a minute.',
                        '300 million gallons of water are needed to produce a single days supply of U.S. newsprint.',
                        'One inch of rainfall drops 7,000 gallons or nearly 30 tons of water on a 60 feet by 180 feet piece of land.',
                        'Close to 9 billion gallons of water are used each day for residential outdoor use. Most of it is used for landscape irrigation, reports the EPA, so think carefully when planning how much turf grass you need to plant in your yard. Watering the lawn for 20 minutes every day of the week is equivalent to taking more than 800 showers or running the shower nonstop for a total of 4 days. That’s the equivalent of a year’s worth of showers for a family of four. ',
                        'Drought-resistant plants, such as Deer Grass, California Lilac, and Tickweed, are some of the options that can survive a harsh summer without a lot of water.  ',
                        'Replace your old light bulbs.  LED bulbs use 25-80% less energy.',
                        'A gallon of gasoline takes nearly 13 gallons of water to produce. Combine your errands, car pool to work, or take public transportation to reduce both your energy and water use.',
                        'f you keep as many of the existing trees and plants as you can, you will not have to water them as much because they are already established, advises the EPA. The Agency also recommends choosing plants that are naturally found in (native to) your region since they also do not require additional assistance. ',
                        'Flying from Los Angeles to San Francisco, about 700 miles round-trip, could cost you more than 9,000 gallons of water, or enough for almost 2,000 average dishwasher loads.',
                        'If you have a variety of plants, group them together by water needs. By putting them in zones, you can reduce the chances of wasting water on plants that do not need as much, reports the EPA.',
                        'A cross-country airplane trip (about 6,000 miles) could be worth more than 1,700 standard toilet flushes.',
                        'According to recent reports, nearly 5% of all U.S. water withdrawals are used to fuel industry and the production of many of the material goods we stock up on weekly, monthly, and yearly.',
                        'It takes about 100 gallons of water to grow and process a single pound of cotton, and the average American goes through about 35 pounds of new cotton material each year.',
                        'Using mulch helps retain water in your yard by minimizing the level of evaporation and moderating soil temperatures, according to the EPA, especially in the summer. It also reduces erosion that takes place over time. Organic mulch is also essential in helping to improve your soil’s condition so that it is better able to absorb water and nutrients. However, be careful not to apply too deeply or it will suffocate plants.',
                        'While kids like to play in the water when it is hot, do not let them play with outdoor water hoses or have water fights. According to San Diego’s water saving tips, you can conserve water by taking them to your city’s public pool or perhaps to the beach. You can also save water by not letting them drink out of the hoses, since they would use much more water this way than by drinking water out of a glass.',
                        'A programmable thermostat can be set to automatically turn off or reduce heating and cooling during the times when you are asleep or away.  On average, a programmable thermostat can save you $180 per year. ',
                        'Washing your vehicles at a carwash that recycles its water conserves more water than washing them yourself at home, according to Home Water Works. Carwashes also use less water than consumers washing their own vehicles. ',
                        'If you wash your vehicle at home, making sure that the hose has a shutoff valve can conserve water, according to Home Water Works. Instead of the water running continuously, you can prevent waste by turn it on only when you need to.',
                        'The typical pool uses 22,000 gallons to fill it up, and without a cover, the pool can lose hundreds of gallons of water each month due to evaporation. According to the City of Fresno Department of Utilities, you can reduce water evaporation by close to 90% by using a pool cover. ',
                        'You can use 10 gallons of water per minute hosing down your driveway and in 10 minutes, you will have used 100 gallons on water. Instead of using the hose, you should use a broom to clean your driveway instead, according to the City of Fresno Department of Utilities',
                        'Watering your lawn early in the morning is best for water conservation efforts, according to Popular Mechanics . The site warns that watering in the day can cause the water to evaporate too soon. As a result, some of the water won’t get to the plant’s roots, causing you to waste water.',
                        'If you can’t water it in the morning during the week, wait until the weekend to do it. (If you water in the evening, the site warns that the water will just sit there and could result in fungus.)',
                        'Your lawn only needs to be watered every 5 to 7 days, according to WaterInfo.org. Many people are overwatering their lawns. Not only is this wasteful, but it also keeps the grass from being able to receive the oxygen it needs to grow healthy, so it will eventually die. In addition, when your lawn is overwatered, the fertilizer is washed away, resulting in groundwater pollution.',
                        'If you improperly dispose of just one quart of oil, it can contaminate 250,000 gallons on water, according to Hydroknot. Properly disposing of the oil ensures that it does not contaminate the soil, and subsequently, streams, and rivers. Contact your local government to find out where you can recycle your oil. ',
                        'Windows are significant source of energy waste - they can add up to 10-25% of your total heating bill. To prevent heat loss through your windows, you can replace single-pane windows with double-pane products instead.',
                        'As we speak, more than 199 tons of paper has already been produced (paper production in 15 seconds).', 
                        '324 liters of water is used to make 1 kilogram of paper.',
                        '10 liters of water is needed to make one piece of A4 paper.',
                        '93% of paper comes from trees.', 
                        '50% of the waste of businesses is composed of paper.',
                        'The energy market in the United States is the third largest industry in the country.',
                        'To print a Sunday edition of the New York Times requires 75,000 trees!', 
                        'Packaging makes up 1/3 or more of our trash.',
                        'Energy use in America is doubling every 20 years.',
                        'Recycling 1 ton of paper saves around 682.5 gallons of oil, 26,500 liters of water and 17 trees.',
                        'In 2014, the United States provided approximately 89% of the country’s energy needs. The remaining 11% came primarily from petroleum imports.',
                        'The solar energy market alone has created over 175,000 jobs in the United States.',
                        'U.S offices use 12.1 trillion sheets of paper a year.',
                        'The United Sates invested $51.8 billion in clean energy in 2014 alone. This is the second most in the entire world. The country has invested more than $386 billion since 2007.',
                        'Paper accounts for 25% of landfill waste and 33% of municipal waste.',
                        'With all the paper we waste each year, we can build a 12 foot high wall of paper from New York to California!',
                        'Lessening of paper usage was predicted due to the electronic revolution. It didn’t happen. Demand for paper is expected to double before 2030.',
                        'Energy Productivity in the United States economy has increased by 11% from 2007 to 2014.',
                        'Every tree produces enough oxygen for 3 people to breathe.',
                        'It is estimated by the Bureau of Labor and Statistics that there are more than 3.4 million jobs in the United States related to clean energy initiatives.',
                        'In 2014, natural gas production was higher than it has ever been in history.',
                        'The United States has more nuclear reactors, more nuclear power capacity and generates more nuclear power than any other country in the world.',
                        'Approximately 20% of the United States’ electricity comes from these nuclear reactors, making the civil nuclear marketplace a more than $740 billion industry.',
                        'Get dripping taps repaired – they probably just need a new washer. A dripping tap can waste more than 5,500 litres of water a year.',
                        'The United States produces more geothermal energy than any other country and more biomass power than any other country.',
                        'Producing 42 million tons of toilet paper requires: 712 million trees, 1,165 millions tons of water, 78 million tons of oil',
                        'The United States uses petroleum as its number one energy source. It provides more energy than natural gas, coal or solar power.',
                        'Natural gas is used to heat more than 76 percent of US homes and commercial properties.',
                        'Coal is the largest global source of electricity, but only about 1/3 of the energy from the average coal power plant makes it to customers in the form of electricity.',
                        'Hospitals in the United States rank as some of the highest energy consumers in the entire world.',
                        'It’s better to keep your fridge full, as it will use less energy when it’s well stocked.',
                        'It is estimated that in 2014, the United States used approximately 412 billion kWh of electricity just for lighting.',
                        'The United States uses approximately 23% of the world?s energy, yet it only holds about 5% of the world?s population.',
                        'K-12 schools in the United States spend more than $6 billion on energy use, or more than they spend on textbooks and computers combined.',
                        ' It is estimated that the United States spend more than $300 billion a year on energy that goes to drafty doors and windows, inefficient appliances and other energy wasters that could be easily remedied. This is more than the United States spends on its military every year.',
                        'The United States is the second biggest consumer of energy in the world, after China.',
                        'Don’t leave unnecessary ‘stuff’ in the boot. If your car boot is full of bits and bobs that you don’t actually need on your journey – take them out. They increase the weight of the car so it will use more fuel.',
                        'Google alone uses enough energy to continuously power 200,000 homes. The amount of energy it requires to conduct 100 searches on the site is the equivalent of a standard light bulb burning for 28 minutes.',
                        'The average American uses approximately 313 million Btu of energy, while the worldwide average per person is around 75 million Btu.',
                    ],
        };
        
        var index = Math.floor(Math.random() * data.FACTS.length)
        console.log('index: ',index)
        const speakOutput =  data.FACTS[index];
      // const speakOutput = 'this is a test'
        console.log('speakOutput: ',speakOutput)


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
                                "speakOut": speakOutput 
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