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
                    sepa-swamp:waterContent ?water.
            }
        }
`
    return sepa.query(retriveData,{host:"mml.arces.unibo.it"})
}

export function insertData(id,voltage,water) {
    const updateData = `
        PREFIX sepa-swamp: <http://arces.wot.it/swamp/calibration/>
        INSERT{
        graph sepa-swamp:${id} {
            ?record sepa-swamp:voltage ${voltage};
                sepa-swamp:waterContent ${water}.
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
        graph <http://arces.wot.it/swamp/calibration/112760127662576846275> {
    ?record sepa-swamp:voltage ?v;
      sepa-swamp:waterContent ?w.
  }
}WHERE {
	graph <http://arces.wot.it/swamp/calibration/112760127662576846275> {
    ?record sepa-swamp:voltage ?v;
      sepa-swamp:waterContent ?w.
  }
}
    `
    return sepa.update(clearUpd, { host: "mml.arces.unibo.it" })
}