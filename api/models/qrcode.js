module.exports = (sequelize, Sequelize) => {

  var QRcode = sequelize.define('QRcode', {

      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      code: {
          type: Sequelize.STRING,
          notEmpty: true
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

  });
  QRcode.associate = function (models) {
    QRcode.hasOne(models.collection);
  }
  return QRcode;
}
