import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface InventarioAttributes {
  id?: number;
  productoId: number;
  almacenId: number;
  cantidad: number;
  ultimaActualizacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Inventario extends Model<InventarioAttributes> implements InventarioAttributes {
  public id!: number;
  public productoId!: number;
  public almacenId!: number;
  public cantidad!: number;
  public ultimaActualizacion?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Inventario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    almacenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'almacenes',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    ultimaActualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'inventario',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productoId', 'almacenId']
      }
    ]
  }
);

export default Inventario;
