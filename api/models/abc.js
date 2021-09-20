
module.exports = (sequelize, Sequelize) => {

    var Abc = sequelize.define('abc', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
        },
        code: {
            type: Sequelize.STRING,
        },
    });

    return Abc;
}
