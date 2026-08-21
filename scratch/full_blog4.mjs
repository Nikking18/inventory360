import fs from 'fs';

const blog4_translations = {
  es: {
    title: 'Trazabilidad de Lotes y Caducidades: Buenas Prácticas para Alimentación, Bebidas y Cosmética',
    excerpt: 'Domina la trazabilidad por lotes, algoritmos de rotación FIFO vs FEFO, normativas internacionales (FDA FSMA 204, UE MDR, GMP) y protocolos de retirada de producto en 5 minutos sin destruir stock sano.',
    category: 'Operaciones y Normativa',
    keywords: ['software trazabilidad lotes', 'protocolo retirada de producto lote', 'método rotación FIFO vs FEFO', 'alertas fecha de caducidad TPV', 'cumplimiento FDA FSMA 204 retail', 'trazabilidad alimentación cosmética', 'código de barras GS1 128 lotes', 'reducción mermas por caducidad', 'gestión de stock en cuarentena'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. El Coste Regulatorio y Financiero de las Mermas por Caducidad' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Mecánica Matemática de Rotación de Stock' },
      { id: 'regulatory-compliance-standards', title: '3. Marcos Regulatorios: FDA FSMA 204, Reglamento UE y GMP' },
      { id: 'surgical-recall-protocol', title: '4. Protocolo Quirúrgico de Retirada de Lote en 5 Minutos' },
      { id: 'expiry-alert-thresholds', title: '5. Embudo Dinámico de Alertas de Caducidad a 30/60/90 Días' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Codificación GS1-128 y DataMatrix 2D: Identificadores AI de Lote' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilidad de Mermas: Cálculo del Impacto Financiero Real' },
      { id: 'inventory-360-lot-setup', title: '8. Ejecución de Lotes y Caducidades en Inventory 360' }
    ],
    content: `
### 1. El Coste Regulatorio y Financiero de las Mermas por Caducidad

En los sectores de alimentación, bebidas especiales, cosmética natural, suplementos dietéticos, farmacia y productos químicos, el recuento genérico de unidades es un riesgo crítico. 

A diferencia del comercio no perecedero donde un artículo no vendido simplemente inmoviliza capital, en el comercio perecedero representa una pérdida económica directa que se deteriora en tiempo real:

\`\`\`
[ Recepción de Mercancía ] ➔ [ Desempaquetado de Lote ] ➔ [ Exposición en Estantería ]
                                                               │
                       ┌───────────────────────────────────────┴───────────────────────────────────────┐
                       ▼                                                                               ▼
           [ Vendido Antes de Fecha ]                                                        [ Caducado en Estantería ]
                       │                                                                               │
          🟢 Margen Bruto 100% Cobrado                                                   🔴 Pérdida Total del Coste (COGS)
                                                                                         🔴 Tasa de Gestión de Residuos
                                                                                         🔴 Sanción por Infracción Sanitaria
\`\`\`

La Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO) estima que el comercio minorista pierde entre un **1.8% y un 4.2% de su facturación bruta anual** exclusivamente por productos caducados. Para una tienda con una facturación de $2,000,000 al año, esto supone entre **$36,000 y $84,000 en pérdidas de beneficio neto evitable** cada ejercicio.

---

### 2. FIFO vs. FEFO: Mecánica Matemática de Rotación de Stock

1. **FIFO (First-In, First-Out)**: Los primeros artículos en entrar al almacén son los primeros en venderse. Se basa únicamente en el **Momento de Entrada ($T_{\\text{llegada}}$)**.
2. **FEFO (First-Expired, First-Out)**: Los artículos con la fecha de caducidad más cercana se priorizan para el cobro en caja, sin importar cuándo llegaron. Se basa en el **Tiempo hasta Caducidad ($T_{\\text{caducidad}}$)**.

#### Comparativa Operativa FIFO vs. FEFO:

| Característica / Métrica | FIFO (Primero en Entrar, Primero en Salir) | FEFO (Primero en Caducar, Primero en Salir) |
| :--- | :--- | :--- |
| **Criterio de Prioridad** | Fecha y hora de recepción del pedido | Fecha de caducidad o consumo preferente |
| **Sector Recomendado** | Electrónica, Moda, Bricolaje, Secos | Lácteos, Frescos, Cosmética, Vacunas, Cerveza |
| **Protección ante Inconsistencias** | 🔴 Baja (Nuevos lotes con fecha corta se pierden) | 🟢 Alta (Se despacha primero lo que antes caduca) |
| **Tipo de Código de Barras** | UPC / EAN-13 estándar | GS1-128 / DataMatrix 2D con etiquetas AI |
| **Reducción Media de Mermas** | Nivel de referencia estándar | **Reducción del desperdicio entre un 42% y 68%** |

> **Realidad Operativa**: Nunca utilice FIFO para perecederos. Si el Proveedor A entrega yogures que caducan en 40 días y el Proveedor B entrega yogures que caducan en 15 días, FIFO dejará pudrir los del Proveedor B en el almacén. FEFO garantiza que los de fecha corta salgan a la venta de inmediato.

---

### 3. Marcos Regulatorios: FDA FSMA 204, Reglamento UE y GMP

1. **FDA FSMA 204 (EE.UU.)**: Obliga a registrar Eventos Críticos de Seguimiento (CTE) y Elementos de Datos Clave (KDE) durante al menos 24 meses.
2. **Reglamento de Cosméticos de la UE (CE 1223/2009)**: Exige la trazabilidad de lotes y el control del Periodo Posterior a la Apertura (PAO).
3. **Buenas Prácticas de Fabricación (GMP)**: Garantizan la trazabilidad genealógica del lote hacia adelante y hacia atrás.

---

### 4. Protocolo Quirúrgico de Retirada de Lote en 5 Minutos

\`\`\`
[ Fase 1: NOTIFICACIÓN DEL PROVEEDOR ]
   │  ➔ Alerta de lote contaminado: SKU #ALM-100, Lote #LOT-9921
   ▼
[ Fase 2: CONSULTA EN EL LIBRO MAYOR (< 30 Segundos) ]
   │  ➔ Búsqueda en el motor IndexedDB local: 14 uds en Almacén | 6 uds en Pasillo 2.
   ▼
[ Fase 3: BLOQUEO DEL SISTEMA EN 1 CLIC (< 15 Segundos) ]
   │  ➔ Estado cambiado a "CUARENTENA_RETIRADO".
   │  ➔ El TPV rechaza automáticamente el escaneo de ese lote.
   ▼
[ Fase 4: AUDITORÍA DE CLIENTES AFECTADOS (< 2 Minutos) ]
   │  ➔ Filtro de ventas: 18 uds compradas por 12 clientes identificados.
   │  ➔ Exportación inmediata de contactos para aviso preventivo de seguridad.
\`\`\`

#### Comparativa de Ejecución de Retirada:

| Métrica | Comercio Tradicional No Segregado | Motor Quirúrgico de Inventory 360 |
| :--- | :--- | :--- |
| **Tiempo de Localización** | 4 a 8 horas (Búsqueda manual en estanterías) | **< 30 segundos (Búsqueda automática en ledger)** |
| **Unidades Descartadas** | 100% de la categoría ($12,000+ de pérdida) | **Solo el lote afectado ($450 de coste)** |
| **Bloqueo en Caja TPV** | Notas manuales pegadas en pantalla | **Rechazo algorítmico inmediato de escaneo** |
| **Trazabilidad de Clientes** | Imposible sin recibos en papel | **Exportación de lista de contacto en 1 clic** |

---

### 5. Embudo Dinámico de Alertas de Caducidad a 30/60/90 Días

\`\`\`
[ A 90 Días de Caducar ] ➔ 🟢 Monitorización de velocidad. Precio normal ($19.99).
[ A 60 Días de Caducar ] ➔ 🟡 Alerta Amarilla. Mover producto al frontal de estantería.
[ A 30 Días de Caducar ] ➔ 🟠 Descuento automático del 25% o pack promocional.
[ A 10 Días de Caducar ] ➔ 🔴 Liquidación al 50% o donación a banco de alimentos.
[ 0 Días (Caducado) ]    ➔ ⛔ Bloqueo en TPV: Prohibida su venta en caja.
\`\`\`

Al automatizar los descuentos al umbral de **30 días**, los comerciantes recuperan entre el **60% y el 75% del coste del producto** en lugar de asumir una pérdida del 100%.

---

### 6. Codificación GS1-128 y DataMatrix 2D: Identificadores AI de Lote

| Identificador de Aplicación (AI) | Dato Codificado | Ejemplo de Cadena | Interpretación |
| :--- | :--- | :--- | :--- |
| **(01)** | Código GTIN de Producto | \`00850012345678\` | Identificador SKU |
| **(10)** | Número de Lote / Batch | \`LOT-9921\` | Serie de Producción |
| **(17)** | Fecha de Caducidad (\`AAMMDD\`) | \`261130\` | Caduca el 30 Nov 2026 |
| **(21)** | Número de Serie Unitario | \`SN-883492\` | ID Individual Único |

Al escanear en el TPV, [Inventory 360](https://www.inventory360.shop) analiza la cadena de fecha incrustada, comprueba la caducidad y descuenta el lote exacto en menos de 15 milisegundos.

---

### 7. Contabilidad de Mermas: Cálculo del Impacto Financiero Real

$$\\text{Tasa de Pérdida por Caducidad (\\%)} = \\left( \\frac{\\text{Coste Total de Unidades Caducadas (\\$)}}{\\text{Coste Total de Mercancías Perecederas Vendidas (COGS \\$)}} \\right) \\times 100$$

#### Ejemplo Numérico en Quesería Boutique:
* **Coste COGS de Lácteos Comprados**: $140,000
* **Unidades Caducadas Descartadas**: $5,800
* **Tasa de Retirada de Residuos Orgánicos**: $650
* **Horas de Personal Revisando Fechas a Mano**: $120\\text{ horas} \\times \\$18/\\text{h} = \\$2,160$

$$\\text{Pérdida Trimestral Total} = 5,800 + 650 + 2,160 = \\$8,610$$
$$\\text{Tasa Efectiva de Merma} = \\left( \\frac{8,610}{140,000} \\right) \\times 100 = 6.15\\%$$

Aplicar alertas FEFO reduce este desperdicio del **6.15% a menos del 1.2%**, aportando más de **$27,000 de beneficio neto directo** al balance anual.

---

### 8. Ejecución de Lotes y Caducidades en Inventory 360

[Inventory 360](https://www.inventory360.shop) incluye control de lotes integrado en local:

1. **Asignación de Lote al Recibir**: Introduzca el número de lote y fecha de vencimiento al registrar las compras para activar la cola FEFO.
2. **Alertas Visuales de Vencimiento**: Los paneles destacan automáticamente los lotes a 30, 60 y 90 días con insignias de color.
3. **Bloqueo Quirúrgico de Lotes**: Ponga en cuarentena un lote específico mientras el resto de existencias del producto sigue vendiéndose con normalidad.
4. **Informes de Auditoría Multilingües**: Exporte historiales completos en CSV, Excel o PDF en 11 idiomas con total privacidad.
`
  },

  fr: {
    title: 'Traçabilité des Lots et Dates de Péremption : Guide Pratique pour l\'Alimentaire et la Cosmétique',
    excerpt: 'Maîtrisez la traçabilité par lot, les algorithmes de rotation FIFO vs FEFO, la conformité réglementaire (FDA FSMA 204, normes UE) et le rappel ciblé de produits en moins de 5 minutes sans détruire les stocks sains.',
    category: 'Opérations & Conformité',
    keywords: ['traçabilité des lots logiciel', 'procédure rappel de lot', 'rotation des stocks FIFO FEFO', 'alerte date limite consommation DLC', 'traçabilité alimentaire cosmétique', 'code barre GS1 128 lot', 'réduction démarque casse péremption', 'gestion stock quarantaine'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Le Coût Financier et Réglementaire des Pertes de Périssables' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO : Mécanique Mathématique de Rotation des Stocks' },
      { id: 'regulatory-compliance-standards', title: '3. Normes Réglementaires : FDA FSMA 204, UE et BPF' },
      { id: 'surgical-recall-protocol', title: '4. Procédure de Rappel Ciblé de Lot en Moins de 5 Minutes' },
      { id: 'expiry-alert-thresholds', title: '5. Pipeline Dynamique d\'Alertes de Péremption à 30/60/90 Jours' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Encodage GS1-128 et DataMatrix 2D : Identifiants IA de Lots' },
      { id: 'spoilage-accounting-formulas', title: '7. Comptabilité des Pertes : Mesure du Coût Réel' },
      { id: 'inventory-360-lot-setup', title: '8. Gestion des Lots dans Inventory 360' }
    ],
    content: `
### 1. Le Coût Financier et Réglementaire des Pertes de Périssables

Dans les secteurs de l'alimentation, des boissons de spécialité, des cosmétiques naturels, des compléments alimentaires et de la pharmacie, la gestion globale des stocks est un risque majeur.

Contrairement aux produits non périssables, un article périmé non vendu représente une perte sèche immédiate :

\`\`\`
[ Réception Marchandise ] ➔ [ Déballage du Lot ] ➔ [ Mise en Rayon ]
                                                          │
                       ┌──────────────────────────────────┴──────────────────────────────────┐
                       ▼                                                                     ▼
             [ Vendu Avant Échéance ]                                              [ Périmé en Rayon ]
                       │                                                                     │
            🟢 Marge Brute 100% Encaissée                                         🔴 Perte Sèche Totale (COGS)
                                                                                  🔴 Frais de Traitement des Déchets
                                                                                  🔴 Amende Sanitaire Éventuelle
\`\`\`

La FAO estime que les détaillants perdent entre **1,8% et 4,2% de leur chiffre d'affaires annuel** en produits périmés. Pour un magasin réalisant 2 000 000 € de chiffre d'affaires, cela représente **36 000 € à 84 000 € de perte de bénéfice net évitable** chaque année.

---

### 2. FIFO vs. FEFO : Mécanique Mathématique de Rotation des Stocks

1. **FIFO (First-In, First-Out)** : Sortie selon l'ordre d'arrivée en entrepôt ($T_{\\text{arrivée}}$).
2. **FEFO (First-Expired, First-Out)** : Sortie prioritaire des articles dont la Date Limite de Consommation (DLC) est la plus proche ($T_{\\text{expiration}}$).

#### Comparatif Opérationnel FIFO vs. FEFO :

| Critère / Métrique | FIFO (Premier Entré, Premier Sorti) | FEFO (Premier Périmé, Premier Sorti) |
| :--- | :--- | :--- |
| **Clé de Tri Principale** | Date et heure de réception de commande | Date de péremption certifiée (DLC/DLUO) |
| **Secteur Idéal** | Électronique, Mode, Bricolage, Épicerie sèche | Produits frais, Laitier, Cosmétique, Vaccins |
| **Protection contre Anomalies** | 🔴 Faible (Nouveaux lots courts périment) | 🟢 Élevée (Lots courts écoulés en priorité) |
| **Norme Code-Barres** | UPC / EAN-13 standard 1D | GS1-128 / DataMatrix 2D avec tags IA |
| **Réduction Moyenne des Pertes** | Référence de base | **Diminution du gaspillage de 42% à 68%** |

---

### 3. Normes Réglementaires : FDA FSMA 204, UE et BPF

1. **FDA FSMA 204 (États-Unis)** : Enregistrement des événements de traçabilité critiques (CTE) et éléments de données clés (KDE) pendant au moins 24 mois.
2. **Règlement Cosmétiques UE (CE 1223/2009)** : Traçabilité des lots et respect de la Période Après Ouverture (PAO).
3. **Bonnes Pratiques de Fabrication (BPF / GMP)** : Traçabilité complète amont et aval.

---

### 4. Procédure de Rappel Ciblé de Lot en Moins de 5 Minutes

\`\`\`
[ Phase 1 : AVIS DE RAPPEL FOURNISSEUR ]
   │  ➔ Lot contaminé identifié : SKU #ALM-100, Lot #LOT-9921
   ▼
[ Phase 2 : RECHERCHE INSTANTANÉE EN BASE (< 30 Secondes) ]
   │  ➔ Recherche IndexedDB : 14 unités en Réserve | 6 unités en Rayon 2.
   ▼
[ Phase 3 : VERROUILLAGE SYSTÈME EN 1 CLIC (< 15 Secondes) ]
   │  ➔ Statut passé à "QUARANTAINE_RAPPELÉ".
   │  ➔ Rejet automatique du scan en caisse.
   ▼
[ Phase 4 : EXTRACTION DES CONTACTS CLIENTS (< 2 Minutes) ]
   │  ➔ Journal des ventes : 18 unités achetées par 12 clients identifiés.
   │  ➔ Export immédiat des contacts pour message d'alerte sanitaire.
\`\`\`

#### Benchmark de Réactivité lors d'un Rappel :

| Indicateur | Commerce Traditionnel Non Tracé | Moteur Chirurgical Inventory 360 |
| :--- | :--- | :--- |
| **Temps d'Isolation** | 4 à 8 heures (Recherche visuelle en rayon) | **< 30 secondes (Requête dans le registre)** |
| **Unités Détruites** | 100% de la catégorie (> 10 000 € de perte) | **Uniquement le lot contaminé (450 €)** |
| **Blocage en Caisse** | Mémos papier collés sur les écrans | **Rejet algorithmique instantané du scan** |
| **Traçabilité Client** | Impossible sans tickets papier | **Extraction automatisée des contacts en 1 clic** |

---

### 5. Pipeline Dynamique d'Alertes de Péremption à 30/60/90 Jours

\`\`\`
[ 90 Jours Avant Échéance ] ➔ 🟢 Surveillance du rythme de vente. Prix standard (19,99 €).
[ 60 Jours Avant Échéance ] ➔ 🟡 Alerte Jaune. Mise en avant en tête de gondole.
[ 30 Jours Avant Échéance ] ➔ 🟠 Remise promotionnelle de -25% ou offre groupée.
[ 10 Jours Avant Échéance ] ➔ 🔴 Déstockage flash à -50% ou don à une banque alimentaire.
[ 0 Jour (Périmé) ]         ➔ ⛔ Blocage en Caisse : Vente strictement interdite.
\`\`\`

---

### 6. Encodage GS1-128 et DataMatrix 2D : Identifiants IA de Lots

| Identifiant d'Application (IA) | Donnée Encodée | Exemple de Chaîne | Interprétation |
| :--- | :--- | :--- | :--- |
| **(01)** | Code Produit GTIN | \`00850012345678\` | Identifiant SKU |
| **(10)** | Numéro de Lot / Batch | \`LOT-9921\` | Lot de Fabrication |
| **(17)** | Date de Péremption (\`AAMMJJ\`) | \`261130\` | Expire le 30 nov. 2026 |
| **(21)** | Numéro de Série | \`SN-883492\` | Identifiant Unitaire |

---

### 7. Comptabilité des Pertes : Mesure du Coût Réel

$$\\text{Taux de Perte par Péremption (\\%)} = \\left( \\frac{\\text{Coût Total des Rebuts Périmés (\\euro)}}{\\text{Coût d'Achat des Périssables Vendus (COGS \\euro)}} \\right) \\times 100$$

Exemple pour une crèmerie fromagerie :
* Achats Périssables (COGS) : 140 000 €
* Rebuts jetés : 5 800 € / Collecte déchets : 650 € / Heures de vérification manuelle : 2 160 €
* Perte totale = 8 610 € (Taux de perte : **6,15%**)
* L'application de règles FEFO ramène ce taux à **moins de 1,2%**, soit **27 000 € de profit net récupéré**.

---

### 8. Gestion des Lots dans Inventory 360

[Inventory 360](https://www.inventory360.shop) intègre nativement la gestion des lots :
1. **Attribution à la Réception** : Saisie du lot et de la DLC lors de l'entrée en stock pour générer la file FEFO.
2. **Alertes Visuelles Dynamiques** : Badges de couleur pour les seuils 30, 60 et 90 jours.
3. **Mise en Quarantaine Ciblée** : Bloquez un lot précis sans interrompre la vente des lots sains.
4. **Rapports d'Audit Multilingues** : Exportez vos historiques conformes en CSV, Excel ou PDF dans 11 langues.
`
  },

  de: {
    title: 'Chargen- & Mindesthaltbarkeits-Tracking: Best Practices für Lebensmittel, Getränke & Kosmetik',
    excerpt: 'Beherrschen Sie Chargenrückverfolgung, FIFO vs. FEFO-Rotationsalgorithmen, behördliche Compliance (FDA FSMA 204, EU-Kosmetikverordnung, GMP) und gezielte Produktrückrufe in unter 5 Minuten.',
    category: 'Betrieb & Compliance',
    keywords: ['Chargenrückverfolgung Software', 'Chargenrückruf Ablauf', 'FIFO vs FEFO Methode', 'MHD Ablaufwarnung Kasse', 'Lebensmittel Kosmetik Chargenverwaltung', 'GS1 128 Barcode Charge MHD', 'Verderb Reduzierung Einzelhandel', 'Sperrlager Warenwirtschaft'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Finanzielle und regulatorische Risiken von Verderb' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Mathematische Bestandsrotation' },
      { id: 'regulatory-compliance-standards', title: '3. Regulatorische Rahmenbedingungen: FDA, EU & GMP' },
      { id: 'surgical-recall-protocol', title: '4. Der 5-Minuten-Präzisionsrückruf-Standard' },
      { id: 'expiry-alert-thresholds', title: '5. Dynamische 30/60/90-Tage MHD-Warnstufen' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128 & 2D-DataMatrix Barcode-Codierung' },
      { id: 'spoilage-accounting-formulas', title: '7. Abschreibungsrechnung: Echte Verderbkosten ermitteln' },
      { id: 'inventory-360-lot-setup', title: '8. Chargen- und MHD-Verwaltung in Inventory 360' }
    ],
    content: `
### 1. Finanzielle und regulatorische Risiken von Verderb

Im Handel mit Lebensmitteln, Getränken, Kosmetika, Nahrungsergänzungsmitteln und Pharmazeutika ist die reine Artikelzählung ohne Chargenbezug ein unkalkulierbares Risiko.

Verfallene Ware bedeutet den Totalverlust des eingesetzten Einkaufswerts zuzüglich Entsorgungskosten:

\`\`\`
[ Wareneingang ] ➔ [ Chargenerfassung ] ➔ [ Regalplatzierung ]
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
             [ Rechtzeitig Verkauft ]                           [ Im Regal Abgelaufen ]
                       │                                                 │
            🟢 Volle Rohmarge Realisiert                        🔴 100% Kapitalverlust (COGS)
                                                                🔴 Kosten für Sonderabfallentsorgung
                                                                🔴 Bußgelder bei Gewerbekontrollen
\`\`\`

Die Welternährungsorganisation (FAO) beziffert die jährlichen Verderbverluste im Einzelhandel auf **1,8% bis 4,2% des Bruttoumsatzes**. Bei 2.000.000 € Umsatz verbrennt ein Geschäft **36.000 € bis 84.000 € an vermeidbarem Reingewinn**.

---

### 2. FIFO vs. FEFO: Mathematische Bestandsrotation

1. **FIFO (First-In, First-Out)**: Älteste Ware nach Wareneingangszeitpunkt wird zuerst verkauft ($T_{\\text{Eingang}}$).
2. **FEFO (First-Expired, First-Out)**: Ware mit kürzestem Mindesthaltbarkeitsdatum (MHD) wird priorisiert abgegeben ($T_{\\text{Verfall}}$).

#### Operativer Vergleich FIFO vs. FEFO:

| Merkmal / Kennzahl | FIFO (First-In, First-Out) | FEFO (First-Expired, First-Out) |
| :--- | :--- | :--- |
| **Primärer Sortierschlüssel** | Wareneingangsdatum & Uhrzeit | Zertifiziertes Verfallsdatum / MHD |
| **Ideale Handelsbranche** | Elektronik, Textil, Baumarkt, Trockensortiment | Molkerei, Feinkost, Kosmetik, Impfstoffe |
| **Schutz bei Lieferantenabweichungen** | 🔴 Gering (Kurzlaufende Neulieferungen verderben) | 🟢 Hoch (Kürzeste Restlaufzeit wird priorisiert) |
| **Barcode-Standard** | Standard 1D EAN / UPC | GS1-128 / 2D-DataMatrix mit KI-Tags |
| **Verderbreduktion** | Standardbasis | **Senkung der Verderbquote um 42% bis 68%** |

---

### 3. Regulatorische Rahmenbedingungen: FDA, EU & GMP

1. **FDA FSMA 204**: Pflicht zur Erfassung kritischer Nachverfolgungsereignisse (CTEs) für mindestens 24 Monate.
2. **EU-Kosmetikverordnung (EG 1223/2009)**: Kennzeichnungspflicht für Chargennummer und Verwendungsdauer nach dem Öffnen (PAO).
3. **Gute Herstellungspraxis (GMP)**: Vollständige Vorwärts- und Rückwärtsgenealogie aller Chargen.

---

### 4. Der 5-Minuten-Präzisionsrückruf-Standard

\`\`\`
[ Phase 1: HERSTELLER-RÜCKRUFMELDUNG ]
   │  ➔ Kontaminierte Charge gemeldet: SKU #ALM-100, Charge #LOT-9921
   ▼
[ Phase 2: BESTANDSSUCHE IN ECHTZEIT (< 30 Sekunden) ]
   │  ➔ IndexedDB Abfrage: 14 Stk in Lagerfach 4B | 6 Stk in Regalreihe 2.
   ▼
[ Phase 3: 1-KLICK SYSTEMSPERRUNG (< 15 Sekunden) ]
   │  ➔ Status geändert auf "SPERRLAGER_RÜCKRUF".
   │  ➔ Kassen verweigern den Barcode-Scan dieser Charge automatisch.
   ▼
[ Phase 4: KUNDENKONTAKTLISTE FILTERN (< 2 Minuten) ]
   │  ➔ Verkaufsprotokoll: 18 Einheiten an 12 erfasste Kunden verkauft.
   │  ➔ Sofortiger Kontaktexport für gesundheitliche Warnmeldungen.
\`\`\`

#### Rückruf-Reaktionszeiten im Vergleich:

| Kennzahl | Konventioneller Handel ohne Chargen | Inventory 360 Präzisions-Engine |
| :--- | :--- | :--- |
| **Such- & Isolationszeit** | 4 bis 8 Stunden (Manuelles Regalsuchen) | **< 30 Sekunden (Automatisierte Suche)** |
| **Vernichtete Ware** | 100% der Warengruppe (> 10.000 € Schaden) | **Nur betroffene Charge (450 €)** |
| **Kassensperre** | Notizzettel an den Kassenmonitoren | **Sofortige algorithmische Scan-Abweisung** |
| **Kundenwarnung** | Ohne Papierbelege unmöglich | **1-Klick-Export aller Kontaktdaten** |

---

### 5. Dynamische 30/60/90-Tage MHD-Warnstufen

\`\`\`
[ 90 Tage bis MHD ] ➔ 🟢 Regulärer Verkauf zum Standardpreis (19,99 €).
[ 60 Tage bis MHD ] ➔ 🟡 Gelbe Warnstufe: Platzierung im Regal vorne.
[ 30 Tage bis MHD ] ➔ 🟠 Automatischer 25% Rabatt oder Aktionsbündel.
[ 10 Tage bis MHD ] ➔ 🔴 Abverkauf (-50%) oder Abgabe an Hilfsorganisationen.
[ 0 Tage (Abgelaufen) ] ➔ ⛔ Kassensperre: Scan an Kasse dauerhaft unterbunden.
\`\`\`

---

### 6. GS1-128 & 2D-DataMatrix Barcode-Codierung

| Application Identifier (AI) | Encodiertes Datenfeld | Beispielzeichenfolge | Interpretation |
| :--- | :--- | :--- | :--- |
| **(01)** | Global Trade Item Number (GTIN) | \`00850012345678\` | Artikel-SKU |
| **(10)** | Chargen- / Losnummer | \`LOT-9921\` | Produktionscharge |
| **(17)** | Verfallsdatum (\`JJMMTT\`) | \`261130\` | Ablauf am 30.11.2026 |
| **(21)** | Seriennummer | \`SN-883492\` | Eindeutige Packungs-ID |

---

### 7. Abschreibungsrechnung: Echte Verderbkosten ermitteln

$$\\text{Verderbverlustquote (\\%)} = \\left( \\frac{\\text{Kosten abgelaufener Ware (\\euro)}}{\\text{Wareneinsatz verderblicher Waren (COGS \\euro)}} \\right) \\times 100$$

Ein Feinkostgeschäft mit 140.000 € COGS, 5.800 € Vernichtung, 650 € Entsorgung und 2.160 € Prüfaufwand weist **8.610 € Verlust (6,15%)** auf. Durch FEFO sinkt dieser Wert auf **unter 1,2%**, was **über 27.000 € Jahresgewinn** rettet.

---

### 8. Chargen- und MHD-Verwaltung in Inventory 360

[Inventory 360](https://www.inventory360.shop) bietet integriertes lokales Chargen-Tracking:
1. **Chargenerfassung beim Wareneingang**: Eingabe von Chargennummer und MHD bei Bestellannahme.
2. **Automatische MHD-Warnmeldungen**: Farbkodierte Kennzeichnung gefährdeter Bestände.
3. **Gezielte Chargenquarantäne**: Sperrung einzelner Chargen bei fortlaufendem Verkauf einwandfreier Bestände.
4. **Mehrsprachige Prüfberichte**: Revisionssichere Exporte in 11 Sprachen als CSV, Excel und PDF.
`
  },

  hi: {
    title: 'बैच, लॉट और समाप्ति तिथि ट्रैकिंग: खाद्य, पेय और सौंदर्य प्रसाधन रिटेलर्स के लिए संपूर्ण गाइड',
    excerpt: 'लॉट-स्तरीय ट्रेसेबिलिटी, FIFO बनाम FEFO स्टॉक रोटेशन नियम, नियामक अनुपालन (FDA FSMA 204, GMP) और स्वस्थ स्टॉक को नुकसान पहुंचाए बिना 5 मिनट में सर्जिकल रिकॉल करने की कार्यप्रणाली।',
    category: 'परिचालन और अनुपालन',
    keywords: ['लॉट ट्रैकिंग सॉफ्टवेयर', 'बैच नंबर रिकॉल प्रक्रिया', 'FIFO बनाम FEFO विधि', 'एक्सपायरी डेट अलर्ट पीओएस', 'खाद्य एवं सौंदर्य प्रसाधन ट्रेसेबिलिटी', 'GS1 128 बारकोड लॉट', 'खराब माल कम करने के उपाय', 'क्वारंटाइन इन्वेंटरी मैनेजमेंट'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. खराब होने वाले सामान की वित्तीय और कानूनी लागत' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO बनाम FEFO: स्टॉक रोटेशन की गणितीय प्रणाली' },
      { id: 'regulatory-compliance-standards', title: '3. नियामक मानक: FDA, FSSAI और GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5 मिनट में सर्जिकल बैच रिकॉल प्रक्रिया' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90 दिन का डायनामिक एक्सपायरी अलर्ट सिस्टम' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128 और 2D बारकोड एनकोडिंग' },
      { id: 'spoilage-accounting-formulas', title: '7. खराब माल की लागत का वास्तविक वित्तीय हिसाब' },
      { id: 'inventory-360-lot-setup', title: '8. Inventory 360 में बैच और एक्सपायरी प्रबंधन' }
    ],
    content: `
### 1. खराब होने वाले सामान की वित्तीय और कानूनी लागत

किराना, डेयरी, जूस, सौंदर्य प्रसाधन और दवाओं के व्यापार में एक्सपायरी तारीख का ध्यान न रखने पर भारी आर्थिक नुकसान होता है:

\`\`\`
[ माल की आवक ] ➔ [ बैच अनपैकिंग ] ➔ [ रैक पर सजाना ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [ समय पर बिक गया ]                               [ दुकान में एक्सपायर हुआ ]
                 │                                               │
    🟢 100% पूरा मुनाफा प्राप्त                               🔴 100% खरीद लागत का नुकसान (COGS)
                                                                 🔴 कचरा निपटान का खर्च
                                                                 🔴 स्वास्थ्य विभाग का चालान
\`\`\`

खाद्य एवं कृषि संगठन (FAO) के अनुसार रिटेल स्टोर हर साल अपनी कुल बिक्री का **1.8% से 4.2%** खराब माल के कारण गंवा देते हैं। 2 करोड़ रुपये के वार्षिक कारोबार वाले स्टोर के लिए यह सालाना **₹3,60,000 से ₹8,40,000 का सीधा नुकसान** है।

---

### 2. FIFO बनाम FEFO: स्टॉक रोटेशन की गणितीय प्रणाली

1. **FIFO (First-In, First-Out)**: जो माल पहले आया, वह पहले बिकेगा ($T_{\\text{आवक}}$)।
2. **FEFO (First-Expired, First-Out)**: जिसकी समाप्ति तिथि (Expiry Date) सबसे पहले है, वह पहले बिकेगा ($T_{\\text{एक्सपायरी}}$)।

#### FIFO बनाम FEFO तुलना:

| विशेषता | FIFO (पहले आया, पहले बिका) | FEFO (पहले एक्सपायर, पहले बिका) |
| :--- | :--- | :--- |
| **प्राथमिकता आधार** | ऑर्डर प्राप्ति की तारीख व समय | प्रमाणित एक्सपायरी तिथि |
| **उपयुक्त व्यापार** | इलेक्ट्रॉनिक्स, कपड़े, हार्डवेयर | डेयरी, फल-सब्जी, सौंदर्य प्रसाधन, दवाएं |
| **नुकसान से सुरक्षा** | 🔴 कम (नया माल पहले बिकने पर पुराना सड़ जाता है) | 🟢 अधिक (निकट एक्सपायरी वाला माल पहले निकलता है) |
| **बारकोड प्रकार** | साधारण 1D बारकोड | GS1-128 / 2D DataMatrix बारकोड |
| **औसत वेस्टेज में कमी** | सामान्य स्तर | **कचरा व नुकसान 42% से 68% तक कम** |

---

### 3. नियामक मानक: FDA, FSSAI और GMP

1. **FSSAI / FDA FSMA 204**: 24 महीने तक सभी खाद्य पदार्थों के लॉट और आपूर्ति रिकॉर्ड को अनिवार्य रूप से सुरक्षित रखना।
2. **कॉस्मेटिक्स नियम**: खोलने के बाद उपयोग की अवधि (PAO) की निगरानी।
3. **Good Manufacturing Practice (GMP)**: माल की संपूर्ण बैकवर्ड व फॉरवर्ड ट्रैकिंग।

---

### 4. 5 मिनट में सर्जिकल बैच रिकॉल प्रक्रिया

\`\`\`
[ चरण 1: सप्लायर से रिकॉल नोटिस आया ]
   │  ➔ खराब बैच की पहचान: SKU #ALM-100, लॉट #LOT-9921
   ▼
[ चरण 2: 30 सेकंड में सिस्टम में लोकेशन खोजें ]
   │  ➔ IndexedDB सर्च: 14 पीस गोदाम में | 6 पीस रैक नंबर 2 पर।
   ▼
[ चरण 3: 1-क्लिक में क्वारंटाइन लॉक ]
   │  ➔ स्टेटस बदलकर "QUARANTINE_RECALLED" किया गया।
   │  ➔ बिलिंग काउंटर पर बारकोड स्कैन स्वतः रिजेक्ट।
   ▼
[ चरण 4: प्रभावित ग्राहकों की सूची निकालें ]
   │  ➔ बिक्री लेज़र: 18 पीस 12 पंजीकृत ग्राहकों ने खरीदे।
   │  ➔ सुरक्षा सूचना भेजने हेतु संपर्क विवरण एक्सपोर्ट।
\`\`\`

---

### 5. 30/60/90 दिन का डायनामिक एक्सपायरी अलर्ट सिस्टम

\`\`\`
[ 90 दिन शेष ] ➔ 🟢 सामान्य बिक्री दर और निगरानी (पूर्ण मूल्य)।
[ 60 दिन शेष ] ➔ 🟡 पीला अलर्ट: उत्पाद को दुकान के मुख्य रैक पर आगे रखें।
[ 30 दिन शेष ] ➔ 🟠 25% का विशेष डिस्काउंट ऑफर या बंडल सेल।
[ 10 दिन शेष ] ➔ 🔴 50% क्लीयरेंस सेल या खाद्य बैंक को दान।
[ 0 दिन (समाप्त) ] ➔ ⛔ बिलिंग काउंटर पर पूर्ण प्रतिबंध।
\`\`\`

---

### 6. GS1-128 और 2D बारकोड एनकोडिंग

| आइडेंटिफ़ायर (AI) | डेटा | उदाहरण स्ट्रिंग | अर्थ |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN कोड | \`00850012345678\` | उत्पाद SKU |
| **(10)** | लॉट / बैच नंबर | \`LOT-9921\` | उत्पादन बैच |
| **(17)** | एक्सपायरी तारीख | \`261130\` | 30 नवंबर 2026 |
| **(21)** | सीरियल नंबर | \`SN-883492\` | यूनिट आईडी |

---

### 7. खराब माल की लागत का वास्तविक वित्तीय हिसाब

$$\\text{खराब माल नुकसान दर (\\%)} = \\left( \\frac{\\text{एक्सपायर माल की कुल लागत (₹)}}{\\text{बेचे गए कुल खराब होने वाले माल की लागत (₹)}} \\right) \\times 100$$

FEFO अपनाने से त्रैमासिक नुकसान **6.15% से घटकर 1.2% से कम** हो जाता है, जिससे सालाना **₹2,00,000 से अधिक की शुद्ध बचत** होती है।

---

### 8. Inventory 360 में बैच और एक्सपायरी प्रबंधन

[Inventory 360](https://www.inventory360.shop) आपके व्यापार को सुरक्षित करता है:
1. **आवक पर लॉट दर्ज करना**: खरीद प्रविष्टि करते समय लॉट व एक्सपायरी डालकर FEFO चालू करें।
2. **रंग-बिरंगे अलर्ट बैज**: 30, 60 और 90 दिन पर स्वतः चेतावनी।
3. **सर्जिकल लॉट क्वारंटाइन**: खराब बैच को तुरंत लॉक करें जबकि बाकी लॉट बिकते रहेंगे।
4. **11 भाषाओं में ऑडिट रिपोर्ट**: CSV, Excel और PDF डाउनलोड।
`
  },

  ja: {
    title: 'ロット管理・賞味期限トラッキング：食品・飲料・コスメ小売業のための実践ガイド',
    excerpt: 'ロット追跡、FIFO（先入れ先出し）vs FEFO（賞味期限先出し）数理アルゴリズム、規制コンプライアンス（食品衛生法・GMP）、健全在庫を守る5分間リコール手順を網羅。',
    category: '業務運用＆コンプライアンス',
    keywords: ['ロット管理 システム', 'リコール 手順', 'FIFO FEFO 先入れ先出し 違い', '賞味期限アラート POS', '食品 化粧品 在庫追跡', 'GS1 128 バーコード ロット', '廃棄ロス 削減', '隔離在庫 管理'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. 廃棄ロスと規制遵守がもたらす財務的インパクト' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO：在庫回転アルゴリズムの比較' },
      { id: 'regulatory-compliance-standards', title: '3. 主要規制フレームワーク：食品衛生法・薬機法・GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5分間で完了する対象ロット限定リコール手順' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90日段階的賞味期限アラートパイプライン' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128＆2次元データマトリックスの活用' },
      { id: 'spoilage-accounting-formulas', title: '7. 廃棄損の真実の保有コスト計算式' },
      { id: 'inventory-360-lot-setup', title: '8. Inventory 360でのロット＆期限管理運用' }
    ],
    content: `
### 1. 廃棄ロスと規制遵守がもたらす財務的インパクト

食品スーパー、オーガニックコスメ、サプリメント、医薬品分野において、単なる数量管理は重大なリスクを招きます。

非生鮮品と異なり、期限切れ商品は即座に100%の資本損失を生み出します：

\`\`\`
[ 商品入荷 ] ➔ [ ロット検品 ] ➔ [ 売場陳列 ]
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
       [ 期限内に販売完了 ]                              [ 売場で賞味期限切れ ]
                 │                                         │
      🟢 粗利益マージンを完全回収                        🔴 100%の仕入原価損失 (COGS)
                                                         🔴 廃棄処理費用
                                                         🔴 保健所・衛生指導リスク
\`\`\`

FAO（国連食糧農業機関）の推計では、小売店は期限切れ廃棄によって**年間売上の1.8%〜4.2%**を喪失しています。年商2億円の店舗では、毎年**360万〜840万円もの純利益**が失われています。

---

### 2. FIFO vs. FEFO：在庫回転アルゴリズムの比較

1. **FIFO（先入れ先出し）**：入荷日時順に出荷（$T_{\\text{入荷}}$）。
2. **FEFO（期限先出し）**：賞味期限が近い順に出荷（$T_{\\text{期限}}$）。

#### FIFO vs. FEFO 比較表：

| 項目 / 指標 | FIFO (先入れ先出し) | FEFO (賞味期限先出し) |
| :--- | :--- | :--- |
| **ソート基準** | 発注受領日時 | 正式な賞味期限・消費期限 |
| **適正分野** | アパレル、家電、日用品、乾物 | 飲料、生鮮、コスメ、医薬品 |
| **納品ズレへの耐性** | 🔴 低い（新入荷の短期限品が残存） | 🟢 極めて高い（期限順に自動消化） |
| **バーコード仕様** | 標準JAN / 1Dバーコード | GS1-128 / 2Dデータマトリックス |
| **廃棄ロス削減率** | 基準値 | **廃棄ロスを42%〜68%削減** |

---

### 3. 主要規制フレームワーク：食品衛生法・薬機法・GMP

1. **食品トレーサビリティ法 / FDA FSMA 204**：重要追跡イベント（CTE）の24ヶ月間保管義務。
2. **薬機法・化粧品基準**：製造番号（ロット）と開封後使用期限（PAO）の厳格管理。
3. **GMP基準**：原材料調達から最終販売レシートまでの完全な系譜管理。

---

### 4. 5分間で完了する対象ロット限定リコール手順

\`\`\`
[ フェーズ1: 仕入先からの回収要請 ]
   │  ➔ 対象ロット判明: SKU #ALM-100, Lot #LOT-9921
   ▼
[ フェーズ2: 台帳即時検索 (< 30秒) ]
   │  ➔ IndexedDB検索: バックヤード棚4Bに14点 | 売場2列目に6点。
   ▼
[ フェーズ3: 1クリック隔離ロック (< 15秒) ]
   │  ➔ ステータスを「回収隔離」に変更。
   │  ➔ POSレジで当該ロットのスキャンを自動拒否。
   ▼
[ フェーズ4: 購入顧客リストの抽出 (< 2分) ]
   │  ➔ 販売履歴から購入者12名を即時特定し安全通知。
\`\`\`

#### リコール対応の比較：

| 評価指標 | 従来の非追跡型店舗 | Inventory 360 精密管理 |
| :--- | :--- | :--- |
| **特定・隔離時間** | 4〜8時間（手作業での棚探し） | **30秒未満（台帳即時検索）** |
| **廃棄損害** | 当該商品全数（100万円以上の損失） | **対象ロットのみ（数万円程度）** |
| **レジ誤販売防止** | レジ画面へのメモ貼り付け | **アルゴリズムによる自動スキャン拒否** |
| **顧客追跡** | レシートなしでは追跡不能 | **1クリックでの連絡先リスト抽出** |

---

### 5. 30/60/90日段階的賞味期限アラートパイプライン

\`\`\`
[ 期限まで90日 ] ➔ 🟢 通常販売・消化速度の監視。
[ 期限まで60日 ] ➔ 🟡 黄色アラート：売場手前への配置換え（フェイシング変更）。
[ 期限まで30日 ] ➔ 🟠 自動25%値引き・バンドル販売。
[ 期限まで10日 ] ➔ 🔴 50%引き売り切り・フードバンク寄贈。
[ 期限切れ (0日) ] ➔ ⛔ レジロック：会計を絶対拒否。
\`\`\`

---

### 6. GS1-128＆2次元データマトリックスの活用

| アプリケーション識別子 (AI) | データ項目 | 生データ例 | 意味 |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN商品コード | \`00850012345678\` | 商品SKU |
| **(10)** | ロット番号 | \`LOT-9921\` | 製造バッチ |
| **(17)** | 賞味期限 (\`YYMMDD\`) | \`261130\` | 2026年11月30日期限 |
| **(21)** | 個体シリアル番号 | \`SN-883492\` | 単品ユニークID |

---

### 7. 廃棄損の真実の保有コスト計算式

$$\\text{廃棄損率 (\\%)} = \\left( \\frac{\\text{期限切れ廃棄総額}}{\\text{生鮮品売上原価 (COGS)}} \\right) \\times 100$$

FEFOと段階的値引きの導入により、廃棄損率は **6.15% から 1.2% 未満に改善** され、年間 **250万円以上の純利益** が守られます。

---

### 8. Inventory 360でのロット＆期限管理運用

[Inventory 360](https://www.inventory360.shop) による実践：
1. **仕入受入時のロット登録**：ロット番号と期限を入力してFEFOキューを有効化。
2. **色分けアラート**：30日・60日・90日の期限切迫品を可視化。
3. **対象ロット限定隔離**：問題ロットのみをピンポイントで販売停止。
4. **11言語監査レポート出力**：CSV/Excel/PDFでの完全な履歴出力。
`
  },

  zh: {
    title: '批次号与保质期管理全景实战：食品生鲜、美妆与医药零售的先进追溯规范',
    excerpt: '深度解析批次级可追溯性构建、FIFO（先进先出）与 FEFO（先到期先出）数理轮换模型、法规合规标准及5分钟精准批次召回标准作业程序（SOP）。',
    category: '运营管理与法规合规',
    keywords: ['批次追踪库存系统', '产品批次召回SOP', 'FIFO与FEFO对比', '保质期到期预警POS', '食品美妆追溯法规', 'GS1 128条形码批次', '降低生鲜临期损耗', '隔离库存管理'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. 易腐损耗与法规违规的双重财务代价' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO：库存轮换算法的数理机制' },
      { id: 'regulatory-compliance-standards', title: '3. 核心监管框架：食品安全法与GMP规范' },
      { id: 'surgical-recall-protocol', title: '4. 5分钟精准批次召回标准作业程序（SOP）' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90天动态阶梯式临期预警流水线' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128与二维DataMatrix的AI标识符编码' },
      { id: 'spoilage-accounting-formulas', title: '7. 损耗会计：量化真实的库存报废持有成本' },
      { id: 'inventory-360-lot-setup', title: '8. 在 Inventory 360 中落地批次与效期管理' }
    ],
    content: `
### 1. 易腐损耗与法规违规的双重财务代价

在生鲜食品、高端酒水、天然美妆、保健品和药品零售中，按总件数模糊记账是极其危险的。

与非易腐商品不同，临期过期商品直接转化为 100% 的净损失：

\`\`\`
[ 供应商送货到店 ] ➔ [ 批次拆箱验收 ] ➔ [ 排面货架陈列 ]
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
             [ 保质期内顺利售出 ]                              [ 货架上过期变质 ]
                       │                                                 │
            🟢 收回 100% 销售毛利                              🔴 100% 采购进货成本损失 (COGS)
                                                               🔴 危险废物环保处理费
                                                               🔴 市场监管行政处罚罚金
\`\`\`

联合国粮农组织（FAO）统计，零售商因临期过期直接造成的损耗占**年销售总额的 1.8% 至 4.2%**。年营收 2000 万元的门店每年因此蒸发 **36 万至 84 万元纯利润**。

---

### 2. FIFO vs. FEFO：库存轮换算法的数理机制

1. **FIFO（先进先出）**：按商品入库时间先后顺序出库（$T_{\\text{入库}}$）。
2. **FEFO（先到期先出）**：无论到货先后，严格按保质期临近程度优先出库（$T_{\\text{到期}}$）。

#### FIFO vs. FEFO 运营对比：

| 评估维度 / 指标 | FIFO（先进先出） | FEFO（先到期先出） |
| :--- | :--- | :--- |
| **核心排序键值** | 采购单收货日期与时间 | 权威质检保质期 / 最佳赏味期 |
| **适用零售行业** | 3C数码、服装鞋帽、五金、干货 | 生鲜乳品、烘焙、化妆品、疫苗 |
| **供应商混批保护** | 🔴 弱（短效期新到商品滞留仓库） | 🟢 极强（短效期商品优先陈列） |
| **条码规范要求** | 普通 1D EAN / UPC | GS1-128 / 二维 DataMatrix |
| **平均损耗削减** | 基准水平 | **过期报废损耗降低 42% 至 68%** |

---

### 3. 核心监管框架：食品安全法与GMP规范

1. **食品安全追溯法规 / FDA FSMA 204**：必须留存关键追溯事件（CTE）和核心数据要素（KDE）至少 24 个月。
2. **化妆品监管规范**：严格管理生产批号与开盖后保质期（PAO）。
3. **GMP 优良制造规范**：实现从原材料到销售小票的双向全链条追溯。

---

### 4. 5分钟精准批次召回标准作业程序（SOP）

\`\`\`
[ 阶段1: 供应商召回通报 ]
   │  ➔ 锁定污染批次: SKU #ALM-100, 批号 #LOT-9921
   ▼
[ 阶段2: 账本秒级检索 (< 30秒) ]
   │  ➔ IndexedDB 查询: 仓库4B货位有14件 | 2号货架有6件。
   ▼
[ 阶段3: 1键系统隔离 (< 15秒) ]
   │  ➔ 状态变更为 "QUARANTINE_RECALLED"。
   │  ➔ 收银台扫码枪自动报警并拒绝结账。
   ▼
[ 阶段4: 穿透追溯客户档案 (< 2分钟) ]
   │  ➔ 销售台账: 该批次已被 12 位会员购买 18 件。
   │  ➔ 一键导出联系名单并发送安全召回提醒。
\`\`\`

#### 召回响应能力对比：

| 指标 | 传统无批次台账门店 | Inventory 360 精准追溯引擎 |
| :--- | :--- | :--- |
| **排查隔离耗时** | 4 至 8 小时（员工手动翻找货架） | **< 30 秒（系统全库智能检索）** |
| **报废商品损失** | 该品类 100% 下架（损失数万元） | **仅限受污染批次（损失几百元）** |
| **收银台防漏售** | 收银机屏幕贴手工便签 | **扫码底层算法即时拦截禁售** |
| **消费者召回通知** | 无纸质小票时完全失联 | **1 键导出会员名单与联系电话** |

---

### 5. 30/60/90天动态阶梯式临期预警流水线

\`\`\`
[ 距到期90天 ] ➔ 🟢 正常动销监控，维持正价（19.99元）。
[ 距到期60天 ] ➔ 🟡 黄色预警：调整排面至前端显眼货位。
[ 距到期30天 ] ➔ 🟠 自动触发 7.5 折特惠或捆绑组合销售。
[ 距到期10天 ] ➔ 🔴 5折清仓或临期食品专柜捐赠。
[ 距到期0天 (过期) ] ➔ ⛔ 收银端绝对禁售：彻底锁死出单。
\`\`\`

---

### 6. GS1-128与二维DataMatrix的AI标识符编码

| 应用标识符 (AI) | 编码数据项 | 示例数据串 | 字段解析 |
| :--- | :--- | :--- | :--- |
| **(01)** | 商品全球代码 (GTIN) | \`00850012345678\` | 商品 SKU 代码 |
| **(10)** | 生产批次号 (Lot) | \`LOT-9921\` | 厂商生产批次 |
| **(17)** | 保质期截止 (\`YYMMDD\`) | \`261130\` | 2026年11月30日到期 |
| **(21)** | 单品序列号 | \`SN-883492\` | 唯一单品 ID |

---

### 7. 损耗会计：量化真实的库存报废持有成本

$$\\text{临期损耗率 (\\%)} = \\left( \\frac{\\text{过期报废商品总成本 (元)}}{\\text{易腐商品销售成本 (COGS 元)}} \\right) \\times 100$$

引入 FEFO 与阶梯促销后，损耗率可由 **6.15% 压降至 1.2% 以下**，每年为门店直接挽回 **10 万元以上纯利润**。

---

### 8. 在 Inventory 360 中落地批次与效期管理

[Inventory 360](https://www.inventory360.shop) 原生支持：
1. **入库登记批次与效期**：采购入库时输入批次号与保质期，激活 FEFO 队列。
2. **色彩化临期预警**：仪表盘高亮提示 30/60/90 天风险批次。
3. **精准批次锁定**：一键隔离特定批次，同商品其他健康批次正常销售。
4. **11种语言合规报表**：一键导出符合法规审计的 CSV、Excel 与 PDF。
`
  },

  ar: {
    title: 'تتبع التشغيلات وتواريخ الصلاحية: أفضل الممارسات لتجزئة الأغذية ومستحضرات التجميل',
    excerpt: 'دليل تشغيلي شامل لتتبع أرقام التشغيلات (Lots)، وخوارزميات تدوير المخزون FIFO مقابل FEFO، والامتثال التنظيمي، وإجراء استدعاء دقيق للتشغيلات في أقل من 5 دقائق دون إتلاف المخزون السليم.',
    category: 'العمليات والامتثال',
    keywords: ['برنامج تتبع أرقام التشغيلات', 'إجراءات سحب واستدعاء البضائع', 'مقارنة FIFO و FEFO', 'تنبيهات تاريخ الصلاحية نقاط البيع', 'تتبع الأغذية والتجميل', 'باركود GS1 128 تشغيلات', 'تقليل التوالف المنتهية الصلاحية', 'إدارة حجر البضائع'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. التكاليف المالية والتنظيمية لتلف البضائع المنتهية الصلاحية' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. مقارنة FIFO و FEFO: آليات تدوير المخزون رياضياً' },
      { id: 'regulatory-compliance-standards', title: '3. الأطر التنظيمية ومعايير سلامة الأغذية' },
      { id: 'surgical-recall-protocol', title: '4. خطة سحب واستدعاء التشغيلات المعيبة في 5 دقائق' },
      { id: 'expiry-alert-thresholds', title: '5. خط التنبيهات التدريجي للصلاحية (30/60/90 يوماً)' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. ترميز باركود GS1-128 والرموز ثنائية الأبعاد' },
      { id: 'spoilage-accounting-formulas', title: '7. محاسبة التوالف: حساب الخسارة المالية الفعلية' },
      { id: 'inventory-360-lot-setup', title: '8. إدارة الصلاحية والتشغيلات في Inventory 360' }
    ],
    content: `
### 1. التكاليف المالية والتنظيمية لتلف البضائع المنتهية الصلاحية

في قطاعات الأغذية والمشروبات ومستحضرات التجميل والأدوية، يؤدي غياب التتبع الدقيق للتشغيلات إلى خسائر مباشرة:

\`\`\`
[ استلام الشحنة ] ➔ [ فحص التشغيلة ] ➔ [ العرض على الرفوف ]
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
           [ بيع في فترة الصلاحية ]                              [ انتهاء الصلاحية على الرف ]
                    │                                               │
        🟢 تحصيل كامل هامش الربح                                  🔴 خسارة 100% من سعر الشراء (COGS)
                                                                    🔴 تكاليف إتلاف النفايات
                                                                    🔴 غرامات البلدية والتفتيش
\`\`\`

تفيد منظمة الأغذية والزراعة (FAO) بأن تجار التجزئة يخسرون **1.8% إلى 4.2% من إجمالي الإيرادات** سنوياً بسبب التوالف. لمتجر مبيعاته مليونا ريال، يمثل هذا **36,000 إلى 84,000 ريال من الأرباح الضائعة**.

---

### 2. مقارنة FIFO و FEFO: آليات تدوير المخزون رياضياً

1. **FIFO (الوارد أولاً يصرف أولاً)**: يعتمد على تاريخ الاستلام ($T_{\\text{الوصول}}$).
2. **FEFO (المنتهي أولاً يصرف أولاً)**: يعتمد على تاريخ انتهاء الصلاحية ($T_{\\text{الانتهاء}}$)، مما يخفض التوالف بنسبة **42% إلى 68%**.

#### جدول المقارنة التشغيلية:

| المعيار | نظام FIFO | نظام FEFO |
| :--- | :--- | :--- |
| **أساس الترتيب** | تاريخ ووقت استلام الشحنة | تاريخ انتهاء الصلاحية الفعلي |
| **الأنشطة المناسبة** | الملابس، الإلكترونيات، المواد الجافة | الأغذية، الألبان، التجميل، الأدوية |
| **الحماية من اختلاف التوريد** | 🔴 منخفضة (تلف الشحنات الجديدة قصيرة الأجل) | 🟢 ممتازة (صرف الأقرب انتهاءً أولاً) |
| **نوع الباركود** | 1D UPC / EAN عادي | GS1-128 / DataMatrix مع معرفات الذكاء |

---

### 3. الأطر التنظيمية ومعايير سلامة الأغذية

* متطلبات هيئات الغذاء والدواء (FDA FSMA 204 و SFDA): حفظ سجلات التتبع لمدة لا تقل عن 24 شهراً.
* ضوابط مستحضرات التجميل: مراقبة فترة الصلاحية بعد الفتح (PAO).

---

### 4. خطة سحب واستدعاء التشغيلات المعيبة في 5 دقائق

\`\`\`
[ المرحلة 1: إشعار سحب من المورد ] ➔ تحديد التشغيلة الملوثة: SKU #ALM-100, Lot #LOT-9921
         ▼
[ المرحلة 2: استعلام فوري في النظام (< 30 ثانية) ] ➔ 14 قطعة في المستودع | 6 قطع في الرف 2.
         ▼
[ المرحلة 3: حظر البيع بنقرة واحدة (< 15 ثانية) ] ➔ تحويل الحالة إلى "محجور" ورفض المسح في الكاشير.
         ▼
[ المرحلة 4: استخراج بيانات المشترين (< دقيقتين) ] ➔ تصدير قائمة العملاء لإرسال تحذير عاجل.
\`\`\`

---

### 5. خط التنبيهات التدريجي للصلاحية (30/60/90 يوماً)

* **90 يوماً**: البيع بالسعر الرسمي.
* **60 يوماً**: نقل المنتجات لمقدمة الرفوف.
* **30 يوماً**: خصم ترويجي 25%.
* **10 أيام**: تصفية بخصم 50%.
* **0 يوم (منتهي)**: منع البيع في الكاشير تماماً.

---

### 6. ترميز باركود GS1-128 والرموز ثنائية الأبعاد

| المعرف (AI) | البيانات | مثال | التفسير |
| :--- | :--- | :--- | :--- |
| **(01)** | كود GTIN | \`00850012345678\` | كود الصنف |
| **(10)** | رقم التشغيلة | \`LOT-9921\` | دفعة الإنتاج |
| **(17)** | تاريخ الانتهاء | \`261130\` | 30 نوفمبر 2026 |
| **(21)** | الرقم التسلسلي | \`SN-883492\` | معرف القطعة |

---

### 7. محاسبة التوالف: حساب الخسارة المالية الفعلية

$$\\text{نسبة التوالف (\\%)} = \\left( \\frac{\\text{تكلفة البضاعة المنتهية الصلاحية}}{\\text{تكلفة مبيعات البضائع القابلة للتلف (COGS)}} \\right) \\times 100$$

---

### 8. إدارة الصلاحية والتشغيلات في Inventory 360

[Inventory 360](https://www.inventory360.shop) يوفر لك:
1. تسجيل رقم التشغيلة وتاريخ الانتهاء عند الاستلام لتفعيل طابور FEFO.
2. تنبيهات ملونة لتواريخ 30 و 60 و 90 يوماً.
3. حجر فوري لأي تشغيلة محددة مع استمرار بيع التشغيلات السليمة.
4. تصدير تقارير المطابقة والتدقيق بـ 11 لغة بصيغ CSV و Excel و PDF.
`
  },

  pt: {
    title: 'Rastreamento de Lotes e Validade: Melhores Práticas para Alimentos, Bebidas e Cosméticos',
    excerpt: 'Domine a rastreabilidade no nível do lote, algoritmos de rotação FIFO vs FEFO, conformidade com órgãos reguladores (Anvisa, FDA) e recall cirúrgico em menos de 5 minutos sem descartar itens saudáveis.',
    category: 'Operações e Conformidade',
    keywords: ['software rastreamento de lotes', 'procedimento de recall de lote', 'diferença FIFO e FEFO estoque', 'alerta data de validade PDV', 'rastreabilidade alimentos cosméticos', 'código de barras GS1 128 lote', 'redução de perdas por validade', 'gestão de quarentena'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. O Custo Financeiro e Regulatório das Perdas por Validade' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: A Mecânica de Rotação de Estoque' },
      { id: 'regulatory-compliance-standards', title: '3. Normas Regulatórias: Anvisa, FDA e Boas Práticas (GMP)' },
      { id: 'surgical-recall-protocol', title: '4. Procedimento Padrão de Recall de Lote em 5 Minutos' },
      { id: 'expiry-alert-thresholds', title: '5. Linha de Alertas de Validade em 30/60/90 Dias' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Códigos GS1-128 e DataMatrix 2D: Tags de Lote' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilidade de Avarias: Medindo a Perda Real' },
      { id: 'inventory-360-lot-setup', title: '8. Gestão de Lotes no Inventory 360' }
    ],
    content: `
### 1. O Custo Financeiro e Regulatório das Perdas por Validade

No comércio de alimentos, bebidas especiais, cosméticos naturais, suplementos e medicamentos, o controle simplificado por quantidade é um risco financeiro.

Itens vencidos representam perda direta de 100% do capital:

\`\`\`
[ Recebimento do Lote ] ➔ [ Triagem e Etiquetagem ] ➔ [ Exposição nas Prateleiras ]
                                                            │
                       ┌────────────────────────────────────┴────────────────────────────────────┐
                       ▼                                                                         ▼
             [ Vendido Dentro do Prazo ]                                               [ Vencido na Prateleira ]
                       │                                                                         │
            🟢 Margem Bruta Total Realizada                                           🔴 Perda de 100% do Custo (CMV)
                                                                                      🔴 Custo de Descarte de Resíduos
                                                                                      🔴 Multas da Vigilância Sanitária
\`\`\`

A FAO estima que o varejo perde anualmente entre **1,8% e 4,2% do faturamento bruto** exclusivamente com mercadorias vencidas. Em uma loja com R$ 2.000.000 de faturamento, isso equivale a **R$ 36.000 a R$ 84.000 de lucro líquido perdido**.

---

### 2. FIFO vs. FEFO: A Mecânica de Rotação de Estoque

1. **FIFO (First-In, First-Out)**: Prioriza a data de recebimento da nota ($T_{\\text{entrada}}$).
2. **FEFO (First-Expired, First-Out)**: Prioriza os itens com validade mais próxima ($T_{\\text{validade}}$), **reduzindo perdas em até 68%**.

#### Comparação Operacional:

| Parâmetro | FIFO (Primeiro que Entra) | FEFO (Primeiro que Vence) |
| :--- | :--- | :--- |
| **Critério de Saída** | Data de entrada no estoque | Data de validade certificada |
| **Segmentos Indicados** | Moda, Informática, Materiais secos | Laticínios, Bebidas, Cosméticos, Vacinas |
| **Proteção de Lotes** | 🔴 Baixa (Lotes curtos novos estragam) | 🟢 Alta (Itens curtos saem imediatamente) |
| **Padrão de Código** | EAN-13 tradicional 1D | GS1-128 / DataMatrix 2D |

---

### 3. Normas Regulatórias: Anvisa, FDA e Boas Práticas (GMP)

1. **Anvisa / FDA FSMA 204**: Exigência de guarda de dados de rastreabilidade de lotes por no mínimo 24 meses.
2. **Cosméticos**: Controle rigoroso do Período Após Abertura (PAO).

---

### 4. Procedimento Padrão de Recall de Lote em 5 Minutos

\`\`\`
[ Fase 1: ALERTA DO FABRICANTE ] ➔ Lote contaminado: SKU #ALM-100, Lote #LOT-9921
         ▼
[ Fase 2: CONSULTA NO BANCO (< 30 Segundos) ] ➔ 14 un no estoque | 6 un no corredor 2.
         ▼
[ Fase 3: BLOQUEIO NO PDV (< 15 Segundos) ] ➔ Status "QUARENTENA" e recusa no caixa.
         ▼
[ Fase 4: AUDITORIA DE COMPRADORES (< 2 Minutos) ] ➔ Exportação da lista de clientes para aviso.
\`\`\`

---

### 5. Linha de Alertas de Validade em 30/60/90 Dias

* **90 Dias**: Monitoramento preventivo e preço cheio.
* **60 Dias**: Reposicionamento na frente da gôndola.
* **30 Dias**: Promoção com 25% de desconto.
* **10 Dias**: Queima de estoque (50% OFF) ou doação.
* **Vencido (0 Dia)**: Proibição total de venda no caixa.

---

### 6. Códigos GS1-128 e DataMatrix 2D

| Identificador (AI) | Informação | Exemplo | Significado |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN do Produto | \`00850012345678\` | Código SKU |
| **(10)** | Número do Lote | \`LOT-9921\` | Lote Industrial |
| **(17)** | Validade (\`AAMMDD\`) | \`261130\` | Vence 30/11/2026 |
| **(21)** | Serial Unitário | \`SN-883492\` | ID Individual |

---

### 7. Contabilidade de Avarias: Medindo a Perda Real

$$\\text{Taxa de Perda por Validade (\\%)} = \\left( \\frac{\\text{Custo de Descartes Vencidos (R\\$)}}{\\text{CMV de Perecíveis (R\\$)}} \\right) \\times 100$$

---

### 8. Gestão de Lotes no Inventory 360

[Inventory 360](https://www.inventory360.shop) oferece:
1. Cadastro de lote e vencimento na entrada de notas de compra para fila FEFO.
2. Avisos visuais em 30, 60 e 90 dias nos relatórios de estoque.
3. Bloqueio pontual de lotes defeituosos com liberação dos saudáveis.
4. Exportação de relatórios em 11 idiomas em CSV, Excel e PDF.
`
  },

  it: {
    title: 'Tracciabilità di Lotti e Scadenze: Best Practice per il Settore Alimentare, Beverage e Cosmetica',
    excerpt: 'Padroneggia la tracciabilità dei lotti, gli algoritmi di rotazione FIFO vs FEFO, la conformità normativa (HACCP, UE 1223/2009) e la procedura di richiamo mirato del lotto in meno di 5 minuti senza distruggere i prodotti sani.',
    category: 'Operazioni e Normativa',
    keywords: ['software tracciabilità lotti', 'procedura richiamo lotto prodotto', 'rotazione scorte FIFO FEFO', 'avviso data di scadenza cassa', 'tracciabilità alimentare cosmetica', 'codice a barre GS1 128 lotto', 'riduzione scarti scaduti', 'gestione quarantena magazzino'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Il Costo Economico e Normativo dei Prodotti Deperibili' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Meccanica Matematica della Rotazione Scorte' },
      { id: 'regulatory-compliance-standards', title: '3. Normative di Settore: HACCP, Norme UE e GMP' },
      { id: 'surgical-recall-protocol', title: '4. Procedura Operativa di Richiamo del Lotto in 5 Minuti' },
      { id: 'expiry-alert-thresholds', title: '5. Pipeline di Allarmi Scadenza a 30/60/90 Giorni' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Codifica GS1-128 e DataMatrix 2D: Tag AI per Lotti' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilità degli Scarti: Calcolo della Perdita Reale' },
      { id: 'inventory-360-lot-setup', title: '8. Gestione Lotti e Scadenze in Inventory 360' }
    ],
    content: `
### 1. Il Costo Economico e Normativo dei Prodotti Deperibili

Nei settori alimentare, cosmetico e farmaceutico, la mancata gestione delle scadenze provoca una perdita media compresa tra l'**1,8% e il 4,2% del fatturato annuo**:

\`\`\`
[ Ricevimento Merci ] ➔ [ Registrazione Lotto ] ➔ [ Esposizione a Scaffale ]
                                                        │
                       ┌────────────────────────────────┴────────────────────────────────┐
                       ▼                                                                 ▼
            [ Venduto Entro la Scadenza ]                                     [ Scaduto sullo Scaffale ]
                       │                                                                 │
          🟢 Margine Lordo 100% Incassato                                     🔴 Perdita Totale del Costo (COGS)
                                                                              🔴 Costi Smaltimento Rifiuti
                                                                              🔴 Sanzioni ASL e Controlli
\`\`\`

---

### 2. FIFO vs. FEFO: Meccanica Matematica della Rotazione Scorte

* **FIFO (First-In, First-Out)**: Prelievo in base all'ordine di arrivo ($T_{\\text{arrivo}}$).
* **FEFO (First-Expired, First-Out)**: Priorità ai prodotti con scadenza più ravvicinata ($T_{\\text{scadenza}}$), **riducendo gli scarti del 42%-68%**.

---

### 3. Normative di Settore: HACCP, Norme UE e GMP

1. **HACCP & Regolamento UE**: Conservazione obbligatoria dei registri di tracciabilità per 24 mesi.
2. **Cosmetica (CE 1223/2009)**: Controllo del Periodo Dopo l'Apertura (PAO).

---

### 4. Procedura Operativa di Richiamo del Lotto in 5 Minuti

\`\`\`
[ Fase 1: NOTIFICA DI RICHIAMO ] ➔ Individuazione lotto difettoso: SKU #ALM-100, Lotto #LOT-9921
         ▼
[ Fase 2: RICERCA NEL DATABASE (< 30 Secondi) ] ➔ 14 pz in magazzino | 6 pz in corsia 2.
         ▼
[ Fase 3: BLOCCO CASSA IN 1 CLIC (< 15 Secondi) ] ➔ Stato "QUARANTENA" e rifiuto barcode alla cassa.
         ▼
[ Fase 4: ESTRAZIONE CLIENTI (< 2 Minuti) ] ➔ Esportazione lista acquirenti per avviso sanitario.
\`\`\`

---

### 5. Pipeline di Allarmi Scadenza a 30/60/90 Giorni

* **90 Giorni**: Monitoraggio standard a prezzo pieno.
* **60 Giorni**: Spostamento sul fronte dello scaffale.
* **30 Giorni**: Sconto promozionale del 25%.
* **10 Giorni**: Vendita lampo al 50% o donazione.
* **Scaduto (0 Giorni)**: Blocco assoluto della vendita alla cassa.

---

### 6. Codifica GS1-128 e DataMatrix 2D: Tag AI per Lotti

| Identificatore (AI) | Dato | Esempio | Significato |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN Prodotto | \`00850012345678\` | Codice SKU |
| **(10)** | Numero Lotto | \`LOT-9921\` | Lotto di Produzione |
| **(17)** | Data Scadenza (\`AAMMGG\`) | \`261130\` | Scade il 30/11/2026 |
| **(21)** | Seriale Unitario | \`SN-883492\` | ID Singolo |

---

### 7. Contabilità degli Scarti: Calcolo della Perdita Reale

$$\\text{Tasso di Scarto (\\%)} = \\left( \\frac{\\text{Costo Merci Scadute (\\euro)}}{\\text{Costo del Venduto Deperibili (COGS \\euro)}} \\right) \\times 100$$

---

### 8. Gestione Lotti e Scadenze in Inventory 360

[Inventory 360](https://www.inventory360.shop) gestisce:
1. Registrazione numero di lotto e scadenza al carico merci per la coda FEFO.
2. Badge visivi di allerta nei report di magazzino.
3. Quarantena mirata del singolo lotto senza bloccare i lotti conformi.
4. Esportazione di report di conformità in 11 lingue in CSV, Excel e PDF.
`
  },

  ru: {
    title: 'Учет Партий, Серий и Сроков Годности: Руководство для Продуктового, Косметического и Фарма-Ритейла',
    excerpt: 'Полное практическое руководство: поштучный партионный учет, алгоритмы ротации FIFO vs FEFO, регуляторный комплаенс (Честный Знак, ХАССП, GMP) и локальный отзыв партии за 5 минут без списания здорового товара.',
    category: 'Операции и Регламенты',
    keywords: ['партионный учет программа', 'регламент отзыва партии товара', 'ротация склада FIFO FEFO', 'контроль сроков годности на кассе', 'учет сроков годности косметика продукты', 'штрихкод GS1 128 срок годности', 'снижение списаний просрочки', 'карантинный учет склада'],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Финансовые и Юридические Риски Списания Просрочки' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Математика Ротации Складских Запасов' },
      { id: 'regulatory-compliance-standards', title: '3. Стандарты Регулирования: ХАССП, ЕАЭС и GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5-Минутный Регламент Выборочного Отзыва Партии' },
      { id: 'expiry-alert-thresholds', title: '5. Каскадная Система Предупреждений за 30/60/90 Дней' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Кодирование GS1-128 и DataMatrix: Теги Партий и Сроков' },
      { id: 'spoilage-accounting-formulas', title: '7. Учет Списаний: Расчет Реального Ущерба от Порчи' },
      { id: 'inventory-360-lot-setup', title: '8. Настройка Партий и Сроков Годности в Inventory 360' }
    ],
    content: `
### 1. Финансовые и Юридические Риски Списания Просрочки

В торговле продуктами питания, напитками, косметикой и аптечным ассортиментом штучный учет без привязки к срокам годности приводит к колоссальным потерям:

\`\`\`
[ Поступление Товара ] ➔ [ Приемка по Партиям ] ➔ [ Выкладка на Полки ]
                                                          │
                       ┌──────────────────────────────────┴──────────────────────────────────┐
                       ▼                                                                     ▼
             [ Продано в Срок Годности ]                                           [ Просрочено на Полке ]
                       │                                                                     │
            🟢 Полная Торговая Наценка                                            🔴 100% Списание Себестоимости (COGS)
                                                                                  🔴 Расходы на Утилизацию Отходов
                                                                                  🔴 Штрафы Роспотребнадзора
\`\`\`

По данным FAO, розничные сети теряют от **1.8% до 4.2% годовой выручки** исключительно на списаниях просроченной продукции. При обороте 100 млн рублей в год это составляет **от 1.8 до 4.2 млн рублей чистых прямых убытков**.

---

### 2. FIFO vs. FEFO: Математика Ротации Складских Запасов

1. **FIFO (First-In, First-Out)**: Списание по времени поступления на склад ($T_{\\text{приход}}$).
2. **FEFO (First-Expired, First-Out)**: Приоритетная продажа товаров с ближайшим сроком годности ($T_{\\text{срок}}$).

#### Операционное Сравнение FIFO vs. FEFO:

| Параметр / Метрика | FIFO (Первым Пришел, Первым Ушел) | FEFO (Первым Истекает, Первым Ушел) |
| :--- | :--- | :--- |
| **Ключ Сортировки** | Дата и время приемки накладной | Официальный срок годности товара |
| **Отрасли Применения** | Электроника, одежда, крепеж, сухие смеси | Молочка, кулинария, косметика, вакцины |
| **Защита от Пересорта** | 🔴 Низкая (Свежие партии с коротким сроком сгорают) | 🟢 Высокая (Короткие сроки сразу идут в продажу) |
| **Формат Штрихкода** | Обычный 1D EAN-13 | GS1-128 / 2D DataMatrix (Честный Знак) |
| **Снижение Списаний** | Базовый уровень | **Снижение потерь от порчи на 42%–68%** |

---

### 3. Стандарты Регулирования: ХАССП, ЕАЭС и GMP

1. **ХАССП / Честный Знак**: Обязательный учет каждой маркированной единицы и фиксация сроков годности.
2. **Техрегламенты ЕАЭС по Косметике**: Контроль сроков годности и периода использования после вскрытия (PAO).
3. **GMP**: Сквозная прослеживаемость от завода до чека покупателя.

---

### 4. 5-Минутный Регламент Выборочного Отзыва Партии

\`\`\`
[ Этап 1: УВЕДОМЛЕНИЕ ОТ ПОСТАВЩИКА ]
   │  ➔ Выявлен брак партии: SKU #ALM-100, Партия #LOT-9921
   ▼
[ Этап 2: ПОИСК В БАЗЕ (< 30 Секунд) ]
   │  ➔ Запрос в IndexedDB: 14 шт на складе 4B | 6 шт на полке ряда 2.
   ▼
[ Этап 3: БЛОКИРОВКА В 1 КЛИК (< 15 Секунд) ]
   │  ➔ Статус изменен на "КАРАНТИН_ОТОЗВАН".
   │  ➔ Кассовый узел автоматически отклоняет штрихкод этого лота.
   ▼
[ Этап 4: ВЫГРУЗКА СПИСКА ПОКУПАТЕЛЕЙ (< 2 Минут) ]
   │  ➔ Лог продаж: 18 шт продано 12 клиентам.
   │  ➔ Экспорт контактов для срочного смс/email оповещения.
\`\`\`

---

### 5. Каскадная Система Предупреждений за 30/60/90 Дней

\`\`\`
[ 90 Дней до Срока ] ➔ 🟢 Мониторинг скорости продаж по полной цене.
[ 60 Дней до Срока ] ➔ 🟡 Желтое Предупреждение: Перемещение на передний план.
[ 30 Дней до Срока ] ➔ 🟠 Автоматическая промо-скидка 25% или бандл.
[ 10 Дней до Срока ] ➔ 🔴 Финальная распродажа (-50%) или списание.
[ 0 Дней (Просрочено) ] ➔ ⛔ Запрет Продажи: Полный отказ в чеке на кассе.
\`\`\`

---

### 6. Кодирование GS1-128 и DataMatrix: Теги Партий и Сроков

| Идентификатор (AI) | Данные | Пример | Расшифровка |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN код товара | \`00850012345678\` | Артикул SKU |
| **(10)** | Номер Партии / Серии | \`LOT-9921\` | Производственная серия |
| **(17)** | Срок Годности (\`ГГММДД\`) | \`261130\` | Годен до 30.11.2026 |
| **(21)** | Индивидуальный Серийный Номер | \`SN-883492\` | Уникальный код единицы |

---

### 7. Учет Списаний: Расчет Реального Ущерба от Порчи

$$\\text{Уровень Потерь от Порчи (\\%)} = \\left( \\frac{\\text{Стоимость Списанной Просрочки (руб)}}{\\text{Себестоимость Проданных Скоропортящихся Товаров (COGS руб)}} \\right) \\times 100$$

Внедрение FEFO снижает списания с **6.15% до менее чем 1.2%**, сохраняя для магазина **более 1 500 000 рублей чистой прибыли** ежегодно.

---

### 8. Настройка Партий и Сроков Годности в Inventory 360

[Inventory 360](https://www.inventory360.shop) автоматизирует партионный учет:
1. **Ввод Партии при Приемке**: Регистрация серии и даты экспирации для автоматической FEFO-очереди.
2. **Цветовая Индикация**: Наглядные индикаторы рисков за 30, 60 и 90 дней до конца срока.
3. **Выборочный Карантин**: Блокировка отдельной партии с сохранением продаж остальных серий.
4. **Аудиторские Отчеты на 11 Языках**: Выгрузка полной истории движения в CSV, Excel и PDF.
`
  }
};

const i18nPath = 'd:/Website Dev/Free Inventory/inventory360/lib/blogI18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const startMarker = `'batch-lot-expiry-date-tracking-guide':`;
const endMarker = `'barcode-label-printing-sku-system-guide':`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newBlog4 = `'batch-lot-expiry-date-tracking-guide': ${JSON.stringify(blog4_translations, null, 2)},\n  `;
  const updatedCode = code.slice(0, startIndex) + newBlog4 + code.slice(endIndex);
  fs.writeFileSync(i18nPath, updatedCode, 'utf8');
  console.log('Successfully updated Blog 4 with full 8-section content across all 11 languages!');
} else {
  console.error('Could not locate markers for Blog 4 in lib/blogI18n.ts');
}
