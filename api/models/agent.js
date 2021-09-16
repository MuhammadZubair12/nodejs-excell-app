
module.exports = (sequelize, Sequelize) => {

  var Agent = sequelize.define('agent', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
      },
      business_name: {
          type: Sequelize.STRING,
      },
      fca_no: {
        type: Sequelize.STRING,
      },
      sr_no: {
        type: Sequelize.STRING,
      },
      contact_person: {
        type: Sequelize.STRING,
      },
      working_days: {
        type: Sequelize.STRING,
      },
      working_hours: {
        type: Sequelize.STRING,
      },
      friday_break: {
        type: Sequelize.STRING,
      },

  });
  Agent.associate = function (models) {
    Agent.belongsTo(models.user);
    Agent.belongsTo(models.collection_route);
    Agent.hasOne(models.collection_schedule);
  }
  return Agent;
}
