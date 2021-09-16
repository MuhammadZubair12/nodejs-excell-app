
const bcryptSevice = require('../services/bcrypt.service');

module.exports = (sequelize, Sequelize) => {

  const hooks = {
    beforeSave(user) {
      user.password = bcryptSevice.password(user); // eslint-disable-line no-param-reassign
    },
  };

  const instanceMethods = {
    toJSON() {
      const values = Object.assign({}, this.get());

      delete values.password;

      return values;
    },
  };

  const User = sequelize.define('user', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    about: {
      type: Sequelize.TEXT
    },

    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true
      }
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false
    },

    last_login: {
      type: Sequelize.DATE
    },

    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },

    phone: {
      type: Sequelize.STRING,
    },

    is_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  }, { hooks, instanceMethods });

  User.associate = function (models) {
    User.hasOne(models.address);
    User.belongsTo(models.role);
  }
  return User;

}
//module.exports = User;
