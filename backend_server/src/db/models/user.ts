import {
  Sequelize,
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association
} from 'sequelize';
import { UsePc } from './use_pc';

/* user db first settings */
export interface UserAttributes {
  id: number;
  email?: string;
  password?: string;
  birthdate?: Date
  gender?: string;
  signinType: 'email' | 'googleoauth';
  signinId?: string;
  remainTime: number;
}

interface UserCreationAttributes extends Optional<Optional<UserAttributes, 'id'>, 'remainTime'> {}

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public email?: string;
  public password?: string;
  public birthdate?: Date;
  public gender?: string;
  public signinType!: 'email' | 'googleoauth';
  public signinId?: string;
  public remainTime!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUsePcs!: HasManyGetAssociationsMixin<UsePc>; // Note the null assertions!
  public addUsePcs!: HasManyAddAssociationMixin<UsePc, number>;
  public hasUsePcs!: HasManyHasAssociationMixin<UsePc, number>;
  public countUsePcs!: HasManyCountAssociationsMixin;
  public createUsePcs!: HasManyCreateAssociationMixin<UsePc>;

  public readonly usePcs?: UsePc[]; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    usePcs: Association<User, UsePc>;
  };
}

export const initUser = (sequelize: Sequelize) => {
  User.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(320),
      allowNull: true
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'etc'),
      allowNull: true
    },
    signinType: {
      type: DataTypes.ENUM('email', 'googleoauth'),
      allowNull: false
    },
    signinId: { // TODO: 이거 인덱싱해서 빨리 찾을 수 있도록 하면 좋을듯
      type: DataTypes.STRING(),
      allowNull: true
    },
    remainTime: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    }
  }, {
    tableName: 'user',
    sequelize
  });

  const queryInterface = sequelize.getQueryInterface();
  queryInterface.addConstraint('user', {
    fields: ['signinType', 'signinId'],
    type: 'unique'
  });
};

export const initUserAssociate = () => {
  User.hasMany(UsePc, {
    sourceKey: 'id',
    foreignKey: 'userId',
    as: 'usePcs'
  });
};
