# DCU01_Iniciar_Sesion

## Diagrama

Archivo UML: [DCU01_iniciar-sesion.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DCU01_iniciar-sesion.puml)

## Especificacion del caso de uso

- ID Caso de uso: DCU01
- Nombre del caso de uso: DCU_Iniciar_Sesion
- Actor principal: Usuario (Administrador, Encargado o Usuario Operativo)
- Descripcion: el usuario ingresa sus credenciales para acceder al sistema segun su rol.
- Precondiciones: usuario registrado y activo.

### Flujo basico

1. El usuario solicita iniciar sesion.
2. Ingresa correo y contrasena.
3. El sistema valida datos y estado de usuario.
4. El sistema genera token JWT y devuelve perfil.
5. El usuario accede al dashboard segun su rol.

### Flujo alternativo

1. Si faltan datos, el sistema muestra validacion requerida.
2. Si las credenciales son invalidas, muestra mensaje de error.
3. Si el usuario esta inactivo, bloquea el acceso.

### Postcondiciones

- Sesion autenticada con token valido.
- Registro de auditoria del evento `LOGIN`.

### Relaciones

- Ninguna.

