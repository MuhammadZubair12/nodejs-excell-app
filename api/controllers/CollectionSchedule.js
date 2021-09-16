const models = require('../models');
const authService = require('../services/auth.service');


const CollectionScheduleController = () => {

    const create = (req, res) => {
        req.checkBody('agent_id', 'agent_id is required').notEmpty();
        req.checkBody('collection_route_id', 'collection_route_id is required').notEmpty();
        const body = req.body;
        const cs =  {
            collectionRouteId: body.collection_route_id,
            agentId:body.agent_id,
            monday: body.monday,
            tuesday: body.tuesday,
            wednesday: body.wednesday,
            thursday: body.thursday,
            friday: body.friday,
            saturday: body.saturday,
            sunday: body.sunday,
        }
        return models.collection_schedule.create(cs).then(_cs=> {
          return res.status(200).json(_cs);
        }).catch(err=> {
          return res.status(500).json(err);
        });
      }

    return {
        create,
        get,
    };
}

module.exports = CollectionScheduleController;
