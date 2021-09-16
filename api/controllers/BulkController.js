const models = require('../models');

const BulkController = () => {

    const vehicles = (req, res) => {
   return models.vehicle.findAll({
    include: [
      {
        model: models.driver, as: 'driver'},
      ]
   })
      .then(vehicles => {
        return res.status(200).json(vehicles);
      }).catch(err => {
        return res.status(500).json(err);
      });
    }

    const agents = (req, res) => {
      return models.agent.findAll({
        include: [
          { model: models.user, as: 'user'},
          ]
      })
      .then(agents => {
        return res.status(200).json(agents);
      }).catch(err => {
        return res.status(500).json(err);
      });
    }

    const drivers = (req, res) => {
      return models.driver.findAll({
        include: [
          { model: models.user, as: 'user'},
          { model: models.vehicle, as: 'vehicle'},
          ]
      })
        .then(drivers => {
          return res.status(200).json(drivers);
        }).catch(err => {
          return res.status(500).json(err);
        });
    }

    const collection_routes = (req, res) => {
      return models.collection_route.findAll({
        include: [
            { model: models.agent ,
            },
          ]
      })
        .then(collection_routes => {
          return res.status(200).json(collection_routes);
        }).catch(err => {
          return res.status(500).json(err);
        });
      }

    return {
      vehicles,
      agents,
      drivers,
      collection_routes,
    };
}

module.exports = BulkController;
