const { stripPrefix } = require('xml2js/lib/processors');

var parseString = require('xml2js').parseString;


// from local xmlfile

// function loadXMLDoc() {
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//       if (this.readyState == 4 && this.status == 200) {
//         //console.log(this.responseXML)
//         myFunction(this);
//       }
//     };
//     xmlhttp.open("GET", "data.xml", true, );
//     //xmlhttp.setRequestHeader('Authentication', '57c5dbbbf1fe4d0001000018ebf3689e7a044b00b23e5202e0972bd7')
//     xmlhttp.send();
//   };

// const xmlToJSON = require('./xmlToJSON.js')

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
                    <NumberOfResults>20</NumberOfResults>
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


//   function loadXMLDoc() {
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//       if (this.readyState == 4 && this.status == 200) {
//         //console.log(this.responseXML)
//         myFunction(this);
//       }
//     };
//     xmlhttp.open("PUT", xmlUrl, true );
//     xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*')
//     xmlhttp.setRequestHeader('Authentication', '57c5dbbbf1fe4d0001000018ebf3689e7a044b00b23e5202e0972bd7')
//     xmlhttp.setRequestHeader('Constent-Type', 'text/XML');

//     xmlhttp.send(body);
//   };
let result = {};
let tree = 'Trias[0].ServiceDelivery[0].DeliveryPayload[0].StopEventResponse[0]'


function getData() {
    fetch(xmlUrl, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/XML',
            'Authorization': '57c5dbbbf1fe4d000100001842c323fa9ff44fbba0b9b925f0c052d1'
        },
        body // body data type must match "Content-Type" header
    })
        .then(response => {
            response.text().then(text => {
                // console.log(text)

                parseString(text, { tagNameProcessors: [stripPrefix] }, function (err, result) {

                    //console.dir(result);

                    let jsonObj = result.Trias.ServiceDelivery[0].DeliveryPayload[0].StopEventResponse[0].StopEventResult;
                    //console.log(jsonObj[0].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay[0].Text[0]);
                    myFunction(jsonObj)

                });

                // var jsonObj = xmlToJSON.parseString(text);
                //console.log(jsonObj)
                //result = jsonObj.Trias[0].ServiceDelivery[0].DeliveryPayload[0].StopEventResponse[0].StopEventResult;
                // console.log(result)
                // myFunction(result)
            })
        })
}

// setInterval(getData(), 5000);
getData();


function myFunction(xml) {
    var x, i, txt;
    x = xml;
    txt = [];

    // console.log(xml);

    for (i = 0; i < x.length; i++) {

        let track = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].PlannedBay[0].Text[0];
        let train = x[i].StopEvent[0].Service[0].PublishedLineName[0].Text[0];
        let dir = x[i].StopEvent[0].Service[0].DirectionRef[0];
        let timePlanned = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].TimetabledTime[0];
        let timeEstimated = x[i].StopEvent[0].ThisCall[0].CallAtStop[0].ServiceDeparture[0].EstimatedTime[0];
        let dest = x[i].StopEvent[0].Service[0].DestinationText[0].Text[0];
        let from = x[i].StopEvent[0].Service[0].OriginText[0].Text[0];

        txt.push({ timePlanned, timeEstimated, track, train, dir, dest, from })
    }

    console.log('DataFile (txt)= ', txt);

}
