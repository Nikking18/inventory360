import fs from 'fs';

const blog6_translations = {
  es: {
    title: 'Enrutamiento de Inventario Multisede: Transferencias entre Tiendas, Almacenes Centrales y Reposición',
    excerpt: 'Manual operativo para dominar la logística minorista multisede: distribución Hub-and-Spoke vs. Punto a Punto, prevención de mermas en tránsito, cálculo de stock de seguridad por ubicación y reposición automática sin stock fantasma.',
    category: 'Operaciones y Normativa',
    keywords: [
      'gestión de inventario multisede',
      'protocolo transferencia de stock entre tiendas',
      'distribución almacén central hub and spoke',
      'seguimiento inventario en tránsito',
      'TPV retail multitienda',
      'enrutamiento reposición de stock almacén',
      'evitar stock fantasma en transferencias',
      'punto de pedido por ubicación ROP',
      'cross docking logística retail',
      'software inventario múltiples sucursales'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. La Crisis de Visibilidad Multisede y la Paradoja del Stock Fantasma' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Arquitectura de Distribución: Hub-and-Spoke vs. Punto a Punto' },
      { id: 'three-state-transfer-protocol', title: '3. El Protocolo de Transferencia en 3 Estados (Solicitado ➔ En Tránsito ➔ Recibido)' },
      { id: 'location-specific-rop-math', title: '4. Fórmulas Matemáticas de Punto de Pedido por Ubicación' },
      { id: 'cross-docking-operations', title: '5. Cross-Docking vs. Almacenamiento Tradicional: Reducción de 48h de Latencia' },
      { id: 'in-transit-shrinkage-sop', title: '6. Protocolo de Conciliación de Mermas y Discrepancias en Tránsito' },
      { id: 'multi-branch-valuation-tax', title: '7. Valoración Contable y Fiscal de Transferencias entre Sucursales' },
      { id: 'inventory-360-multi-location-setup', title: '8. Ejecución Multisede Paso a Paso en Inventory 360' }
    ],
    content: `
### 1. La Crisis de Visibilidad Multisede y la Paradoja del Stock Fantasma

Expandir un negocio minorista desde una única tienda física a múltiples sucursales (o incorporar un centro de distribución central) incrementa exponencialmente la vulnerabilidad operativa.

Sin un libro mayor contable unificado para todas las sedes, las empresas caen víctimas de la **Paradoja del Stock Fantasma**:

\`\`\`
[ Tienda Principal Centro ]   ➔ Rotura de stock en SKU-400 (Alto Tráfico, 0 Unidades Disponibles)
                                       │
                                (Punto Ciego de Bases de Datos Aisladas)
                                       │
[ Sucursal Comercial Periferia ] ➔ 140 Unidades de SKU-400 Inmóviles (Capital de Trabajo Atrapado)
                                       │
                                       ▼
                       [ Fallos Operativos Críticos ]
                ├── Pérdida de Ventas y Fuga de Clientes en la Tienda Principal
                ├── Órdenes de Compra Redundantes y Urgentes a Proveedores
                └── Mermas e Incidencias en Envíos al Transferir sin Trazabilidad
\`\`\`

Cuando un cliente en la Tienda A solicita una talla agotada, los cajeros con sistemas aislados no pueden saber si la Tienda B tiene existencias. Peor aún: coordinar transferencias por teléfono genera "unidades fantasma" que desaparecen de la contabilidad de la Tienda A días antes de que la Tienda B confirme su recepción.

---

### 2. Arquitectura de Distribución: Hub-and-Spoke vs. Punto a Punto

Las empresas minoristas deben definir reglas topológicas claras para el movimiento físico de mercancía entre ubicaciones:

\`\`\`
      [ TOPOLOGÍA HUB-AND-SPOKE (RADIAL) ]          [ TOPOLOGÍA PUNTO A PUNTO ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │ ALMACÉN CENTRAL / HUB  │                │ TIENDA A │◀────▶│ TIENDA B │
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │ TIENDA A │   │ TIENDA B │   │ TIENDA C │        │ TIENDA C │◀────▶│ TIENDA D │
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (Compras en Gran Volumen, Fletes Predecibles)  (Alta Fricción, Auditorías Caóticas)
\`\`\`

#### Matriz Comparativa de Topologías de Distribución:

| Métrica Operativa | Distribución Hub-and-Spoke (Centro-Radial) | Transferencias Punto a Punto |
| :--- | :--- | :--- |
| **Eficiencia de Fletes de Proveedor** | 🟢 Máxima (Descuentos por Camión Completo FTL) | 🔴 Baja (Envíos fraccionados LTL y paquetería cara) |
| **Espacio de Almacén en Tienda** | 🟢 Mínimo (Superficie de venta optimizada) | 🔴 Alto (Requiere sobrestock de seguridad por tienda) |
| **Precisión del Libro Contable** | 🟢 Alta (Único punto centralizado de entrada) | 🔴 Baja (Discrepancias frecuentes en traspasos) |
| **Coste Laboral por Unidad** | Bajo (Preparación consolidada por pallets) | Alto (Picking manual de unidades individuales) |
| **Etapa Comercial Recomendada** | A partir de 3 tiendas, cadenas regionales | 2 tiendas en proximidad geográfica (< 10 km) |

---

### 3. El Protocolo de Transferencia en 3 Estados (Solicitado ➔ En Tránsito ➔ Recibido)

Para preservar el balance contable inmutable, el inventario no puede desaparecer mágicamente de la Tienda A y aparecer en la Tienda B. Debe fluir a través de un **Estado de Custodia en 3 Fases**:

$$\\text{Inventario Total de la Red} = \\sum_{j=1}^{M} S_{\\text{Ubicación } j} + \\sum_{k=1}^{T} S_{\\text{En Tránsito } k}$$

\`\`\`
[ Estado 1: TRANSFERENCIA SOLICITADA / EN PICKING ]
   │  ➔ La tienda origen bloquea la cantidad ("RESERVADO_PARA_TRANSFERENCIA").
   ▼
[ Estado 2: EN TRÁNSITO (El Depósito de Custodia Digital) ]
   │  ➔ El stock se descuenta permanentemente del disponible en Origen.
   │  ➔ Pasa al registro de "EN_TRÁNSITO" con manifiesto de transporte y tracking.
   │  ➔ Ninguna de las tiendas puede vender estas unidades durante el viaje.
   ▼
[ Estado 3: INSPECCIÓN DE RECEPCIÓN Y CONFIRMACIÓN ]
   │  ➔ La tienda destino escanea los códigos de barras contra el albarán.
   │  ➔ Las unidades verificadas incrementan el stock en Destino; traspaso cerrado.
\`\`\`

#### Por Qué la Custodia Digital en Tránsito es Fundamental:
1. **Evita la Doble Venta**: Los cajeros de la tienda emisora no pueden vender por error artículos ya empaquetados en la furgoneta de transporte.
2. **Garantiza la Continuidad del Balance**: Los balances contables reflejan el valor exacto de las mercancías durante el transporte entre diferentes municipios o sedes fiscales.

---

### 4. Fórmulas Matemáticas de Punto de Pedido por Ubicación

Los puntos de pedido uniformes para todas las tiendas fracasan porque la velocidad de ventas y los plazos de transporte varían según la ubicación geográfica.

#### Fórmula de Punto de Pedido (ROP) Específico por Sucursal:

$$\\text{ROP}_{\\text{Sucursal } i} = (\\text{Venta Diaria Media}_{\\text{Sucursal } i} \\times \\text{Plazo de Entrega}_{\\text{Hub}\\to\\text{Sucursal } i}) + \\text{Stock de Seguridad}_{\\text{Sucursal } i}$$

#### Fórmula de Stock de Seguridad Estadístico por Sucursal:

$$\\text{Stock de Seguridad}_{\\text{Sucursal } i} = Z \\times \\sqrt{\\left(\\overline{L}_{i} \\times \\sigma_{D, i}^2\\right) + \\left(\\overline{D}_{i}^2 \\times \\sigma_{L, i}^2\\right)}$$

Donde:
* $Z$ = Factor de nivel de servicio ($1.65$ para $95\\%$ de disponibilidad en tienda).
* $\\overline{D}_{i}$ = Venta media diaria en unidades en la Sucursal $i$.
* $\\sigma_{D, i}$ = Desviación estándar de la demanda diaria en la Sucursal $i$.
* $\\overline{L}_{i}$ = Plazo medio de transporte desde el almacén central en días.
* $\\sigma_{L, i}$ = Desviación estándar del plazo de transporte.

#### Ejemplo Práctico Multisede:
Distribución del producto \`APP-SHT-01\` desde un Almacén Central a dos puntos de venta:

| Parámetro Operativo | Almacén Central (Hub) | Tienda Centro (Sucursal A) | Tienda Aeropuerto (Sucursal B) |
| :--- | :--- | :--- | :--- |
| **Velocidad Diaria ($\\overline{D}$)** | — | $14\\text{ unidades/día}$ | $4\\text{ unidades/día}$ |
| **Plazo de Reposición ($L$)** | $14\\text{ días (Proveedor)}$ | $2\\text{ días (Furgoneta interna)}$ | $4\\text{ días (Transporte seguro)}$ |
| **Stock de Seguridad Calculado** | $120\\text{ unidades}$ | $22\\text{ unidades}$ | $10\\text{ unidades}$ |
| **Punto de Pedido (ROP)** | **$260\\text{ Unidades}$** | **$(14 \\times 2) + 22 = 50\\text{ Uds}$** | **$(4 \\times 4) + 10 = 26\\text{ Uds}$** |

---

### 5. Cross-Docking vs. Almacenamiento Tradicional: Reducción de 48h de Latencia

En el almacenamiento tradicional, las mercancías recibidas se desempaquetan, se colocan en estanterías altas y luego se bajan para preparar los envíos a las tiendas.

En el **Cross-Docking**, los pallets recibidos de fábrica se desglosan directamente en el muelle de descarga y se cargan de inmediato en las furgonetas de reparto a tiendas:

\`\`\`
[ Camión del Proveedor ] ➔ [ Muelle de Descarga ] ➔ [ Desglose Directo por Tienda ]
                                                            │
                         ┌──────────────────────────────────┼──────────────────────────────────┐
                         ▼                                  ▼                                  ▼
               [ Furgoneta a Tienda A ]           [ Furgoneta a Tienda B ]           [ Furgoneta a Tienda C ]
               (0 Horas en Estantería)            (0 Horas en Estantería)            (0 Horas en Estantería)
\`\`\`

* **Reduce los Costes Laborales de Almacén un 35%**: Elimina tareas de ubicación y extracción posterior.
* **Acelera la Llegada a Tienda de 24 a 48 Horas**: Los nuevos productos se ponen a la venta días antes que la competencia.

---

### 6. Protocolo de Conciliación de Mermas y Discrepancias en Tránsito

Si la Tienda A envía 20 unidades de una tablet y la Tienda B solo encuentra 18 unidades al abrir la caja, ¿cómo se concilia el descuadre?

#### Procedimiento Normalizado de Trabajo (PNT) en 3 Pasos:
1. **Recepción a Ciegas**: El personal de la Tienda B debe escanear cada código de barras físico sin ver la cantidad esperada en pantalla.
2. **Alerta Automática de Discrepancia**: Si el conteo físico $\\neq$ cantidad del manifiesto, el traspaso pasa a estado \`AUDITORIA_DISCREPANCIA\`.
3. **Resolución de la Incidencia**:
   * Si hubo daños en el transporte: Se tramita reclamación al seguro de la agencia de mensajería.
   * Si hubo error de conteo en origen: Se ajusta el libro contable de la Tienda A con nota de auditoría.
   * Ninguna tienda puede cerrar el documento sin la firma digital del Responsable de Operaciones.

---

### 7. Valoración Contable y Fiscal de Transferencias entre Sucursales

1. **Consistencia en la Valoración de Costes**: Las transferencias deben conservar el coste base original (FIFO o Coste Medio Ponderado) y no el precio de venta al público para evitar generar ingresos imponibles ficticios.
2. **Imputación de Portes Internos**: Los costes del transporte logístico propio deben contabilizarse como gastos operativos (\`OPEX - Logística Interna\`) y no inflar el valor de activo del producto individual.

---

### 8. Ejecución Multisede Paso a Paso en Inventory 360

[Inventory 360](https://www.inventory360.shop) unifica la gestión multisede en el navegador con total privacidad:

1. **Defina Múltiples Sucursales**: En **Configuración > Ubicaciones**, cree su almacén central, tiendas insignia y puntos de venta con códigos únicos.
2. **Gestione Transferencias entre Tiendas**: En **Transferencias**, seleccione origen y destino, añada artículos y genere albaranes oficiales de transporte listos para imprimir.
3. **Consulta de Stock Cruzado en Tiempo Real**: Desde el terminal **Venta (TPV)**, los cajeros pueden buscar cualquier SKU y ver al instante las existencias disponibles en todas las demás tiendas.
4. **Informes Consolidados Multilingües**: Exporte valoraciones de inventario e historiales de traspasos en CSV, Excel o PDF en 11 idiomas con seguridad 100% offline.
`
  },

  fr: {
    title: 'Routage des Stocks Multi-Sites : Gestion des Transferts Inter-Magasins, Entrepôts Centraux et Réapprovisionnement',
    excerpt: 'Guide opérationnel complet de logistique multi-sites : distribution Hub-and-Spoke vs. Point-à-Point, élimination des pertes en transit, calcul des stocks de sécurité par point de vente et réassort automatisé sans stock fantôme.',
    category: 'Opérations & Conformité',
    keywords: [
      'gestion de stock multi sites',
      'procédure transfert de stock entre magasins',
      'distribution entrepôt central hub and spoke',
      'suivi stock en transit',
      'logiciel caisse multi magasins',
      'routage réapprovisionnement entrepôt',
      'éviter stock fantôme transferts',
      'point de commande par magasin ROP',
      'cross docking logistique distribution',
      'gestion inventaire multi succursales'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. Crise de Visibilité Multi-Sites et Paradoxe du Stock Fantôme' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Topologie de Distribution : Hub-and-Spoke vs. Point-à-Point' },
      { id: 'three-state-transfer-protocol', title: '3. Le Protocole de Transfert en 3 États (Demandé ➔ En Transit ➔ Réceptionné)' },
      { id: 'location-specific-rop-math', title: '4. Calcul Mathématique du Point de Commande par Emplacement' },
      { id: 'cross-docking-operations', title: '5. Cross-Docking vs. Stockage Traditionnel : 48h de Latence Économisées' },
      { id: 'in-transit-shrinkage-sop', title: '6. Procédure de Réconciliation des Écarts et Pertes en Transit' },
      { id: 'multi-branch-valuation-tax', title: '7. Valorisation Comptable et Fiscale des Transferts Inter-Boutiques' },
      { id: 'inventory-360-multi-location-setup', title: '8. Gestion Multi-Sites Pas à Pas dans Inventory 360' }
    ],
    content: `
### 1. Crise de Visibilité Multi-Sites et Paradoxe du Stock Fantôme

Passer d'une boutique unique à un réseau de points de vente physiques (avec ou sans entrepôt central) démultiplie les risques opérationnels.

Sans grand livre unifié en temps réel, les réseaux subissent le **Paradoxe du Stock Fantôme** :

\`\`\`
[ Boutique Centre-Ville ]   ➔ Rupture sur SKU-400 (Forte Affluence, 0 Unité Disponible)
                                     │
                             (Point Aveugle de Systèmes Déconnectés)
                                     │
[ Boutique Périphérie ]     ➔ 140 Unités de SKU-400 Dormantes (Trésorerie Immobilisée)
                                     │
                                     ▼
                     [ Défaillances Opérationnelles Majeures ]
              ├── Ventes Perdues et Clients Mécontents en Centre-Ville
              ├── Commandes Fournisseurs Urgentes et Redondantes
              └── Pertes Inexpliquées lors des Transferts Non Tracés
\`\`\`

Lorsqu'un client demande une taille en rupture au Magasin A, le vendeur ne peut pas vérifier si le Magasin B en possède. Pire, les transferts gérés par téléphone créent des « stocks fantômes » disparus du Magasin A des jours avant leur validation au Magasin B.

---

### 2. Topologie de Distribution : Hub-and-Spoke vs. Point-à-Point

\`\`\`
      [ TOPOLOGIE HUB-AND-SPOKE (RADIALE) ]          [ TOPOLOGIE POINT-À-POINT ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │ ENTREPÔT CENTRAL / HUB │                │ MAGASIN A│◀────▶│ MAGASIN B│
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │ MAGASIN A│   │ MAGASIN B│   │ MAGASIN C│        │ MAGASIN C│◀────▶│ MAGASIN D│
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (Achats Groupés, Frais de Port Optimisés)      (Frictions Multiples, Audits Chaotiques)
\`\`\`

#### Matrice Comparative des Topologies :

| Critère Logistique | Modèle Hub-and-Spoke (Centre-Radial) | Transferts Point-à-Point |
| :--- | :--- | :--- |
| **Tarifs Fournisseurs** | 🟢 Optimaux (Remises sur camions complets FTL) | 🔴 Faibles (Petites expéditions fragmentées) |
| **Emprise de Réserve en Magasin** | 🟢 Minimale (Surfaces de vente maximisées) | 🔴 Élevée (Surstocks de sécurité par boutique) |
| **Précision des Stocks** | 🟢 Maximale (Point de contrôle unique audité) | 🔴 Faible (Écarts fréquents en transit) |
| **Coût de Main-d'Œuvre / Unité** | Faible (Préparation groupée par palettes) | Élevé (Picking unitaire individuel) |
| **Stade d'Entreprise Adapté** | Réseaux de 3 magasins et plus | 2 magasins proches (< 10 km) |

---

### 3. Le Protocole de Transfert en 3 États (Demandé ➔ En Transit ➔ Réceptionné)

$$\\text{Inventaire Global du Réseau} = \\sum_{j=1}^{M} S_{\\text{Magasin } j} + \\sum_{k=1}^{T} S_{\\text{En Transit } k}$$

\`\`\`
[ État 1 : TRANSFERT DEMANDÉ / EN PRÉPARATION ]
   │  ➔ Le magasin source réserve la quantité ("RÉSERVÉ_TRANSFERT").
   ▼
[ État 2 : EN TRANSIT (Séquestre Numérique) ]
   │  ➔ Déduit définitivement du stock disponible Source.
   │  ➔ Transféré au registre "EN_TRANSIT" avec bordereau transporteur.
   │  ➔ Aucune boutique ne peut vendre ces unités pendant le transport.
   ▼
[ État 3 : CONTRÔLE DE RÉCEPTION & VALIDATION ]
   │  ➔ Le magasin destinataire scanne les codes-barres physiques.
   │  ➔ Les unités vérifiées augmentent le stock Destinataire ; transfert clos.
\`\`\`

---

### 4. Calcul Mathématique du Point de Commande par Emplacement

$$\\text{ROP}_{\\text{Magasin } i} = (\\text{Ventes Quotidiennes Moyennes}_{\\text{Magasin } i} \\times \\text{Délai d'Acheminement}) + \\text{Stock de Sécurité}_{\\text{Magasin } i}$$

$$\\text{Stock de Sécurité}_{\\text{Magasin } i} = Z \\times \\sqrt{\\left(\\overline{L}_{i} \\times \\sigma_{D, i}^2\\right) + \\left(\\overline{D}_{i}^2 \\times \\sigma_{L, i}^2\\right)}$$

#### Exemple Chiffré Multi-Sites :

| Paramètre | Entrepôt Central (Hub) | Magasin Centre-Ville (A) | Magasin Aéroport (B) |
| :--- | :--- | :--- | :--- |
| **Vélocité Journalière ($\\overline{D}$)** | — | $14\\text{ unités/jour}$ | $4\\text{ unités/jour}$ |
| **Délai d'Approvisionnement ($L$)** | $14\\text{ jours (Fournisseur)}$ | $2\\text{ jours (Navette interne)}$ | $4\\text{ jours (Transport sécurisé)}$ |
| **Stock de Sécurité Calculé** | $120\\text{ unités}$ | $22\\text{ unités}$ | $10\\text{ unités}$ |
| **Point de Commande (ROP)** | **$260\\text{ Unités}$** | **$(14 \\times 2) + 22 = 50\\text{ Uds}$** | **$(4 \\times 4) + 10 = 26\\text{ Uds}$** |

---

### 5. Cross-Docking vs. Stockage Traditionnel : 48h de Latence Économisées

\`\`\`
[ Camion Fournisseur ] ➔ [ Quai de Déchargement ] ➔ [ Tri Immédiat par Destination ]
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        ▼                                ▼                                ▼
             [ Navette Magasin A ]            [ Navette Magasin B ]            [ Navette Magasin C ]
             (Zéro Mise en Rayon)             (Zéro Mise en Rayon)             (Zéro Mise en Rayon)
\`\`\`

* **Réduction de 35% des Coûts de Manutention**.
* **Accélération de la Mise en Vente de 24h à 48h**.

---

### 6. Procédure de Réconciliation des Écarts et Pertes en Transit

1. **Réception à l'Aveugle** : Scan physique unitaire sans affichage préalable des quantités attendues.
2. **Alerte Automatique d'Écart** : Passage automatique en statut \`AUDIT_ÉCART\`.
3. **Arbitrage et Traitement** : Recours transporteur ou régularisation avec signature obligatoire du Responsable des Opérations.

---

### 7. Valorisation Comptable et Fiscale des Transferts Inter-Boutiques

* **Maintien du Coût d'Origine** : Les transferts conservent le coût d'achat (FIFO/PMP) pour ne pas générer de marge artificielle imposable.
* **Frais de Transport Internes** : Comptabilisés en charges d'exploitation (\`OPEX\`).

---

### 8. Gestion Multi-Sites Pas à Pas dans Inventory 360

[Inventory 360](https://www.inventory360.shop) propose une gestion multi-sites complète :

1. **Création des Emplacements** dans **Paramètres > Emplacements** (Hubs, boutiques, corners).
2. **Édition des Bons de Transfert** dans le module **Transferts** avec bordereaux imprimables.
3. **Visibilité du Stock Réseau en Caisse (POS)** : Consultation en temps réel du stock des autres magasins.
4. **Rapports d'Audit Consolidés** : Téléchargement en CSV, Excel et PDF en 11 langues.
`
  },

  de: {
    title: 'Filialübergreifendes Bestandsrouting: Umlagerungen, Zentrallager & Filialnachschub',
    excerpt: 'Praxisleitfaden für Multi-Location-Handelslogistik: Hub-and-Spoke vs. Point-to-Point Distribution, Vermeidung von Transitschwund, standortspezifische Sicherheitsbestände und automatisierter Filialnachschub ohne Geisterbestände.',
    category: 'Betrieb & Compliance',
    keywords: [
      'Multi-Location Bestandsverwaltung',
      'Filialumlagerung Ablauf Warenwirtschaft',
      'Zentrallager Hub and Spoke Distribution',
      'Schwundvermeidung Transitbestand',
      'Filialkasse Kassennetzwerk POS',
      'Nachschubsteuerung Filialen',
      'Geisterbestände Umlagerung verhindern',
      'Meldebestand Standort ROP Formel',
      'Cross Docking Einzelhandel Logistik',
      'Filialübergreifende Warenwirtschaft'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. Das Multi-Standort-Sichtbarkeitsproblem & Geisterbestände' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Distributionsarchitektur: Hub-and-Spoke vs. Point-to-Point' },
      { id: 'three-state-transfer-protocol', title: '3. Das 3-Stufen-Umlagerungsprotokoll (Angefordert ➔ In Transit ➔ Empfangen)' },
      { id: 'location-specific-rop-math', title: '4. Mathematische Meldebestände nach Standort' },
      { id: 'cross-docking-operations', title: '5. Cross-Docking vs. Einlagerung: 48 Stunden Zeitersparnis' },
      { id: 'in-transit-shrinkage-sop', title: '6. SOP zur Klärung von Transitschwund und Differenzen' },
      { id: 'multi-branch-valuation-tax', title: '7. Bewertung & steuerliche Buchung von Filialumlagerungen' },
      { id: 'inventory-360-multi-location-setup', title: '8. Multi-Standort-Verwaltung in Inventory 360' }
    ],
    content: `
### 1. Das Multi-Standort-Sichtbarkeitsproblem & Geisterbestände

Die Expansion von einer Einzelverkaufsstelle zu einem Netzwerk aus mehreren Filialen oder die Einführung eines Zentrallagers vervielfacht operative Fehlerrisiken.

Ohne ein einheitliches Hauptbuch geraten Händler in das **Geisterbestands-Paradoxon**:

\`\`\`
[ Flagship-Store Innenstadt ] ➔ Ausverkauft bei SKU-400 (Hohe Kundenfrequenz, 0 Stk verfügbar)
                                     │
                           (Blindflug getrennter Datenbanken)
                                     │
[ Outlet-Filiale Vorort ]     ➔ 140 Stk SKU-400 liegen unverkauft im Regal (Totes Kapital)
                                     │
                                     ▼
                     [ Kritische operative Ausfälle ]
              ├── Umsatzverlust & abwandernde Kunden im Flagship-Store
              ├── Überflüssige Notbestellungen beim Vorlieferanten
              └── Schwund & Differenzen bei ungetrackten Umlagerungen
\`\`\`

---

### 2. Distributionsarchitektur: Hub-and-Spoke vs. Point-to-Point

\`\`\`
      [ HUB-AND-SPOKE TOPOLOGIE (ZENTRAL) ]          [ POINT-TO-POINT TOPOLOGIE ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │    ZENTRALLAGER / HUB  │                │ FILIALE A│◀────▶│ FILIALE B│
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │ FILIALE A│   │ FILIALE B│   │ FILIALE C│        │ FILIALE C│◀────▶│ FILIALE D│
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (Großkundenrabatte, planbare Logistik)          (Hohe Reibungsverluste, fehleranfällig)
\`\`\`

#### Topologie-Vergleichsmatrix:

| Kriterium | Hub-and-Spoke (Zentrallager) | Point-to-Point (Filial-Direkt) |
| :--- | :--- | :--- |
| **Frachteffizienz Lieferanten** | 🟢 Maximal (Rabatte für Komplettladungen FTL) | 🔴 Niedrig (Teilladungen, hohe Paketkosten) |
| **Lagerfläche in der Filiale** | 🟢 Minimal (Fokus auf Verkaufsfläche) | 🔴 Hoch (Hohe Sicherheitspuffer pro Filiale) |
| **Buchungsgenauigkeit** | 🟢 Hoch (Einheitlicher Erfassungsort) | 🔴 Niedrig (Häufige Buchungsdifferenzen) |
| **Personalaufwand pro Einheit** | Niedrig (Palettenbasierte Kommissionierung) | Hoch (Manuelle Einzelentnahme) |
| **Optimale Unternehmensgröße** | Ab 3 Filialen, Ketten & Franchise | 2 Filialen in direkter Nähe (< 10 km) |

---

### 3. Das 3-Stufen-Umlagerungsprotokoll (Angefordert ➔ In Transit ➔ Empfangen)

$$\\text{Gesamtbestand im Netzwerk} = \\sum_{j=1}^{M} S_{\\text{Standort } j} + \\sum_{k=1}^{T} S_{\\text{In Transit } k}$$

\`\`\`
[ Stufe 1: UMLAGERUNG ANGEFORDERT / GEPICKT ]
   │  ➔ Quell-Standort sperrt die Menge ("FÜR_UMLAGERUNG_RESERVIERT").
   ▼
[ Stufe 2: IN TRANSIT (Digitales Treuhandkonto) ]
   │  ➔ Bestand wird am Quell-Standort abgebucht.
   │  ➔ Verbuchung auf dem Transitkonto mit Frachtbegleitdokument.
   │  ➔ Keine Filiale kann diese Ware während des Transports verkaufen.
   ▼
[ Stufe 3: WARENEINGANGSPRÜFUNG & EINBUCHUNG ]
   │  ➔ Empfängerfiliale scannt Barcodes gegen den Lieferschein.
   │  ➔ Geprüfte Ware erhöht den Bestand der Zielfiliale; Vorgang abgeschlossen.
\`\`\`

---

### 4. Mathematische Meldebestände nach Standort

$$\\text{ROP}_{\\text{Filiale } i} = (\\text{Tagesbedarf}_{\\text{Filiale } i} \\times \\text{Umlagerungszeit}) + \\text{Sicherheitsbestand}_{\\text{Filiale } i}$$

$$\\text{Sicherheitsbestand}_{\\text{Filiale } i} = Z \\times \\sqrt{\\left(\\overline{L}_{i} \\times \\sigma_{D, i}^2\\right) + \\left(\\overline{D}_{i}^2 \\times \\sigma_{L, i}^2\\right)}$$

#### Rechenbeispiel:

| Parameter | Zentrallager (Hub) | Filiale Innenstadt (A) | Filiale Flughafen (B) |
| :--- | :--- | :--- | :--- |
| **Tagesnachfrage ($\\overline{D}$)** | — | $14\\text{ Stk/Tag}$ | $4\\text{ Stk/Tag}$ |
| **Wiederbeschaffungszeit ($L$)** | $14\\text{ Tage (Hersteller)}$ | $2\\text{ Tage (Eigener Transporter)}$ | $4\\text{ Tage (Sicherheitstransport)}$ |
| **Sicherheitsbestand ($SS$)** | $120\\text{ Stk}$ | $22\\text{ Stk}$ | $10\\text{ Stk}$ |
| **Meldebestand (ROP)** | **$260\\text{ Stück}$** | **$(14 \\times 2) + 22 = 50\\text{ Stk}$** | **$(4 \\times 4) + 10 = 26\\text{ Stk}$** |

---

### 5. Cross-Docking vs. Einlagerung: 48 Stunden Zeitersparnis

* **35% weniger Handling- und Personalkosten** durch Wegfall von Einlagerung und erneuter Auslagerung.
* **24 bis 48 Stunden schnellerer Verkaufsstart** in den Filialen.

---

### 6. SOP zur Klärung von Transitschwund und Differenzen

1. **Blind-Wareneingang**: Scannen der physischen Packstücke ohne vorherige Anzeige der Soll-Menge.
2. **Automatische Differenzmeldung**: Bei Abweichungen wechselt der Beleg auf \`DIFFERENZ_AUDIT\`.
3. **Untersuchung & Klärung**: Schadensmeldung an Transportdienstleister oder Korrekturbuchung mit Manager-Freigabe.

---

### 7. Bewertung & steuerliche Buchung von Filialumlagerungen

* **Beibehaltung der Einstandspreise (FIFO/Gleitender Durchschnitt)** zur Vermeidung fiktiver steuerpflichtiger Zwischengewinne.
* **Interne Frachtkosten** werden als Betriebsaufwand (\`OPEX\`) erfasst.

---

### 8. Multi-Standort-Verwaltung in Inventory 360

[Inventory 360](https://www.inventory360.shop) vereinfacht Multi-Standort-Abläufe:

1. **Standorte anlegen** unter **Einstellungen > Standorte**.
2. **Umlagerungsbelege mit 1 Klick erstellen** inklusive druckfähiger Lieferscheine.
3. **Echtzeit-Filialabfrage an der Kasse (POS)** zur sofortigen Auskunft über Bestände in Nachbarfilialen.
4. **Mehrsprachige konsolidierte Berichte** als CSV, Excel und PDF in 11 Sprachen.
`
  },

  hi: {
    title: 'मल्टी-लोकेशन इन्वेंटरी रूटिंग: शाखाओं के बीच ट्रांसफर, सेंट्रल वेयरहाउस और ऑटो-रीऑर्डरिंग',
    excerpt: 'मल्टी-स्टोर रिटेल लॉजिस्टिक्स की संपूर्ण गाइड: हब-एंड-स्पोक बनाम पॉइंट-टू-पॉइंट वितरण, ट्रांजिट में होने वाले नुकसान की रोकथाम, स्थान-विशिष्ट सेफ्टी स्टॉक और बिना किसी गड़बड़ी के शाखाओं की री-स्टॉकिंग।',
    category: 'परिचालन और अनुपालन',
    keywords: [
      'मल्टी लोकेशन इन्वेंटरी मैनेजमेंट',
      'स्टोर के बीच स्टॉक ट्रांसफर प्रक्रिया',
      'हब एंड स्पोक वेयरहाउस डिस्ट्रीब्यूशन',
      'ट्रांजिट में इन्वेंटरी ट्रैकिंग',
      'मल्टी ब्रांच रिटेल पीओएस',
      'वेयरहाउस स्टॉक पुनःपूर्ति रूटिंग',
      'ट्रांसफर में स्टॉक गड़बड़ी रोकना',
      'स्थान आधारित रीऑर्डर पॉइंट ROP',
      'क्रॉस डॉकिंग रिटेल लॉजिस्टिक्स',
      'मल्टी आउटलेट इन्वेंटरी सॉफ्टवेयर'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. मल्टी-लोकेशन दृश्यता संकट और फैंटम स्टॉक की समस्या' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. वितरण संरचना: हब-एंड-स्पोक बनाम पॉइंट-टू-पॉइंट' },
      { id: 'three-state-transfer-protocol', title: '3. 3-चरणीय इंटर-ब्रांच ट्रांसफर प्रोटोकॉल (अनुरोध ➔ ट्रांजिट ➔ प्राप्त)' },
      { id: 'location-specific-rop-math', title: '4. शाखा-वार रीऑर्डर पॉइंट (ROP) का गणितीय फॉर्मूला' },
      { id: 'cross-docking-operations', title: '5. क्रॉस-डॉकिंग बनाम पारंपरिक भंडारण: 48 घंटे की बचत' },
      { id: 'in-transit-shrinkage-sop', title: '6. ट्रांजिट में माल के नुकसान और विसंगति समाधान की SOP' },
      { id: 'multi-branch-valuation-tax', title: '7. मल्टी-ब्रांच मूल्यांकन और ट्रांसफर अकाउंटिंग' },
      { id: 'inventory-360-multi-location-setup', title: '8. Inventory 360 में मल्टी-लोकेशन संचालन' }
    ],
    content: `
### 1. मल्टी-लोकेशन दृश्यता संकट और फैंटम स्टॉक की समस्या

जब एक स्टोर से बढ़कर कई शाखाएं या केंद्रीय गोदाम बनाया जाता है, तो परिचालन की चुनौतियां कई गुना बढ़ जाती हैं।

केंद्रीय लेज़र के अभाव में व्यापारी **फैंटम स्टॉक की समस्या** में फंस जाते हैं:

\`\`\`
[ मुख्य बाज़ार शाखा ]     ➔ SKU-400 आउट-ऑफ-स्टॉक (भारी मांग, 0 यूनिट उपलब्ध)
                                    │
                        (अलग-अलग डेटाबेस का अंधा मोड़)
                                    │
[ बाहरी उपनगरीय शाखा ]   ➔ SKU-400 के 140 पीस रखे हुए हैं (फंसी हुई पूंजी)
                                    │
                                    ▼
                     [ गंभीर परिचालन विफलताएं ]
              ├── मुख्य स्टोर पर बिक्री का नुकसान और ग्राहक निराशा
              ├── सप्लायर को अनावश्यक आपातकालीन खरीद ऑर्डर
              └── बिना ट्रैकिंग के ट्रांसफर करने पर माल की चोरी व नुकसान
\`\`\`

---

### 2. वितरण संरचना: हब-एंड-स्पोक बनाम पॉइंट-टू-पॉइंट

\`\`\`
      [ हब-एंड-स्पोक संरचना (केंद्रीय) ]             [ पॉइंट-टू-पॉइंट संरचना ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │   सेंट्रल वेयरहाउस / HUB│                │  स्टोर A │◀────▶│  स्टोर B │
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │  स्टोर A │   │  स्टोर B │   │  स्टोर C │        │  स्टोर C │◀────▶│  स्टोर D │
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (थोक खरीद पर भारी छूट, सुरक्षित माल)          (अत्यधिक उलझन, ऑडिट में भारी विसंगति)
\`\`\`

---

### 3. 3-चरणीय इंटर-ब्रांच ट्रांसफर प्रोटोकॉल (अनुरोध ➔ ट्रांजिट ➔ प्राप्त)

$$\\text{कुल नेटवर्क स्टॉक} = \\sum_{j=1}^{M} S_{\\text{शाखा } j} + \\sum_{k=1}^{T} S_{\\text{ट्रांजिट में } k}$$

\`\`\`
[ चरण 1: ट्रांसफर अनुरोध / पिकिंग ]
   │  ➔ स्रोत शाखा स्टॉक लॉक करती है ("ट्रांसफर हेतु आरक्षित")।
   ▼
[ चरण 2: ट्रांजिट में (डिजिटल एस्क्रो) ]
   │  ➔ स्रोत शाखा के खाते से माल स्थायी रूप से घटता है।
   │  ➔ गाड़ी के ट्रैकिंग नंबर के साथ "ट्रांजिट खाते" में दर्ज होता है।
   │  ➔ रास्ते के दौरान कोई भी स्टोर इसे बेच नहीं सकता।
   ▼
[ चरण 3: माल प्राप्ति और बारकोड मिलान ]
   │  ➔ गंतव्य शाखा बारकोड स्कैन करके मिलान करती है।
   │  ➔ सही माल गंतव्य स्टॉक में जुड़ जाता है; ट्रांसफर बंद।
\`\`\`

---

### 4. शाखा-वार रीऑर्डर पॉइंट (ROP) का गणितीय फॉर्मूला

$$\\text{ROP}_{\\text{शाखा } i} = (\\text{दैनिक औसत मांग}_{\\text{शाखा } i} \\times \\text{ट्रांसफर दिन}) + \\text{सेफ्टी स्टॉक}_{\\text{शाखा } i}$$

#### उदाहरण:
* **सेंट्रल वेयरहाउस**: ROP = **260 यूनिट**
* **सिटी स्टोर (शाखा A)**: $(14 \\times 2) + 22 =$ **50 यूनिट**
* **एयरपोर्ट स्टोर (शाखा B)**: $(4 \\times 4) + 10 =$ **26 यूनिट**

---

### 5. क्रॉस-डॉकिंग बनाम पारंपरिक भंडारण: 48 घंटे की बचत

* **गोदाम मजदूरी में 35% की कमी**।
* **दुकान तक माल पहुँचने में 24 से 48 घंटे की तेज़ी**।

---

### 6. ट्रांजिट में माल के नुकसान और विसंगति समाधान की SOP

1. **ब्लाइंड स्कैनिंग**: बिना स्क्रीन पर संख्या देखे बारकोड स्कैन करना।
2. **विसंगति फ्लैग**: गिनती न मिलने पर स्वतः \`AUDIT_DISCREPANCY\` में जाना।
3. **अंतिम समाधान**: ऑपरेशंस मैनेजर के डिजिटल हस्ताक्षर के बाद ही ट्रांसफर पूर्ण होना।

---

### 7. मल्टी-ब्रांच मूल्यांकन और ट्रांसफर अकाउंटिंग

* माल का ट्रांसफर खरीद लागत मूल्य (FIFO/औसत लागत) पर ही दर्ज करें ताकि नकली कर योग्य लाभ न बने।
* आंतरिक परिवहन खर्च को \`OPEX\` (परिचालन व्यय) में दर्ज करें।

---

### 8. Inventory 360 में मल्टी-लोकेशन संचालन

[Inventory 360](https://www.inventory360.shop) संपूर्ण समाधान देता है:
1. **शाखाएं जोड़ें**: **Settings > Locations** में वेयरहाउस और स्टोर बनाएं।
2. **1-क्लिक स्टॉक ट्रांसफर**: चालान और पैकिंग स्लिप प्रिंट करें।
3. **पीओएस पर अन्य शाखाओं का लाइव स्टॉक देखें**।
4. **11 भाषाओं में बहुभाषी ऑडिट रिपोर्ट** (CSV, Excel, PDF)।
`
  },

  ja: {
    title: 'マルチロケーション在庫ルーティング：店舗間移動・中央倉庫・拠点間自動補充の実践設計',
    excerpt: 'ハブ＆スポーク vs ポイント・ツー・ポイント物流モデル、輸送中ロス（イン・トランジット・リーケージ）の防止、拠点別安全在庫の数理モデル、幽霊在庫を生まない店舗間補充の完全運用マニュアル。',
    category: '業務運用＆コンプライアンス',
    keywords: [
      '複数拠点 在庫管理 システム',
      '店舗間 在庫移動 手順',
      'ハブアンドスポーク 物流 倉庫',
      '輸送中 在庫追跡 トランジット',
      '多店舗 POS レジ 連動',
      '倉庫 店舗 補充 ルーティング',
      '幽霊在庫 移動トラブル 防止',
      '拠点別 発注点 ROP 計算式',
      'クロスドッキング 小売 物流',
      '多店舗 在庫管理 ソフトウェア'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. 複数拠点における可視性危機と「幽霊在庫」のパラドックス' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. 物流トポロジー比較：ハブ＆スポーク vs. ポイント・ツー・ポイント' },
      { id: 'three-state-transfer-protocol', title: '3. 3段階の店舗間移動プロトコル（依頼 ➔ 輸送中 ➔ 検品受領）' },
      { id: 'location-specific-rop-math', title: '4. 拠点別の動的発注点（ROP）と安全在庫の数理計算' },
      { id: 'cross-docking-operations', title: '5. クロスドッキング運用：滞留時間を48時間短縮する手法' },
      { id: 'in-transit-shrinkage-sop', title: '6. 輸送中ロス・数量不一致を即時解消する標準業務手順（SOP）' },
      { id: 'multi-branch-valuation-tax', title: '7. 拠点間移動の原価評価と会計・税務上の注意点' },
      { id: 'inventory-360-multi-location-setup', title: '8. Inventory 360での多拠点管理ステップ' }
    ],
    content: `
### 1. 複数拠点における可視性危機と「幽霊在庫」のパラドックス

単一店舗から複数店舗への展開や中央倉庫の導入は、在庫管理の複雑性を急激に増大させます。

全拠点でリアルタイムに同期された元帳がない場合、事業者は**幽霊在庫（ファントムストック）の罠**に陥ります：

\`\`\`
[ 旗艦店（駅前・中心街） ] ➔ SKU-400が欠品中（客数多数・売上機会損失）
                                    │
                          (店舗間DBの断絶・不可視)
                                    │
[ 郊外店舗 / アウトレット ] ➔ SKU-400が140点も滞留・放置（資金固定化）
                                    │
                                    ▼
                         [ 致命的な業務トラブル ]
                  ├── 旗艦店での売上損失と顧客離脱
                  ├── メーカーへの重複・緊急発注による資金圧迫
                  └── 電話依頼による移動中の紛失・数量差異
\`\`\`

---

### 2. 物流トポロジー比較：ハブ＆スポーク vs. ポイント・ツー・ポイント

\`\`\`
      [ ハブ＆スポーク（中央集約型） ]                 [ ポイント・ツー・ポイント（分散型） ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │    中央倉庫 / HUB      │                │  店舗 A  │◀────▶│  店舗 B  │
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │  店舗 A  │   │  店舗 B  │   │  店舗 C  │        │  店舗 C  │◀────▶│  店舗 D  │
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (大口仕入割引・計画的配送)                      (店舗間摩擦大・在庫管理の破綻)
\`\`\`

---

### 3. 3段階の店舗間移動プロトコル（依頼 ➔ 輸送中 ➔ 検品受領）

$$\\text{全ネットワーク総在庫} = \\sum_{j=1}^{M} S_{\\text{拠点 } j} + \\sum_{k=1}^{T} S_{\\text{輸送中 } k}$$

\`\`\`
[ ステージ1: 移動依頼・ピッキング完了 ]
   │  ➔ 出庫元店舗が数量をロック（「移動用引当済」）。
   ▼
[ ステージ2: 輸送中（デジタルエスクロー） ]
   │  ➔ 出庫元の手持在庫から確定減算。
   │  ➔ 配送伝票とともに「輸送中台帳」に計上（両店舗とも販売不可）。
   ▼
[ ステージ3: 入庫検品・受領完了 ]
   │  ➔ 入庫先店舗が実物バーコードをスキャン照合。
   │  ➔ 確認数量が入庫先の手持在庫に加算され移動完了。
\`\`\`

---

### 4. 拠点別の動的発注点（ROP）と安全在庫の数理計算

$$\\text{ROP}_{\\text{拠点 } i} = (\\text{日販平均}_{\\text{拠点 } i} \\times \\text{配送リードタイム}) + \\text{安全在庫}_{\\text{拠点 } i}$$

* **中央倉庫**: ROP = **260点**
* **中心街店舗 (A)**: $(14 \\times 2) + 22 =$ **50点**
* **空港店舗 (B)**: $(4 \\times 4) + 10 =$ **26点**

---

### 5. クロスドッキング運用：滞留時間を48時間短縮する手法

* **倉庫内荷役人件費を35%削減**（格納・再ピッキングの廃止）。
* **店頭陳列までの時間を24〜48時間短縮**。

---

### 6. 輸送中ロス・数量不一致を即時解消する標準業務手順（SOP）

1. **ブラインド検品**：画面の指示数を見ずに実物を1点ずつスキャン。
2. **差異自動検知**：実数と伝票数が不一致の場合、自動で「差異監査中」に移行。
3. **責任者の電子承認**による帳簿調整。

---

### 7. 拠点間移動の原価評価と会計・税務上の注意点

* 移動商品は仕入原価（FIFOまたは移動平均原価）のまま移管し、架空の売上利益を計上しない。
* 社内配送費用は経費（\`OPEX\`）として処理。

---

### 8. Inventory 360での多拠点管理ステップ

[Inventory 360](https://www.inventory360.shop) による実践：
1. **拠点の登録**：**設定 > 拠点・ロケーション**で中央倉庫や各店舗を登録。
2. **ワンクリック店舗間移動**：品目を追加し、印刷可能な出荷指示書を発行。
3. **POSレジからの他店舗在庫照会**：店頭でお客様に他店舗の在庫数を即答。
4. **11言語対応の監査台帳出力**（CSV, Excel, PDF）。
`
  },

  zh: {
    title: '多门店与多仓库库存全域调度指南：跨店调拨、总仓集散与自动化分店补货实战',
    excerpt: '深度解析多网点零售供应链：轴辐式（Hub-and-Spoke）与点对点（Point-to-Point）物流拓扑、在途损耗拦截、分店差异化安全库存测算及零幽灵库存的自动化补货闭环。',
    category: '运营管理与法规合规',
    keywords: [
      '多门店多仓库库存管理',
      '跨店库存调拨标准流程',
      '中心总仓轴辐式物流分拨',
      '在途库存损耗追踪',
      '连锁多门店收银系统 POS',
      '仓库分店补货调度算法',
      '杜绝调拨在途幽灵库存',
      '分店差异化再订货点 ROP',
      '越库作业 Cross Docking',
      '连锁零售多网点进销存软件'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. 多网点库存黑洞与「幽灵库存」悖论' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. 仓储物流拓扑：轴辐式总仓（Hub-and-Spoke）vs. 门店点对点（Point-to-Point）' },
      { id: 'three-state-transfer-protocol', title: '3. 三阶段不可逆调拨状态机（发起申请 ➔ 在途监管 ➔ 验收上架）' },
      { id: 'location-specific-rop-math', title: '4. 分店差异化再订货点（ROP）与安全库存数理建模' },
      { id: 'cross-docking-operations', title: '5. 越库作业（Cross-Docking）：缩短 48 小时周转滞后' },
      { id: 'in-transit-shrinkage-sop', title: '6. 在途货损与数量差异对账标准作业程序（SOP）' },
      { id: 'multi-branch-valuation-tax', title: '7. 跨网点库存成本结转与公司间内部结算合规' },
      { id: 'inventory-360-multi-location-setup', title: '8. 在 Inventory 360 中落地多门店全域调度' }
    ],
    content: `
### 1. 多网点库存黑洞与「幽灵库存」悖论

零售企业从单一店面迈向连锁多店或建立区域分发总仓时，供应链协同难度呈几何级数增加。

缺少统一全局实时总账时，企业必然陷入**幽灵库存悖论**：

\`\`\`
[ 市中心旗舰店 ] ➔ 爆款 SKU-400 发生断货（客流如织，0件现货可卖）
                                │
                      (各店独立孤岛数据库盲区)
                                │
[ 郊区奥莱分店 ] ➔ SKU-400 积压 140 件滞销（宝贵营运资金被死锁）
                                │
                                ▼
                     [ 致命性运营亏损 ]
              ├── 旗舰店白白错失销售业绩，客户大量流失
              ├── 采购部盲目向供应商下达冗余加急采购单
              └── 电话口头调拨缺乏单据，运输途中产生货物下落不明
\`\`\`

---

### 2. 仓储物流拓扑：轴辐式总仓（Hub-and-Spoke）vs. 门店点对点（Point-to-Point）

\`\`\`
      [ 轴辐式总仓分拨架构 (Hub-and-Spoke) ]          [ 门店间点对点调拨架构 ]

          ┌────────────────────────┐                ┌──────────┐      ┌──────────┐
          │     中央总仓 / HUB     │                │  分店 A  │◀────▶│  分店 B  │
          └───┬────────┬────────┬──┘                └────┬─────┘      └────┬─────┘
              │        │        │                        │                 │
       ┌──────┘        │        └──────┐                 │                 │
       ▼               ▼               ▼                 ▼                 ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────┐      ┌──────────┐
  │  分店 A  │   │  分店 B  │   │  分店 C  │        │  分店 C  │◀────▶│  分店 D  │
  └──────────┘   └──────────┘   └──────────┘        └──────────┘      └──────────┘
  (大批量整车采购折扣、集约化高效干线)          (调拨链路混乱、多方盘点账实严重脱节)
\`\`\`

#### 架构对比矩阵：

| 运营评估维度 | 轴辐式总仓模式 (Hub-and-Spoke) | 门店间点对点调拨模式 (Point-to-Point) |
| :--- | :--- | :--- |
| **供应商干线运费** | 🟢 最优（整车 FTL 集中采购降本） | 🔴 极差（碎片化散单零担拼车，运费高昂） |
| **门店后库面积占用** | 🟢 极低（精益快动销，营业面积最大化） | 🔴 极高（各门店均需堆砌大量安全库存） |
| **台账数据准确度** | 🟢 极高（单一入口统一质检验收入库） | 🔴 极低（网状多头调动极易漏记错记） |
| **单件商品拣货工时** | 低（托盘级批量波次分拨） | 高（人工单件散件逐个拣选） |
| **最佳适用企业阶段** | 3 家以上门店、区域或全国连锁品牌 | 2 家距离极近的同城兄弟店（< 10公里） |

---

### 3. 三阶段不可逆调拨状态机（发起申请 ➔ 在途监管 ➔ 验收上架）

$$\\text{全网总库存} = \\sum_{j=1}^{M} S_{\\text{各实体门店 } j} + \\sum_{k=1}^{T} S_{\\text{在途监管资金 } k}$$

\`\`\`
[ 阶段 1: 调拨发起 / 拣货出库 ]
   │  ➔ 调出门店锁定库存（标记为 "调拨锁定中"）。
   ▼
[ 阶段 2: 运输在途 (数字资产隔离监管) ]
   │  ➔ 调出门店实物账正式扣除。
   │  ➔ 转入 "在途监管账本"，绑定物流承运面单。
   │  ➔ 运输期间双方门店均无权销售该批货物，彻底杜绝一物两卖。
   ▼
[ 阶段 3: 到货扫码质检与入库确认 ]
   │  ➔ 调入门店逐件扫码核对实物。
   │  ➔ 系统核验无误后正式计入调入门店可售账本；调拨单圆满归档。
\`\`\`

---

### 4. 分店差异化再订货点（ROP）与安全库存数理建模

$$\\text{ROP}_{\\text{分店 } i} = (\\text{日均销量}_{\\text{分店 } i} \\times \\text{总仓配送交期天数}) + \\text{分店安全库存}_{\\text{分店 } i}$$

$$\\text{分店安全库存}_{\\text{分店 } i} = Z \\times \\sqrt{\\left(\\overline{L}_{i} \\times \\sigma_{D, i}^2\\right) + \\left(\\overline{D}_{i}^2 \\times \\sigma_{L, i}^2\\right)}$$

#### 实操测算案例：
* **中央总仓 (Hub)**：ROP = **260件**
* **核心商圈分店 (A)**：$(14 \\times 2) + 22 =$ **50件**
* **交通枢纽分店 (B)**：$(4 \\times 4) + 10 =$ **26件**

---

### 5. 越库作业（Cross-Docking）：缩短 48 小时周转滞后

* **削减 35% 仓库人工搬运成本**（免除入库上架和二次下架）。
* **商品上架提前 24 至 48 小时**。

---

### 6. 在途货损与数量差异对账标准作业程序（SOP）

1. **盲扫验收（Blind Receiving）**：接收端员工扫码前不显示应到件数，避免心理暗示盲签。
2. **差异自动预警**：实收数 $\\neq$ 发运数时，调拨单自动挂起并锁定为 \`差异待审计\`。
3. **闭环仲裁**：经运营总监电子审批后方可完成货损平账。

---

### 7. 跨网点库存成本结转与公司间内部结算合规

* 调拨严格沿用原始进货成本（先进先出 FIFO 或移动加权平均成本），严禁加价调拨虚增应税收入。
* 内部调拨运费计入管理费用（\`OPEX - 内部物流\`）。

---

### 8. 在 Inventory 360 中落地多门店全域调度

[Inventory 360](https://www.inventory360.shop) 提供强大的多网点管理：

1. **多网点自由定义**：在 **设置 > 门店与位置** 创建总仓、分店及前置仓。
2. **一键生成调拨发货单**：自动打印带条码的专业装箱清单。
3. **收银端跨店实时查库**：收银员在前台直接查询其他分店库存。
4. **11种语言全景审计报表**：导出符合财务审计标准的 CSV、Excel 与 PDF。
`
  },

  ar: {
    title: 'توجيه المخزون متعدد الفروع: إدارة المناقلات بين الفروع والمستودعات المركزية وإعادة الطلب',
    excerpt: 'دليل تشغيلي لإتقان لوجستيات التجزئة متعددة الفروع: نموذج Hub-and-Spoke ونموذج النقل المباشر، ومنع الفواقد أثناء النقل، وحساب مخزون الأمان لكل فرع، وأتمتة التوريد بدون أرصدة وهمية.',
    category: 'العمليات والامتثال',
    keywords: [
      'إدارة المخزون متعدد الفروع',
      'إجراءات مناقلة البضائع بين المحلات',
      'توزيع المستودع المركزي Hub and Spoke',
      'تتبع البضائع في الطريق',
      'نقاط بيع الفروع المتعددة POS',
      'توجيه إعادة تموين الفروع',
      'منع الأرصدة الوهمية في النقل',
      'نقطة إعادة الطلب لكل فرع ROP',
      'الكروس دوكينج في التجزئة',
      'برنامج مخازن متعدد الفروع'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. أزمة وضوح المخزون متعدد الفروع ومعضلة البضائع الوهمية' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. هيكل التوزيع: المستودع المركزي مقابل النقل المباشر بين الفروع' },
      { id: 'three-state-transfer-protocol', title: '3. بروتوكول المناقلة ثلاثي المراحل (مطلوب ➔ في الطريق ➔ مستلم)' },
      { id: 'location-specific-rop-math', title: '4. معادلات نقطة إعادة الطلب ومخزون الأمان لكل فرع' },
      { id: 'cross-docking-operations', title: '5. التفريغ المباشر (Cross-Docking) وتوفير 48 ساعة من التأخير' },
      { id: 'in-transit-shrinkage-sop', title: '6. معالجة فروقات ونواقص الشحن أثناء المناقلات' },
      { id: 'multi-branch-valuation-tax', title: '7. التقييم المحاسبي والضريبي لمناقلات الفروع' },
      { id: 'inventory-360-multi-location-setup', title: '8. إدارة الفروع المتعددة في Inventory 360' }
    ],
    content: `
### 1. أزمة وضوح المخزون متعدد الفروع ومعضلة البضائع الوهمية

يؤدي توسع النشاط إلى فروع متعددة ومستودع مركزي إلى مخاطر تشغيلية معقدة عند غياب دفتر أستاذ موحد:

\`\`\`
[ الفرع الرئيسي في السوق ] ➔ نفاد الصنف SKU-400 (طلب مرتفع، رصيد صفر)
                                   │
                       (انفصال قواعد البيانات بين الفروع)
                                   │
[ فرع الأطراف / المعرض ]   ➔ 140 قطعة راكدة من SKU-400 (أموال مجمدة)
                                   │
                                   ▼
                    [ أزمات تشغيلية حرجة ]
             ├── ضياع مبيعات مؤكدة في الفرع الرئيسي
             ├── إصدار أوامر شراء طارئة ومكررة للمورد
             └── ضياع بضائع أثناء النقل الشفهي بدون مستندات
\`\`\`

---

### 2. هيكل التوزيع: المستودع المركزي مقابل النقل المباشر بين الفروع

* **نموذج Hub-and-Spoke (المستودع المركزي)**: شراء بكميات كبيرة بخصومات ممتازة وتوزيع منتظم.
* **نموذج Point-to-Point (المباشر بين الفروع)**: تكاليف شحن مرتفعة وفوضى في المطابقة والتدقيق.

---

### 3. بروتوكول المناقلة ثلاثي المراحل (مطلوب ➔ في الطريق ➔ مستلم)

$$\\text{إجمالي مخزون الشبكة} = \\sum_{j=1}^{M} S_{\\text{الفرع } j} + \\sum_{k=1}^{T} S_{\\text{في الطريق } k}$$

\`\`\`
[ المرحلة 1: طلب المناقلة والتجهيز ] ➔ حجز الكمية في الفرع المرسل.
         ▼
[ المرحلة 2: في الطريق (حساب وسيط رقمي) ] ➔ خصمها من المرسل وتسجيلها في حساب النقل (ممنوع بيعها).
         ▼
[ المرحلة 3: الفحص والاستلام ] ➔ مسح الباركود في الفرع المستلم وإضافتها للرصيد رسمياً.
\`\`\`

---

### 4. معادلات نقطة إعادة الطلب ومخزون الأمان لكل فرع

$$\\text{ROP}_{\\text{الفرع } i} = (\\text{الطلب اليومي}_{\\text{الفرع } i} \\times \\text{مدة التوريد}) + \\text{مخزون الأمان}_{\\text{الفرع } i}$$

* **المستودع المركزي**: ROP = **260 قطعة**
* **فرع المدينة (A)**: $(14 \\times 2) + 22 =$ **50 قطعة**
* **فرع المطار (B)**: $(4 \\times 4) + 10 =$ **26 قطعة**

---

### 5. التفريغ المباشر (Cross-Docking) وتوفير 48 ساعة من التأخير

* خفض **35% من تكاليف العمالة** في المستودعات.
* تسريع وصول المنتجات لرفوف الفروع بما بين **24 إلى 48 ساعة**.

---

### 6. معالجة فروقات ونواقص الشحن أثناء المناقلات

1. **المسح الأعمى**: مسح القطع دون معرفة العدد المتوقع مسبقاً.
2. **تعليق المناقلة تلقائياً** عند وجود فرق في العدد.
3. **اعتماد مدير العمليات** للمطابقة النهائية.

---

### 7. التقييم المحاسبي والضريبي لمناقلات الفروع

* الاحتفاظ بسعر التكلفة الأصلي (FIFO) في المناقلات لمنع احتساب أرباح وهمية خاضعة للضريبة.
* تسجيل تكاليف الشحن الداخلي كمصاريف تشغيلية (\`OPEX\`).

---

### 8. إدارة الفروع المتعددة في Inventory 360

[Inventory 360](https://www.inventory360.shop) يوفر:
1. تعريف المستودعات والفروع في **Settings > Locations**.
2. إصدار أوامر وبوالص المناقلة بنقرة واحدة.
3. استعلام الكاشير في نقطة البيع عن أرصدة الفروع الأخرى فورياً.
4. تقارير تدقيق مجمعة بـ 11 لغة بصيغ CSV و Excel و PDF.
`
  },

  pt: {
    title: 'Roteamento de Estoque Multilocal: Gestão de Transferências entre Lojas, Matriz e Reposição',
    excerpt: 'Guia mestre de logística varejista multiloja: topologia Hub-and-Spoke vs. Ponto a Ponto, controle de perdas em trânsito, cálculo de estoque de segurança por filial e reabastecimento automático sem estoques fantasmas.',
    category: 'Operações e Conformidade',
    keywords: [
      'gestão de estoque multilocal',
      'transferência de estoque entre lojas',
      'distribuição centro de distribuição hub and spoke',
      'rastreamento de estoque em trânsito',
      'frente de caixa PDV multiloja',
      'reabastecimento automático de filiais',
      'eliminar estoque fantasma em transferências',
      'ponto de reposição por filial ROP',
      'cross docking logística varejo',
      'software de estoque para franquias'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. A Crise de Visibilidade Multilocal e o Paradoxo do Estoque Fantasma' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Arquitetura de Distribuição: Hub-and-Spoke vs. Ponto a Ponto' },
      { id: 'three-state-transfer-protocol', title: '3. O Protocolo de Transferência em 3 Etapas (Solicitado ➔ Em Trânsito ➔ Recebido)' },
      { id: 'location-specific-rop-math', title: '4. Fórmulas de Ponto de Reposição Específicas por Filial' },
      { id: 'cross-docking-operations', title: '5. Cross-Docking vs. Armazenamento Convencional: 48h a Menos de Espera' },
      { id: 'in-transit-shrinkage-sop', title: '6. POP de Reconciliação de Avarias e Divergências em Trânsito' },
      { id: 'multi-branch-valuation-tax', title: '7. Avaliação Contábil e Fiscal de Transferências entre Filiais' },
      { id: 'inventory-360-multi-location-setup', title: '8. Execução Multilocal Passo a Passo no Inventory 360' }
    ],
    content: `
### 1. A Crise de Visibilidade Multilocal e o Paradoxo do Estoque Fantasma

A expansão de uma loja única para uma rede com filiais ou centro de distribuição amplia exponencialmente os riscos operacionais.

Sem um razão central unificado, redes varejistas sofrem com o **Estoque Fantasma**:

\`\`\`
[ Loja Flagship Centro ]     ➔ Falta de SKU-400 (Alto fluxo, 0 unidades para venda)
                                     │
                         (Ponto Cego de Bancos Isolados)
                                     │
[ Loja Shopping Periferia ]  ➔ 140 unidades de SKU-400 paradas (Capital bloqueado)
                                     │
                                     ▼
                     [ Falhas Operacionais Graves ]
              ├── Vendas perdidas e clientes insatisfeitos na Flagship
              ├── Compras emergenciais e redundantes junto a fornecedores
              └── Furtos e extravios em transferências sem documentação
\`\`\`

---

### 2. Arquitetura de Distribuição: Hub-and-Spoke vs. Ponto a Ponto

* **Hub-and-Spoke (CD Central)**: Compras em grande escala com desconto de frete FTL e estoque enxuto nas filiais.
* **Ponto a Ponto (Entre Lojas)**: Fretes caros, complexidade de rotas e alto risco de desvios.

---

### 3. O Protocolo de Transferência em 3 Etapas (Solicitado ➔ Em Trânsito ➔ Recebido)

$$\\text{Estoque Total da Rede} = \\sum_{j=1}^{M} S_{\\text{Filial } j} + \\sum_{k=1}^{T} S_{\\text{Em Trânsito } k}$$

\`\`\`
[ Estado 1: TRANSFERÊNCIA SOLICITADA / SEPARADA ] ➔ A filial de origem reserva os itens.
         ▼
[ Estado 2: EM TRÂNSITO (Conta de Custódia) ] ➔ Baixa na origem e registro no trânsito (bloqueado para venda).
         ▼
[ Estado 3: CONFERÊNCIA E RECEBIMENTO ] ➔ A filial de destino bipeia os códigos e dá entrada no estoque.
\`\`\`

---

### 4. Fórmulas de Ponto de Reposição Específicas por Filial

$$\\text{ROP}_{\\text{Filial } i} = (\\text{Venda Média Diária}_{\\text{Filial } i} \\times \\text{Prazo de Transporte}) + \\text{Estoque de Segurança}_{\\text{Filial } i}$$

* **CD Central (Hub)**: ROP = **260 unidades**
* **Loja Centro (A)**: $(14 \\times 2) + 22 =$ **50 unidades**
* **Loja Aeroporto (B)**: $(4 \\times 4) + 10 =$ **26 unidades**

---

### 5. Cross-Docking vs. Armazenamento Convencional: 48h a Menos de Espera

* **35% de economia em mão de obra de armazenagem**.
* **Chegada à área de vendas 24 a 48 horas mais rápida**.

---

### 6. POP de Reconciliação de Avarias e Divergências em Trânsito

1. **Conferência Cega**: Leitura dos códigos físicos sem visualização prévia da quantidade da nota.
2. **Bloqueio Automático de Divergência** para auditoria.
3. **Assinatura Digital do Gerente de Operações** para encerramento do chamado.

---

### 7. Avaliação Contábil e Fiscal de Transferências entre Filiais

* Manter o custo de aquisição original (FIFO ou Preço Médio) para evitar geração de receita tributável fictícia.
* Fretes internos alocados em despesas operacionais (\`OPEX\`).

---

### 8. Execução Multilocal Passo a Passo no Inventory 360

[Inventory 360](https://www.inventory360.shop) oferece:
1. Cadastro de matriz e filiais em **Configurações > Unidades**.
2. Emissão de guias de remessa e romaneios de transferência em 1 clique.
3. Consulta de estoque entre lojas direto na tela de vendas do PDV.
4. Relatórios contábeis consolidados em 11 idiomas em CSV, Excel e PDF.
`
  },

  it: {
    title: 'Routing dell\'Inventario Multi-Sede: Gestione Trasferimenti tra Negozi, Magazzini Centrali e Riordino',
    excerpt: 'Guida operativa per la logistica retail multi-punto vendita: distribuzione Hub-and-Spoke vs. Punto-a-Punto, eliminazione delle perdite in transito, calcolo scorte di sicurezza per sede e riassortimento automatico.',
    category: 'Operazioni e Normativa',
    keywords: [
      'gestione inventario multi sede',
      'trasferimento scorte tra negozi procedura',
      'distribuzione magazzino centrale hub and spoke',
      'tracciamento merci in transito',
      'punto cassa retail multi filiale POS',
      'routing rifornimento punti vendita',
      'eliminare scorte fantasma trasferimenti',
      'punto di riordino per filiale ROP',
      'cross docking logistica distribuzione',
      'software magazzino catene negozi'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. La Crisi di Visibilità Multi-Sede e il Paradosso delle Scorte Fantasma' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Topologia di Distribuzione: Hub-and-Spoke vs. Punto-a-Punto' },
      { id: 'three-state-transfer-protocol', title: '3. Protocollo di Trasferimento a 3 Fasi (Richiesto ➔ In Transito ➔ Ricevuto)' },
      { id: 'location-specific-rop-math', title: '4. Calcolo Matematico del Punto di Riordino per Sede' },
      { id: 'cross-docking-operations', title: '5. Cross-Docking vs. Stoccaggio Tradizionale: 48 Ore Guadagnate' },
      { id: 'in-transit-shrinkage-sop', title: '6. Procedura Operativa per la Risoluzione di Discrepanze in Transito' },
      { id: 'multi-branch-valuation-tax', title: '7. Valutazione Fiscale e Contabile dei Trasferimenti Interni' },
      { id: 'inventory-360-multi-location-setup', title: '8. Gestione Multi-Sede in Inventory 360' }
    ],
    content: `
### 1. La Crisi di Visibilità Multi-Sede e il Paradosso delle Scorte Fantasma

Gestire una rete di punti vendita o un polo logistico centrale comporta rischi critici se i database non sono sincronizzati:

\`\`\`
[ Negozio Centro Storico ]   ➔ Esaurito per SKU-400 (Molti clienti, 0 unità disponibili)
                                     │
                         (Punto Cieco tra Sistemi Separati)
                                     │
[ Negozio Periferia / Outlet ]➔ 140 Unità di SKU-400 invendute (Capitale bloccato)
                                     │
                                     ▼
                     [ Gravi Fallimenti Operativi ]
              ├── Perdita di vendite e clienti nel negozio principale
              ├── Ordini fornitore urgenti e inutilmente duplicati
              └── Ammanchi e perdite durante i trasferimenti non tracciati
\`\`\`

---

### 2. Topologia di Distribuzione: Hub-and-Spoke vs. Punto-a-Punto

* **Modello Hub-and-Spoke (Hub Centrale)**: Grandi volumi di acquisto con sconti fornitore e negozi snelli.
* **Modello Punto-a-Punto (Tra Negozi)**: Spedizioni frazionate costose e frequenti discrepanze d'inventario.

---

### 3. Protocollo di Trasferimento a 3 Fasi (Richiesto ➔ In Transito ➔ Ricevuto)

$$\\text{Inventario Totale della Rete} = \\sum_{j=1}^{M} S_{\\text{Sede } j} + \\sum_{k=1}^{T} S_{\\text{In Transito } k}$$

\`\`\`
[ Fase 1: TRASFERIMENTO RICHIESTO ] ➔ La sede mittente blocca le scorte.
         ▼
[ Fase 2: IN TRANSITO (Conto Deposito) ] ➔ Scarico dal mittente e carico sul conto transito (non vendibile).
         ▼
[ Fase 3: CONTROLLO E RICEZIONE ] ➔ Il destinatario scansiona i barcode e carica la merce in giacenza.
\`\`\`

---

### 4. Calcolo Matematico del Punto di Riordino per Sede

$$\\text{ROP}_{\\text{Sede } i} = (\\text{Vendite Giornaliere Medie}_{\\text{Sede } i} \\times \\text{Giorni di Trasporto}) + \\text{Scorta di Sicurezza}_{\\text{Sede } i}$$

* **Magazzino Centrale (Hub)**: ROP = **260 unità**
* **Negozio Centro (A)**: $(14 \\times 2) + 22 =$ **50 unità**
* **Negozio Aeroporto (B)**: $(4 \\times 4) + 10 =$ **26 unità**

---

### 5. Cross-Docking vs. Stoccaggio Tradizionale: 48 Ore Guadagnate

* **35% di risparmio sui costi di manodopera di magazzino**.
* **Merce a scaffale da 24 a 48 ore prima rispetto alla concorrenza**.

---

### 6. Procedura Operativa per la Risoluzione di Discrepanze in Transito

1. **Ricezione Cieca**: Conteggio tramite scansione barcode senza visualizzare i quantitativi attesi.
2. **Allerta Automatica per Differenze**: Stato \`AUDIT_DISCREPANZA\`.
3. **Approvazione del Responsabile Operativo** per la chiusura della pratica.

---

### 7. Valutazione Fiscale e Contabile dei Trasferimenti Interni

* Mantenimento del costo di carico (FIFO o Costo Medio Ponderato) per evitare la generazione di utili fittizi tassabili.
* Costi di trasporto interni allocati nei costi operativi (\`OPEX\`).

---

### 8. Gestione Multi-Sede in Inventory 360

[Inventory 360](https://www.inventory360.shop) gestisce:
1. Creazione sedi in **Impostazioni > Sedi e Magazzini**.
2. Documenti di trasporto (DDT) di trasferimento in 1 clic.
3. Consultazione giacenze di altri negozi direttamente dal POS in cassa.
4. Esportazione registri di magazzino consolidati in 11 lingue in CSV, Excel e PDF.
`
  },

  ru: {
    title: 'Маршрутизация Запасов в Мульти-Складской Сети: Перемещения, Центральные Склады и Пополнение Филиалов',
    excerpt: 'Полный операционный регламент сетевого ритейла: топологии Hub-and-Spoke vs. Point-to-Point, защита от потерь в пути, расчет локальных точек заказа (ROP) и автоматическое пополнение филиалов без пересорта.',
    category: 'Операции и Регламенты',
    keywords: [
      'учет запасов нескольких складов',
      'перемещение товаров между магазинами регламент',
      'распределительный центр hub and spoke',
      'учет товаров в пути инкубация',
      'кассовая программа для сети магазинов',
      'пополнение остатков филиалов склада',
      'исключение пересорта при перемещениях',
      'точка заказа для филиала формула ROP',
      'кросс докинг розничная логистика',
      'программа учета для торговой сети'
    ],
    tableOfContents: [
      { id: 'phantom-inventory-paradox', title: '1. Кризис Видимости в Торговой Сети и Парадокс Фантомных Остатков' },
      { id: 'hub-and-spoke-vs-point-to-point', title: '2. Топологии Распределения: Хаб и Спицы (Hub-and-Spoke) vs. Прямые Перемещения' },
      { id: 'three-state-transfer-protocol', title: '3. 3-Этапный Протокол Перемещения (Заявка ➔ В Пути ➔ Приемка)' },
      { id: 'location-specific-rop-math', title: '4. Математический Расчет Точки Заказа (ROP) по Каждому Филиалу' },
      { id: 'cross-docking-operations', title: '5. Кросс-Докинг vs. Классическое Хранение: Ускорение на 48 Часов' },
      { id: 'in-transit-shrinkage-sop', title: '6. Регламент Урегулирования Расхождений и Недостач в Пути' },
      { id: 'multi-branch-valuation-tax', title: '7. Бухгалтерская и Налоговая Оценка Межфилиальных Перемещений' },
      { id: 'inventory-360-multi-location-setup', title: '8. Пошаговая Работа с Филиалами в Inventory 360' }
    ],
    content: `
### 1. Кризис Видимости в Торговой Сети и Парадокс Фантомных Остатков

Масштабирование от одного магазина к сети торговых точек и распределительному центру резко увеличивает риски расхождений.

Без единого главного регистра сеть сталкивается с **Парадоксом Фантомных Остатков**:

\`\`\`
[ Флагманский Магазин в Центре ] ➔ Обнуление остатка SKU-400 (Плотный трафик, 0 шт в наличии)
                                         │
                             (Слепая зона изолированных баз)
                                         │
[ Аутлет на Окраине Города ]     ➔ 140 шт SKU-400 лежат мертвым грузом (Замороженный капитал)
                                         │
                                         ▼
                         [ Критические операционные сбои ]
                  ├── Потеря выручки и лояльности во флагманском магазине
                  ├── Необоснованные экстренные заказы поставщику
                  └── Недостачи и кражи при устных перемещениях без документов
\`\`\`

---

### 2. Топологии Распределения: Хаб и Спицы (Hub-and-Spoke) vs. Прямые Перемещения

* **Хаб и Спицы (Распределительный центр)**: Закупка полными фурами (FTL), максимальные скидки поставщиков, компактные склады в магазинах.
* **Прямые перемещения (Магазин-Магазин)**: Дорогая логистика, путаница в учете и регулярный пересорт.

---

### 3. 3-Этапный Протокол Перемещения (Заявка ➔ В Пути ➔ Приемка)

$$\\text{Совокупный Запас Сети} = \\sum_{j=1}^{M} S_{\\text{Филиал } j} + \\sum_{k=1}^{T} S_{\\text{В Пути } k}$$

\`\`\`
[ Этап 1: ЗАЯВКА НА ПЕРЕМЕЩЕНИЕ / СБОРКА ] ➔ Склад-отправитель резервирует товар.
         ▼
[ Этап 2: В ПУТИ (Цифровой Эскроу) ] ➔ Списание с отправителя, постановка на баланс пути (продажа заблокирована).
         ▼
[ Этап 3: ПРИЕМКА И СКАНИРОВАНИЕ ] ➔ Склад-получатель сканирует штрихкоды и приходует товар.
\`\`\`

---

### 4. Математический Расчет Точки Заказа (ROP) по Каждому Филиалу

$$\\text{ROP}_{\\text{Филиал } i} = (\\text{Дневной Спрос}_{\\text{Филиал } i} \\times \\text{Плечо Доставки}) + \\text{Страховой Запас}_{\\text{Филиал } i}$$

* **Центральный Склад (Hub)**: ROP = **260 шт**
* **Магазин Центр (A)**: $(14 \\times 2) + 22 =$ **50 шт**
* **Магазин Аэропорт (B)**: $(4 \\times 4) + 10 =$ **26 шт**

---

### 5. Кросс-Докинг vs. Классическое Хранение: Ускорение на 48 Часов

* **Снижение затрат на складской персонал на 35%** (без размещения на стеллажах).
* **Поступление товара на полки магазинов на 24–48 часов быстрее**.

---

### 6. Регламент Урегулирования Расхождений и Недостач в Пути

1. **Слепая приемка**: Сканирование фактически прибывшего товара без подсказок на экране.
2. **Автоматический статус расхождения**: При несовпадении накладная блокируется как \`ДИСПРОПОРЦИЯ_АУДИТ\`.
3. **Электронное согласование руководителем логистики** для списания или претензии к перевозчику.

---

### 7. Бухгалтерская и Налоговая Оценка Межфилиальных Перемещений

* Перемещение по фактической себестоимости (FIFO/Средневзвешенная) без наценок для исключения фиктивной налогооблагаемой прибыли.
* Транспортные расходы списываются на операционные затраты (\`OPEX\`).

---

### 8. Пошаговая Работа с Филиалами в Inventory 360

[Inventory 360](https://www.inventory360.shop) предоставляет:
1. Создание складов и магазинов в **Настройки > Склады и Точки**.
2. Оформление перемещений в 1 клик с печатью транспортных накладных.
3. Мгновенная проверка остатков в других филиалах прямо на кассе (POS).
4. Консолидированные отчеты на 11 языках в CSV, Excel и PDF.
`
  }
};

const i18nPath = 'd:/Website Dev/Free Inventory/inventory360/lib/blogI18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const targetKey = `'multi-location-inventory-transfers-warehouse-routing':`;
const nextKey = `'omnichannel-ecommerce-inventory-synchronization':`;

const startIndex = code.indexOf(targetKey);
const nextIndex = code.indexOf(nextKey);

if (startIndex !== -1 && nextIndex !== -1) {
  const newBlog6 = `'multi-location-inventory-transfers-warehouse-routing': ${JSON.stringify(blog6_translations, null, 2)},\n  `;
  const updatedCode = code.slice(0, startIndex) + newBlog6 + code.slice(nextIndex);
  fs.writeFileSync(i18nPath, updatedCode, 'utf8');
  console.log('Successfully updated Blog 6 (multi-location-inventory-transfers-warehouse-routing) with full 8-section content across all 11 languages!');
} else {
  console.error('Could not locate markers for Blog 6 in lib/blogI18n.ts');
}
