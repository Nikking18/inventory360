import fs from 'fs';

const translations_post2 = {
  // Spanish
  es: {
    title: 'Guía Maestra de Rotación de Inventarios y Optimización de la Velocidad de Stock',
    excerpt: 'Una exhaustiva masterclass financiera y operativa para calcular el ratio de rotación de inventarios, días de venta (DSI), velocidad de ventas por SKU y reducción de costes de almacenamiento para liberar capital de trabajo.',
    category: 'Estrategia de Inventario',
    keywords: [
      'fórmula de rotación de inventario',
      'cómo calcular la rotación de stock',
      'fórmula días de inventario DSI',
      'cálculo de velocidad de ventas por SKU',
      'porcentaje de coste de almacenamiento de inventario',
      'fórmula de coste de ventas COGS',
      'ciclo de conversión de efectivo retail',
      'reducción de stock muerto',
      'fórmula de cantidad económica de pedido EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. La Gravedad Financiera del Inventario: Capital de Trabajo vs Activos Inmovilizados' },
      { id: 'the-master-formula', title: '2. La Fórmula Maestra del Ratio de Rotación y Coste de Ventas (COGS)' },
      { id: 'days-sales-of-inventory', title: '3. Días de Venta de Inventario (DSI) y Ciclo de Conversión de Efectivo' },
      { id: 'sku-sales-velocity', title: '4. Velocidad de Ventas por SKU: Unidades/Día y Días de Suministro' },
      { id: 'carrying-cost-economics', title: '5. Desglose de Costes de Almacenamiento: Por Qué el Stock Pierde un 25% Anual' },
      { id: 'industry-benchmarks', title: '6. Benchmarks Globales de Rotación en 6 Sectores del Retail' },
      { id: 'optimization-playbook', title: '7. El Plan de 5 Pilares para Acelerar la Rotación' },
      { id: 'safety-stock-eoq', title: '8. Fórmulas de Stock de Seguridad Dinámico y Lote Económico (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. Ejecución de Analítica de Velocidad en Tiempo Real en Inventory 360' },
    ],
    content: `
### 1. La Gravedad Financiera del Inventario: Capital de Trabajo vs Activos Inmovilizados

En el comercio minorista, el efectivo es oxígeno. Cada euro o dólar inmovilizado en mercancía parada en una estantería de almacén es capital no disponible para nóminas, marketing, adquisición de clientes o compras con descuento por volumen.

El inventario tiene una naturaleza única en el balance: **es un activo que se deprecia en pasivo cuanto más tiempo permanece inmóvil**.

Los comerciantes que no optimizan la velocidad de stock sufren el **Estrangulamiento del Capital de Trabajo**:
* Las estanterías están repletas de producto, pero la cuenta bancaria carece de liquidez.
* El capital queda atrapado en artículos de baja rotación u obsoletos que exigen fuertes descuentos para liquidarse.
* Se producen roturas de stock simultáneas en los productos estrella más vendidos por falta de fondos para recomprar.

---

### 2. La Fórmula Maestra del Ratio de Rotación y Coste de Ventas (COGS)

El **Ratio de Rotación de Inventario** mide cuántas veces un negocio vende y repone completamente su stock medio durante un periodo contable (anual, trimestral o últimos 30 días).

$$\\text{Ratio de Rotación de Inventario} = \\frac{\\text{Coste de Mercancías Vendidas (COGS)}}{\\text{Valor Medio del Inventario al Coste}}$$

Donde:
$$\\text{COGS} = \\text{Inventario Inicial} + \\text{Compras del Periodo} - \\text{Inventario Final}$$
$$\\text{Valor Medio del Inventario} = \\frac{\\text{Coste Inventario Inicial} + \\text{Coste Inventario Final}}{2}$$

> **Regla Contable Fundamental**: Utilice siempre el **Coste de Mercancías Vendidas (COGS)** en el numerador en lugar de los ingresos brutos por ventas. Usar los ingresos infla artificialmente la rotación porque incluye el margen comercial de beneficio, mientras que el stock se contabiliza al coste.

#### Ejemplo Práctico Detallado:
Una tienda de moda y estilo de vida analiza su ejercicio anual:
* **Inventario Inicial (Valor al Coste)**: $120.000 €
* **Compras Añadidas al Inventario**: $640.000 €
* **Inventario Final (Valor al Coste)**: $160.000 €

$$\\text{COGS} = 120.000 € + 640.000 € - 160.000 € = 600.000 €$$
$$\\text{Inventario Medio} = \\frac{120.000 € + 160.000 €}{2} = 140.000 €$$
$$\\text{Ratio de Rotación} = \\frac{600.000 €}{140.000 €} = 4.28\\times \\text{ al año}$$

Esto significa que el negocio renueva por completo su almacén aproximadamente **4.28 veces al año**.

---

### 3. Días de Venta de Inventario (DSI) y Ciclo de Conversión de Efectivo

Para traducir la rotación a días operativos que el equipo de compras pueda gestionar, calculamos los **Días de Venta de Inventario (DSI)**:

$$\\text{DSI} = \\frac{365}{\\text{Ratio de Rotación}} = \\left( \\frac{\\text{Inventario Medio}}{\\text{COGS}} \\right) \\times 365$$

Aplicando el ejemplo anterior ($4.28\\times$ de rotación):
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Días}$$

En promedio, transcurren **85.3 días** desde que un producto entra por el muelle de descarga hasta que un cliente lo compra en caja y se cobra el dinero.

#### El Contexto del Ciclo de Conversión de Efectivo (CCC):
$$\\text{CCC} = \\text{Días de Inventario (DSI)} + \\text{Días de Cobro (DSO)} - \\text{Días de Pago a Proveedores (DPO)}$$

Si paga a sus proveedores a **30 días (DPO)** pero tarda **85 días en vender el stock (DSI)**, su empresa debe financiar **55 días de desfase de tesorería** con recursos propios o créditos bancarios.

---

### 4. Velocidad de Ventas por SKU: Unidades/Día y Días de Suministro

Para tomar decisiones diarias de compra, se calcula la **Velocidad de Ventas a nivel de SKU**:

$$\\text{Velocidad Diaria de Ventas} (V_d) = \\frac{\\sum \\text{Unidades Vendidas en el Periodo}}{\\text{Días del Periodo}}$$
$$\\text{Días de Suministro Restantes} (D_s) = \\frac{\\text{Stock Físico Actual}}{V_d}$$

#### Matriz Práctica de Velocidad:

| Código SKU | Descripción del Producto | Stock Disponible | Ventas 30 Días | Velocidad Diaria | Días de Suministro | Estado de Velocidad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Sudadera Algodón Orgánico (Negro/L) | 120 uds | 180 uds | 6.0 uds / día | **20.0 Días** | ⚡ **Alta Velocidad (Reordenar Ya)** |
| **EL-405** | Cargador USB-C 65W GaN | 85 uds | 45 uds | 1.5 uds / día | **56.6 Días** | 🟢 **Stock Saludable y Equilibrado** |
| **HM-902** | Lámpara Cerámica Mesa (Latón) | 40 uds | 4 uds | 0.13 uds / día | **307.7 Días** | 🔴 **Stock Muerto / Capital Atrapado** |

---

### 5. Desglose de Costes de Almacenamiento: Por Qué el Stock Pierde un 25% Anual

Los directores financieros estiman el **Coste Total de Mantener Inventario** entre un **20% y un 32% anual** del valor del stock:

\`\`\`
[ Coste Total de Mantenimiento de Inventario: ~25% Anual ]
  ├── 1. Coste de Capital / Coste de Oportunidad del Dinero: 8% – 12%
  ├── 2. Almacenamiento e Instalaciones (Alquiler, Suministros, Racks): 4% – 7%
  ├── 3. Mermas, Hurtos y Daños en Tránsito: 2% – 4%
  ├── 4. Seguros e Impuestos Locales sobre Activos: 1% – 2%
  └── 5. Obsolescencia y Descuentos Forzados por Liquidación: 5% – 10%
\`\`\`

Si una tienda mantiene $200.000 € en stock sobrante o estancado durante 12 meses, está quemando silenciosamente **$50.000 € al año** en costes ocultos sin generar margen.

---

### 6. Benchmarks Globales de Rotación en 6 Sectores del Retail

| Sector del Comercio Minorista | Rotación Anual Óptima | DSI Objetivo (Días) | Margen Bruto Típico | Característica Operativa |
| :--- | :--- | :--- | :--- | :--- |
| **Supermercados y Alimentación** | **14.0x – 24.0x** | 15 – 26 días | 18% – 25% | Velocidad ultra alta, perecederos, margen estrecho |
| **Moda y Confección Textil** | **4.5x – 8.0x** | 45 – 81 días | 45% – 60% | 4–6 colecciones por temporada, alto riesgo de obsolescencia |
| **Electrónica de Consumo** | **6.0x – 10.0x** | 36 – 60 días | 20% – 35% | Ciclos rápidos de componentes, rotación FIFO estricta |
| **Ferretería y Construcción** | **3.0x – 5.0x** | 73 – 120 días | 30% – 40% | No perecedero, amplio surtido, uso multiestacional |
| **Cosmética y Belleza** | **5.0x – 8.0x** | 45 – 73 días | 55% – 70% | Alta compra recurrente, control riguroso de caducidades |
| **Joyería y Artículos de Lujo** | **1.2x – 2.5x** | 146 – 300 días | 65% – 85% | Pocas transacciones, margen bruto en dinero muy alto |

---

### 7. El Plan de 5 Pilares para Acelerar la Rotación

1. **Segmentación de Velocidad ABC**:
   * **Clase A (Top 20% de SKUs)**: Genera el 80% de ventas. Conteo cíclico semanal y stock de seguridad ajustado.
   * **Clase B (Siguiente 30% de SKUs)**: Genera el 15% de ventas. Revisión quincenal.
   * **Clase C (50% restante de SKUs)**: Genera el 5% de ventas. Pedido strictly bajo demanda o lotes mínimos.
2. **Reducción de Plazos de Entrega de Proveedores ($L$)**:
   * Negocie entregas semanales más pequeñas en lugar de grandes pedidos trimestrales. Reducir el plazo de 30 a 7 días disminuye el stock de reserva más de un 50%.
3. **Liquidación Estructurada de Stock Muerto (+90 Días)**:
   * Cree packs en el TPV (combine productos de alta venta con artículos estancados con un 15% de descuento).
4. **Fórmulas Dinámicas de Punto de Pedido (ROP)**:
   * Automatice las órdenes de reposición vinculándolas a la velocidad de venta real de los últimos 30 días.
5. **Reequilibrio de Stock entre Tiendas en Tiempo Real**:
   * Si la Tienda A tiene 90 días de stock sobrante y la Tienda B solo tiene 4 días, realice una transferencia interna antes de comprar más a fábrica.

---

### 8. Fórmulas de Stock de Seguridad Dinámico y Lote Económico (EOQ)

$$\\text{Punto de Pedido (ROP)} = (\\text{Demanda Diaria Media} \\times \\text{Plazo de Entrega en Días}) + \\text{Stock de Seguridad}$$

$$\\text{Stock de Seguridad Estadístico} = Z \\times \\sigma_{LT} \\times \\sqrt{L}$$

Donde:
* $Z$ = Factor de Nivel de Servicio ($1.65$ para 95% de disponibilidad, $2.33$ para 99%).
* $\\sigma_{LT}$ = Desviación estándar de la demanda diaria.
* $L$ = Plazo de entrega del proveedor en días.

#### Cantidad Económica de Pedido (EOQ):
$$\\text{EOQ} = \\sqrt{\\frac{2 \\times D \\times S}{H}}$$

Donde:
* $D$ = Demanda anual en unidades.
* $S$ = Coste fijo por pedido (administración, portes, recepción).
* $H$ = Coste anual de almacenamiento por unidad ($Coste \\times \\text{Coste de Almacenamiento \\%}$).

---

### 9. Ejecución de Analítica de Velocidad en Tiempo Real en Inventory 360

[Inventory 360](https://www.inventory360.shop) automatiza todo este marco matemático directamente en su navegador:

1. **Cálculo de Velocidad en Vivo**: En **Informes > Rotación y Velocidad**, el sistema calcula las unidades vendidas por día, el COGS y los días de suministro restantes para cada SKU.
2. **Generación de Órdenes de Compra en 1 Clic**: Cuando el stock cae por debajo del ROP dinámico, el sistema genera pedidos de compra agrupados por proveedor.
3. **Informes de Valoración Multidivisa y Multilingües**: Exporte análisis completos en CSV, Excel o PDF en 11 idiomas con métricas exactas al coste y al precio de venta.
`
  },

  // French
  fr: {
    title: 'Le Guide Ultime du Ratio de Rotation des Stocks et de la Vélocité des Ventes',
    excerpt: 'Une masterclass financière et opérationnelle complète pour calculer le taux de rotation des stocks, le délai moyen d’écoulement (DSI), la vélocité par SKU et libérer le fonds de roulement.',
    category: 'Stratégie de Stock',
    keywords: [
      'formule rotation des stocks',
      'calcul rotation inventaire',
      'formule DSI délai moyen stock',
      'vélocité des ventes par SKU',
      'coût de possession du stock',
      'formule COGS coût des marchandises',
      'cycle de conversion de trésorerie',
      'réduire le stock dormant',
      'formule quantité économique EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. La Gravité Financière des Stocks : Fonds de Roulement vs Actifs Immobilisés' },
      { id: 'the-master-formula', title: '2. La Formule Maîtresse du Ratio de Rotation et Calcul du COGS' },
      { id: 'days-sales-of-inventory', title: '3. Délai Moyen d’Écoulement (DSI) et Cycle de Conversion de Trésorerie' },
      { id: 'sku-sales-velocity', title: '4. Vélocité des Ventes par SKU : Unités/Jour et Jours de Stock Restants' },
      { id: 'carrying-cost-economics', title: '5. Coût de Possession : Pourquoi le Stock Dormant Perd 25% par An' },
      { id: 'industry-benchmarks', title: '6. Ratios de Rotation de Référence dans 6 Grands Secteurs du Commerce' },
      { id: 'optimization-playbook', title: '7. Le Plan d’Action en 5 Piliers pour Accélérer la Rotation' },
      { id: 'safety-stock-eoq', title: '8. Formules de Stock de Sécurité Dynamique et Quantité Économique (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. Analyse de Vélocité en Temps Réel dans Inventory 360' },
    ],
    content: `
### 1. La Gravité Financière des Stocks : Fonds de Roulement vs Actifs Immobilisés

Dans le commerce, la trésorerie est vitale. Chaque euro immobilisé dans des marchandises stockées sur une étagère d'entrepôt est un euro indisponible pour la masse salariale, le marketing, l'acquisition de clients ou les remises sur volume fournisseur.

Le stock possède une propriété financière unique : **c'est un actif qui se déprécie en passif plus il reste immobile**.

Les commerçants qui ne mesurent pas la vélocité de leurs stocks subissent le **Goulot d’Étranglement du Fonds de Roulement** :
* Les rayons sont remplis d'articles, mais les comptes bancaires manquent de liquidités.
* Le capital est piégé dans des références obsolètes nécessitant de lourdes remises pour être liquidées.
* Des ruptures de stock surviennent simultanément sur les produits vedettes par manque de trésorerie pour réapprovisionner.

---

### 2. La Formule Maîtresse du Ratio de Rotation et Calcul du COGS

Le **Taux de Rotation des Stocks** mesure le nombre de fois où une entreprise vend et renouvelle entièrement son stock moyen au cours d'un exercice comptable :

$$\\text{Ratio de Rotation} = \\frac{\\text{Coût des Marchandises Vendues (COGS)}}{\\text{Valeur Moyenne du Stock au Coût}}$$

Où :
$$\\text{COGS} = \\text{Stock Initial} + \\text{Achats de la Période} - \\text{Stock Final}$$
$$\\text{Valeur Moyenne du Stock} = \\frac{\\text{Stock Initial} + \\text{Stock Final}}{2}$$

> **Règle Comptable Essentielle** : Utilisez toujours le **Coût d'Achat des Marchandises Vendues (COGS)** au numérateur et non le chiffre d'affaires. L'utilisation du prix de vente gonfle artificiellement le ratio car il intègre votre marge commerciale.

---

### 3. Délai Moyen d’Écoulement (DSI) et Cycle de Conversion de Trésorerie

$$\\text{DSI} = \\frac{365}{\\text{Ratio de Rotation}} = \\left( \\frac{\\text{Stock Moyen}}{\\text{COGS}} \\right) \\times 365$$

Pour un commerçant ayant une rotation de $4.28\\times$ :
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Jours}$$

Il s'écoule en moyenne **85,3 jours** entre la réception d'un article et son encaissement effectif en caisse.

---

### 4. Vélocité des Ventes par SKU : Unités/Jour et Jours de Stock Restants

$$\\text{Vélocité Quotidienne} (V_d) = \\frac{\\sum \\text{Unités Vendues}}{\\text{Nombre de Jours}}$$
$$\\text{Jours d'Approvisionnement Restants} (D_s) = \\frac{\\text{Stock Actuel en Rayon}}{V_d}$$

| Code SKU | Désignation de l'Article | Stock Disponible | Ventes 30 Jours | Vélocité / Jour | Jours de Stock Restants | Statut de Vélocité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Sweat à Capuche Coton Bio (Noir/L) | 120 unités | 180 unités | 6.0 unités / jour | **20.0 Jours** | ⚡ **Forte Vélocité (Réapprovisionner)** |
| **EL-405** | Chargeur USB-C 65W GaN | 85 unités | 45 unités | 1.5 unité / jour | **56.6 Jours** | 🟢 **Stock Équilibré et Sain** |
| **HM-902** | Lampe de Table Céramique | 40 unités | 4 unités | 0.13 unité / jour | **307.7 Jours** | 🔴 **Stock Dormant / Capital Bloqué** |

---

### 5. Coût de Possession : Pourquoi le Stock Dormant Perd 25% par An

Le coût annuel total de possession d'un stock représente entre **20% et 32%** de sa valeur marchande :
* Coût d'opportunité du capital : 8% – 12%
* Entreposage, loyer, énergie : 4% – 7%
* Démarque inconnue, casse, vol : 2% – 4%
* Obsolescence et démarques obligatoires : 5% – 10%

---

### 6. Ratios de Rotation de Référence dans 6 Grands Secteurs du Commerce

| Secteur d'Activité | Taux de Rotation Annuel | DSI Cible (Jours) | Marge Brute Moyenne |
| :--- | :--- | :--- | :--- |
| **Supermarchés & Alimentation** | **14.0x – 24.0x** | 15 – 26 jours | 18% – 25% |
| **Prêt-à-Porter & Mode** | **4.5x – 8.0x** | 45 – 81 jours | 45% – 60% |
| **Électronique Grand Public** | **6.0x – 10.0x** | 36 – 60 jours | 20% – 35% |
| **Bricolage & Matériaux** | **3.0x – 5.0x** | 73 – 120 jours | 30% – 40% |
| **Cosmétique & Beauté** | **5.0x – 8.0x** | 45 – 73 jours | 55% – 70% |
| **Bijouterie & Luxe** | **1.2x – 2.5x** | 146 – 300 jours | 65% – 85% |

---

### 7. Le Plan d’Action en 5 Piliers pour Accélérer la Rotation

1. **Classification ABC par Vélocité** (Top 20% Classe A = 80% des ventes).
2. **Réduction des Délais Fournisseurs** (Livraisons hebdomadaires plus fréquentes).
3. **Liquidation Ciblée des Stocks Dormants (+90 Jours)** via des offres groupées en caisse.
4. **Calcul Automatique des Points de Commande (ROP)**.
5. **Transferts Inter-Magasins en Temps Réel** pour équilibrer les surplus.

---

### 8. Formules de Stock de Sécurité Dynamique et Quantité Économique (EOQ)

$$\\text{Point de Commande (ROP)} = (\\text{Demande Quotidienne Moyenne} \\times \\text{Délai de Livraison}) + \\text{Stock de Sécurité}$$

$$\\text{Quantité Économique de Commande (EOQ)} = \\sqrt{\\frac{2 \\times D \\times S}{H}}$$

---

### 9. Analyse de Vélocité en Temps Réel dans Inventory 360

[Inventory 360](https://www.inventory360.shop) calcule automatiquement ces indicateurs en local dans votre navigateur :
* Tableau de bord dynamique **Rapports > Rotation & Vélocité**.
* Génération en 1 clic des bons de commande par fournisseur.
* Exportation de rapports valorisés en 11 langues aux formats CSV, Excel et PDF.
`
  },

  // German
  de: {
    title: 'Master-Leitfaden zur Lagerumschlagshäufigkeit & Optimierung der Bestandsgeschwindigkeit',
    excerpt: 'Eine umfassende betriebswirtschaftliche Masterclass zur Berechnung von Lagerumschlag, Reichweite in Tagen (DSI), SKU-Verkaufsgeschwindigkeit und Reduzierung von Lagerhaltungskosten zur Freisetzung von Betriebskapital.',
    category: 'Bestandsstrategie',
    keywords: [
      'Lagerumschlagshäufigkeit Formel',
      'Lagerumschlag berechnen',
      'Reichweite Lagerbestand DSI Formel',
      'Verkaufsgeschwindigkeit SKU Einheiten pro Tag',
      'Lagerhaltungskostensatz Prozent',
      'COGS Wareneinsatz Formel',
      'Cash Conversion Cycle Einzelhandel',
      'Lagerhüter reduzieren',
      'Optimale Bestellmenge EOQ Formel'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. Die finanzielle Schwerkraft des Lagers: Betriebskapital vs. Gebundenes Vermögen' },
      { id: 'the-master-formula', title: '2. Die Formel zur Lagerumschlagshäufigkeit & Wareneinsatz (COGS)' },
      { id: 'days-sales-of-inventory', title: '3. Lagerreichweite in Tagen (DSI) & Geldumschlagsdauer' },
      { id: 'sku-sales-velocity', title: '4. Granulare Verkaufsgeschwindigkeit: Einheiten/Tag & Reichweite' },
      { id: 'carrying-cost-economics', title: '5. Lagerhaltungskosten: Warum liegende Ware jährlich 25% verliert' },
      { id: 'industry-benchmarks', title: '6. Globale Umschlag-Benchmarks in 6 großen Handelsbranchen' },
      { id: 'optimization-playbook', title: '7. Der 5-Säulen-Plan zur Beschleunigung des Lagerumschlags' },
      { id: 'safety-stock-eoq', title: '8. Dynamischer Sicherheitsbestand & Optimale Bestellmenge (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. Echtzeit-Geschwindigkeitsanalyse in Inventory 360' },
    ],
    content: `
### 1. Die finanzielle Schwerkraft des Lagers: Betriebskapital vs. Gebundenes Vermögen

Im Handel ist Liquidität überlebenswichtig. Jeder Euro, der in physischer Ware im Lager gebunden ist, steht nicht für Gehälter, Marketing oder Skonto-Einkäufe zur Verfügung.

Bestand besitzt eine besondere bilanzielle Eigenschaft: **Er ist ein Vermögenswert, der sich mit zunehmender Liegezeit in eine Verbindlichkeit verwandelt**.

Händler, die ihre Umschlaggeschwindigkeit nicht steuern, geraten in den **Working-Capital-Engpass**:
* Die Regale sind voll, aber auf dem Geschäftskonto fehlt Liquidität.
* Kapital ist in Ladenhütern blockiert, die nur mit hohen Rabatten abverkauft werden können.
* Bei Topsellern kommt es gleichzeitig zu Lieferengpässen, weil das Geld für Nachbestellungen fehlt.

---

### 2. Die Formel zur Lagerumschlagshäufigkeit & Wareneinsatz (COGS)

$$\\text{Lagerumschlagshäufigkeit} = \\frac{\\text{Wareneinsatz (COGS)}}{\\text{Durchschnittlicher Lagerbestand zu Einstandspreisen}}$$

Wobei:
$$\\text{COGS} = \\text{Anfangsbestand} + \\text{Zugänge/Einkäufe} - \\text{Endbestand}$$
$$\\text{Durchschnittlicher Bestand} = \\frac{\\text{Anfangsbestand} + \\text{Endbestand}}{2}$$

> **Wichtige Buchhaltungsregel**: Verwenden Sie im Zähler stets den **Wareneinsatz (COGS)** und nicht den Bruttoumsatz, da der Verkaufsumsatz durch die Handelsspanne verzerrt ist.

---

### 3. Lagerreichweite in Tagen (DSI) & Geldumschlagsdauer

$$\\text{DSI (Lagerreichweite)} = \\frac{365}{\\text{Lagerumschlag}} = \\left( \\frac{\\text{Durchschnittsbestand}}{\\text{COGS}} \\right) \\times 365$$

Bei einem Umschlag von $4.28\\times$:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Tage}$$

---

### 4. Granulare Verkaufsgeschwindigkeit: Einheiten/Tag & Reichweite

$$\\text{Tägliche Verkaufsgeschwindigkeit} (V_d) = \\frac{\\sum \\text{Verkaufte Einheiten}}{\\text{Tage}}$$
$$\\text{Verbleibende Reichweite in Tagen} (D_s) = \\frac{\\text{Aktueller Lagerbestand}}{V_d}$$

| SKU-Code | Produktbezeichnung | Lagerbestand | 30-Tage-Verkäufe | Geschwindigkeit / Tag | Reichweite in Tagen | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Bio-Baumwoll-Hoodie (Schwarz/L) | 120 Stk | 180 Stk | 6.0 Stk / Tag | **20.0 Tage** | ⚡ **Schnelldreher (Sofort nachbestellen)** |
| **EL-405** | USB-C 65W GaN Ladegerät | 85 Stk | 45 Stk | 1.5 Stk / Tag | **56.6 Tage** | 🟢 **Gesunder Bestand** |
| **HM-902** | Keramik-Tischlampe (Messing) | 40 Stk | 4 Stk | 0.13 Stk / Tag | **307.7 Tage** | 🔴 **Ladenhüter / Kapital gebunden** |

---

### 5. Lagerhaltungskosten: Warum liegende Ware jährlich 25% verliert

Lagerhaltungskosten belaufen sich im Handel auf **20% bis 32% pro Jahr** des gebundenen Warenwertes (Kapitalkosten 8-12%, Miete/Fläche 4-7%, Schwund/Bruch 2-4%, Wertverlust 5-10%).

---

### 6. Globale Umschlag-Benchmarks in 6 großen Handelsbranchen

| Handelsbranche | Optimaler Jahresumschlag | Ziel-DSI (Tage) | Typische Rohmarge |
| :--- | :--- | :--- | :--- |
| **Lebensmittel & Supermärkte** | **14.0x – 24.0x** | 15 – 26 Tage | 18% – 25% |
| **Bekleidung & Mode** | **4.5x – 8.0x** | 45 – 81 Tage | 45% – 60% |
| **Unterhaltungselektronik** | **6.0x – 10.0x** | 36 – 60 Tage | 20% – 35% |
| **Baumarkt & Werkzeuge** | **3.0x – 5.0x** | 73 – 120 Tage | 30% – 40% |
| **Kosmetik & Drogerie** | **5.0x – 8.0x** | 45 – 73 Tage | 55% – 70% |
| **Schmuck & Luxusgüter** | **1.2x – 2.5x** | 146 – 300 Tage | 65% – 85% |

---

### 7. Der 5-Säulen-Plan zur Beschleunigung des Lagerumschlags

1. **ABC-Klassifizierung** zur Priorisierung von A-Artikeln.
2. **Kürzere Lieferantenvorlaufzeiten** durch wöchentliche Kleinlieferungen.
3. **Gezielter Abverkauf von Ladenhütern** (+90 Tage) über Kassen-Bundles.
4. **Dynamische Meldebestände (ROP)**.
5. **Filialübergreifender Bestandsausgleich** in Echtzeit.

---

### 8. Dynamischer Sicherheitsbestand & Optimale Bestellmenge (EOQ)

$$\\text{Meldebestand (ROP)} = (\\text{Tagesbedarf} \\times \\text{Lieferzeit}) + \\text{Sicherheitsbestand}$$

$$\\text{Optimale Bestellmenge (EOQ)} = \\sqrt{\\frac{2 \\times D \\times S}{H}}$$

---

### 9. Echtzeit-Geschwindigkeitsanalyse in Inventory 360

[Inventory 360](https://www.inventory360.shop) führt diese mathematischen Berechnungen lokal in Ihrem Browser aus:
* Live-Dashboard unter **Berichte > Umschlag & Geschwindigkeit**.
* 1-Klick-Erstellung automatischer Lieferantenbestellungen.
* Mehrsprachige Bestandsbewertungsberichte als CSV, Excel und PDF.
`
  },

  // Hindi
  hi: {
    title: 'इन्वेंटरी टर्नओवर अनुपात और स्टॉक वेलोसिटी अनुकूलन की मास्टर गाइड',
    excerpt: 'इन्वेंटरी टर्नओवर अनुपात, दिनों में स्टॉक की बिक्री (DSI), SKU-स्तरीय बिक्री गति और होल्डिंग लागत को कम करके कार्यशील पूंजी को अनलॉक करने पर एक विस्तृत वित्तीय और परिचालन मास्टरक्लास।',
    category: 'इन्वेंटरी रणनीति',
    keywords: [
      'इन्वेंटरी टर्नओवर अनुपात फॉर्मूला',
      'इन्वेंटरी टर्नओवर की गणना कैसे करें',
      'DSI फॉर्मूला दिनों में बिक्री',
      'स्टॉक वेलोसिटी यूनिट प्रति दिन',
      'इन्वेंटरी होल्डिंग लागत प्रतिशत',
      'COGS बेचे गए माल की लागत',
      'वर्किंग कैपिटल रिटेल',
      'डेड स्टॉक कम करने के उपाय',
      'EOQ ऑर्डर मात्रा फॉर्मूला'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. इन्वेंटरी का वित्तीय प्रभाव: कार्यशील पूंजी बनाम फंसी हुई संपत्ति' },
      { id: 'the-master-formula', title: '2. इन्वेंटरी टर्नओवर अनुपात का मास्टर फॉर्मूला और COGS गणित' },
      { id: 'days-sales-of-inventory', title: '3. डेज सेल्स ऑफ इन्वेंटरी (DSI) और कैश कन्वर्जन साइकिल' },
      { id: 'sku-sales-velocity', title: '4. SKU स्तर पर बिक्री की गति: यूनिट/दिन और आपूर्ति के दिन' },
      { id: 'carrying-cost-economics', title: '5. कैरिंग कॉस्ट का विश्लेषण: रखा हुआ माल सालाना 25% क्यों गंवाता है' },
      { id: 'industry-benchmarks', title: '6. प्रमुख 6 रिटेल क्षेत्रों में वैश्विक टर्नओवर बेंचमार्क' },
      { id: 'optimization-playbook', title: '7. टर्नओवर बढ़ाने की 5-सूत्रीय कार्ययोजना' },
      { id: 'safety-stock-eoq', title: '8. डायनामिक सेफ्टी स्टॉक और EOQ फॉर्मूला' },
      { id: 'inventory-360-implementation', title: '9. Inventory 360 में रियल-टाइम वेलोसिटी एनालिटिक्स' },
    ],
    content: `
### 1. इन्वेंटरी का वित्तीय प्रभाव: कार्यशील पूंजी बनाम फंसी हुई संपत्ति

व्यापार में नकदी (Cash) ऑक्सीजन के समान है। गोदाम या दुकान के रैक पर रखे हर उत्पाद में फंसा हुआ पैसा वेतन, मार्केटिंग या नए ट्रेंडिंग माल की खरीद के लिए अनुपलब्ध रहता है।

इन्वेंटरी बैलेंस शीट पर एक अनोखी संपत्ति है: **यह जितना अधिक समय तक स्थिर रहती है, उतनी ही तेजी से देयता (Liability) में बदलती है**।

जब व्यापारी स्टॉक वेलोसिटी की निगरानी नहीं करते, तो उन्हें **वर्किंग कैपिटल की तंगी** का सामना करना पड़ता है:
* अलमारियां सामान से भरी दिखती हैं, लेकिन बैंक खाते में नकदी नहीं होती।
* धीमे बिकने वाले सामान में पूंजी फंस जाती है।
* सबसे ज्यादा बिकने वाले सामान के लिए री-ऑर्डर करने का बजट खत्म हो जाता है।

---

### 2. इन्वेंटरी टर्नओवर अनुपात का मास्टर फॉर्मूला और COGS गणित

$$\\text{इन्वेंटरी टर्नओवर अनुपात} = \\frac{\\text{बेचे गए माल की लागत (COGS)}}{\\text{औसत इन्वेंटरी लागत}}$$

जहाँ:
$$\\text{COGS} = \\text{प्रारंभिक स्टॉक} + \\text{अवधि के दौरान खरीद} - \\text{अंतिम स्टॉक}$$
$$\\text{औसत इन्वेंटरी} = \\frac{\\text{प्रारंभिक स्टॉक लागत} + \\text{अंतिम स्टॉक लागत}}{2}$$

> **महत्वपूर्ण नियम**: हमेशा अंश में **COGS** का उपयोग करें, कुल बिक्री राजस्व का नहीं, क्योंकि राजस्व में आपका लाभ मार्जिन शामिल होता है।

---

### 3. डेज सेल्स ऑफ इन्वेंटरी (DSI) और कैश कन्वर्जन साइकिल

$$\\text{DSI (दिनों में आपूर्ति)} = \\frac{365}{\\text{टर्नओवर अनुपात}} = \\left( \\frac{\\text{औसत इन्वेंटरी}}{\\text{COGS}} \\right) \\times 365$$

यदि टर्नओवर $4.28\\times$ है:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ दिन}$$

इसका अर्थ है कि माल आने से लेकर बिकने और नकदी मिलने में औसतन **85.3 दिन** लगते हैं।

---

### 4. SKU स्तर पर बिक्री की गति: यूनिट/दिन और आपूर्ति के दिन

| SKU कोड | उत्पाद विवरण | उपलब्ध स्टॉक | 30 दिन की बिक्री | दैनिक गति | शेष आपूर्ति दिन | स्थिति |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | कॉटन हुडी (ब्लैक/L) | 120 यूनिट | 180 यूनिट | 6.0 यूनिट/दिन | **20.0 दिन** | ⚡ **तेज गति (तुरंत ऑर्डर करें)** |
| **EL-405** | USB-C 65W चार्जर | 85 यूनिट | 45 यूनिट | 1.5 यूनिट/दिन | **56.6 दिन** | 🟢 **संतुलित स्वस्थ स्टॉक** |
| **HM-902** | टेबल लैंप (ब्रास) | 40 यूनिट | 4 यूनिट | 0.13 यूनिट/दिन | **307.7 दिन** | 🔴 **डेड स्टॉक / पूंजी फंसी** |

---

### 5. कैरिंग कॉस्ट: रखा हुआ माल सालाना 25% क्यों गंवाता है

इन्वेंटरी रखने की कुल लागत (गोदाम किराया, ब्याज, चोरी/टूट-फूट, अप्रचलन) उत्पाद मूल्य का **20% से 32% प्रति वर्ष** होती है। 10 लाख रुपये का फंसा हुआ माल हर साल **2.5 लाख रुपये** का मौन नुकसान कराता है।

---

### 6. प्रमुख रिटेल क्षेत्रों में वार्षिक टर्नओवर बेंचमार्क

* **किराना और सुपरमार्केट**: 14x – 24x (15 – 26 दिन)
* **कपड़े और गारमेंट्स**: 4.5x – 8.0x (45 – 81 दिन)
* **इलेक्ट्रॉनिक्स**: 6.0x – 10.0x (36 – 60 दिन)
* **हार्डवेयर और पेंट**: 3.0x – 5.0x (73 – 120 दिन)
* **सौंदर्य प्रसाधन**: 5.0x – 8.0x (45 – 73 दिन)
* **ज्वेलरी और लक्जरी**: 1.2x – 2.5x (146 – 300 दिन)

---

### 7. टर्नओवर बढ़ाने की 5-सूत्रीय कार्ययोजना

1. **ABC वर्गीकरण**: शीर्ष 20% उत्पादों पर सबसे अधिक ध्यान दें।
2. **सप्लायर लीड टाइम कम करें**: तिमाही बड़े ऑर्डर के बजाय साप्ताहिक छोटे ऑर्डर लें।
3. **90+ दिन पुराने डेड स्टॉक को बंडल ऑफर में निकालें**।
4. **स्वचालित री-ऑर्डर पॉइंट (ROP)** लागू करें।
5. **शाखाओं के बीच रियल-टाइम स्टॉक ट्रांसफर** करें।

---

### 8. Inventory 360 में रियल-टाइम वेलोसिटी एनालिटिक्स

[Inventory 360](https://www.inventory360.shop) आपके ब्राउज़र में यह संपूर्ण गणित स्वचालित करता है:
* **रिपोर्टिंग > टर्नओवर और वेलोसिटी** में लाइव रन-रेट डैशबोर्ड।
* कम स्टॉक होने पर 1-क्लिक में सप्लायर परचेज ऑर्डर जनरेशन।
* 11 भाषाओं में विस्तृत CSV, Excel और PDF एक्सपोर्ट।
`
  },

  // Japanese
  ja: {
    title: '在庫回転率と販売速度（ベロシティ）最適化のマスターガイド',
    excerpt: '在庫回転率、在庫日数（DSI）、SKU別の販売速度の算出、および保管コスト削減によって凍結された運転資金を解放するための実践的財務マスタークラス。',
    category: '在庫戦略',
    keywords: [
      '在庫回転率 計算式',
      '在庫回転期間 DSI 計算',
      'SKU別販売速度 ユニット/日',
      '在庫保有コスト 割合',
      '売上原価 COGS 計算式',
      'キャッシュコンバージョンサイクル',
      '滞留在庫 デッドストック削減',
      '経済的発注量 EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. 在庫の財務的重力：運転資金と固定化資産の真実' },
      { id: 'the-master-formula', title: '2. 在庫回転率の基本計算式と売上原価（COGS）' },
      { id: 'days-sales-of-inventory', title: '3. 在庫回転日数（DSI）とキャッシュコンバージョンサイクル' },
      { id: 'sku-sales-velocity', title: '4. SKU別の販売速度：日販数と適正在庫日数' },
      { id: 'carrying-cost-economics', title: '5. 在庫保有コストの内訳：滞留在庫が年25%価値を失う理由' },
      { id: 'industry-benchmarks', title: '6. 主要小売6業種における年間回転率ベンチマーク' },
      { id: 'optimization-playbook', title: '7. 在庫回転率を劇的に高める5つの柱' },
      { id: 'safety-stock-eoq', title: '8. 動的安全在庫と経済的発注量（EOQ）の計算式' },
      { id: 'inventory-360-implementation', title: '9. Inventory 360でのリアルタイム速度分析の実践' },
    ],
    content: `
### 1. 在庫の財務的重力：運転資金と固定化資産の真実

小売ビジネスにおいて、キャッシュ（現金）は血液です。倉庫や店舗の棚に眠る在庫に縛られた資金は、人件費、マーケティング、人気商品の仕入れに一切使えません。

在庫は貸借対照表（B/S）上で極めて特殊な性質を持ちます：**動かない期間が長くなるほど、資産から負債へと劣化していきます**。

在庫回転率を管理しない小売事業者は、必ず**運転資金の枯渇**に直面します：
* 棚には商品が溢れているのに、銀行口座のキャッシュが不足する。
* 売れ残った滞留商品に資金が拘束され、値引き処分を余儀なくされる。
* 売れ筋商品が欠品しても、再発注するための資金が不足する。

---

### 2. 在庫回転率の基本計算式と売上原価（COGS）

$$\\text{在庫回転率（回/年）} = \\frac{\\text{売上原価（COGS）}}{\\text{平均在庫金額（原価ベース）}}$$

ここで：
$$\\text{売上原価} = \\text{期首在庫} + \\text{当期仕入高} - \\text{期末在庫}$$
$$\\text{平均在庫金額} = \\frac{\\text{期首在庫原価} + \\text{期末在庫原価}}{2}$$

> **重要な会計原則**：分子には売上高ではなく、必ず**売上原価（COGS）**を使用してください。売上高には粗利益マージンが含まれるため、回転率が過大に算出されてしまいます。

---

### 3. 在庫回転日数（DSI）とキャッシュコンバージョンサイクル

$$\\text{在庫回転日数 (DSI)} = \\frac{365}{\\text{在庫回転率}} = \\left( \\frac{\\text{平均在庫}}{\\text{売上原価}} \\right) \\times 365$$

回転率が $4.28$ 回の場合：
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ 日}$$

商品が入荷してから販売され、代金が回収されるまでに平均 **85.3日** かかることを意味します。

---

### 4. SKU別の販売速度：日販数と適正在庫日数

$$\\text{日別販売速度} (V_d) = \\frac{\\text{特定期間の販売数量}}{\\text{期間日数}}$$
$$\\text{在庫残日数} (D_s) = \\frac{\\text{現在の手持在庫数}}{V_d}$$

| SKUコード | 商品名 | 現在庫数 | 過去30日販売数 | 日販速度 | 残存在庫日数 | 判定ステータス |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | オーガニックコットンパーカー (黒/L) | 120個 | 180個 | 6.0個 / 日 | **20.0日** | ⚡ **高回転（即時再発注）** |
| **EL-405** | USB-C 65W GaN充電器 | 85個 | 45個 | 1.5個 / 日 | **56.6日** | 🟢 **健全・適正在庫** |
| **HM-902** | セラミックテーブルランプ | 40個 | 4個 | 0.13個 / 日 | **307.7日** | 🔴 **デッドストック（資金固定化）** |

---

### 5. 在庫保有コストの内訳：滞留在庫が年25%価値を失う理由

年間在庫保有コストは、在庫金額の **20%〜32%** に達します（金利・機会費用 8-12%、倉庫賃料・光熱費 4-7%、破損・盗難 2-4%、陳腐化・値引き損失 5-10%）。1,000万円の滞留在庫は毎年 **250万円の損失** を生み出します。

---

### 6. 主要小売6業種における年間回転率ベンチマーク

* **食品スーパー**: 14.0x – 24.0x (15 – 26日)
* **アパレル・ファッション**: 4.5x – 8.0x (45 – 81日)
* **家電・デジタル機器**: 6.0x – 10.0x (36 – 60日)
* **ホームセンター・金物**: 3.0x – 5.0x (73 – 120日)
* **化粧品・コスメ**: 5.0x – 8.0x (45 – 73日)
* **宝石・ラグジュアリー**: 1.2x – 2.5x (146 – 300日)

---

### 7. 在庫回転率を劇的に高める5つの柱

1. **ABC分析による重点管理**（売上の80%を作る上位20%のAランク商品を集中的に管理）。
2. **発注リードタイムの短縮**（四半期まとめ買いから週次小口納品へ変更）。
3. **90日以上滞留したデッドストックのセット販売・早期損切り**。
4. **過去30日実績に基づく動的発注点（ROP）の適用**。
5. **店舗間在庫移動（トランスファー）による余剰の平準化**。

---

### 8. Inventory 360でのリアルタイム速度分析の実践

[Inventory 360](https://www.inventory360.shop) は、これら高度な数理分析をブラウザ内で完全自動化します：
* **レポート > 回転率＆ベロシティ** によるリアルタイムの消化日数可視化。
* 安全在庫を下回った際の発注書（PO）1クリック自動作成。
* 11言語対応のCSV・Excel・PDF原価評価レポート出力。
`
  },

  // Chinese (Simplified)
  zh: {
    title: '库存周转率与库存流速（Velocity）优化全景实战指南',
    excerpt: '全面解析库存周转率计算、存货周转天数（DSI）、SKU级动销流速测算及库存持有成本控制，帮助零售企业盘活被沉淀的巨额营运资金。',
    category: '库存战略',
    keywords: [
      '库存周转率计算公式',
      '存货周转天数DSI',
      'SKU销售流速测算',
      '库存持有成本率',
      '营业成本COGS公式',
      '零售现金周转周期',
      '消除呆滞死库存',
      '经济订货批量EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. 库存的财务重力法则：营运现金流 vs 沉淀资产' },
      { id: 'the-master-formula', title: '2. 库存周转率核心公式与营业成本（COGS）核算' },
      { id: 'days-sales-of-inventory', title: '3. 存货周转天数（DSI）与现金转换周期（CCC）' },
      { id: 'sku-sales-velocity', title: '4. SKU级颗粒度销售流速：日均销量与库存可用天数' },
      { id: 'carrying-cost-economics', title: '5. 库存持有成本全景剖析：滞销商品为何每年贬值25%' },
      { id: 'industry-benchmarks', title: '6. 零售行业6大业态年度周转率参考基准' },
      { id: 'optimization-playbook', title: '7. 提升库存周转效率的5大核心战术' },
      { id: 'safety-stock-eoq', title: '8. 动态安全库存与经济订货批量（EOQ）数学模型' },
      { id: 'inventory-360-implementation', title: '9. 在 Inventory 360 中落地实时库存流速分析' },
    ],
    content: `
### 1. 库存的财务重力法则：营运现金流 vs 沉淀资产

在现代零售商业中，现金就是氧气。每一笔沉淀在仓库货架上的滞销库存，都是被锁死且无法用于员工薪资、营销获客和采购热销新品的宝贵现金。

库存具备独特的财务属性：**商品在库房停留的时间越久，它就越快从资产退化为吞噬利润的负债**。

未建立库存周转控制的零售商必然陷入**营运资金挤压困境**：
* 库房货物堆积如山，但企业银行账户极度缺乏流动性。
* 巨额资金被死死卡在滞销或过季SKU中，最终只能依靠亏本打折清仓。
* 热销爆品因资金链紧绷无法及时补货，频繁面临断货损失。

---

### 2. 库存周转率核心公式与营业成本（COGS）核算

$$\\text{库存周转率（次/年）} = \\frac{\\text{销售商品营业成本 (COGS)}}{\\text{平均库存成本金额}}$$

其中：
$$\\text{COGS} = \\text{期初库存} + \\text{本期采购入库} - \\text{期末库存}$$
$$\\text{平均库存成本} = \\frac{\\text{期初库存成本} + \\text{期末库存成本}}{2}$$

> **重要会计准则**：公式分子必须严格使用**营业成本（COGS）**，绝不能使用销售营业额。因为销售额包含了毛利润加价，会虚假拔高周转率数值。

---

### 3. 存货周转天数（DSI）与现金转换周期（CCC）

$$\\text{存货周转天数 (DSI)} = \\frac{365}{\\text{库存周转率}} = \\left( \\frac{\\text{平均库存}}{\\text{COGS}} \\right) \\times 365$$

若某企业年周转率为 $4.28$ 次：
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ 天}$$

即商品从验收进仓到收银台卖出并收回货款，平均需要经历 **85.3天**。

---

### 4. SKU级颗粒度销售流速：日均销量与库存可用天数

$$\\text{日均销售流速} (V_d) = \\frac{\\sum \\text{周期内销售件数}}{\\text{周期天数}}$$
$$\\text{当前库存可售天数} (D_s) = \\frac{\\text{现有实物库存量}}{V_d}$$

| SKU编码 | 商品名称与规格 | 当前在库量 | 过去30天销量 | 日均流速 | 预计可售天数 | 动销健康状态 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | 有机棉连帽卫衣 (黑/L) | 120件 | 180件 | 6.0件 / 天 | **20.0天** | ⚡ **高速动销（立即发起补货）** |
| **EL-405** | 氮化镓 65W 充电器 | 85件 | 45件 | 1.5件 / 天 | **56.6天** | 🟢 **健康平稳库存** |
| **HM-902** | 复古陶瓷台灯 (黄铜) | 40件 | 4件 | 0.13件 / 天 | **307.7天** | 🔴 **呆滞死库存（资金严重冻结）** |

---

### 5. 库存持有成本全景剖析：滞销商品为何每年贬值25%

财务分析表明，企业每年的**综合库存持有成本高达货值金额的 20% 至 32%**（资金沉淀机会成本 8-12%、仓储租金能耗 4-7%、损耗与破损 2-4%、换季贬值与打折清仓 5-10%）。100万元呆滞库存每年默默蒸发 **25万元** 纯利润。

---

### 6. 零售行业6大业态年度周转率参考基准

* **商超生鲜**: 14.0x – 24.0x (15 – 26天)
* **服装鞋帽**: 4.5x – 8.0x (45 – 81天)
* **数码3C**: 6.0x – 10.0x (36 – 60天)
* **五金建材**: 3.0x – 5.0x (73 – 120天)
* **美妆个护**: 5.0x – 8.0x (45 – 73天)
* **珠宝奢侈品**: 1.2x – 2.5x (146 – 300天)

---

### 7. 提升库存周转效率的5大核心战术

1. **ABC 价值分级管理**（倾斜资源重点管控产生80%收益的头部20% A类商品）。
2. **压缩供应商交期（Lead Time）**，推行“高频小批次”采购模式。
3. **收银端组合捆绑促销**，将90天以上滞销品与爆款搭配折价清仓。
4. **引入基于30天动态动销的自动化再订货点（ROP）**。
5. **多门店实时调拨（Transfer）**，避免重复向工厂下单。

---

### 8. 在 Inventory 360 中落地实时库存流速分析

[Inventory 360](https://www.inventory360.shop) 在浏览器前端自动完成上述全部复杂运算：
* **报表 > 周转与流速** 模块实时展示动销速率与预计断货天数。
* 低于预警线时一键自动归集生成供应商采购单（PO）。
* 支持以11种语言导出包含成本与售价视角的 CSV、Excel 与 PDF 评估报表。
`
  },

  // Arabic
  ar: {
    title: 'الدليل الشامل لمعدل دوران المخزون وتحسين سرعة تدفق البضائع',
    excerpt: 'دليل مالي وتشغيلي احترافي لحساب معدل دوران المخزون، وأيام بقاء البضاعة (DSI)، وسرعة مبيعات الأصناف (SKU Velocity)، وخفض تكاليف التخزين لتحرير رأس المال العامل.',
    category: 'استراتيجية المخزون',
    keywords: [
      'معادلة دوران المخزون',
      'حساب سرعة بيع البضاعة',
      'فترة بقاء المخزون DSI',
      'تكلفة البضاعة المباعة COGS',
      'تكلفة الاحتفاظ بالمخزون',
      'دورة تحويل النقدية',
      'التخلص من البضاعة الراكدة',
      'حجم الطلب الاقتصادي EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. الجاذبية المالية للمخزون: رأس المال العامل مقابل الأصول المجمدة' },
      { id: 'the-master-formula', title: '2. المعادلة الأساسية لمعدل دوران المخزون وتكلفة المبيعات' },
      { id: 'days-sales-of-inventory', title: '3. أيام بقاء المخزون (DSI) ودورة تحويل النقد' },
      { id: 'sku-sales-velocity', title: '4. سرعة مبيعات الأصناف: المبيعات اليومية وفترة التغطية' },
      { id: 'carrying-cost-economics', title: '5. تكاليف الاحتفاظ بالمخزون: لماذا تفقد البضاعة 25% سنوياً' },
      { id: 'industry-benchmarks', title: '6. المعدلات القياسية لدوران المخزون في 6 قطاعات تجارية' },
      { id: 'optimization-playbook', title: '7. خطة العمل الخماسية لتسريع دوران البضائع' },
      { id: 'safety-stock-eoq', title: '8. معادلات مخزون الأمان والكمية الاقتصادية للطلب (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. تحليل سرعة المخزون في نظام Inventory 360' },
    ],
    content: `
### 1. الجاذبية المالية للمخزون: رأس المال العامل مقابل الأصول المجمدة

في تجارة التجزئة، السيولة النقدية هي شريان الحياة. كل ريال أو دولار مقيد في بضاعة راكدة على أرفف المستودعات هو مال مجمد لا يمكن استخدامه لدفع الرواتب أو التسويق أو شراء المنتجات الأكثر طلباً.

المخزون يتميز بخاصية فريدة: **هو أصل يتحول تدريجياً إلى عبء مالي كلما طالت فترة بقائه دون بيع**.

التجار الذين لا يراقبون سرعة دوران المخزون يقعون في **أزمة السيولة**:
* المستودعات ممتلئة بالبضائع، لكن الحسابات البنكية خالية من النقد.
* الأموال محتجزة في منتجات راكدة تتطلب خصومات قاسية لتصريفها.
* نفاذ مفاجئ للمنتجات الأكثر مبيعاً لعدم توفر السيولة لإعادة شرائها.

---

### 2. المعادلة الأساسية لمعدل دوران المخزون وتكلفة المبيعات

$$\\text{معدل دوران المخزون} = \\frac{\\text{تكلفة البضاعة المباعة (COGS)}}{\\text{متوسط قيمة المخزون بالتكلفة}}$$

حيث أن:
$$\\text{تكلفة البضاعة المباعة} = \\text{مخزون أول المدة} + \\text{المشتريات} - \\text{مخزون آخر المدة}$$
$$\\text{متوسط المخزون} = \\frac{\\text{مخزون أول المدة} + \\text{مخزون آخر المدة}}{2}$$

> **قاعدة محاسبية هامة**: استخدم دائماً **تكلفة البضاعة المباعة (COGS)** في البسط وليس إجمالي المبيعات، لأن سعر البيع يتضمن هامش الربح مما يعطي انطباعاً مضللاً.

---

### 3. أيام بقاء المخزون (DSI) ودورة تحويل النقد

$$\\text{DSI (أيام بقاء المخزون)} = \\frac{365}{\\text{معدل الدوران}} = \\left( \\frac{\\text{متوسط المخزون}}{\\text{COGS}} \\right) \\times 365$$

إذا كان معدل الدوران $4.28$ مرة في السنة:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ يوماً}$$

---

### 4. سرعة مبيعات الأصناف: المبيعات اليومية وفترة التغطية

| رمز الصنف | وصف المنتج | المخزون المتوفر | مبيعات 30 يوماً | السرعة اليومية | أيام التغطية | الحالة |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | هودي قطن عضوي (أسود/L) | 120 قطعة | 180 قطعة | 6.0 قطع / يوم | **20.0 يوماً** | ⚡ **سريع الحركة (طلب فوري)** |
| **EL-405** | شاحن سريع 65W GaN | 85 قطعة | 45 قطعة | 1.5 قطعة / يوم | **56.6 يوماً** | 🟢 **مخزون صحي ومتوازن** |
| **HM-902** | مصباح طاولة كلاسيكي | 40 قطعة | 4 قطع | 0.13 قطعة / يوم | **307.7 يوماً** | 🔴 **بضاعة راكدة (أموال مجمدة)** |

---

### 5. تكاليف الاحتفاظ بالمخزون: لماذا تفقد البضاعة 25% سنوياً

تقدر تكلفة الاحتفاظ بالمخزون بما بين **20% إلى 32% سنوياً** من قيمته الإجمالية (تكلفة تجميد رأس المال، إيجار المستودعات، التلف، والتخفيضات الإجبارية للتصريف).

---

### 6. المعدلات القياسية لدوران المخزون في 6 قطاعات تجارية

* **السوبرماركت والمواد الغذائية**: 14.0x – 24.0x (15 – 26 يوماً)
* **الملابس والأزياء**: 4.5x – 8.0x (45 – 81 يوماً)
* **الأجهزة الإلكترونية**: 6.0x – 10.0x (36 – 60 يوماً)
* **مواد البناء والأدوات**: 3.0x – 5.0x (73 – 120 يوماً)
* **مستحضرات التجميل**: 5.0x – 8.0x (45 – 73 يوماً)
* **المجوهرات والسلع الفاخرة**: 1.2x – 2.5x (146 – 300 يوماً)

---

### 7. خطة العمل الخماسية لتسريع دوران البضائع

1. **تصنيف ABC** للتركيز على أهم 20% من المنتجات التي تحقق 80% من المبيعات.
2. **تقليل فترات توريد الموردين** عبر التوريد الأسبوعي المستمر.
3. **عروض التخفيض المجمعة في نقاط البيع** لتصريف البضائع الراكدة (+90 يوماً).
4. **تطبيق نقاط إعادة الطلب التلقائية (ROP)**.
5. **المناقلة الفورية للمخزون بين الفروع** قبل الشراء من الخارج.

---

### 8. تحليل سرعة المخزون في نظام Inventory 360

يقوم [Inventory 360](https://www.inventory360.shop) بأتمتة كافة هذه المعادلات الرياضية داخل المتصفح:
* لوحة تحكم حية عبر **التقارير > معدل الدوران وسرعة المبيعات**.
* توليد أوامر الشراء للموردين بنقرة واحدة عند انخفاض المخزون.
* تصدير تقارير تقييم شاملة بـ 11 لغة بصيغ CSV و Excel و PDF.
`
  },

  // Portuguese
  pt: {
    title: 'Guia Definitivo do Giro de Estoque e Otimização da Velocidade de Vendas',
    excerpt: 'Uma masterclass financeira e operacional sobre cálculo do índice de giro de estoque, dias de estoque (DSI), velocidade de vendas por SKU e liberação de capital de giro.',
    category: 'Estratégia de Estoque',
    keywords: [
      'fórmula giro de estoque',
      'como calcular giro de estoque',
      'dias de estoque DSI fórmula',
      'velocidade de vendas SKU unidades por dia',
      'custo de manutenção de estoque',
      'custo das mercadorias vendidas CMV',
      'ciclo de conversão de caixa varejo',
      'eliminar estoque parado',
      'lote econômico de compra EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. A Gravidade Financeira do Estoque: Capital de Giro vs Ativos Bloqueados' },
      { id: 'the-master-formula', title: '2. A Fórmula Mestra do Giro de Estoque e Cálculo do CMV (COGS)' },
      { id: 'days-sales-of-inventory', title: '3. Dias de Venda do Estoque (DSI) e Ciclo Financeiro' },
      { id: 'sku-sales-velocity', title: '4. Velocidade de Vendas por SKU: Unidades/Dia e Dias de Cobertura' },
      { id: 'carrying-cost-economics', title: '5. Custo de Manutenção: Por Que Estoque Parado Perde 25% ao Ano' },
      { id: 'industry-benchmarks', title: '6. Benchmarks Globais de Giro em 6 Setores do Varejo' },
      { id: 'optimization-playbook', title: '7. O Plano de 5 Pilares para Acelerar o Giro' },
      { id: 'safety-stock-eoq', title: '8. Estoque de Segurança Dinâmico e Lote Econômico (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. Análise de Velocidade em Tempo Real no Inventory 360' },
    ],
    content: `
### 1. A Gravidade Financeira do Estoque: Capital de Giro vs Ativos Bloqueados

No varejo, fluxo de caixa é oxigênio. Cada real parado em mercadorias nas prateleiras é dinheiro indisponível para folha de pagamento, marketing ou compras com desconto.

O estoque possui uma característica contábil única: **é um ativo que se deprecia em passivo quanto mais tempo permanece imóvel**.

Varejistas que não medem a velocidade de vendas enfrentam o **Estrangulamento do Capital de Giro**:
* Prateleiras cheias de mercadoria, mas caixa da empresa sem liquidez.
* Dinheiro travado em SKUs obsoletos que exigem liquidações com prejuízo.
* Ruptura de estoque nos produtos campeões de venda por falta de verba para recompra.

---

### 2. A Fórmula Mestra do Giro de Estoque e Cálculo do CMV (COGS)

$$\\text{Giro de Estoque} = \\frac{\\text{Custo das Mercadorias Vendidas (CMV)}}{\\text{Valor Médio do Estoque a Preço de Custo}}$$

Onde:
$$\\text{CMV} = \\text{Estoque Inicial} + \\text{Compras} - \\text{Estoque Final}$$
$$\\text{Estoque Médio} = \\frac{\\text{Estoque Inicial} + \\text{Estoque Final}}{2}$$

> **Regra Contábil Essencial**: Utilize sempre o **CMV (Custo das Mercadorias Vendidas)** no numerador e nunca o faturamento bruto, para não distorcer o cálculo com a margem de lucro.

---

### 3. Dias de Venda do Estoque (DSI) e Ciclo Financeiro

$$\\text{DSI (Dias de Estoque)} = \\frac{365}{\\text{Giro de Estoque}} = \\left( \\frac{\\text{Estoque Médio}}{\\text{CMV}} \\right) \\times 365$$

Para um giro de $4.28\\times$:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Dias}$$

---

### 4. Velocidade de Vendas por SKU: Unidades/Dia e Dias de Cobertura

| Código SKU | Descrição do Produto | Estoque Atual | Vendas 30 Dias | Velocidade Diária | Dias de Cobertura | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Moletom Algodão Orgânico (Preto/G) | 120 un | 180 un | 6.0 un / dia | **20.0 Dias** | ⚡ **Alto Giro (Recomprar Já)** |
| **EL-405** | Carregador USB-C 65W GaN | 85 un | 45 un | 1.5 un / dia | **56.6 Dias** | 🟢 **Estoque Equilibrado e Saudável** |
| **HM-902** | Abajur de Cerâmica e Latão | 40 un | 4 un | 0.13 un / dia | **307.7 Dias** | 🔴 **Estoque Parado / Capital Preso** |

---

### 5. Custo de Manutenção: Por Que Estoque Parado Perde 25% ao Ano

O custo total de carregamento de estoque gira entre **20% e 32% ao ano** do valor estocado (custo de oportunidade 8-12%, aluguel/espaço 4-7%, perdas/avarias 2-4%, obsolescência 5-10%). Manter R$ 100.000 em estoque parado custa **R$ 25.000 por ano** em perdas invisíveis.

---

### 6. Benchmarks Globais de Giro em 6 Setores do Varejo

* **Supermercados e Alimentos**: 14.0x – 24.0x (15 – 26 dias)
* **Vestuário e Moda**: 4.5x – 8.0x (45 – 81 dias)
* **Eletrônicos**: 6.0x – 10.0x (36 – 60 dias)
* **Material de Construção**: 3.0x – 5.0x (73 – 120 dias)
* **Cosméticos e Beleza**: 5.0x – 8.0x (45 – 73 dias)
* **Joalheria e Luxo**: 1.2x – 2.5x (146 – 300 dias)

---

### 7. O Plano de 5 Pilares para Acelerar o Giro

1. **Curva ABC**: Priorização rigorosa dos 20% de itens que geram 80% da receita.
2. **Redução de Prazos de Entrega**: Compras semanais fracionadas com fornecedores.
3. **Queima Estruturada de Estoque Parado (+90 Dias)** via combos promocionais no PDV.
4. **Ponto de Reposição Automático (ROP)**.
5. **Transferência de Estoque entre Lojas** para balancear excedentes.

---

### 8. Análise de Velocidade em Tempo Real no Inventory 360

O [Inventory 360](https://www.inventory360.shop) executa todos esses cálculos localmente no navegador:
* Painel dinâmico em **Relatórios > Giro e Velocidade**.
* Geração de pedidos de compra em 1 clique agrupados por fornecedor.
* Exportação de relatórios em 11 idiomas em CSV, Excel e PDF.
`
  },

  // Italian
  it: {
    title: 'Guida Completa all\'Indice di Rotazione del Magazzino e Ottimizzazione della Velocità di Stock',
    excerpt: 'Una masterclass finanziaria e operativa per calcolare l\'indice di rotazione, i giorni di giacenza (DSI), la velocità di vendita per SKU e ridurre i costi di mantenimento.',
    category: 'Strategia di Magazzino',
    keywords: [
      'formula rotazione magazzino',
      'come calcolare rotazione scorte',
      'giorni di giacenza DSI formula',
      'velocità di vendita SKU unità al giorno',
      'costo di mantenimento a magazzino',
      'costo del venduto COGS',
      'ciclo di conversione del circolante',
      'eliminare scorte morte',
      'lotto economico di riordino EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. La Gravità Finanziaria del Magazzino: Capitale Circolante vs Asset Bloccati' },
      { id: 'the-master-formula', title: '2. La Formula Maestra della Rotazione e Calcolo del Costo del Venduto (COGS)' },
      { id: 'days-sales-of-inventory', title: '3. Giorni di Giacenza Media (DSI) e Ciclo di Conversione del Circolante' },
      { id: 'sku-sales-velocity', title: '4. Velocità di Vendita per SKU: Unità/Giorno e Giorni di Copertura' },
      { id: 'carrying-cost-economics', title: '5. Costi di Mantenimento: Perché la Merce Ferma Perde il 25% all\'Anno' },
      { id: 'industry-benchmarks', title: '6. Benchmark di Rotazione nei 6 Principali Settori Retail' },
      { id: 'optimization-playbook', title: '7. Il Piano in 5 Fasi per Accelerare la Rotazione' },
      { id: 'safety-stock-eoq', title: '8. Scorta di Sicurezza Dinamica e Lotto Economico (EOQ)' },
      { id: 'inventory-360-implementation', title: '9. Analisi di Velocità in Tempo Reale in Inventory 360' },
    ],
    content: `
### 1. La Gravità Finanziaria del Magazzino: Capitale Circolante vs Asset Bloccati

Nel commercio la liquidità è fondamentale. Ogni euro bloccato in merce ferma sugli scaffali è denaro sottratto agli stipendi, al marketing o agli investimenti di sviluppo.

Le scorte hanno una natura peculiare: **sono un attivo che si trasforma in passivo più a lungo rimane immobile**.

Chi non monitora la rotazione delle scorte subisce la **Strozzatura del Capitale Circolante**:
* Scaffali pieni di prodotti ma conti correnti privi di liquidità.
* Denaro immobilizzato in articoli a bassa rotazione che richiedono svendite sottocosto.
* Rotture di stock sui prodotti più venduti per mancanza di fondi da destinare al riordino.

---

### 2. La Formula Maestra della Rotazione e Calcolo del Costo del Venduto (COGS)

$$\\text{Indice di Rotazione} = \\frac{\\text{Costo del Venduto (COGS)}}{\\text{Valore Medio delle Scorte al Costo}}$$

Dove:
$$\\text{COGS} = \\text{Rimanenze Iniziali} + \\text{Acquisti} - \\text{Rimanenze Finali}$$
$$\\text{Giacenza Media} = \\frac{\\text{Rimanenze Iniziali} + \\text{Rimanenze Finali}}{2}$$

> **Regola Contabile**: Usa sempre il **Costo del Venduto (COGS)** al numeratore e non il fatturato lordo, poiché il fatturato include il margine commerciale.

---

### 3. Giorni di Giacenza Media (DSI) e Ciclo di Conversione del Circolante

$$\\text{DSI (Giorni di Giacenza)} = \\frac{365}{\\text{Indice di Rotazione}} = \\left( \\frac{\\text{Giacenza Media}}{\\text{COGS}} \\right) \\times 365$$

Con un indice di rotazione di $4.28\\times$:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Giorni}$$

---

### 4. Velocità di Vendita per SKU: Unità/Giorno e Giorni di Copertura

| Codice SKU | Descrizione Articolo | Giacenza Attuale | Vendite 30 Giorni | Velocità Giornaliera | Giorni di Copertura | Stato |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Felpa Cotone Bio (Nero/L) | 120 pz | 180 pz | 6.0 pz / giorno | **20.0 Giorni** | ⚡ **Alta Velocità (Riordinare)** |
| **EL-405** | Caricatore USB-C 65W GaN | 85 pz | 45 pz | 1.5 pz / giorno | **56.6 Giorni** | 🟢 **Scorta Equilibrata e Sana** |
| **HM-902** | Lampada da Tavolo Ceramica | 40 pz | 4 pz | 0.13 pz / giorno | **307.7 Giorni** | 🔴 **Scorta Ferma / Capitale Bloccato** |

---

### 5. Costi di Mantenimento: Perché la Merce Ferma Perde il 25% all'Anno

Il costo totale di mantenimento a magazzino si attesta tra il **20% e il 32% all'anno** del valore delle scorte (costo del capitale 8-12%, affitti/spazi 4-7%, cali/furti 2-4%, obsolescenza 5-10%).

---

### 6. Benchmark di Rotazione nei 6 Principali Settori Retail

* **Supermercati & Alimentari**: 14.0x – 24.0x (15 – 26 giorni)
* **Abbigliamento & Moda**: 4.5x – 8.0x (45 – 81 giorni)
* **Elettronica di Consumo**: 6.0x – 10.0x (36 – 60 giorni)
* **Brico & Ferramenta**: 3.0x – 5.0x (73 – 120 giorni)
* **Cosmesi & Profumeria**: 5.0x – 8.0x (45 – 73 giorni)
* **Gioielleria & Lusso**: 1.2x – 2.5x (146 – 300 giorni)

---

### 7. Il Piano in 5 Fasi per Accelerare la Rotazione

1. **Analisi ABC** per concentrarsi sul 20% di articoli che produce l'80% delle vendite.
2. **Riduzione dei tempi di consegna fornitori** con ordini frequenti a lotti ridotti.
3. **Liquidazione mirata delle scorte ferme (+90 Giorni)** con offerte bundle alla cassa.
4. **Punti di riordino automatici (ROP)**.
5. **Trasferimenti di merce tra punti vendita** in tempo reale.

---

### 8. Analisi di Velocità in Tempo Reale in Inventory 360

[Inventory 360](https://www.inventory360.shop) gestisce automaticamente questi calcoli nel browser:
* Dashboard in tempo reale in **Report > Rotazione e Velocità**.
* Creazione ordini fornitori in 1 clic.
* Esportazione di report di valorizzazione in 11 lingue in formato CSV, Excel e PDF.
`
  },

  // Russian
  ru: {
    title: 'Полное Экспертное Руководство по Оборачиваемости Запасов и Скорости Продаж',
    excerpt: 'Исчерпывающий финансовый и операционный мастер-класс: расчет коэффициента оборачиваемости, дней оборота (DSI), скорости продаж SKU и высвобождение оборотного капитала.',
    category: 'Стратегия Запасов',
    keywords: [
      'коэффициент оборачиваемости запасов формула',
      'как рассчитать оборачиваемость склада',
      'дни оборота запасов DSI формула',
      'скорость продаж SKU штук в день',
      'затраты на хранение запасов процент',
      'себестоимость проданных товаров COGS',
      'финансовый цикл ритейл',
      'ликвидация неликвидов склада',
      'оптимальный размер заказа EOQ'
    ],
    tableOfContents: [
      { id: 'financial-gravity-of-inventory', title: '1. Финансовая Гравитация Запасов: Оборотный Капитал vs Замороженные Активы' },
      { id: 'the-master-formula', title: '2. Формула Оборачиваемости и Расчет Себестоимости Продаж (COGS)' },
      { id: 'days-sales-of-inventory', title: '3. Дни Оборота Запасов (DSI) и Финансовый Цикл' },
      { id: 'sku-sales-velocity', title: '4. Скорость Продаж по SKU: Штук в День и Дни Запаса' },
      { id: 'carrying-cost-economics', title: '5. Затраты на Хранение: Почему Зависший Товар Теряет 25% в Год' },
      { id: 'industry-benchmarks', title: '6. Мировые Бенчмарки Оборачиваемости в 6 Отраслях Ритейла' },
      { id: 'optimization-playbook', title: '7. План из 5 Шагов для Ускорения Оборачиваемости' },
      { id: 'safety-stock-eoq', title: '8. Динамический Страховой Запас и Формула EOQ' },
      { id: 'inventory-360-implementation', title: '9. Аналитика Скорости Запасов в Inventory 360' },
    ],
    content: `
### 1. Финансовая Гравитация Запасов: Оборотный Капитал vs Замороженные Активы

В торговом бизнесе наличные деньги — это кислород. Каждый рубль, замороженный в лежащем на складе товаре, недоступен для выплаты зарплат, маркетинга или закупки ходовых новинок.

Запасы обладают уникальным свойством: **это актив, который превращается в пассив тем быстрее, чем дольше он лежит без движения**.

Без контроля оборачиваемости ритейлеры сталкиваются с **кризисом оборотного капитала**:
* Полки забиты товаром, но на расчетном счете нет свободных денег.
* Капитал заблокирован в неликвидах, требующих глубоких скидок для сбыта.
* На ходовых товарах происходят регулярные обнуления остатков из-за нехватки бюджета на закупку.

---

### 2. Формула Оборачиваемости и Расчет Себестоимости Продаж (COGS)

$$\\text{Коэффициент Оборачиваемости} = \\frac{\\text{Себестоимость Проданных Товаров (COGS)}}{\\text{Средняя Стоимость Запасов по Себестоимости}}$$

Где:
$$\\text{COGS} = \\text{Начальный Остаток} + \\text{Покупки/Поступления} - \\text{Конечный Остаток}$$
$$\\text{Средний Запас} = \\frac{\\text{Начальный Остаток} + \\text{Конечный Остаток}}{2}$$

> **Главное Бухгалтерское Правило**: Всегда используйте в числителе **Себестоимость (COGS)**, а не выручку, чтобы исключить искажение торговой наценкой.

---

### 3. Дни Оборота Запасов (DSI) и Финансовый Цикл

$$\\text{DSI (Дни Оборота)} = \\frac{365}{\\text{Коэффициент Оборачиваемости}} = \\left( \\frac{\\text{Средний Запас}}{\\text{COGS}} \\right) \\times 365$$

При оборачиваемости $4.28\\times$:
$$\\text{DSI} = \\frac{365}{4.28} = 85.28 \\text{ Дней}$$

---

### 4. Скорость Продаж по SKU: Штук в День и Дни Запаса

$$\\text{Дневная Скорость Продаж} (V_d) = \\frac{\\sum \\text{Продано Единиц}}{\\text{Дней в Периоде}}$$
$$\\text{Остаток Дней Запаса} (D_s) = \\frac{\\text{Текущий Остаток на Складе}}{V_d}$$

| Артикул SKU | Наименование Товара | Остаток на Складе | Продажи за 30 Дней | Скорость в День | Дней Запаса | Статус |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AP-102** | Худи из Органического Хлопка (Черный/L) | 120 шт | 180 шт | 6.0 шт / день | **20.0 Дней** | ⚡ **Высокая Скорость (Срочный Дозаказ)** |
| **EL-405** | Зарядное Устройство 65W GaN | 85 шт | 45 шт | 1.5 шт / день | **56.6 Дней** | 🟢 **Здоровый Сбалансированный Запас** |
| **HM-902** | Настольная Лампа Керамика | 40 шт | 4 шт | 0.13 шт / день | **307.7 Дней** | 🔴 **Неликвид / Капитал Заблокирован** |

---

### 5. Затраты на Хранение: Почему Зависший Товар Теряет 25% в Год

Совокупная стоимость владения запасами составляет **20%–32% в год** от их стоимости (цена заморозки капитала 8-12%, аренда/коммуналка склада 4-7%, бой/кражи 2-4%, уценка/неликвид 5-10%).

---

### 6. Мировые Бенчмарки Оборачиваемости в 6 Отраслях Ритейла

* **Продукты Питания и Супермаркеты**: 14.0x – 24.0x (15 – 26 дней)
* **Одежда и Обувь**: 4.5x – 8.0x (45 – 81 день)
* **Потребительская Электроника**: 6.0x – 10.0x (36 – 60 дней)
* **Строительные Материалы и Крепеж**: 3.0x – 5.0x (73 – 120 дней)
* **Косметика и Парфюмерия**: 5.0x – 8.0x (45 – 73 дня)
* **Ювелирные Изделия и Люкс**: 1.2x – 2.5x (146 – 300 дней)

---

### 7. План из 5 Шагов для Ускорения Оборачиваемости

1. **ABC-Анализ**: Концентрация на 20% товаров, приносящих 80% прибыли.
2. **Сокращение плеча поставки**: Переход на еженедельные партии.
3. **Ликвидация неликвидов (+90 Дней)** через кассовые бандлы и скидки.
4. **Автоматический расчет точки заказа (ROP)**.
5. **Межфилиальное перемещение остатков** в реальном времени.

---

### 8. Аналитика Скорости Запасов в Inventory 360

[Inventory 360](https://www.inventory360.shop) автоматизирует эти расчеты в браузере:
* Мониторинг в разделе **Отчетность > Оборачиваемость и Скорость**.
* Создание заказов поставщикам в 1 клик.
* Экспорт отчетов об оценке склада на 11 языках в CSV, Excel и PDF.
`
  }
};

// Now read existing lib/blogI18n.ts and merge translations for post 2
const i18nPath = 'd:/Website Dev/Free Inventory/inventory360/lib/blogI18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const post2Str = `'inventory-turnover-ratio-stock-velocity-guide': ${JSON.stringify(translations_post2, null, 2)},\n`;

// Find markers
const startMarker = `'inventory-turnover-ratio-stock-velocity-guide':`;
const endMarker = `'barcode-label-printing-sku-system-guide':`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = code.slice(0, startIndex) + post2Str + '  ' + code.slice(endIndex);
  fs.writeFileSync(i18nPath, newCode, 'utf8');
  console.log('Successfully updated lib/blogI18n.ts with complete translations for post 2 across all 11 languages!');
} else {
  console.error('Could not locate markers in lib/blogI18n.ts for post 2. startIndex:', startIndex, 'endIndex:', endIndex);
}
