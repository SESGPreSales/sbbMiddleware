const { stripPrefix } = require('xml2js/lib/processors');
const express = require('express');
const app = express();
var parseString = require('xml2js').parseString;
const fs = require('fs');
// const { sbbApiKey } = require('./environment/secrets');
const fileName = './public/trains.json';

const sbbApiKey = process.env.api_key;
const stopRef = process.env.stopRef;

checkInputs();
// ref for Zurich mainstation : 8503000 
// ref for Geneva Airport : 8501026

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
                        <StopPointRef>${stopRef}</StopPointRef>
                    </LocationRef>
                </Location>
                <Params>
                    <NumberOfResults>300</NumberOfResults>
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
                    //console.log('Updated Data from SBB Api received');
                    myFunction(jsonObj)

                });

            })
        })
}

function myFunction(xml) {
    var x, i;
    x = xml;
    let txt = [];
    let timePlanned;
    let timeEstimated;
    let track;

    for (i = 0; i < x.length; i++) {

        if (x[i].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay) { track = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay[0].Text[0] }
        else { track = 'tbd' };

        let train = x[i].StopEvent[0].Service[0].PublishedLineName[0].Text[0];
        let dir = 'Departures';
        timePlanned = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].TimetabledTime[0];

        if (x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].EstimatedTime) { timeEstimated = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].EstimatedTime }
        else { timeEstimated = timePlanned };

        let dest = x[i].StopEvent[0].Service[0].DestinationText[0].Text[0];
        let from = x[i].StopEvent[0].Service[0].OriginText[0].Text[0];

        let t1 = new Date(timePlanned);
        let t2 = new Date(timeEstimated);

        let diff = diff_minutes(t2, t1);

        txt.push({ t1, t2, diff, track, train, dir, dest, from })
    }
    // Write the newly created JSON to file
    fs.writeFile(fileName, JSON.stringify(txt), function writeJSON(err) {
        if (err) return console.log(err);
        console.log('Updated ' + fileName);
    });
};

Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}

//Get the min difference between two date
function diff_minutes(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

//let contentfull = {};
let counter = 0;
// crete Route to request track (as single or comma separated list of tracks)
app.get('/api/sbb/track/:track', (req, res) => {
    let reqTrack = [];
    // let filtered = [];
    // reqTrack = '165'
    reqTrack = req.params.track.split(',');
    
    console.log(`Received request for track ${reqTrack}`)

    //get fulldata from file:
    let contentfull = [];
    contentfull = JSON.parse(fs.readFileSync(fileName))

    //filter the data
    let filtered = contentfull.filter(train => reqTrack.includes(train.track));

    if (filtered.length > 0) {
        // console.log('filtered is not empty', filtered.length);
        const toShow = `results: ${filtered.length} - next dest: ${filtered[0].dest} , Time: ${filtered[0].t1}`
        //console.log('filtered ', toShow);
        res.status(200).send(filtered);
    }
    else {
        //return to screen
        let noData = [{
            dest: 'No Data to show',
            train: '',
            t1: '',
            diff: ''
        }];
        console.log('filtered was empty', noData);

        res.status(200).send(noData);
    }
    // counter++;
    // console.log('counter', counter)
});


// crete Route to arriving trains (can be Departure or Arrival, or both commaseparated)
app.get('/api/sbb/direction/:dir', (req, res) => {
    let reqDirection = [];
    reqDirection = req.params.dir.split(',');
    //console.log('requested direction =', reqDirection, reqDirection.length);
    //get fulldata from file:
    let contentfull = JSON.parse(fs.readFileSync(fileName))

    //filter the data
    let filtered = contentfull.filter(train => reqDirection.includes(train.dir))

    console.log('filtered ', filtered.length);

    //return to screen
    res.status(200).send(filtered);

});

function checkInputs() {
if (!sbbApiKey) { 
    console.log('Api key is missing. Please provide key at docker run ...');
    return; 
};
if (!stopRef) { 
    console.log('stopRef is missing. Please provide key at docker run ...');
    return;
}

console.log('Congratulations: no config errors found. Starting...')
app.listen(5019);
console.log('middleware is ready to receive requests... ');
}


setInterval(() => getData(), 30000);
