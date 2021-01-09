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
<p>[x] calculation best time to deliver</p>
<p>[x] add break time to each destination</p>
<p>[x] if destination is the same place, it calculator will not add break time </p>
<p>[-] payload calculation by payload in each destination</p>
<p>[-] radius calculation from depot (starter)</p>
