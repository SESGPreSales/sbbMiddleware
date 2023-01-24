const { stripPrefix } = require('xml2js/lib/processors');
const express = require('express');
const app = express();
var parseString = require('xml2js').parseString;
const fs = require('fs');
const { sbbApiKey } = require('./environment/secrets');
//require('./environment/secrets')

const fileName = './public/trains.json';
//const fileNamePower = './public/power.json';

let txt = [];

const body = `
<?xml version="1.0" encoding="UTF-8"?>
<Trias version="1.1" xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <ServiceRequest>
        <siri:RequestTimestamp>2023-01-23T07:34:35.647Z</siri:RequestTimestamp>
        <siri:RequestorRef>API-Explorer</siri:RequestorRef>
        <RequestPayload>
            <StopEventRequest>
                <Location>
                    <LocationRef>
                        <StopPointRef>8503000</StopPointRef>
                    </LocationRef>
                </Location>
                <Params>
                    <NumberOfResults>100</NumberOfResults>
                    <StopEventType>departure</StopEventType>
                    <IncludePreviousCalls>false</IncludePreviousCalls>
                    <IncludeOnwardCalls>false</IncludeOnwardCalls>
                    <IncludeRealtimeData>true</IncludeRealtimeData>
                </Params>
            </StopEventRequest>
        </RequestPayload>
    </ServiceRequest>
</Trias>
`;

const xmlUrl = 'https://api.opentransportdata.swiss/trias2020';

function getData() {
    fetch(xmlUrl, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/XML',
            'Authorization': sbbApiKey
        },
        body // body data type must match "Content-Type" header
    })
        .then(response => {
            response.text().then(text => {
                // console.log(text)

                parseString(text, { tagNameProcessors: [stripPrefix] }, function (err, result) {

                    let jsonObj = result.Trias.ServiceDelivery[0].DeliveryPayload[0].StopEventResponse[0].StopEventResult;
                    //console.log(jsonObj[0].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay[0].Text[0]);
                    myFunction(jsonObj)

                });

            })
        })
}

function myFunction(xml) {
    var x, i;
    x = xml;

    // console.log(xml);

    for (i = 0; i < x.length; i++) {

        let track = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay[0].Text[0];
        let train = x[i].StopEvent[0].Service[0].PublishedLineName[0].Text[0];
        let dir = 'Departure';
        let timePlanned = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].TimetabledTime[0];
        //let timeEstimated = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].EstimatedTime[0];
        let dest = x[i].StopEvent[0].Service[0].DestinationText[0].Text[0];
        let from = x[i].StopEvent[0].Service[0].OriginText[0].Text[0];

        txt.push({ timePlanned, track, train, dir, dest, from })
    }

    //console.log('DataFile (txt)= ', txt);

    fs.writeFile(fileName, JSON.stringify(txt), function writeJSON(err) {
        if (err) return console.log(err);
        //console.log('writing to ' + fileName);
    });
};


// crete Route to request correct data
app.get('/api/sbb/track/:track', (req, res) => {
    console.log('requested track =', req.params.track);

    //get fulldata from file:
    let contentfull = JSON.parse(fs.readFileSync(fileName))

    let filtered = contentfull.filter(t => t.track === req.params.track);
    //console.log('filtered ', filtered);

    res.status(200).send(filtered);

    // id = req.params.id;
    // contentfull[id].occupied = req.params.movement;
    // console.log('new: ', contentfull);

    // fs.writeFile(fileName, JSON.stringify(contentfull), function writeJSON(err) {
    // 	if (err) return console.log(err);
    // 	//  	console.log(JSON.stringify(contentfull));
    // 	console.log('writing to ' + fileName);
    // })
});

setInterval(() => getData(), 30000);

app.listen(5019);
console.log('listening to port 5019...');