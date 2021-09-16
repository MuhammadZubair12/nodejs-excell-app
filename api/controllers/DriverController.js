const userController = require('./UserController'),
  models = require('../models'),
  utils = require('../../lib/utils'),
  _ = require('lodash').assign,
  logger = require('../../config/logger'),
;


const DriverController = () => {

  const createDriver = (req, res)=> {
    req.checkBody('license', 'license is required').notEmpty();
    return userController.register(req, res)
  }
   

  const getDriver = (req, res)=> {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).send({ "message": 'Id is required' });
    }
    return models.driver
    .findOne({
      where: {
        id: userId,
      },
      include: [
        { model: models.user, as: 'user',
        attributes: {
          exclude: ['password']
        },
        include: [ {model: models.address, as: 'address'}]
      }
    ]}).then(driver => {
      if(!driver) {
        return res.status(400).json({ "message": 'Driver not found' });
      } else {
        return res.status(200).json(driver);
      }

    });
  }

  const getAllDrivers = (req, res) => {
    return models.driver
    .findAll({
      include: [
        { model: models.user, as: 'user',
        where: {roleId: 3},
        attributes: {
          exclude: ['password']
        },
        include: [ {model: models.address, as: 'address'}]
      },
    ]}).then(driver => {
      if(!driver) {
        return res.status(400).json({ "message": 'Driver not found' });
      } else {
        return res.status(200).json(driver);
      }

    });
  }

  const updateDriver = (req, res) => {
    req.checkBody('driver_id', 'driver_id is required').notEmpty();
    const driverId = req.body.driver_id;
    if (req.body.email) {
      req.checkBody('email', 'email is already registered').isEmailAvailable();
      req.checkBody('email', 'email is invalid').isEmail();
    }
    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send({ errors });
      return;
    }
    const body = req.body;
    const updateUser = {
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      roleId: body.role,
      password: body.password,
      status: body.status,
    }
    const updateDriver = {
      license: body.license,
    }

    const _addressObject = utils.addressObject(body);
    return models.driver
    .findOne({
      where: {id: driverId},
      include: [
        { model: models.user, as: 'user',
        attributes: {
          exclude: ['password']
        },
        include: [ {model: models.address, as: 'address'}]
      },
    ]}).then(driver => {
      if(!driver) {
        return res.status(400).json({ "message": 'Driver not found' });
      } else {
        const promises = [];
        promises.push(driver.user.updateAttributes(updateUser));
        if (driver.user.address) {
          promises.push(driver.user.address.updateAttributes(_addressObject));
        } else {
          promises.push(models.address.create(_addressObject).then(address=> {
            promises.push(driver.user.setAddress(address));
          }));
        }
        promises.push(driver.updateAttributes(updateDriver));
        Promise.all(promises).then(result=> {
          return res.status(200).json({ result: true });
        });
      }

    });
  }

  return {
    createDriver,
    getDriver,
    getAllDrivers,
    updateDriver,
  };
}

module.exports = DriverController;
