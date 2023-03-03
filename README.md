# sbbMiddleware

### Description 

The Middleware retrieves Real-time Data from the Opentransportdata.swiss API at 30-second intervals to ensure that the maximum number of calls per minute is never exceeded.

Using this data, the Middleware offers an API that can fulfill WPlayer requests and provide up-to-date information about Trains, depending on the call type specified by the Variable Tags on the screen.

The example uses the Main Trainstation in Zurich, Switzerland.

### Installation 


### API Key 
To utilize this middleware, you must obtain an API key from https://opentransportdata.swiss/de/dev-dashboard/  
Once you have the API key, create a folder named "environment" and add a file named "secrets.js" with the following content:

const sbbApiKey = ' YOUR API KEY';
module.exports = { sbbApiKey }

### Screenhots
![image](https://user-images.githubusercontent.com/50730110/222460665-1f615571-d65c-45c9-8f77-66f36677eaec.png)
![image](https://user-images.githubusercontent.com/50730110/222460790-823dea24-5b90-4f9d-ab37-96ff43404fa7.png)
