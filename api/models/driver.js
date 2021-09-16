
module.exports = (sequelize, Sequelize) => {

  var Driver = sequelize.define('driver', {

      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      license: {
          type: Sequelize.STRING,
          notEmpty: true
      },
      guaranter_contact: {
        type: Sequelize.STRING,
      },
      driver_image_url: {
        type: Sequelize.STRING,
        notEmpty: true
      }
  });
  Driver.associate = function (models) {
    Driver.belongsTo(models.user);
    Driver.belongsTo(models.vehicle);
    Driver.belongsTo(models.collection_route);
  }
  return Driver;
}
