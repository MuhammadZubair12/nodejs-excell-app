module.exports = (sequelize, Sequelize) => {
  const hooks = {
    beforeCreate(collection) {
      collection.originCollectionScheduleId = collection.collectionScheduleId; // eslint-disable-line no-param-reassign
    },
  };

  var Collection = sequelize.define('collection', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
      },
      collectedByDriver: {
        type: Sequelize.INTEGER,
      },
      collection_status: {
          type: Sequelize.STRING,
          notEmpty: true,
          defaultValue: 'pending'
      },
      date: {
        type: Sequelize.DATEONLY,
        notEmpty: true,
      },
      origin_date: {
        type: Sequelize.DATEONLY,
        notEmpty: true,
      },
      amount_to_be_collected: {
        type: Sequelize.DECIMAL,
      },
      amount_collected: {
        type: Sequelize.DECIMAL,
      },
      amount_confirmed: {
        type: Sequelize.DECIMAL,
      },
      originCollectionScheduleId: {
        type: Sequelize.INTEGER,
        notEmpty: true,
      },
      notes: {
        type: Sequelize.STRING,
      },

  }, { hooks });
  Collection.associate = function (models) {
    Collection.belongsTo(models.collection_schedule);
    Collection.belongsTo(models.QRcode);
  }
  return Collection;
}
