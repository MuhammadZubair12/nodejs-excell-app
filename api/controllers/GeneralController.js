const models = require('../models');
const authService = require('../services/auth.service');


const GeneralController = () => {

    const sync = (req, res) => {
        models.sequelize.sync({ force: true })
            .then(() => {
            const promises = [];

            promises.push(models.role.create({ name: 'Admin'}));
            promises.push(models.role.create({ name: 'Fleet Manager'}));
            promises.push(models.role.create({ name: 'Driver'}));
            promises.push(models.role.create({ name: 'Agent'}));

            Promise.all(promises).then(result=> {
                res.status(200).json({ msg: 'DB, synced!' });
            } ).catch((err) => {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' });
            });
    });
    };

    return {
        sync,
    };
}

module.exports = GeneralController;
