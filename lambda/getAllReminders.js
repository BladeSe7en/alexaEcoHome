const https = require('https');

function getAllReminders() {
    return new Promise(((resolve, reject) => {
        var options = {
            host: 'https://api.amazonalexa.com',
            port: 443,
            path: '/v1/alerts/reminders',
            method: 'GET',
        };

        const request = https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}
