## Vehicle Routing Problem by Shortest path  


## Reqest 
<p>"time" : Array[number[]] ** time should be matrix format</p>
<p> "payload" : {
	"volume" : number[],
      	"weight" : number[]
	}
</p>
<p> "conditions" : {
	"maxDuration": number,
	"slack" : number 
	}
</p>
<p> "vehicles" : Array[{
	"id" : string,
	"weight" : number,
	"volume" : number
	}]
</p>

## Feature
<p>[x] calculation best time to deliver</p>
<p>[x] add break time to each destination</p>
<p>[x] if destination is the same place, it calculator will not add break time </p>
<p>[-] payload calculation by payload in each destination</p>
<p>[-] radius calculation from depot (starter)</p>
