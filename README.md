## Vehicle Routing Problem by Shortest path  

** Request data: 
	"time" : Array[number[]], -- ** Maxtrix
		"payload" : {
			"volume" : number[],
      "weight" : number[]
		},
	"conditions" : {
		"maxDuration": number,
		"slack" : number 
	},
	"vehicles" : Array[{
		"id" : string,
		"weight" : number,
		"volume" : number
	}]

## Feature
[x] calculation best time to deliver 
[x] add break time to each destination
[x] calculation duration and show quantity of vehicle to delivery in duration time  
[x] if destination is the same place, it calculator will not add break time
[] payload calculation by payload in each destination
[] radius calculation from depot (starter)
