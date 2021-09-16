const models = require('../models'),
utils = require('../../lib/utils');



const VehicleController = () => {

    const create = (req, res) => {
      req.checkBody('reg_no', 'reg_no is required').notEmpty();
      req.checkBody('model', 'model is required').notEmpty();
      const body = req.body;
      return models.vehicle.create({
        reg_no: _.toLower(body.reg_no),
        company: body.company,
        last_service: utils.setTimeZone(body.last_service),
        is_insured: body.is_insured,
        model: body.model
      }).then(vehicle=> {
        return res.status(200).json(vehicle);
      }).catch(err=> {
        return res.status(500).json(err);
      });
    }

    const update = (req, res) => {
      req.checkBody('reg_no', 'reg_no is required').notEmpty();
      req.checkBody('model', 'model is required').notEmpty();
      req.checkBody('id', 'id is required').notEmpty();
      const body = req.body;
      const vehicleId = body.id;
      let _vehicle = {
        reg_no: _.toLower(body.reg_no),
        company: body.company,
        last_service: utils.setTimeZone(body.last_service),
        is_insured: body.is_insured,
        model: body.model,
      };
      _vehicle = utils.cleanObject(_vehicle);
      return models.vehicle.update(_vehicle,
      { where: {id: vehicleId},}).then(vehicle=> {
        return res.status(200).json(vehicle);
      }).catch(err=> {
        return res.status(500).json(err);
      });
    }

    const get = (req, res) => {
      let limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;   // number of records per page
      let offset = 0;
      let whereCondition = utils.applyVehicleRegistration(req, {});
      return models.vehicle.count({where: whereCondition}).then(count => {
        let page = req.query.page || 1;      // page number
        let pages = Math.ceil(count / limit);
        offset = limit * (page - 1);
        return models.vehicle.findAll({
          limit: limit,
          offset: offset,
          $sort: { id: 1 },
          where: whereCondition,
        }).then(vehicles=> {
           return res.status(200).json({ vehicles, pagination: {
            page,
            total_records: count,
            total_pages: pages,
          }});
        })
      })
    }

    const getById = (req, res) => {
      const vehicleId = req.params.id;
      if (!vehicleId) {
        res.status(400).send({ "message": 'Id is required' });
      }
        return models.vehicle.findOne({
          where: {
            id: vehicleId,
          },
        }).then(vehicle=> {
           return res.status(200).json(vehicle);
        })
    }

    return {
      create,
      get,
      update,
      getById,
    };
}

module.exports = VehicleController;
