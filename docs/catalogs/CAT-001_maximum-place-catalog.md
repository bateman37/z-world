---
id: CAT-001
title: Catálogo máximo de lugares
status: approved
canonical_for:
  - catálogo máximo de arquetipos de lugar (familias A–V)
  - estrategia de IDs y alias para lugares aparentemente duplicados
depends_on: []
related:
  - CAT-002
  - CAT-003
  - CAT-004
  - CAT-005
  - WLD-005
  - WLD-006
  - WLD-010
  - DISC-0003
---

## 1. Propósito

Conservar íntegro, como horizonte máximo indexado, el catálogo de arquetipos
de lugar del Anexo A de
[prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md](../../prompts/DESIGN-004_simulation-first-reboot-and-procedural-places.md#63-catálogo-máximo-de-lugares)
(sección 63): 22 familias, de la A a la V, y todos sus IDs y nombres. Este
documento no decide qué se implementa primero (ver
[CAT-004](CAT-004_initial-semantic-place-slice.md)) ni cómo se genera cada
lugar (ver
[WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md)).

## 2. Principios que no deben romperse

- `approved` en este documento significa **catálogo de horizonte aprobado
  como referencia de expansión**, nunca alcance de implementación inmediata
  (ver [VIS-003](../10-vision/VIS-003_maximum-design-envelope.md) y
  [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)).
- El orden, los IDs y los nombres del Anexo A se conservan literalmente. No
  se renombran, fusionan ni eliminan entradas en esta entrega.
- Un arquetipo listado aquí no es una promesa de que exista en una semilla
  concreta ni de que se implemente. Es un miembro válido del horizonte
  máximo.
- «Lugar» no equivale a «edificio». Este catálogo cataloga arquetipos de
  **estructura con huella** (edificios y construcciones con programa de
  estancias); no agota el terreno, la cobertura vegetal, el agua sin
  instalación ni los elementos lineales (carreteras, caminos, vallas,
  tuberías) del mapa local, que se rigen como nodo, línea o área según el
  modelo de
  [WLD-010](../20-world/WLD-010_mutable-terrain-and-spatial-construction.md).
  Un campo o una zona de bosque sin construcción alguna no necesita un ID
  de este catálogo.
- Muchas de las localizaciones especiales o narrativas de la familia V no
  son arquetipos base independientes: son modificadores (trait, historia,
  ocupación) aplicados sobre un tipo base de otra familia (ver sección 4 y
  [WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)).

## 3. Modelo funcional

### 3.1 Formato de ID

Cada arquetipo tiene un ID estable `PREFIJO-NN` (prefijo de tres letras de la
familia, número de dos cifras) y un nombre en español. El prefijo identifica
la familia (columna «Familia» en la sección 3.2), no un dominio documental
de `docs/` (no debe confundirse con `WLD`, `SET`, etc.).

### 3.2 Familias A–V

| Letra | Familia | Prefijo(s) | Nº de arquetipos |
|---|---|---|---:|
| A | Residencial | `RES` | 30 |
| B | Comercio alimentario | `COM` (01–16) | 16 |
| C | Comercio general | `COM` (17–46) | 30 |
| D | Hostelería y alojamiento | `HOS` | 20 |
| E | Sanidad y asistencia | `SAN` | 20 |
| F | Educación | `EDU` | 15 |
| G | Cultura y conocimiento | `CUL` | 15 |
| H | Administración | `ADM` | 16 |
| I | Emergencia y seguridad | `SEG` | 16 |
| J | Talleres y oficios | `TAL` | 28 |
| K | Industria | `IND` | 23 |
| L | Logística y almacenamiento | `LOG` | 18 |
| M | Agricultura | `AGR` | 22 |
| N | Ganadería | `GAN` | 16 |
| O | Forestal | `FOR` | 9 |
| P | Agua | `AGU` | 16 |
| Q | Energía | `ENE` | 16 |
| R | Telecomunicaciones | `TEL` | 12 |
| S | Transporte | `TRA` | 22 |
| T | Turismo y ocio | `OCI` | 23 |
| U | Religioso y funerario | `REL` | 10 |
| V | Localizaciones especiales / narrativas | `ESP` | 30 |

Las familias B y C comparten el prefijo `COM`; se numeran de forma
continua (01–46) tal y como los registró el Anexo A, sin renumerar.

### 3.3 Catálogo completo

#### A. Residencial

`RES-01` Apartamento estudio · `RES-02` Apartamento pequeño · `RES-03`
Apartamento familiar · `RES-04` Apartamento grande · `RES-05` Bloque pequeño
de apartamentos · `RES-06` Bloque residencial grande · `RES-07` Casa
adosada · `RES-08` Casa pareada · `RES-09` Casa familiar pequeña · `RES-10`
Casa familiar mediana · `RES-11` Casa familiar grande · `RES-12` Chalet ·
`RES-13` Villa · `RES-14` Mansión · `RES-15` Casa de pueblo antigua ·
`RES-16` Casa de montaña · `RES-17` Cabaña · `RES-18` Refugio particular ·
`RES-19` Vivienda con garaje/taller · `RES-20` Vivienda con negocio ·
`RES-21` Vivienda con huerto · `RES-22` Vivienda con corral · `RES-23` Casa
en construcción · `RES-24` Casa en reforma · `RES-25` Vivienda abandonada ·
`RES-26` Segunda residencia · `RES-27` Casa rural · `RES-28` Masía / finca
rural · `RES-29` Vivienda sobre comercio · `RES-30` Complejo residencial
cerrado.

#### B. Comercio alimentario

`COM-01` Tienda de alimentación · `COM-02` Supermercado pequeño · `COM-03`
Supermercado grande · `COM-04` Hipermercado · `COM-05` Frutería · `COM-06`
Carnicería · `COM-07` Pescadería · `COM-08` Panadería · `COM-09`
Pastelería · `COM-10` Tienda gourmet · `COM-11` Tienda de congelados ·
`COM-12` Mayorista alimentario · `COM-13` Mercado municipal · `COM-14`
Puesto de mercado · `COM-15` Tienda ecológica · `COM-16` Almacén de
bebidas.

#### C. Comercio general

`COM-17` Ferretería · `COM-18` Tienda de bricolaje · `COM-19` Materiales de
construcción · `COM-20` Tienda eléctrica · `COM-21` Tienda de fontanería ·
`COM-22` Electrodomésticos · `COM-23` Informática · `COM-24` Electrónica ·
`COM-25` Telefonía · `COM-26` Librería · `COM-27` Papelería · `COM-28`
Quiosco · `COM-29` Tienda de ropa · `COM-30` Zapatería · `COM-31` Tienda
deportiva · `COM-32` Tienda de montaña/camping · `COM-33` Tienda de
bicicletas · `COM-34` Recambios de automóvil · `COM-35` Mueblería · `COM-36`
Segunda mano · `COM-37` Anticuario · `COM-38` Joyería · `COM-39`
Floristería · `COM-40` Tienda agrícola · `COM-41` Tienda para animales ·
`COM-42` Armería / caza · `COM-43` Tienda multiprecio · `COM-44` Tienda de
pintura · `COM-45` Tienda de herramientas profesionales · `COM-46` Venta de
maquinaria.

#### D. Hostelería y alojamiento

`HOS-01` Bar · `HOS-02` Cafetería · `HOS-03` Restaurante pequeño · `HOS-04`
Restaurante grande · `HOS-05` Restaurante de carretera · `HOS-06` Pizzería ·
`HOS-07` Comida rápida · `HOS-08` Comedor colectivo · `HOS-09` Hotel
pequeño · `HOS-10` Hotel grande · `HOS-11` Hostal · `HOS-12` Pensión ·
`HOS-13` Albergue · `HOS-14` Refugio de montaña · `HOS-15` Camping · `HOS-16`
Área de autocaravanas · `HOS-17` Motel · `HOS-18` Casa rural · `HOS-19`
Restaurante con vivienda · `HOS-20` Bar con vivienda.

#### E. Sanidad y asistencia

`SAN-01` Consulta médica · `SAN-02` Centro de salud · `SAN-03` Hospital
pequeño · `SAN-04` Hospital grande · `SAN-05` Clínica privada · `SAN-06`
Clínica dental · `SAN-07` Fisioterapia · `SAN-08` Farmacia · `SAN-09`
Laboratorio clínico · `SAN-10` Clínica veterinaria · `SAN-11` Residencia de
ancianos · `SAN-12` Centro de día · `SAN-13` Guardería · `SAN-14` Centro
social · `SAN-15` Refugio asistencial · `SAN-16` Centro de rehabilitación ·
`SAN-17` Banco de sangre · `SAN-18` Almacén sanitario · `SAN-19` Consultorio
rural · `SAN-20` Centro de emergencias médicas.

#### F. Educación

`EDU-01` Escuela infantil · `EDU-02` Escuela primaria · `EDU-03` Instituto ·
`EDU-04` Formación profesional · `EDU-05` Escuela agrícola · `EDU-06`
Escuela técnica · `EDU-07` Universidad · `EDU-08` Laboratorio universitario ·
`EDU-09` Biblioteca escolar · `EDU-10` Academia privada · `EDU-11`
Autoescuela · `EDU-12` Escuela de idiomas · `EDU-13` Taller educativo ·
`EDU-14` Residencia de estudiantes · `EDU-15` Centro de formación
empresarial.

#### G. Cultura y conocimiento

`CUL-01` Biblioteca pública · `CUL-02` Archivo municipal · `CUL-03` Museo ·
`CUL-04` Centro cultural · `CUL-05` Teatro · `CUL-06` Cine · `CUL-07` Sala
de exposiciones · `CUL-08` Editorial · `CUL-09` Imprenta · `CUL-10`
Periódico local · `CUL-11` Radio local · `CUL-12` Televisión local ·
`CUL-13` Archivo histórico · `CUL-14` Biblioteca especializada · `CUL-15`
Centro documental.

#### H. Administración

`ADM-01` Ayuntamiento · `ADM-02` Oficina municipal · `ADM-03` Correos ·
`ADM-04` Banco · `ADM-05` Notaría · `ADM-06` Registro · `ADM-07` Juzgado ·
`ADM-08` Oficina de empleo · `ADM-09` Oficina turística · `ADM-10` Oficina
forestal · `ADM-11` Oficina agrícola · `ADM-12` Centro comunitario ·
`ADM-13` Hacienda / administración tributaria · `ADM-14` Servicios técnicos
municipales · `ADM-15` Obras públicas · `ADM-16` Almacén municipal.

#### I. Emergencia y seguridad

`SEG-01` Policía · `SEG-02` Guardia Civil / puesto rural · `SEG-03`
Bomberos · `SEG-04` Protección Civil · `SEG-05` Base de ambulancias ·
`SEG-06` Seguridad privada · `SEG-07` Centro de emergencias · `SEG-08`
Cárcel · `SEG-09` Depósito de vehículos · `SEG-10` Campo de tiro · `SEG-11`
Cuartel militar · `SEG-12` Búnker militar · `SEG-13` Almacén militar ·
`SEG-14` Puesto de control · `SEG-15` Centro de coordinación · `SEG-16`
Refugio civil.

#### J. Talleres y oficios

`TAL-01` Taller mecánico · `TAL-02` Taller de motocicletas · `TAL-03`
Taller de bicicletas · `TAL-04` Taller de camiones · `TAL-05` Taller
agrícola · `TAL-06` Chapa y pintura · `TAL-07` Neumáticos · `TAL-08`
Carpintería · `TAL-09` Ebanistería · `TAL-10` Herrería · `TAL-11`
Soldadura · `TAL-12` Cerrajería · `TAL-13` Electricista · `TAL-14`
Fontanero · `TAL-15` Climatización · `TAL-16` Electrodomésticos · `TAL-17`
Reparación electrónica · `TAL-18` Reparación informática · `TAL-19` Taller
textil · `TAL-20` Zapatero · `TAL-21` Vidrio · `TAL-22` Cantería · `TAL-23`
Pintura · `TAL-24` Empresa de construcción · `TAL-25` Reparación de
maquinaria · `TAL-26` Bobinado de motores · `TAL-27` Taller hidráulico ·
`TAL-28` Taller de herramientas.

#### K. Industria

`IND-01` Fábrica genérica · `IND-02` Metalúrgica · `IND-03` Planta de
mecanizado · `IND-04` Fábrica electrónica · `IND-05` Industria alimentaria ·
`IND-06` Embotelladora · `IND-07` Cervecería · `IND-08` Bodega · `IND-09`
Industria láctea · `IND-10` Matadero · `IND-11` Aserradero · `IND-12`
Fábrica de muebles · `IND-13` Fábrica textil · `IND-14` Industria química ·
`IND-15` Cementera · `IND-16` Prefabricados · `IND-17` Ladrillera ·
`IND-18` Planta de reciclaje · `IND-19` Fábrica de plástico · `IND-20`
Taller industrial · `IND-21` Planta de envases · `IND-22` Fundición ·
`IND-23` Planta de tratamiento de madera.

#### L. Logística y almacenamiento

`LOG-01` Almacén pequeño · `LOG-02` Almacén industrial · `LOG-03` Centro
logístico · `LOG-04` Nave de distribución · `LOG-05` Cámara frigorífica ·
`LOG-06` Almacén alimentario · `LOG-07` Almacén farmacéutico · `LOG-08`
Almacén agrícola · `LOG-09` Almacén de materiales · `LOG-10` Depósito de
combustible · `LOG-11` Desguace · `LOG-12` Chatarrería · `LOG-13`
Vertedero · `LOG-14` Punto limpio · `LOG-15` Almacén de repuestos ·
`LOG-16` Patio logístico · `LOG-17` Centro de distribución postal ·
`LOG-18` Depósito municipal.

#### M. Agricultura

`AGR-01` Pequeña granja familiar · `AGR-02` Explotación agrícola grande ·
`AGR-03` Huerto profesional · `AGR-04` Invernadero · `AGR-05` Vivero
vegetal · `AGR-06` Frutales · `AGR-07` Viñedo · `AGR-08` Olivar · `AGR-09`
Campo cerealista · `AGR-10` Plantación especializada · `AGR-11` Cobertizo
agrícola · `AGR-12` Almacén de semillas · `AGR-13` Almacén de fertilizantes
· `AGR-14` Taller agrícola · `AGR-15` Sistema de irrigación · `AGR-16`
Molino · `AGR-17` Silo · `AGR-18` Cooperativa agrícola · `AGR-19` Secadero ·
`AGR-20` Almacén de maquinaria · `AGR-21` Planta de selección de semillas ·
`AGR-22` Centro de empaquetado agrícola.

#### N. Ganadería

`GAN-01` Granja bovina · `GAN-02` Granja ovina · `GAN-03` Granja caprina ·
`GAN-04` Granja porcina · `GAN-05` Granja avícola · `GAN-06` Granja
lechera · `GAN-07` Establo · `GAN-08` Picadero · `GAN-09` Criadero ·
`GAN-10` Colmenar · `GAN-11` Almacén de pienso · `GAN-12` Matadero rural ·
`GAN-13` Quesería · `GAN-14` Sala de ordeño · `GAN-15` Centro veterinario
rural · `GAN-16` Pastizal cercado.

#### O. Forestal

`FOR-01` Caseta forestal · `FOR-02` Base de brigada · `FOR-03` Almacén
forestal · `FOR-04` Aserradero · `FOR-05` Vivero forestal · `FOR-06` Torre
de vigilancia · `FOR-07` Refugio forestal · `FOR-08` Parque de maquinaria
forestal · `FOR-09` Centro de prevención de incendios.

#### P. Agua

`AGU-01` Pozo · `AGU-02` Manantial acondicionado · `AGU-03` Depósito de
agua · `AGU-04` Torre de agua · `AGU-05` Estación de bombeo · `AGU-06`
Potabilizadora · `AGU-07` Planta de tratamiento · `AGU-08` Depuradora ·
`AGU-09` Embalse · `AGU-10` Presa · `AGU-11` Canalización principal ·
`AGU-12` Sistema de riego · `AGU-13` Cámara de válvulas · `AGU-14` Estación
de control · `AGU-15` Captación de agua · `AGU-16` Depósito contra
incendios.

#### Q. Energía

`ENE-01` Centro de transformación · `ENE-02` Subestación · `ENE-03` Central
eléctrica · `ENE-04` Hidroeléctrica · `ENE-05` Parque solar · `ENE-06`
Instalación eólica · `ENE-07` Generador de emergencia · `ENE-08` Planta de
biomasa · `ENE-09` Almacén de baterías · `ENE-10` Depósito de combustible ·
`ENE-11` Gasolinera · `ENE-12` Planta de gas · `ENE-13` Sala de calderas ·
`ENE-14` Parque de generadores · `ENE-15` Instalación fotovoltaica
doméstica · `ENE-16` Microcentral hidroeléctrica.

#### R. Telecomunicaciones

`TEL-01` Antena de telefonía · `TEL-02` Central telefónica · `TEL-03`
Repetidor · `TEL-04` Emisora de radio · `TEL-05` Centro de comunicaciones ·
`TEL-06` Estación meteorológica · `TEL-07` Centro de datos · `TEL-08` Sala
de servidores · `TEL-09` Radioaficionado particular · `TEL-10` Nodo de
fibra · `TEL-11` Torre de comunicaciones · `TEL-12` Centro de control.

#### S. Transporte

`TRA-01` Gasolinera · `TRA-02` Taller de carretera · `TRA-03` Parking ·
`TRA-04` Parking subterráneo · `TRA-05` Estación de autobuses · `TRA-06`
Cochera de autobuses · `TRA-07` Estación ferroviaria · `TRA-08` Depósito
ferroviario · `TRA-09` Taller ferroviario · `TRA-10` Mantenimiento de
carreteras · `TRA-11` Almacén de vialidad · `TRA-12` Peaje · `TRA-13` Túnel
/ mantenimiento · `TRA-14` Estación de servicio · `TRA-15` Concesionario ·
`TRA-16` Alquiler de vehículos · `TRA-17` Helipuerto · `TRA-18` Aeródromo ·
`TRA-19` Aeropuerto · `TRA-20` Aparcamiento de camiones · `TRA-21` Báscula /
control logístico · `TRA-22` Centro de quitanieves.

#### T. Turismo y ocio

`OCI-01` Oficina turística · `OCI-02` Centro de visitantes · `OCI-03`
Refugio de montaña · `OCI-04` Estación de esquí · `OCI-05` Remonte ·
`OCI-06` Teleférico · `OCI-07` Alquiler de montaña · `OCI-08` Gimnasio ·
`OCI-09` Polideportivo · `OCI-10` Piscina · `OCI-11` Campo deportivo ·
`OCI-12` Club deportivo · `OCI-13` Centro ecuestre · `OCI-14` Parque de
aventuras · `OCI-15` Área recreativa · `OCI-16` Camping · `OCI-17` Spa ·
`OCI-18` Discoteca · `OCI-19` Sala de juegos · `OCI-20` Cine · `OCI-21`
Centro de escalada · `OCI-22` Alquiler de bicicletas · `OCI-23` Parque
natural / centro de interpretación.

#### U. Religioso y funerario

`REL-01` Iglesia · `REL-02` Capilla · `REL-03` Monasterio · `REL-04`
Convento · `REL-05` Cementerio · `REL-06` Tanatorio · `REL-07` Funeraria ·
`REL-08` Casa parroquial · `REL-09` Almacén parroquial · `REL-10` Refugio
religioso.

#### V. Localizaciones especiales / narrativas

`ESP-01` Refugio preparacionista · `ESP-02` Búnker civil · `ESP-03` Casa de
radioaficionado · `ESP-04` Casa de mecánico · `ESP-05` Casa de sanitario ·
`ESP-06` Casa de agricultor · `ESP-07` Casa de informático · `ESP-08` Casa
de coleccionista · `ESP-09` Taller clandestino · `ESP-10` Laboratorio
clandestino · `ESP-11` Escondite criminal · `ESP-12` Refugio de
supervivientes · `ESP-13` Campamento abandonado · `ESP-14` Hospital
improvisado · `ESP-15` Centro de evacuación · `ESP-16` Centro de
cuarentena · `ESP-17` Puesto militar improvisado · `ESP-18` Comunidad
abandonada · `ESP-19` Edificio fortificado · `ESP-20` Edificio incendiado ·
`ESP-21` Edificio inundado · `ESP-22` Edificio derrumbado · `ESP-23`
Edificio saqueado · `ESP-24` Edificio ocupado recientemente · `ESP-25`
Taller improvisado · `ESP-26` Almacén secreto · `ESP-27` Refugio
subterráneo · `ESP-28` Vivienda tapiada · `ESP-29` Edificio trampa ·
`ESP-30` Almacén oculto.

## 4. Reglas aprobadas

### 4.1 Estrategia de IDs y alias frente a duplicados aparentes

Varios nombres aparecen más de una vez en el catálogo (por ejemplo
«gasolinera» en `ENE-11` y `TRA-01», «camping» en `HOS-15` y `OCI-16»,
«cine» en `CUL-06` y `OCI-20», «refugio» en múltiples familias, o
«aserradero» en `IND-11` y `FOR-04`). Esta entrega no los fusiona ni elimina
uno de los dos IDs. Se conservan como entradas separadas porque representan
clasificación contextual distinta:

- `ENE-11` (Gasolinera, familia Energía) enfatiza su función como punto de
  combustible/energía; `TRA-01` (Gasolinera, familia Transporte) enfatiza su
  función como parada de servicio de carretera. Un generador concreto puede
  tratar ambos como el mismo arquetipo físico con dos etiquetas de familia,
  o como variantes; esa decisión de implementación queda abierta (ver
  [DISC-0003](../discovery/DISC-0003_procedural-place-generator-traceability.md)).
- `HOS-15` (Camping, hostelería/alojamiento) y `OCI-16` (Camping, turismo y
  ocio) distinguen un camping como alojamiento reglado de un camping como
  actividad de ocio; pueden coincidir en el mismo lugar físico según
  contexto.
- `CUL-06` (Cine, cultura) y `OCI-20` (Cine, ocio) distinguen la sala como
  equipamiento cultural municipal de la sala como negocio de ocio comercial.
- Los distintos «refugio» (`HOS-14` refugio de montaña, `SEG-16` refugio
  civil, `ESP-01`/`ESP-02`/`ESP-12`/`ESP-27` refugios especiales y `OCI-03`
  refugio de montaña turístico) son subtipos con función, ocupantes e
  historia distintos, no una sola entrada repetida.
- `IND-11` (Aserradero, industria) y `FOR-04` (Aserradero, forestal)
  distinguen un aserradero industrial urbano/periurbano de un aserradero de
  explotación forestal; pueden compartir programa de estancias base con
  variaciones de escala y contexto.

Ninguna implementación futura debe resolver estas coincidencias
eliminando en silencio un ID de este catálogo. Si una implementación decide
tratar dos IDs como el mismo arquetipo físico con alias, debe declarar esa
relación explícitamente en su propio contrato de datos y registrar el
motivo en una decisión (`docs/decisions/`) o en
[DISC-0003](../discovery/DISC-0003_procedural-place-generator-traceability.md),
nunca borrando la entrada de este catálogo.

### 4.2 Localizaciones especiales como modificadores

Muchas entradas de la familia V (`ESP-*`) no son arquetipos base
independientes con programa de estancias propio: son un tipo base de otra
familia (por ejemplo `RES-10` Casa familiar mediana) más un modificador de
trait, historia u ocupación (ver
[WLD-007](../20-world/WLD-007_place-history-and-environmental-storytelling.md)
y [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md)). Por
ejemplo, `ESP-03` (Casa de radioaficionado) es normalmente `RES-*` + trait
«radioaficionado»; `ESP-20` (Edificio incendiado) es normalmente cualquier
tipo base + historia «incendio». Esta entrega no decide caso por caso cuáles
de los treinta `ESP-*` requieren programa de estancias propio (por ejemplo
`ESP-11` Escondite criminal o `ESP-16` Centro de cuarentena, que sí pueden
justificar un programa distintivo) frente a cuáles son puramente
modificadores; queda como pregunta abierta en
[DISC-0003](../discovery/DISC-0003_procedural-place-generator-traceability.md).

## 5. Interacciones con otros sistemas

- El programa de estancias, instalaciones y módulos de cada familia se
  definen en [CAT-002](CAT-002_rooms-modules-and-building-systems.md).
- Los ocupantes, hogares, negocios, profesiones y aficiones que dan
  coherencia al contenido de cada arquetipo se definen en
  [CAT-003](CAT-003_occupants-professions-hobbies-and-traits.md).
- El primer catálogo implementable, aprobado por `DESIGN-008`, vive en
  [CAT-004](CAT-004_initial-semantic-place-slice.md) (`approved`); sus
  perfiles ambientales de terreno (no edificatorios) usan la convención
  `ENV-*` definida allí, distinta de este catálogo.
- Los objetos, materiales y medios de transporte que equipan el primer
  catálogo se aprueban en
  [CAT-005](CAT-005_initial-object-resource-and-transport-slice.md).
- La cadena generativa que usa este catálogo (contexto, parcela, arquetipo,
  subtipo) se define en
  [WLD-005](../20-world/WLD-005_semantic-place-and-building-generation.md).
- La presión de saqueo histórica que modifica el estado de cada instancia se
  define en
  [WLD-006](../20-world/WLD-006_historical-looting-pressure-and-routes.md).

## 6. Casos límite o riesgos

- Tratar este catálogo como alcance de implementación inmediata
  contradiría [DEC-0006](../decisions/DEC-0006_maximum-envelope-vs-delivery-scope.md)
  y la sección 5.12 del Anexo A de `DESIGN-004`.
- Eliminar en silencio una entrada aparentemente duplicada perdería
  distinciones contextuales reales (ver sección 4.1).

## 7. Preguntas abiertas

- Qué localizaciones especiales de la familia V requieren programa de
  estancias propio frente a ser puramente modificadores (ver sección 4.2 y
  [DISC-0003](../discovery/DISC-0003_procedural-place-generator-traceability.md)).
- Estrategia definitiva de alias/relación entre los IDs de la sección 4.1
  cuando se implemente el generador.

## 8. Ejemplos no normativos

Ninguno adicional a los ya citados en la sección 4.
