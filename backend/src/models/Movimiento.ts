import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface MovimientoAttributes {
  id?: number;
  tipo: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
  productoId: number;
  almacenOrigenId?: number;
  almacenDestinoId?: number;
  cantidad: number;
  motivo: string;
  usuarioId: number;
  numeroDocumento?: string;
  fecha: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Movimiento extends Model<MovimientoAttributes> implements MovimientoAttributes {
  public id!: number;
  public tipo!: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
  public productoId!: number;
  public almacenOrigenId?: number;
  public almacenDestinoId?: number;
  public cantidad!: number;
  public motivo!: string;
  public usuarioId!: number;
  public numeroDocumento?: string;
  public fecha!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Movimiento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'salida', 'transferencia', 'ajuste'),
      allowNull: false
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    almacenOrigenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'almacenes',
        key: 'id'
      }
    },
    almacenDestinoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'almacenes',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    motivo: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    numeroDocumento: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'movimientos',
    timestamps: true
  }
);

export default Movimiento;
