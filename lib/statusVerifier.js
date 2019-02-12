const sepa = Sepajs.client
const verify_connection_query = `
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX arces-monitor: <http://wot.arces.unibo.it/monitor#>
PREFIX qudt-1-1: <http://qudt.org/1.1/schema/qudt#>
SELECT ?time ?battery WHERE {
  <http://wot.arces.unibo.it/monitor#swamp_devices_moisture1_up_Battery_Level> rdf:type sosa:Observation ;
                                                                               sosa:resultTime ?time;
                                                                               sosa:hasResult ?quantity .
  ?quantity qudt-1-1:unit ?unit;
            qudt-1-1:numericValue ?battery.
}
`
const TIMEOUT = 40000

export function watchSensorStatus(data) {
    const sub = sepa.subscribe(verify_connection_query, { host: "mml.arces.unibo.it" })
    let timer = {}
    let disconnect = () => { data.connected = false;}
    sub.on("subscribed", (not) => {
        const time = not.addedResults.results.bindings[0].time.value
        const battery = not.addedResults.results.bindings[0].battery.value
        const last = new Date(time);
        const now = new Date()
        const diff = Math.round(  (now - last)/1000 )
        data.connected = diff < 45
        data.battery = battery
        timer = setTimeout(disconnect, TIMEOUT);
    })
    sub.on("notification", (not) => {
        if(not.sequence > 0){
            clearTimeout(timer)
            timer = setTimeout(disconnect,TIMEOUT);
            data.connected = true;
        }
    })
    

    sub.on("connection-error", (not) => {
        data.connected = false;
    })
}




