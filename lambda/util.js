const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4',
    region: process.env.S3_PERSISTENCE_REGION
});

module.exports.getS3PreSignedUrl = function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60*1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

// EXAMPLE FOR EN-US.JSON FILE

// {
//     "interactionModel": {
//       "languageModel": {
//         "invocationName": "my space facts",
//         "modelConfiguration": {
//           "fallbackIntentSensitivity": {
//             "level": "LOW"
//           }
//         },
//         "intents": [
//           {
//             "name": "AMAZON.CancelIntent",
//             "samples": []
//           },
//           {
//             "name": "AMAZON.HelpIntent",
//             "samples": []
//           },
//           {
//             "name": "AMAZON.StopIntent",
//             "samples": []
//           },
//           {
//             "name": "AMAZON.FallbackIntent",
//             "samples": []
//           },
//           {
//             "name": "AMAZON.StartOverIntent",
//             "samples": []
//           },
//           {
//             "name": "GetNewFactIntent",
//             "slots": [],
//             "samples": [
//               "Give me a fact",
//               "tell me a fact"
//             ]
//           },
//           {
//             "name": "GetTravelTime",
//             "slots": [
//               {
//                 "name": "DepartingPlanet",
//                 "type": "Planet",
//                 "samples": [
//                   "I'm starting from {DepartingPlanet} ",
//                   "{DepartingPlanet} ",
//                   "I'm going from {DepartingPlanet} to {ArrivingPlanet} "
//                 ]
//               },
//               {
//                 "name": "ArrivingPlanet",
//                 "type": "Planet",
//                 "samples": [
//                   "I'm going to {ArrivingPlanet} ",
//                   "{ArrivingPlanet} "
//                 ]
//               }
//             ],
//             "samples": [
//               "calculate travel time",
//               "how long does it take to travel from {DepartingPlanet} to {ArrivingPlanet} "
//             ]
//           }
//         ],
//         "types": [
//           {
//             "name": "Planet",
//             "values": [
//               {
//                 "name": {
//                   "value": "Mercury"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Venus"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Earth"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Mars"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Jupiter"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Saturn"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Uranus"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Neptune"
//                 }
//               },
//               {
//                 "name": {
//                   "value": "Pluto"
//                 }
//               }
//             ]
//           }
//         ]
//       },
//       "dialog": {
//         "intents": [
//           {
//             "name": "GetTravelTime",
//             "confirmationRequired": false,
//             "prompts": {},
//             "slots": [
//               {
//                 "name": "DepartingPlanet",
//                 "type": "Planet",
//                 "confirmationRequired": false,
//                 "elicitationRequired": true,
//                 "prompts": {
//                   "elicitation": "Elicit.Intent-GetTravelTime.IntentSlot-DepartingPlanet"
//                 },
//                 "validations": [
//                   {
//                     "type": "isNotInSet",
//                     "prompt": "Slot.Validation.596358663326.282490667310.1526107495625",
//                     "values": [
//                       "the sun",
//                       "sun",
//                       "our sun"
//                     ]
//                   },
//                   {
//                     "type": "hasEntityResolutionMatch",
//                     "prompt": "Slot.Validation.596358663326.282490667310.1366622834897"
//                   }
//                 ]
//               },
//               {
//                 "name": "ArrivingPlanet",
//                 "type": "Planet",
//                 "confirmationRequired": false,
//                 "elicitationRequired": true,
//                 "prompts": {
//                   "elicitation": "Elicit.Intent-GetTravelTime.IntentSlot-ArrivingPlanet"
//                 }
//               }
//             ]
//           }
//         ],
//         "delegationStrategy": "ALWAYS"
//       },
//       "prompts": [
//         {
//           "id": "Elicit.Intent-GetTravelTime.IntentSlot-DepartingPlanet",
//           "variations": [
//             {
//               "type": "PlainText",
//               "value": "Which planet do you want to start from?"
//             }
//           ]
//         },
//         {
//           "id": "Elicit.Intent-GetTravelTime.IntentSlot-ArrivingPlanet",
//           "variations": [
//             {
//               "type": "PlainText",
//               "value": "Which planet do you want to travel to?"
//             }
//           ]
//         },
//         {
//           "id": "Slot.Validation.596358663326.282490667310.1526107495625",
//           "variations": [
//             {
//               "type": "PlainText",
//               "value": "I can't answer this question about the sun, only planets. Please tell me a planet."
//             },
//             {
//               "type": "PlainText",
//               "value": "While the sun is the center of our solar system, it is not a planet. Please tell me a planet."
//             }
//           ]
//         },
//         {
//           "id": "Slot.Validation.596358663326.282490667310.1366622834897",
//           "variations": [
//             {
//               "type": "PlainText",
//               "value": "{DepartingPlanet} is not a planet. Please tell me one of the nine planets in our solar system. "
//             },
//             {
//               "type": "PlainText",
//               "value": "I don't recognize {DepartingPlanet} as a planet in our solar system. Please tell me a planet."
//             }
//           ]
//         }
//       ]
//     }
//   }