const sepa = Sepajs.client
const verify_connection_query = `
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX arces-monitor: <http://wot.arces.unibo.it/monitor#>
PREFIX qudt-1-1: <http://qudt.org/1.1/schema/qudt#>
SELECT ?timestamp WHERE {
  ?log arces-monitor:refersTo <nodeID://b22714152> ;
       qudt-1-1:numericValue ?value;
       time:inXSDDateTimeStamp ?timestamp
}ORDER BY DESC(?timestamp)
LIMIT 1
`

export function watchSensorStatus(data) {
    const sub = sepa.subscribe(verify_connection_query, { host: "mml.arces.unibo.it" })
    let timer = {}
    let disconnect = () => { data.connected = false;}
    sub.on("subscribed", (not) => {
        const last = new Date("Wed, 27 July 2016 13:30:00");
        const now = new Date()
        const diff = Math.round(  (now - last)/30000 )
        data.connected = diff < 45
        timer = setTimeout(disconnect, 30000);
    })
    sub.on("notification", (not) => {
        if(not.sequence > 0){
            clearTimeout(timer)
            timer = setTimeout(disconnect, 30000);
            data.connected = true;
        }
    })
    

    sub.on("connection-error", (not) => {
        data.connected = false;
    })
}




