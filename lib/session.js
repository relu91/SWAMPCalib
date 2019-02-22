const sepa = Sepajs.client
export function connectUser(id) {
    const create_user = `
        PREFIX sepa-swamp: <http://arces.wot.it/swamp/calibration/>
        INSERT DATA{
            graph sepa-swamp:users {
            sepa-swamp:${id} sepa-swamp:hasData sepa-swamp:${id}.
            }
        }
    `
    return sepa.update(create_user,{host:"mml.arces.unibo.it"})
}

export function retriveData(id) {
    const retriveData = `
        PREFIX sepa-swamp: <http://arces.wot.it/swamp/calibration/>
        SELECT *
        FROM sepa-swamp:users
        WHERE {
            sepa-swamp:${id} sepa-swamp:hasData ?graph.
            graph ?graph{
                ?record sepa-swamp:voltage ?voltage;
                    sepa-swamp:waterContent ?water;
                    sepa-swamp:time ?timestamp.
            }
        }
`
    return sepa.query(retriveData,{host:"mml.arces.unibo.it"})
}

export function insertData(id,voltage,water,timestamp) {
    const updateData = `
        PREFIX sepa-swamp: <http://arces.wot.it/swamp/calibration/>
        INSERT{
        graph sepa-swamp:${id} {
            ?record sepa-swamp:voltage ${voltage};
                sepa-swamp:waterContent ${water};
                sepa-swamp:time ${timestamp}.
        }
        }WHERE {
            Bind(UUID() as ?record )
        }
    `
    return sepa.update(updateData,{host:"mml.arces.unibo.it"})
}

export function clear(id) {
    const clearUpd = `
PREFIX sepa-swamp: <http://arces.wot.it/swamp/calibration/>
DELETE{
  graph ?graph {
    ?record sepa-swamp:voltage ?v;
      sepa-swamp:waterContent ?w;
      sepa-swamp:time ?timestamp.
  }
}
WHERE {
  sepa-swamp:${id} sepa-swamp:hasData ?graph.
  graph ?graph {
    ?record sepa-swamp:voltage ?v;
            sepa-swamp:waterContent ?w;
            sepa-swamp:time ?timestamp.
  }
}
    `
    return sepa.update(clearUpd, { host: "mml.arces.unibo.it" })
}