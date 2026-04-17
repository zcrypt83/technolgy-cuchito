import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface ProductoAttributes {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  proveedorId: number;
  precioCompra: number;
  precioVenta: number;
  unidadMedida: string;
  stockMinimo: number;
  stockMaximo: number;
  imagen?: string;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Producto extends Model<ProductoAttributes> implements ProductoAttributes {
  public id!: number;
  public codigo!: string;
  public nombre!: string;
  public descripcion?: string;
  public categoriaId!: number;
  public proveedorId!: number;
  public precioCompra!: number;
  public precioVenta!: number;
  public unidadMedida!: string;
  public stockMinimo!: number;
  public stockMaximo!: number;
  public imagen?: string;
  public estado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Producto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      }
    },
    proveedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    },
    precioCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precioVenta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unidadMedida: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'unidad'
    },
    stockMinimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    stockMaximo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000
    },
    imagen: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'productos',
    timestamps: true
  }
);

export default Producto;
