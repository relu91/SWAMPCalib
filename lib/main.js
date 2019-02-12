
let sepa = Sepajs.client
import * as watcher from './statusVerifier.js';
import * as session from './session.js';

let dataModel = {
    humidity: undefined,
    mesuring: false,
    connected : true,
    battery : 100,
    sampleCount : 0,
    signed: false,
    data: [],
    id : 0
}
var chartData = {
    datasets: [{
        type: "scatter",
        label: "Observation",
        data: [],
        showLine: false,

    }, {
        type: "scatter",
        label: "Regression",
        data: [],
        showLine: true,
        fill: false,
            borderColor: "rgb(0, 150, 136)",
            backgroundColor: "rgb(0, 150, 136)",
        pointRadius : 0
    }]
};

var options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            display: true,
            ticks: {
                max: 3.3,
                min: 0
            }
        }],
        yAxes: [{
            display: true,
            ticks: {
                max: 100,
                min: 0
            }
        }],
    }
}

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX qudt-1-1: <http://qudt.org/1.1/schema/qudt#>
PREFIX qudt-unit-1-1: <http://qudt.org/1.1/vocab/unit#>
SELECT ?measure ?time WHERE {
  <http://wot.arces.unibo.it/monitor#swamp_devices_moisture1_up_Moisture_Signal_to_Supply_Perc> rdf:type sosa:Observation;
    sosa:hasResult ?quantity;
    sosa:resultTime ?time.
  ?quantity rdf:type qudt-1-1:QuantityValue.
    OPTIONAL {
    ?quantity qudt-1-1:numericValue ?measure
  }
}
`





function calibration(data) {
    if (data.length < 2) {
        return []
    }
    data.sort()
    const result = regression.polynomial(data, { order: 3,precision:2 });
    const funcData = []
    for (let index = 0; index < data.length; index++) {
        const sample = result.predict(data[index][0])

        funcData.push({ x: data[index][0], y: sample[1] })
    }
    return funcData
}
let card = new Vue({
    el: "#app",
    data: dataModel,
    mounted() {
        watcher.watchSensorStatus(dataModel)
        gapi.signin2.render("login-button",{
            longtitle: true,
            theme: 'dark',
            onsuccess: this.logged,
            onfailure: () => {
            
            }
        })
    },
  
    watch: {
        data: {
            handler: (data) => {
                let newData = data.map((sample) => {
                    return {
                        x: sample.voltage, y: sample.humidity
                    }
                })


                let lineData = data.map((sample) => {
                    return [sample.voltage, sample.humidity]
                }).filter((data) => {
                    return data[1]
                })
                // myLineChart.data.labels = newLabels
                myChart.data.datasets[0].data = newData
                myChart.data.datasets[1].data = calibration(lineData)
                myChart.update()


            },
            deep: true
        }
    },
    methods: {
        logged(user){
            const id = user.getId()
            this.id = id
            session.connectUser(id).then(console.log).catch(console.log)
            this.signed = true;
            session.retriveData(id).then((queryResult) => {
                queryResult.results.bindings.forEach(element => {
                    dataModel.data.push({voltage : element.voltage.value, humidity: element.water.value})
                });
               
            })
        },
        save(){
            let csv = "Voltage,Water\n"
            for (const sample of dataModel.data) {
                csv+= `${sample.voltage},${sample.humidity}\n`
            }
            var blob = new Blob([csv], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "data.csv");
        },
        clear(){
            session.clear(dataModel.id).then(() => {
                dataModel.data = []
                myChart.data.datasets[0].data = []
                myChart.data.datasets[1].data = []
            })
        },
        mesure() {
            //Do mesure
            if (!dataModel.mesuring) {

                let subscription = sepa.subscribe(query, { host: "mml.arces.unibo.it" })

                subscription.on("error", console.log)
                subscription.on("connection-error", console.log)

                subscription.on("subscribed", () => {
                    subscription.first = true
                })

                subscription.on("added", (added) => {
                    if (!subscription.first) {
                        dataModel.sampleCount++

                        let sample = { voltage: added.results.bindings[0].measure.value, humidity: dataModel.humidity }
                        session.insertData(dataModel.id, added.results.bindings[0].measure.value, dataModel.humidity)
                        dataModel.data.push(sample)
                    }
                    subscription.first = false;
                })
                dataModel.sub = subscription
            } else {
                dataModel.sampleCount = 0
                dataModel.sub.unsubscribe()
            }
            dataModel.mesuring = !dataModel.mesuring
        }
    },
    updated() {
        if(this.signed && !this.graphInited){
            var ctx = document.getElementById("regression").getContext("2d");

           

            window.myChart = Chart.Scatter(ctx, {
                data: chartData,
                options: options
            });
            this.graphInited = true
        }
        this.$nextTick(() => {
            componentHandler.upgradeDom()
            componentHandler.upgradeAllRegistered();
        })
    },

})


