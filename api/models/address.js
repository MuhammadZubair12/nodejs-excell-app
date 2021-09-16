
module.exports = (sequelize, Sequelize) => {

    var Address = sequelize.define('address', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        country: {
            type: Sequelize.STRING,
        },
        city: {
            type: Sequelize.STRING,
        },
        street_address: {
            type: Sequelize.STRING,
        },
        postal_code: {
            type: Sequelize.STRING,
        },
        lat_long: {
            type: Sequelize.STRING,
        }

    });

    return Address;
}
