const express = require('express');
const line = require('@line/bot-sdk');

require('dotenv').config();

const app = express();

const config = {
    channelAccessToken: 'CUib5Gm+BiHPlaAEsjtJWQB+wnZm25WUxJYbMELEn+nrqwvNRgfxrPXIs13ykhn6QNFq1iWGPn3Vc+zkILlRt77fcJsNPvgueFbHQhT1XyyjMYC9VJrTolitJ5oVpAg1JZFjGZcmrGIMGDMhJN3XowdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'ed9e25180fad18978e4af6fd7fef808b'
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

function handleEvent(event) {

    console.log(event);
    if (event.type === 'message' &&  (event.message.type === 'location' || event.message.type === 'text')) {
        handleMessageEvent(event);
    } else {
        return Promise.resolve(null);
    }
}



function handleMessageEvent(event) {
    var msg = {
        type: 'text',
        text: 'Location not found! Please try again.'
    };

    var eventText = event.message.text;
    var sendLocation = event.message.type;
        
    if (sendLocation == 'location') {
        var request = require("request");
        var url = "http://api.waqi.info/feed/geo:" + event.message.latitude + ";" + event.message.longitude + "/?token=0c1a3ffcab5f91dfa707c81245dc605a58aa22bc";
    request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                Bot_Reply = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                    "type": "buttons",
                    "text": "City: " + body.data.city.name + "\nAQI: " + body.data.aqi 
                                      + "\nTime: " + body.data.time.s,
                    "actions": [{
                        "type": "location",
                        "label": "Enter New Location",
                        "data": "action=buy&itemid=123"
                    }]}}
                return client.replyMessage(event.replyToken, Bot_Reply);}
        })     
                            
    }
    else {
        var request = require("request");
        var url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + eventText + "&inputtype=textquery&fields=geometry&key=AIzaSyASrZMChhLdcX9w3u-oHELRum48OoJnO1E";
    request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                url = "http://api.waqi.info/feed/geo:" + body.candidates[0].geometry.location.lat + ";" + body.candidates[0].geometry.location.lng + "/?token=0c1a3ffcab5f91dfa707c81245dc605a58aa22bc";
            
                console.log(body);
                request({
                url: url,
                json: true
                }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    Bot_Reply = {
                        "type": "template",
                        "altText": "this is a buttons template",
                        "template": {
                        "type": "buttons",
                        "text": "City: " + body.data.city.name + "\nAQI: " + body.data.aqi 
                                          + "\nTime: " + body.data.time.s,
                        "actions": [{
                            "type": "location",
                            "label": "Enter New Location",
                            "data": "action=buy&itemid=123"
                        }]}}
                        return client.replyMessage(event.replyToken, Bot_Reply);}})

            }
        })     
    } 

    

}


app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
    console.log('Port is running', app.get('port'));
});