
module.exports = (sequelize, Sequelize) => {

    var Role = sequelize.define('role', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
            notEmpty: true
        }

    });
    return Role;
}
