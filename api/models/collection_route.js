
module.exports = (sequelize, Sequelize) => {

  var Collection_route = sequelize.define('collection_route', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
      },
      route_no: {
          type: Sequelize.STRING,
          unique: true,
      },
      route_name: {
        type: Sequelize.STRING,
        unique: true,
      },
  });
  Collection_route.associate = function (models) {
    Collection_route.hasMany(models.agent);
    Collection_route.hasOne(models.driver);
    Collection_route.hasOne(models.collection_schedule);
  }
  return Collection_route;
}
