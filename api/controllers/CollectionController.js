const models = require('../models'),
utils = require('../../lib/utils'),
moment = require('moment-weekdaysin'),
sequelize = require('sequelize'),
database = require('../../config/database');
const authService = require('../services/auth.service');
const { Observable, Subject, ReplaySubject, BehaviorSubject, from, of, range, concat, throwError } = require('rxjs');
const { map, filter, switchMap, finalize, catchError, tap } = require('rxjs/operators');

const CollectionController = () => {

  const create = (req, res) => {
    req.checkBody('agent_id', 'agent_id is required').notEmpty();
    req.checkBody('collection_route_id', 'collection_route_id is required').notEmpty();
    req.checkBody('day', 'day is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send({ errors });
      return;
    }
    const promises = [];
    const body = req.body;
    models.collection_schedule.findOrCreate({where : {
      agentId:body.agent_id,
      collectionRouteId:body.collection_route_id,
    }}).then(cs => {
      const collectionSchedule = cs[0];
      collectionSchedule[body.day] = true;
      promises.push(collectionSchedule.save());
      const this_next_month = moment().add(2, 'months').endOf('month');
      const  selectedDays = moment().weekdaysInBetween(this_next_month, body.day);
      selectedDays.forEach(momentDate => {
        const date = utils.setTimeZone(new Date(momentDate.format('LL')));
        promises.push(models.collection.findOrCreate({
          where: {
            collectionScheduleId: collectionSchedule.id,
            date,
            origin_date: date,
          }
        }))
      })
      Promise.all(promises).then(result=> {
          res.status(200).json({ msg: 'Collections scheduled' });
        } ).catch((err) => {
          return res.status(500).json({ msg: 'Internal server error' });
        });
      })
    };


    const update = (req, res) => {
      req.checkBody('id', 'id is required').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const body = req.body;
      const promises = [];
      if (body.change_to_route_id && body.agent_id) {
        promises.push(
          models.collection_schedule.findOrCreate({
            where: {agentId: body.agent_id,
            collectionRouteId: body.change_to_route_id,
          }})
        );
      }
      Promise.all(promises).then(results=> {
        const collectionSchedule = results.length ? results[0][0] : undefined;
        let _collection = {
          collection_status: body.collection_status,
          date: body.date === '' ? null : body.date ,
          amount_to_be_collected: body.amount_to_be_collected,
          amount_collected: body.amount_collected,
          notes: body.notes,
          collectionScheduleId: collectionSchedule ?  collectionSchedule.id : undefined,
        };
        _collection = utils.cleanObject(_collection);
        models.collection.update(
          _collection,
          {
            where: {id: body.id},
          }
        ).then(result => {
          res.status(200).json(result);
        }).catch(error=> {
          res.status(500).json({ msg: 'Internal server error' });
        })
      }).catch((err) => {
          return res.status(500).json({ msg: 'Internal server error' });
      });

    };

    const remove = (req, res) => {
      req.checkQuery('agent_id', 'agent_id is required').notEmpty();
      req.checkQuery('collection_route_id', 'collection_route_id is required').notEmpty();
      req.checkQuery('day', 'day is required').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const promises = [];
      const query = req.query;
      models.collection_schedule.findOrCreate({where : {
        agentId:query.agent_id,
        collectionRouteId:query.collection_route_id,
      }}).then(cs => {
        const collectionSchedule = cs[0];
        collectionSchedule[query.day] = false;
        promises.push(collectionSchedule.save());
        const this_next_month = moment().add(2, 'months').endOf('month');
        const  selectedDays = moment().weekdaysInBetween(this_next_month, query.day);
        selectedDays.forEach(momentDate => {
          const origin_date = utils.setTimeZone(new Date(momentDate.format('LL')));
          promises.push(models.collection.destroy({
            where: {
              collectionScheduleId: collectionSchedule.id,
              origin_date
            }
          }))
        })
        Promise.all(promises).then(result=> {
            res.status(200).json({ msg: 'Collections removed' });
          } ).catch((err) => {
            return res.status(500).json({ msg: 'Internal server error' });
          });
        })
      };

    const get = (req, res)=> {
      req.checkQuery('from_date', 'from_date is required').notEmpty();
      req.checkQuery('to_date', 'to_date is required').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const fromDate = new Date(utils.setTimeZone(req.query.from_date));
      const toDate = new Date(utils.setTimeZone(req.query.to_date));
      let where_condition = ` where date between "${moment(fromDate).format('YYYY-MM-DD')}" And "${moment(toDate).format('YYYY-MM-DD')}"`;
      const query = req.query;
      if (query.collection_status === 'missed') {
        where_condition =  ` where collection_status = 'pending' AND date between "${moment(fromDate).format('YYYY-MM-DD')}" And "${moment(new Date()).format('YYYY-MM-DD')}"`;
      } else if (query.collection_status) {
        where_condition = where_condition + ` AND collection_status = "${query.collection_status}"`;
      }
      if (query.type === 'priority') {
        where_condition = where_condition + ` AND date IS NOT NULL AND date <> origin_date OR originCollectionScheduleId <> collectionScheduleId`;
      }
      const showCanceled =  query.type === 'canceled';
      if (showCanceled) {
        where_condition = ` where date IS NULL AND  origin_date between "${moment(fromDate).format('YYYY-MM-DD')}" And "${moment(toDate).format('YYYY-MM-DD')}"`;
      }
      const exp = showCanceled ? 'origin_date' : 'date';
      const agent_id = parseInt(query.agent_id, 10);
      const collection_route_id = parseInt(query.collection_route_id, 10);
      if (agent_id) {
        where_condition = where_condition + ` AND cs.agentId = ${agent_id}`;
      }
      if (collection_route_id) {
        where_condition = where_condition + ` AND cs.collectionRouteId = ${collection_route_id}`;
      }

      const missed_count_inner_query = `(SELECT COUNT(*) FROM collections AS mc WHERE collection_status = 'pending' AND DATE < "${moment(new Date()).format('YYYY-MM-DD')}" AND mc.date = c.date  ${collection_route_id ? 'AND mc.collectionScheduleId = c.collectionScheduleId': '' }) AS missed_count,`;
      const priority_count_inner_query = `(SELECT COUNT(*) FROM collections AS mc WHERE collection_status = 'pending' AND DATE <> origin_date AND mc.date = c.date ${collection_route_id ? 'AND mc.collectionScheduleId = c.collectionScheduleId': '' }) AS priority_count ,`;
      const canceled_count_inner_qeury = `(SELECT COUNT(*) FROM collections AS mc WHERE DATE IS NULL AND mc.origin_date = c.origin_date AND mc.collectionScheduleId = c.collectionScheduleId ${collection_route_id ? 'AND mc.collectionScheduleId = c.collectionScheduleId': '' }) AS canceled_count,`;
      const pending_count_inner_qeury = `(SELECT COUNT(*) FROM collections AS mc WHERE collection_status = 'pending' AND DATE >= "${moment(new Date()).format('YYYY-MM-DD')}" AND mc.date = c.date ${collection_route_id ? 'AND mc.collectionScheduleId = c.collectionScheduleId': '' }) AS pending_count,`;
      const _query =  `SELECT   COUNT(*) as count,
      ${query.collection_status !== 'pending' ? missed_count_inner_query: ''}
      ${query.type !== 'canceled' ? priority_count_inner_query: ''}
      ${query.type === 'canceled'  ? canceled_count_inner_qeury : ''}
      ${query.collection_status !== 'missed' ? pending_count_inner_qeury: ''}
      ${exp} FROM collections AS c INNER JOIN collection_schedules AS cs ON cs.id = c.collectionScheduleId  ${where_condition} GROUP BY c.${exp}`;

      database.query(_query, { type:sequelize.QueryTypes.SELECT}).then(result=> {
          res.status(200).json(result);
      })

    }

    const getByDate = (req, res)=> {

      req.checkQuery('date', 'date is required').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const date = req.query.date;
      const id = req.query.id;
      const where = {
        date: date,
      };
      if (id) {
        where.id = id;
      }
      const query =  req.query;
      let agent_where = {};
      let collection_where;
      if (query.type === 'priority') {
        where.date =  {
          $eq: date,
          $ne: null,
          $ne: {
            $col: 'origin_date'
          }
        };
      }
      const showCanceled =  query.type === 'canceled';
      if (showCanceled) {
        where.date = null;
        where.origin_date = date;
      }
      const agent_id = parseInt(query.agent_id, 10);
      if(agent_id) {
        agent_where = { id : agent_id };
      }
      if(req.query.business_name) {
        agent_where.business_name = {
          $like: '%' + req.query.business_name + '%'
           };
      }
      const collection_route_id = parseInt(query.collection_route_id, 10);
      if(collection_route_id) {
        collection_where = { id : collection_route_id };
      }
      return models.collection.findAll({
        where,
        include: [
          {
            model: models.collection_schedule,
            as: 'collection_schedule',
            include: [
              {model: models.collection_route, as: 'collection_route' , where: collection_where,
              include: [{model: models.driver, as: 'driver',
              include: [{model: models.user, as: 'user'}]
            }]
            },
              {model: models.agent, as: 'agent', where: agent_where},
            ],
          },
        ]
      }).then(result=> {
        result = result.map(collection => {
          if (collection.collection_status === 'pending' &&  moment(utils.setTimeZone(collection.date || collection.origin_date)).startOf('day') <  moment(utils.setTimeZone(new Date())).startOf('day')) {
            collection.collection_status = 'missed';
          }
          if (collection.date && collection.date !== collection.origin_date || collection.originCollectionScheduleId !== collection.collectionScheduleId ) {
            collection.dataValues.type = 'priority';
          } else if (collection.date === null) {
            collection.dataValues.type = 'canceled';
          }
          return collection;
        });
        res.status(200).json(result);
      })
    }

    const collected = (req, res) => {
      req.checkBody('id', 'id is required').notEmpty();
      req.checkBody('qrcode', 'qrcode is required').notEmpty();
      req.checkBody('driverId', 'driverId is required').notEmpty();
      req.checkBody('amount_collected', 'amount_collected is required').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const body = req.body;
      const promises = [];
      const qrcode = body.qrcode;
      models.QRcode.findOne({
        where: {code: qrcode}
      }).then(qc=> {
        if(!qc){
          return res.status(500).json({ msg: 'Invalid qrcode' });
        } else {
          models.collection.findOne({where: {QRcodeId: qc.id}}).then(c=>{
            if(c) {
              return res.status(500).json({ msg: 'Barcode is assigned to another collection.' });
            } else {
              models.collection.findOne({where: {id: body.id}}).then(collection => {
                collection.updateAttributes({
                  collection_status : 'collected',
                  QRcodeId : qc.id,
                  amount_collected : body.amount_collected,
                  collectedByDriver : body.driverId,
                }).then(()=>{
                  res.status(200).json({msg: 'Collection Updated'});


                });
              }).catch(()=>{
                 res.status(500).json({ msg: 'Collection not found.' });
              });
            }
          })
        }
      })
    };

    const mutliScheduling = (req, res) => {
      req.checkBody('collection_route_id', 'collection_route_id is required').notEmpty();
      req.checkBody('monday', 'monday is required').notEmpty();
      req.checkBody('tuesday', 'tuesday is required').notEmpty();
      req.checkBody('wednesday', 'wednesday is required').notEmpty();
      req.checkBody('thursday', 'thursday is required').notEmpty();
      req.checkBody('friday', 'friday is required').notEmpty();
      req.checkBody('saturday', 'saturday is required').notEmpty();
      req.checkBody('sunday', 'sunday is required').notEmpty();
      req.checkBody('agentIds', 'agentIds is required').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }

      const this_next_month = moment().add(2, 'months').endOf('month');
      const selectedDays = [];
      const unselectedDays = [];
      const body = req.body;
      if(body.monday) selectedDays.push('monday'); else unselectedDays.push('monday');
      if(body.tuesday) selectedDays.push('tuesday'); else unselectedDays.push('tuesday');
      if(body.wednesday) selectedDays.push('wednesday'); else unselectedDays.push('wednesday');
      if(body.thursday) selectedDays.push('thursday'); else unselectedDays.push('thursday');
      if(body.friday) selectedDays.push('friday'); else unselectedDays.push('friday');
      if(body.saturday) selectedDays.push('saturday'); else unselectedDays.push('saturday');
      if(body.sunday) selectedDays.push('sunday'); else unselectedDays.push('sunday');
      let selectedDates = [];
      let unselectedDates = [];

      selectedDays.forEach(day => {
        const days = moment().weekdaysInBetween(this_next_month, day);
        selectedDates = selectedDates.concat(days);
      })
      unselectedDays.forEach(day => {
        const days = moment().weekdaysInBetween(this_next_month, day);
        unselectedDates = unselectedDates.concat(days);
      })
      var errors = req.validationErrors();
      if (errors) {
        res.status(400).send({ errors });
        return;
      }
      const agentsIds = body.agentIds;
      const createScheduleArr = [];
      const deleteScheduleArr = [];
      const daysSchedule = {
        monday: body.monday,
        tuesday: body.tuesday,
        wednesday: body.wednesday,
        thursday: body.thursday,
        friday: body.friday,
        saturday: body.saturday,
        sunday: body.sunday
      }
      const agentIdsWithRoute = agentsIds.map(a => { return {agentId: a, collectionRouteId: body.collection_route_id} });
      const agentIdsWithWhole = agentsIds.map(a=> {return {agentId: a, collectionRouteId: body.collection_route_id}}).map(a => _.assign(a, daysSchedule) );

      models.collection_schedule.findAll ({where: { $or: agentIdsWithRoute}}).then(cs_arr => {
        cs_arr = cs_arr.map((node) => node.get({ plain: true }));
        const requiredCreationSchedules = _.differenceBy(agentIdsWithWhole, cs_arr, 'agentId');
        models.collection_schedule.bulkCreate(requiredCreationSchedules).then(newlyCreatedSchedules => {
          models.collection_schedule.update(daysSchedule,
            {where: { id: cs_arr.map(cs => cs.id)}}).then(()=> {
            newlyCreatedSchedules = newlyCreatedSchedules.map((node) => node.get({ plain: true }));
          const collections_schedules = cs_arr.concat(newlyCreatedSchedules);
          collections_schedules.forEach(cs => {
            selectedDates.forEach(date => {
              createScheduleArr.push({
                  collectionScheduleId: cs.id,
                  originCollectionScheduleId: cs.id,
                  date,
                  origin_date: date,
                })
              });
              unselectedDates.forEach(date => {
                deleteScheduleArr.push({
                  collectionScheduleId: cs.id,
                  originCollectionScheduleId: cs.id,
                  date,
                  origin_date: date,
              })
          })
         });
          const all = deleteScheduleArr.concat(createScheduleArr);
          models.collection.destroy({ where: { $or: all } }).then(()=> {
            models.collection.bulkCreate(createScheduleArr)
              .then(()=> {
                  res.status(200).json({ msg: 'Collections Schedule Changed' });
              })
            ;
          })
          })
        })
    })
  }



    return {
      create,
      remove,
      get,
      getByDate,
      update,
      collected,
      mutliScheduling,
    };
}

module.exports = CollectionController;
