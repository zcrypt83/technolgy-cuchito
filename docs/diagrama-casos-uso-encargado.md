# Diagrama de Casos de Uso - Encargado de Almacén

## PlantUML

```plantuml
@startuml
title Casos de Uso - Encargado de Almacén\nTechnology Cuchito

left to right direction
skinparam packageStyle rectangle

actor "Encargado de Almacén" as Encargado

rectangle "Sistema SaaS de Inventario" {
  usecase "Iniciar/Cerrar sesión" as UC01
  usecase "Consultar productos" as UC02
  usecase "Crear/editar productos" as UC03
  usecase "Gestionar categorías" as UC04
  usecase "Gestionar proveedores" as UC05
  usecase "Consultar almacenes accesibles" as UC06
  usecase "Consultar inventario" as UC07
  usecase "Actualizar inventario" as UC08
  usecase "Registrar entradas" as UC09
  usecase "Registrar salidas" as UC10
  usecase "Registrar transferencias" as UC11
  usecase "Registrar ajustes" as UC12
  usecase "Consultar movimientos" as UC13
  usecase "Visualizar dashboard operativo" as UC14
}

Encargado --> UC01
Encargado --> UC02
Encargado --> UC03
Encargado --> UC04
Encargado --> UC05
Encargado --> UC06
Encargado --> UC07
Encargado --> UC08
Encargado --> UC09
Encargado --> UC10
Encargado --> UC11
Encargado --> UC12
Encargado --> UC13
Encargado --> UC14

@enduml
```

## Notas

- El acceso queda limitado por almacenes permitidos (controlado en backend).
- Después de registrar un movimiento, los paneles se refrescan en vivo sin recargar la página.
- Las acciones quedan trazadas en `auditoria`.

