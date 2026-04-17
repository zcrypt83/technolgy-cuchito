import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Validaciones para Productos
 */
export const validateCreateProducto: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),

  body('sku')
    .trim()
    .notEmpty().withMessage('El SKU es requerido')
    .matches(/^[A-Z0-9-]+$/).withMessage('El SKU solo puede contener letras mayúsculas, números y guiones')
    .isLength({ min: 3, max: 50 }).withMessage('El SKU debe tener entre 3 y 50 caracteres'),

  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),

  body('categoriaId')
    .notEmpty().withMessage('La categoría es requerida')
    .isInt({ min: 1 }).withMessage('Categoría inválida'),

  body('proveedorId')
    .optional()
    .isInt({ min: 1 }).withMessage('Proveedor inválido')
];

export const validateUpdateProducto: ValidationChain[] = [
  param('id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),

  body('sku')
    .optional()
    .trim()
    .matches(/^[A-Z0-9-]+$/).withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

  body('precio')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),

  body('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('Categoría inválida'),

  body('proveedorId')
    .optional()
    .isInt({ min: 1 }).withMessage('Proveedor inválido')
];

/**
 * Validaciones para Movimientos
 */
export const validateCreateMovimiento: ValidationChain[] = [
  body('tipo')
    .notEmpty().withMessage('El tipo de movimiento es requerido')
    .isIn(['entrada', 'salida', 'transferencia', 'ajuste'])
    .withMessage('Tipo de movimiento inválido'),

  body('productoId')
    .notEmpty().withMessage('El producto es requerido')
    .isInt({ min: 1 }).withMessage('Producto inválido'),

  body('almacenOrigenId')
    .notEmpty().withMessage('El almacén de origen es requerido')
    .isInt({ min: 1 }).withMessage('Almacén de origen inválido'),

  body('almacenDestinoId')
    .optional()
    .isInt({ min: 1 }).withMessage('Almacén de destino inválido'),

  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número positivo'),

  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('El motivo no puede exceder 255 caracteres'),

  body('numeroDocumento')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El número de documento no puede exceder 50 caracteres')
];

/**
 * Validaciones para Usuarios
 */
export const validateCreateUsuario: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['administrador', 'encargado_almacen', 'usuario_operativo'])
    .withMessage('Rol inválido'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Teléfono inválido')
];

export const validateUpdateUsuario: ValidationChain[] = [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('rol')
    .optional()
    .isIn(['administrador', 'encargado_almacen', 'usuario_operativo'])
    .withMessage('Rol inválido'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Teléfono inválido')
];

export const validateChangePassword: ValidationChain[] = [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

/**
 * Validaciones para Proveedores
 */
export const validateCreateProveedor: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('ruc')
    .trim()
    .notEmpty().withMessage('El RUC es requerido')
    .matches(/^[0-9]{11}$/).withMessage('El RUC debe tener 11 dígitos'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La dirección no puede exceder 255 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Teléfono inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
];

/**
 * Validaciones para Almacenes
 */
export const validateCreateAlmacen: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('ubicacion')
    .trim()
    .notEmpty().withMessage('La ubicación es requerida')
    .isLength({ min: 5, max: 255 }).withMessage('La ubicación debe tener entre 5 y 255 caracteres'),

  body('capacidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un número positivo')
];

/**
 * Validaciones para Categorías
 */
export const validateCreateCategoria: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres')
];

/**
 * Validaciones de autenticación
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

export const validateRegister: ValidationChain[] = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('rol')
    .optional()
    .isIn(['administrador', 'encargado_almacen', 'usuario_operativo'])
    .withMessage('Rol inválido')
];

/**
 * Validaciones generales
 */
export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido (1-100)')
];
