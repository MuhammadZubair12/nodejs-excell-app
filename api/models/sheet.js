
module.exports = (sequelize, Sequelize) => {

    var Sheet = sequelize.define('sheet', {
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
        category: {
            type: Sequelize.STRING,
        },
        category_code: {
            type: Sequelize.STRING,
        },
        purchase_price: {
            type: Sequelize.STRING,
        },
        sale_price: {
            type: Sequelize.STRING,
        },
        quantity: {
            type: Sequelize.STRING,
        },
        company_id: {
            type: Sequelize.STRING,
        },
        image: {
            type: Sequelize.STRING,
        }

    });

    return Sheet;
}
