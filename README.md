# sbbMiddleware

### Description 

The Middleware retrieves Real-time Data from the Opentransportdata.swiss API at 30-second intervals to ensure that the maximum number of calls per minute is never exceeded.
(Find information about the Opentransportdata.swiss tool here : https://opentransportdata.swiss/de/dataset/aaa )

Using this data, the Middleware offers an API that can fulfill WPlayer requests and provide up-to-date information about Trains, depending on the call type specified by the Variable Tags on the screen.

The example uses the Main Trainstation in Zurich, Switzerland.



### Installation 


### API Key 
To utilize this middleware, you must obtain an API key from https://opentransportdata.swiss/de/dev-dashboard/  

- Set the API key as ENV api_key = your received api key

### Define the station to display 

In the list provided by opentransportdata, choose the station / stop the should be displayed on the screens. 
https://opentransportdata.swiss/en/dataset/didok 

- Set the stop reference as ENV stopRef = selected Stop Reference


### Run using Docker
    docker run --restart=unless-stopped --env api_key=yourAPIkey --env stopRef=selectedStop -d -p 5019:5019 tbesesg/sbbmiddleware:tagnames

### Screenhots
![image](https://user-images.githubusercontent.com/50730110/222460665-1f615571-d65c-45c9-8f77-66f36677eaec.png)
![image](https://user-images.githubusercontent.com/50730110/222460790-823dea24-5b90-4f9d-ab37-96ff43404fa7.png)
