const User = require('../models/User'),
  models = require('../models'),
  mailer = require('../../config/mailer'),
  logger = require('../../config/logger'),
  emailHandler = require('../../lib/emailHandler'),
  utils = require('../../lib/utils'),
  nodemailer = require('nodemailer'),
  jwt = require('jsonwebtoken')
  _ = require('lodash');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const UserController = () => {
  const register = (req, res) => {
    const body = req.body;
    //user
    req.checkBody('password', 'password is required').notEmpty();
    if(body.role != '4') req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('phone', 'phone is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is already registered').isEmailAvailable();
    req.checkBody('email', 'email is invalid').isEmail();
    req.checkBody('role', 'role').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send({ errors });
      return;
    }



    req.asyncValidationErrors().then(() => {
      //no errors, create user
      return models.user.create({
        email: body.email,
        password: body.password,
        name: body.name,
        phone: body.phone,
        roleId: body.license ? 3 : body.role,
        password: body.password,
      })
        .then((user) => {
          const promises= [];
          const _addressObject = utils.addressObject(body);
          if(_addressObject.lat_long) {
            promises.push(models.address.create(utils.addressObject(body)).then(address=> {
              promises.push(user.setAddress(address));
            }));
          }
          if (body.license) {
            const _driver = {
              license: body.license,
              driver_image_url: body.driver_image_url,
              guaranter_contact: body.guaranter_contact,
              userId: user.id,
            };
            if ( body.vehicle_id ) _driver.vehicleId = body.vehicle_id;
            promises.push(models.driver.create(_driver))
          }
          if (body.role == '4') {
            promises.push(models.agent.create({
              userId: user.id,
              business_name: body.business_name,
            }));
          }

          Promise.all(promises).then(result=> {
            const mailingInfo = {
              fullName: user.name,
              to: user.email,
              templatePath: 'mails/welcome',
              subject: 'welcome'
             }
             emailHandler.sendMail(mailingInfo);
             const token = authService.issue({ id: user.id });
             return res.status(200).json({ token, user });
          });

        })
        .catch((err) => {
          return res.status(500).json({ msg: err });
        });

    }).catch((errors) => {
      res.status(400).send({ errors });
    });
  };

  const login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const isMobile  = req.body.client === 'mobile';
    //const roleId = req.body.roleId;
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is invalid').isEmail();
    req.checkBody('password', 'password is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send({ "message": 'There have been validation errors' });
      return;
    }
    let whereObj =  {
      email,
    };
    if(isMobile) {
      whereObj.roleId = 3;
    } else {
      whereObj.roleId = {
        in: [1,2],
      }
    }
    if (email && password) {
      models.user
        .findOne({
          where: whereObj,
        })
        .then((user) => {
          if (!user) {
            return res.status(400).json({ msg: 'Bad Request: User not found' });
          }

          if (bcryptService.comparePassword(password, user.password)) {
            const token = authService.issue({ id: user.id });
            if (user.status === false) {
              return res.status(401).json({ msg: 'This user is deactivated' });
            }
            return res.status(200).json({ token, user });
          }

          return res.status(401).json({ msg: 'Please enter a valid username / password.' });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ msg: 'Internal server error' });
        });
    }
  };

  const validate = (req, res) => {
    const tokenToVerify = req.body.token;

    authService
      .verify(tokenToVerify, (err, succ) => {
        if (err) {
          return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
        } else {
          return models.user.findOne({
            where: {
              id: succ.id,
            },
          }).then(function(user){
            if (user.roleId === 3) {
              models.driver.findOne({
                where: {userId: user.id},
                include: [{model: models.collection_route, as : 'collection_route'}]
              }).then(driver=>{
                user.dataValues.driver = driver;
                return res.status(200).json(user);
              })
            } else {
              return res.status(200).json(user);
            }
            // Do something with the user

          });
        }

        return res.status(200).json({ isvalid: true });
      });
  };

  const me = (req,res) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
            decoded;
        try {
            decoded = jwt.verify(authorization, 'secret');
        } catch (e) {
          return res.status(401).json({ isvalid: false, err: e });
        }
        var userId = decoded.id;
        // Fetch the user by id
        User.findOne({_id: userId}).then(function(user){
            // Do something with the user
            return res.status(200).json(user);
        });
    }
    return res.send(500);
  }

  const getAll = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;   // number of records per page
    let offset = 0;
    let whereCondition = {
      roleId: {
          in: [1,2]
      },
    };
    whereCondition = utils.applyNameFilter(req, whereCondition);
    models.user.count({where: whereCondition})
    .then((count) => {
      let page = req.query.page || 1;      // page number
      let pages = Math.ceil(count / limit);
      offset = limit * (page - 1);
      models.user
      .findAll({
        limit: limit,
        offset: offset,
        $sort: { id: 1 },
        where: whereCondition,
            attributes: {
            exclude: ['password']
        }})
          .then((users) => res.status(200).json({ users, pagination: {
            page,
            total_records: count,
            total_pages: pages,
          }}))
          .catch((err) => {
            return res.status(500).json({ msg: 'Internal server error' });
          });
    }).catch((err) => {
      return res.status(500).json({ msg: 'Internal server error' });
    });;

  };

  const getSingle = (req, res) => {
    const id = req.params.id
    models.user
      .findOne({attributes: {
        exclude: ['password']
      } ,where: {
        id,
      },})
      .then((user) => res.status(200).json({ user }))
      .catch((err) => {
        return res.status(500).json({ msg: 'Internal server error' });
      });
  };

  const updateUserPass = (req, res) => {
    const password = req.body.password;
    const new_password = req.body.new_password;
    const user_id = req.body.user_id;

    req.checkBody('new_password', 'new_password is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('user_id', 'user_id is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).send({ "message": 'There have been validation errors' });
      return;
    }
    if (password && user_id) {
      models.user
        .findOne({
          where: {
            id: user_id,
          },
        })
        .then((user) => {
          if (!user) {
            return res.status(400).json({ msg: 'Bad Request: User not found' });
          }

          if (bcryptService.comparePassword(password, user.password)) {

            return user.update({
              password: new_password,
            })
            .then( ()=> {
              return res.status(200).json({ result: true });
            })
            //
          }

          return res.status(401).json({ msg: 'Unauthorized' });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ msg: 'Internal server error' });
        });
    }
  };

  const updateUser = (req, res) => {

    //user
    req.checkBody('user_id', 'user_id is required').notEmpty();
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
    const userId = body.user_id;
    let _user = {
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      roleId: body.role,
      password: body.password,
      status: body.status
    }
    _user = utils.cleanObject(_user);
    models.user
        .findOne({
          where: {
            id: userId,
          },
          include: [
            { model: models.address, as: 'address'},
        ]
        }).then(user=>{
          const promises = [];

          if (_user) promises.push(

            models.user.update(
              _user,
              {
                individualHooks: true,
                where: {id: user.id},
              }
            )
          );

          Promise.all(promises).then(result=> {
            return res.status(200).json({ result: true });
          } );

        })

  };

  const createDriver = (req, res)=> {
    req.checkBody('license', 'license is required').notEmpty();
    req.checkBody('driver_image_url', 'driver_image_url is required').notEmpty();
    return register(req, res)
  }
  

  const sheet = (req, res) => {
    let sheetdata = [];
    const body = req.body;
    console.log(body);
    body.forEach((row) => {
      let cs =  {
        name: row[0],
        code:row[1],
        category: row[2],
        category_code: row[3],
        purchase_price: row[4],
        sale_price: row[5],
        quantity: row[6],
        company_id:row[7],
        image:row[8]
    }
      sheetdata.push(cs)
    })
    sheetdata.shift();
    return models.sheet.bulkCreate(sheetdata).then(_cs=> {
      // console.log('Bodydd', _cs)
      return res.status(200).json(_cs);
    }).catch(err=> {
      return res.status(500).json(err);
    });

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
        include: [
          {model: models.address, as: 'address'}]
      }
      ,
        { model: models.vehicle, as: 'vehicle'}
    ]}).then(driver => {
      if(!driver) {
        return res.status(400).json({ "message": 'Driver not found' });
      } else {
        return res.status(200).json(driver);
      }

    });
  }

  const getAllDrivers = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;   // number of records per page
    let offset = 0;
    let whereCondition =   {
      roleId: {
          in: [3]
        },
      };
    whereCondition = utils.applyNameFilter(req, whereCondition);
    const paramObject = {
      limit: limit,
      offset: offset,
      $sort: { id: 1 },
      include: [
        { model: models.user, as: 'user',
        where: whereCondition,
        attributes: {
          exclude: ['password']
        },
        include: [ {model: models.address, as: 'address'},]
      },
      { model: models.vehicle, as: 'vehicle'}
    ]};
    models.driver.count(paramObject)
    .then((count) => {
      let page = req.query.page || 1;      // page number
      let pages = Math.ceil(count / limit);
      offset = limit * (page - 1);
      return models.driver
        .findAll(paramObject).then(driver => {
          if(!driver) {
            return res.status(400).json({ "message": 'Driver not found' });
          } else {
            return res.status(200).json({ drivers: driver , pagination: {
              page,
              total_records: count
            }});
          }

      });
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
    let updateUser = {
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      roleId: body.role,
      password: body.password,
      status: body.status,
    }
    updateUser = utils.cleanObject(updateUser);

    let updateDriver = {
      license: body.license,
      driver_image_url: body.driver_image_url,
      guaranter_contact: body.guaranter_contact,
    };
    if ( body.vehicle_id ) updateDriver.vehicleId = body.vehicle_id;
    updateDriver = utils.cleanObject(updateDriver);
    let _addressObject = utils.addressObject(body);
    _addressObject = utils.cleanObject(_addressObject);
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
    register,
    login,
    validate,
    getAll,
    updateUserPass,
    updateUser,
    me,
    getSingle,
    createDriver,
    getDriver,
    getAllDrivers,
    updateDriver,
    sheet,
  };
};

module.exports = UserController;
