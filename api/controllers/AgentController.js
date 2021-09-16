const models = require('../models'),
utils = require('../../lib/utils'),
excelToJson = require('convert-excel-to-json'),
xlsxj = require("xlsx-to-json");;

const UserController = require('./UserController')();
const AgentController = () => {

    const create = (req, res) => {
      req.checkBody('business_name', 'license is required').notEmpty();
      return UserController.register(req, res)
    };

    const get = (req, res)=> {
      const agentId = req.params.id;
      if (!agentId) {
        res.status(400).send({ "message": 'Id is required' });
      }
      return models.agent
      .findOne({
        where: {
          id: agentId,
        },
        include: [
          { model: models.user, as: 'user',
          attributes: {
            exclude: ['password']
          },
          include: [ {model: models.address, as: 'address'}]
        }
      ]}).then(agent => {
        if(!agent) {
          return res.status(400).json({ "message": 'Agent not found' });
        } else {
          return res.status(200).json(agent);
        }

      });
    }


    const getAll = (req, res) => {
      let limit = req.query.limit ? parseInt(req.query.limit, 10) : 5000;   // number of records per page
      let offset = 0;
      let whereCondition =   {
        roleId: {
            in: [4]
          },
        };
      whereCondition = utils.applyBusinessNameFilter(req, whereCondition);
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
          include: [ {model: models.address, as: 'address'}]
        },
      ]
    };
      models.agent.count(paramObject)
      .then((count) => {
        let page = req.query.page || 1;      // page number
        let pages = Math.ceil(count / limit);
        offset = limit * (page - 1);
        return models.agent
          .findAll(paramObject).then(agent => {
            if(!agent) {
              return res.status(400).json({ "message": 'Agent not found' });
            } else {
              return res.status(200).json({ agents: agent , pagination: {
                page,
                total_records: count,
                total_pages: pages,
              }});
            }

        });
      });
    }


  const update = (req, res) => {
    req.checkBody('agent_id', 'agent_id is required').notEmpty();
    const agentId = req.body.agent_id;
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
    let updateAgent = {
      business_name: body.business_name,
    }
    updateAgent = utils.cleanObject(updateAgent);
    let _addressObject = utils.addressObject(body);
    _addressObject = utils.cleanObject(_addressObject);
    return models.agent
    .findOne({
      where: {id: agentId},
      include: [
        { model: models.user, as: 'user',
        attributes: {
          exclude: ['password']
        },
        include: [ {model: models.address, as: 'address'}]
      },
    ]}).then(agent => {
      if(!agent) {
        return res.status(400).json({ "message": 'Agent not found' });
      } else {
        const promises = [];
        promises.push(agent.user.updateAttributes(updateUser));
        if (agent.user.address) {
          promises.push(agent.user.address.updateAttributes(_addressObject));
        } else {
          promises.push(models.address.create(_addressObject).then(address=> {
            promises.push(agent.user.setAddress(address));
          }));
        }
        promises.push(agent.updateAttributes(updateAgent));
        Promise.all(promises).then(result=> {
          return res.status(200).json({ result: true });
        });
      }

    });
  }


  const importAgents = (req, res)=> {
    if (!req.files)
    return res.status(400).send('No files were uploaded.');
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    const filename = `${_.random(1, 5000000)}_${file.name}`;
    const localFileLocation=`./uploads/${filename}`;
    file.mv(localFileLocation, function(err) {
      if (err)
        return res.status(500).send(err);



      B:"Sr. No"
      C:"Business Name"
      D:"Responsible Person Name"
      E:"House No"
      F:"Street"
      G:"City"
      H:"Post Code"
      I:"Contact No"
      J:"Working Days"
      K:"Working Hours"
      L:"Friday Break Time"
      M:"FCA No"
      N:"Email Address"


      const result = excelToJson({
      sourceFile: localFileLocation,
      header:{
        rows: 1 // 2, 3, 4, etc.
      }
      });
      const header_row = result.Sheet1[1];
      const sheet =  result.Sheet1;
      const promises= [];
      if (
        header_row.B === 'Sr. No' &&
        header_row.C === "Business Name" &&
        header_row.D === "Responsible Person Name" &&
        header_row.E === "House No" &&
        header_row.F === "Street" &&
        header_row.G === "City" &&
        header_row.H === "Post Code" &&
        header_row.I === "Contact No" &&
        header_row.J === "Working Days" &&
        header_row.K === "Working Hours" &&
        header_row.L === "Friday Break Time" &&
        header_row.M === "FCA No" &&
        header_row.N === "Email Address"
        ) {
          const mappedAgents =[] ;
          for(let i = 2; i<sheet.length; i++ ) {
            let agent = sheet[i];
            const mappedAgent = {
              sr_no: agent.B,
              business_name: agent.C,
              contact_person: agent.D,
              user_street_address: agent.E + ' ' + agent.F,
              user_city: agent.G,
              user_postal_code: agent.H,
              phone: agent.I,
              working_days: agent.J,
              working_hours: agent.K,
              friday_break: agent.L,
              fca_no: agent.M,
              email: agent.N
            }
            promises.push( models.user.findOne({
              where: {email: mappedAgent.email}
            }).then(user=> {
              if (!user) {
                promises.push(models.user.create({
                  email: mappedAgent.email,
                  phone: mappedAgent.phone,
                  roleId: 4,
                  password: 'asdfgh',
                }).then((user) => {
                  promises.push( models.address.create(utils.addressObject(mappedAgent)).then(address=> {
                    user.setAddress(address);
                    promises.push( models.agent.create({
                      userId: user.id,
                      business_name: mappedAgent.business_name,
                      fca_no: mappedAgent.fca_no,
                      sr_no: mappedAgent.sr_no,
                      contact_person: mappedAgent.sr_no,
                      working_days: mappedAgent.working_days,
                      working_hours: mappedAgent.working_hours,
                      friday_break: mappedAgent.friday_break,
                    }))
                  }));
                }));
              }
            }))
          }

          Promise.all(promises).then(result=> {
            return res.status(200).send(result);
          });

        } else {
          return res.status(400).send('Invalid file format');
        }
    });

    }

  return {
    create,
    get,
    getAll,
    update,
    importAgents,
  };
}

module.exports = AgentController;
