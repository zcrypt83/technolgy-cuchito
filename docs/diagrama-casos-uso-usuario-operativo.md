# Diagrama de Casos de Uso - Usuario Operativo

## PlantUML

```plantuml
@startuml
title Casos de Uso - Usuario Operativo\nTechnology Cuchito

left to right direction
skinparam packageStyle rectangle

actor "Usuario Operativo" as Operativo

rectangle "Sistema SaaS de Inventario" {
  usecase "Iniciar/Cerrar sesión" as UC01
  usecase "Consultar perfil" as UC02
  usecase "Consultar productos" as UC03
  usecase "Consultar almacenes accesibles" as UC04
  usecase "Consultar inventario" as UC05
  usecase "Registrar salida de inventario" as UC06
  usecase "Consultar movimientos" as UC07
  usecase "Visualizar dashboard básico" as UC08
}

Operativo --> UC01
Operativo --> UC02
Operativo --> UC03
Operativo --> UC04
Operativo --> UC05
Operativo --> UC06
Operativo --> UC07
Operativo --> UC08

@enduml
```

## Notas

- En backend, este rol solo puede crear movimientos de tipo `salida`.
- La actualización de inventario/movimientos se refleja automáticamente en la UI.
- Todas las operaciones relevantes quedan registradas en auditoría.

