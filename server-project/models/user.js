'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    
    username: {
      type:DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty:{
          msg :"Username is required"
        } ,
        notNull:{
          msg : "Username is required"
        }
      }
    },
    email: {
      type:DataTypes.STRING,
      allowNull: false,
      unique:{
        msg:"Email must be unique"
      },
      validate:{
        isEmail:{
          msg:"Email must is Format"
        },
        notEmpty:{
          msg :"Email is required"
        } ,
        notNull:{
          msg : "Email is required"
        }
      }
    },
    password: {
      type:DataTypes.STRING,
      allowNull: false,
      validate:{
        notEmpty:{
          msg :"Password is required"
        } ,
        notNull:{
          msg : "Password is required"
        }
      }
    },
    status: {
      type:DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.addHook('beforeCreate', (user, options) => {
    user.password = hashPassword(user.password);
    user.status ='unpaid'
  });
  return User;
};