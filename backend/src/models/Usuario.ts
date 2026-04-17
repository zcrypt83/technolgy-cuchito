import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface UsuarioAttributes {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'administrador' | 'encargado_almacen' | 'usuario_operativo';
  almacenAsignadoId?: number | null;
  telefono?: string;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Usuario extends Model<UsuarioAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public password!: string;
  public rol!: 'administrador' | 'encargado_almacen' | 'usuario_operativo';
  public almacenAsignadoId?: number | null;
  public telefono?: string;
  public estado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('administrador', 'encargado_almacen', 'usuario_operativo'),
      allowNull: false,
      defaultValue: 'usuario_operativo'
    },
    almacenAsignadoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'almacenes',
        key: 'id'
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true
  }
);

export default Usuario;
