# sbbMiddleware

### Goal 
The Middleware is grabbing Real time Data from the Opentransportation.org API every 30 seconds. 
The 30 seconds is set that high to never reach the max. number of calls by minute. 

The Middleware then provides an API to WPlayer requests, to provide current Train information based on the call type.

The type of the WPlayer call is defined by the added Variable Tags on the screen. 

