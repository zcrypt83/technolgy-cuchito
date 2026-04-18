# Diagrama de Casos de Uso - Administrador

## PlantUML

```plantuml
@startuml
title Casos de Uso - Administrador\nTechnology Cuchito

left to right direction
skinparam packageStyle rectangle

actor "Administrador" as Admin

rectangle "Sistema SaaS de Inventario" {
  usecase "Iniciar/Cerrar sesión" as UC01
  usecase "Gestionar usuarios" as UC02
  usecase "Gestionar productos" as UC03
  usecase "Gestionar categorías" as UC04
  usecase "Gestionar proveedores" as UC05
  usecase "Gestionar almacenes" as UC06
  usecase "Consultar/actualizar inventario" as UC07
  usecase "Registrar movimientos\n(entrada, salida,\ntransferencia, ajuste)" as UC08
  usecase "Visualizar dashboard" as UC09
  usecase "Consultar auditoría" as UC10
  usecase "Abrir panel de configuración" as UC11
  usecase "Actualizar permisos por rol" as UC12
  usecase "Actualizar acciones auditables" as UC13
}

Admin --> UC01
Admin --> UC02
Admin --> UC03
Admin --> UC04
Admin --> UC05
Admin --> UC06
Admin --> UC07
Admin --> UC08
Admin --> UC09
Admin --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC13

UC12 ..> UC11 : <<include>>
UC13 ..> UC11 : <<include>>

@enduml
```

## Notas

- El rol administrador tiene acceso completo a todos los endpoints de negocio.
- El panel de configuración persiste cambios de permisos/acciones auditables en `admin-settings.json`.
- Toda acción crítica genera registro en `auditoria`.

