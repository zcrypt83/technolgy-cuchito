import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface AuditoriaAttributes {
  id?: number;
  usuarioId: number;
  accion: string;
  entidad: string;
  entidadId?: number;
  detalles?: string;
  ipAddress?: string;
  fecha: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Auditoria extends Model<AuditoriaAttributes> implements AuditoriaAttributes {
  public id!: number;
  public usuarioId!: number;
  public accion!: string;
  public entidad!: string;
  public entidadId?: number;
  public detalles?: string;
  public ipAddress?: string;
  public fecha!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Auditoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    accion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entidad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entidadId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalles: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
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
    tableName: 'auditoria',
    timestamps: true
  }
);

export default Auditoria;
