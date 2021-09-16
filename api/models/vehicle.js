
module.exports = (sequelize, Sequelize) => {

  var Vehicle = sequelize.define('vehicle', {

      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      company: {
          type: Sequelize.STRING,
      },
      model: {
        type: Sequelize.STRING,
      },
      reg_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      is_insured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_service: {
        type: Sequelize.DATE,
      },
  });
  Vehicle .associate = function (models) {
    Vehicle.hasOne(models.driver);
  }
  return Vehicle;
}
