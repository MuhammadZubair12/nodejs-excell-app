
module.exports = (sequelize, Sequelize) => {

  var collection_schedule = sequelize.define('collection_schedule', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
      },
      monday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tuesday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      wednesday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      thursday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      friday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      saturday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sunday : {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
  });
  collection_schedule.associate = function (models) {
    collection_schedule.belongsTo(models.collection_route);
    collection_schedule.belongsTo(models.agent);
    collection_schedule.hasMany(models.collection, {onDelete: 'CASCADE'});
  }
  return collection_schedule;
}
