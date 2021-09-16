const models = require('../models'),
utils = require('../../lib/utils'),
moment = require('moment-weekdaysin'),
authService = require('../services/auth.service'),
database = require('../../config/database'),
sequelize = require('sequelize');;


const CollectionRouteController = () => {
const remove_query = `SELECT c.id, c.collectionScheduleId ,cs.id as csID FROM collections AS c INNER JOIN collection_schedules cs ON c.collectionScheduleId = cs.id WHERE DATE > '${moment(new Date()).format('YYYY-MM-DD')}' And c.collection_status= 'pending'`;
  const create = (req, res) => {
    req.checkBody('route_no', 'route_no is required').notEmpty();
    req.checkBody('route_name', 'route_name is required').notEmpty();

    const body = req.body;
    const promises = [];
    const _include = [{
      model: models.agent,
      as: 'agent',
      where: {date: {$lt: moment(new Date()).format('YYYY-MM-DD') }}
    }];
    const add_agent_ids  = body.add_agent_ids ?  body.add_agent_ids.split(',').map(aid=> parseInt(aid)) : [];
    return models.collection_route.create({
      route_no: body.route_no,
      route_name: body.route_name,
    }).then(route=> {
      if(body.driver_id) {
        promises.push(models.driver.update({collectionRouteId: route.id},{ where: {id: parseInt(body.driver_id)}}))
      }
      if(add_agent_ids.length) {
        const routeID = route.id;
        promises.push(models.agent.findAll({where: {
          id: { $in: add_agent_ids},
        }}).then(agents=>{
          agents.forEach(a=>{
            a.collectionRouteId = routeID;
            promises.push(a.save());
            if(body.action === 'remove') {
              const _query = `${ remove_query } AND agentId = ${a.id}`;
              let collection_schedule_ids = [];
              promises.push(database.query(_query, { type:sequelize.QueryTypes.SELECT}).then(collections=> {
                collections.forEach(c=> {
                  collection_schedule_ids.push(c.collectionScheduleId);
                  promises.push(models.collection.destroy({
                    where: {
                       id: c.id
                    }
                  }));
                })
                collection_schedule_ids =  _.uniq(collection_schedule_ids);
                promises.push(models.collection_schedule.update(
                {
                  monday: 0,
                  tuesday: 0,
                  wednesday: 0,
                  thursday: 0,
                  friday: 0,
                  saturday: 0,
                  sunday: 0,
                },
                {
                  where: {
                    id: {$in: collection_schedule_ids}
                  }
                }
              ))
              }))
            }
          })
        }));
      }

      Promise.all(promises).then(result=> {
        return res.status(200).json(route);
      }).catch(error=> {
        return res.status(500).json(error)
      });

    }).catch(err=> {
    return res.status(500).json(err);
    });


  }

  const update = (req, res) => {
    req.checkBody('id', 'id is required').notEmpty();
    const body = req.body;
    let routeObject = {
      route_no: body.route_no,
      route_name: body.route_name,
    };
    const routeID = parseInt(body.id)
    routeObject = utils.cleanObject(routeObject);

    const promises = [];
    const remove_agent_ids = body.remove_agent_ids ?  body.remove_agent_ids.split(',').map(aid=> parseInt(aid)) : [];
    const add_agent_ids  = body.add_agent_ids ?  body.add_agent_ids.split(',').map(aid=> parseInt(aid)) : [];
    if(add_agent_ids.length) {
      promises.push(models.agent.findAll({where: {
        id: { $in: add_agent_ids},
      }}).then(agents=>{
        agents.forEach(a=>{
          a.collectionRouteId = routeID;
          if(body.action === 'remove') {
            let collection_schedule_ids = [];
            const _query = `${ remove_query } AND agentId = ${a.id}`;
              promises.push(database.query(_query, { type:sequelize.QueryTypes.SELECT}).then(collections=> {
                collections.forEach(c=> {
                  collection_schedule_ids.push(c.collectionScheduleId);
                  promises.push(models.collection.destroy({
                    where: {
                       id: c.id
                    }
                  }));
                });
                collection_schedule_ids =  _.uniq(collection_schedule_ids);
                promises.push(models.collection_schedule.update(
                {
                  monday: 0,
                  tuesday: 0,
                  wednesday: 0,
                  thursday: 0,
                  friday: 0,
                  saturday: 0,
                  sunday: 0,
                },
                {
                  where: {
                    id: {$in: collection_schedule_ids}
                  }
                }
              ))
              }))
          }
          promises.push(a.save());
        })
      }));
    }
    if(remove_agent_ids.length) {
      const _query = `${ remove_query } AND cs.agentId IN (${remove_agent_ids})`;
      promises.push(database.query(_query, { type:sequelize.QueryTypes.SELECT}).then(collections=> {
        collections.forEach(c=> {
          promises.push(models.collection.destroy({
            where: {
               id: c.id
            }
          }));
        });
        promises.push(models.agent.update({collectionRouteId: null}, {where:{ collectionRouteId:body.id, id : {$in: remove_agent_ids} }}));
      }))
    }
    if(body.driver_id) {
      promises.push(models.driver.update({collectionRouteId: routeID},{ where: {id: parseInt(body.driver_id)}}))
    } else {
      promises.push(models.driver.update({collectionRouteId: null},{ where: {collectionRouteId: routeID}}))
    }
    promises.push(models.collection_route.update(routeObject, {where: {id: routeID}}));
    Promise.all(promises).then(result=> {
      return res.status(200).json(result);
    }).catch(error=> {
      return res.status(500).json(error)
    });
  }

  const get = (req, res) => {
    const query = req.query;
    let collection_route_id = query.route_id;

    let whereCondition = {};
    if(collection_route_id) {
      whereCondition = {
        id: parseInt(collection_route_id)
      };
    }
    whereCondition = utils.applyVehicleRegistration(req, {});
    return models.collection_route.findAll({
      where: whereCondition,
      include: [{
        model: models.agent, as: 'agents'}]
    }).then(routes=> {
      return res.status(200).json(routes);
    }).catch(err=> {
      return res.status(500).json(err);
    });
  }

  const getById = (req, res) => {
    const query = req.query;
    const routeId = parseInt(query.id);
    let agentWhere = {};
    if (query.business_name) {
      agentWhere = {business_name : query.business_name}
    }
    return models.collection_route.findOne({
      where: {id: routeId},
      include: [{
      model: models.agent, as: 'agents',
      where: agentWhere,
        include: [
          {model: models.collection_schedule, as: 'collection_schedule'}]
      },
    {
      model: models.driver, as: 'driver',
    }]


    }).then(route=> {
      return res.status(200).json(route ? route : []);
    }).catch(err=> {
      return res.status(500).json(err);
    });
  }


  return {
    create,
    update,
    get,
    getById
  };
}

module.exports = CollectionRouteController;
