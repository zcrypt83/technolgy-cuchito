import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface AlmacenAttributes {
  id?: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  capacidad: number;
  encargadoId?: number;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Almacen extends Model<AlmacenAttributes> implements AlmacenAttributes {
  public id!: number;
  public nombre!: string;
  public codigo!: string;
  public direccion!: string;
  public ciudad!: string;
  public capacidad!: number;
  public encargadoId?: number;
  public estado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Almacen.init(
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
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    encargadoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'almacenes',
    timestamps: true
  }
);

export default Almacen;
