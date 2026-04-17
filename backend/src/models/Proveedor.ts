import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ProveedorAttributes {
  id?: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto?: string;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Proveedor extends Model<ProveedorAttributes> implements ProveedorAttributes {
  public id!: number;
  public nombre!: string;
  public ruc!: string;
  public direccion!: string;
  public telefono!: string;
  public email!: string;
  public contacto?: string;
  public estado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Proveedor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    contacto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'proveedores',
    timestamps: true
  }
);

export default Proveedor;
