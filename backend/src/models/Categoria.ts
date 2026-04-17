import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CategoriaAttributes {
  id?: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Categoria extends Model<CategoriaAttributes> implements CategoriaAttributes {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public estado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'categorias',
    timestamps: true
  }
);

export default Categoria;
