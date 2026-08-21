import fs from 'fs';

const blog8_translations = {
  es: {
    title: 'Clasificación de Inventario ABC y Liquidación de Stock Muerto: Liberando Capital de Trabajo',
    excerpt: 'Guía operativa para auditar y sanear inventarios minoristas: Principio de Pareto 80/20, matriz ABC-XYZ de volatilidad de demanda, cálculo del coste de mantenimiento y el manual de liquidación en 5 fases para transformar stock obsoleto en liquidez.',
    category: 'Estrategia de Inventario',
    keywords: [
      'clasificación ABC de inventario fórmula',
      'matriz ABC XYZ gestión de stock',
      'liquidar stock muerto comercio retail',
      'principio de pareto inventarios 80 20',
      'coste de posesión stock obsoleto',
      'estrategias liquidación stock sin dañar marca',
      'auditoría de inventario por antigüedad',
      'liberar capital de trabajo almacén',
      'lotes de liquidación B2B',
      'software análisis ABC inventario gratis'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. El Principio de Pareto 80/20 en el Inventario Minorista' },
      { id: 'abc-classification-math', title: '2. El Algoritmo Matemático de Clasificación ABC' },
      { id: 'abc-xyz-matrix', title: '3. La Matriz 9-Box ABC-XYZ de Volatilidad de Demanda' },
      { id: 'true-cost-dead-stock', title: '4. La Verdadera Anatomía Financiera del Stock Muerto' },
      { id: 'dead-stock-identification-audit', title: '5. Protocolo Cuantitativo de Detección de Stock Muerto' },
      { id: 'five-step-liquidation-playbook', title: '6. El Manual de Liquidación en 5 Fases: Recuperar Liquidez' },
      { id: 'prevention-guardrails', title: '7. Salvaguardas Automáticas contra la Reaparición de Stock Muerto' },
      { id: 'inventory-360-abc-setup', title: '8. Ejecución del Análisis ABC y Auditoría en Inventory 360' }
    ],
    content: `
### 1. El Principio de Pareto 80/20 en el Inventario Minorista

En el comercio minorista, **el 80% de los ingresos anuales suele generarse con solo el 20% del catálogo**. Tratar todos los artículos por igual en las compras y el almacenamiento es una de las causas principales de quiebra comercial:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                 CURVA PARETO DE INVENTARIO                  │
   80% │                           ┌─────────────────────────────────┤ ➔ CLASE A (20% Catálogo = 80% Valor)
       │                     ┌─────┘                                 │   • Máxima atención y revisión diaria
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ CLASE B (30% Catálogo = 15% Valor)
   40% │    ┌────┘                                                   │   • Atención media y revisión quincenal
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ CLASE C (50% Catálogo = 5% Valor)
       │                                                             │   • Stock mínimo, peligro de stock muerto
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % TOTAL DE SKUs
\`\`\`

#### Los Dos Errores Fatales en la Gestión Tradicional:
1. **Asignación Indiscriminada de Recursos**: Dedicar el mismo tiempo de conteo y auditoría a un tornillo de 0,05 € que a un smartphone de 800 €.
2. **Ignorar el Coste de Almacenamiento de los Artículos C**: Dejar cientos de referencias de baja rotación en las estanterías absorbiendo costes de alquiler, seguro y depreciación.

---

### 2. El Algoritmo Matemático de Clasificación ABC

Para clasificar científicamente el catálogo, calculamos el **Valor de Consumo Anual (ACV)** de cada SKU:

$$\\text{Valor de Consumo Anual (ACV)} = \\text{Unidades Vendidas al Año} \\times \\text{Coste Unitario}$$

#### Algoritmo de Cálculo en 5 Pasos:
1. Multiplique las ventas anuales en unidades por el coste de compra de cada SKU.
2. Ordene la lista de productos de mayor a menor valor de consumo anual.
3. Calcule el porcentaje individual de cada artículo sobre el valor total del inventario.
4. Genere la columna de porcentaje acumulado sumando fila a fila.
5. Asigne las categorías:
   * **Clase A**: Artículos que representan el **primer 70% a 80%** del valor acumulado (generalmente el 10-20% de los SKUs).
   * **Clase B**: Artículos que representan el **siguiente 15%** del valor acumulado (aproximadamente el 30% de los SKUs).
   * **Clase C**: Artículos que representan el **último 5% al 10%** del valor acumulado (el 50% de los SKUs).

#### Ejemplo de Clasificación con 8 SKUs:

| SKU | Ventas Anuales (Uds) | Coste Unitario | Valor Consumo (ACV) | % del Total | % Acumulado | Clase ABC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SKU-A1** | $1.200$ | $50,00 €$ | $60.000 €$ | $44,4\%$ | $44,4\%$ | **Clase A** |
| **SKU-A2** | $800$ | $60,00 €$ | $48.000 €$ | $35,6\%$ | $80,0\%$ | **Clase A** |
| **SKU-B1** | $400$ | $30,00 €$ | $12.000 €$ | $8,9\%$ | $88,9\%$ | **Clase B** |
| **SKU-B2** | $300$ | $25,00 €$ | $7.500 €$ | $5,6\%$ | $94,4\%$ | **Clase B** |
| **SKU-C1** | $150$ | $20,00 €$ | $3.000 €$ | $2,2\%$ | $96,7\%$ | **Clase C** |
| **SKU-C2** | $100$ | $20,00 €$ | $2.000 €$ | $1,5\%$ | $98,1\%$ | **Clase C** |
| **SKU-C3** | $100$ | $15,00 €$ | $1.500 €$ | $1,1\%$ | $99,3\%$ | **Clase C** |
| **SKU-C4** | $100$ | $10,00 €$ | $1.000 €$ | $0,7\%$ | $100,0\%$ | **Clase C** |

---

### 3. La Matriz 9-Box ABC-XYZ de Volatilidad de Demanda

El análisis ABC mide el **valor monetario**, pero no la **previsibilidad de la demanda**. La clasificación **XYZ** añade esta dimensión calculando el **Coeficiente de Variación ($CV$)**:

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Desviación Estándar de la Demanda}}{\\text{Media de la Demanda}}$$

* **Clase X ($CV < 0.5$)**: Demanda constante y muy predecible (pan, leche, consumibles diarios).
* **Clase Y ($0.5 \\le CV \\le 1.0$)**: Demanda estacional o con fluctuaciones moderadas.
* **Clase Z ($CV > 1.0$)**: Demanda esporádica e impredecible (repuestos industriales, vestidos de fiesta).

#### Matriz 9-Box de Estrategias Operativas:

| Cuadrante | Características | Estrategia de Inventario y Aprovisionamiento | Nivel de Seguridad |
| :--- | :--- | :--- | :--- |
| **AX** | Alto valor, demanda estable y predecible | Just-in-Time (JIT), pedidos automáticos frecuentes, stock de seguridad mínimo | $98\\%$ CSL |
| **AY** | Alto valor, fluctuación estacional | Previsiones basadas en estacionalidad, contratos de reserva con proveedores | $95\\%$ CSL |
| **AZ** | Alto valor, demanda esporádica | Fabricación bajo pedido (Make-to-Order) o compra bajo pedido en firme del cliente | Mínimo / Cero |
| **BX** | Valor medio, demanda constante | Revisión continua estándar $(s, Q)$ con lotes económicos EOQ | $95\\%$ CSL |
| **BY** | Valor medio, demanda estacional | Stock de seguridad amortiguador, pedidos bimensuales ajustados | $90\\%$ CSL |
| **BZ** | Valor medio, demanda impredecible | Stock de seguridad bajo, compras reactivas ante pedidos de clientes | $85\\%$ CSL |
| **CX** | Bajo valor, demanda estable | Pedidos en grandes lotes para obtener descuentos por volumen y reducir portes | $95\\%$ CSL |
| **CY** | Bajo valor, demanda estacional | Compras puntuales de temporada, liquidación rápida al final de campaña | $85\\%$ CSL |
| **CZ** | Bajo valor, demanda esporádica | **CANDIDATO DIRECTO A ELIMINACIÓN**: Vender bajo catálogo sin stock físico | Cero Stock |

---

### 4. La Verdadera Anatomía Financiera del Stock Muerto

El **Stock Muerto (Dead Stock)** está compuesto por artículos que no han registrado ninguna venta en los últimos **90 a 180 días**. 

Mantener stock muerto en el almacén cuesta entre un **20% y un 30% anual de su valor de compra**:

\`\`\`
             [ ANATOMÍA DEL COSTE ANUAL DE MANTENIMIENTO: 20% - 30% ]
  ├── 1. Coste de Oportunidad del Capital (10% - 15%):
  │      Intereses bancarios o rentabilidad perdida por no invertir en productos Clase A.
  ├── 2. Coste de Alquiler de Espacio y Suministros (4% - 8%):
  │      Metros cuadrados de estantería ocupados, climatización y seguridad.
  ├── 3. Seguros y Manipulación Física (2% - 4%):
  │      Pólizas de cobertura, horas de personal en inventarios y traslados.
  └── 4. Depreciación, Daños y Obsolescencia (4% - 10%):
         Pérdida de valor de mercado con cada mes que pasa.
\`\`\`

> Si tiene $50.000 € atrapados en stock muerto, su empresa está perdiendo entre **$10.000 € y $15.000 € cada año** solo en costes invisibles de mantenimiento.

---

### 5. Protocolo Cuantitativo de Detección de Stock Muerto

#### Categorización por Antigüedad de Inventario:
* **0 a 60 Días (Stock Activo)**: Rotación normal dentro del ciclo comercial.
* **61 a 120 Días (Rotación Lenta)**: Artículos que requieren atención comercial.
* **121 a 180 Días (Stock Estancado)**: Artículos con riesgo inminente de obsolescencia.
* **Más de 180 Días (Stock Muerto Oficial)**: Artículos sin movimiento que deben ser liquidados.

#### Diagnóstico de Causas Raíz:
1. **Previsiones de Compra Excesivas**: Pedidos sobredimensionados por compras emocionales sin calcular el ROP.
2. **Cambio en Tendencias o Normativas**: Productos reemplazados por nuevas versiones tecnológicas o modas.
3. **Precios Fuera de Mercado**: Precios de venta inflados que frenaron la demanda frente a la competencia.
4. **Visibilidad Nula en Tienda**: Artículos mal ubicados en rincones oscuros o sin publicar en la web.

---

### 6. El Manual de Liquidación en 5 Fases: Recuperar Liquidez

\`\`\`
                     [ PIRÁMIDE DE LIQUIDACIÓN DE STOCK MUERTO ]

          ▲
         / \\     [ Nivel 1: Empaquetado Algorítmico en TPV (Descuento 0%-20%) ]
        /───\\    ─────────────────────────────────────────────────────────────
       /     \\   [ Nivel 2: Ventas Flash VIP / Páginas Ocultas (Desc. 30%-50%) ]
      /───────\\  ─────────────────────────────────────────────────────────────
     /         \\ [ Nivel 3: Descuentos Agresivos en Marketplaces (Desc. 60%-70%) ]
    /───────────\\[ Nivel 4: Venta B2B por Lotes a Mayoristas (Al Coste / -10%) ]
   /─────────────\\[ Nivel 5: Donación Benéfica y Deducción Fiscal (Desgravación) ]
\`\`\`

* **Nivel 1: Empaquetado (Bundling) en TPV**: Vincule el artículo de stock muerto con un producto estrella Clase A a precio especial (ej. "Compre el teclado premium y llévese la alfombrilla por 2 € más").
* **Nivel 2: Ventas Privadas a Clientes VIP**: Envíe ofertas exclusivas por newsletter o WhatsApp a sus mejores clientes sin hacer pública la rebaja para proteger la imagen de marca.
* **Nivel 3: Canales Secundarios y Marketplaces**: Venda el excedente en plataformas como eBay, Wallapop o Amazon Outlet con nombres de vendedor secundarios.
* **Nivel 4: Venta en Bloque a Mayoristas B2B**: Venda pallets enteros a liquidadores profesionales para recuperar liquidez inmediata al coste o con ligera pérdida.
* **Nivel 5: Donación y Deducción Fiscal**: Done los productos a ONGs o instituciones educativas para obtener certificados de desgravación fiscal en el Impuesto de Sociedades.

---

### 7. Salvaguardas Automáticas contra la Reaparición de Stock Muerto

1. **Acuerdos de Devolución con Proveedores (RTV - Return to Vendor)**: Negocie cláusulas de recompra o canje por novedades para productos que no se vendan en 90 días.
2. **Límites Presupuestarios en Compras Novedosas**: No comprometa más del 15% del presupuesto mensual en productos no probados.
3. **Puntos de Pedido Dinámicos**: Bloquee las recompras automáticas de artículos cuya velocidad de venta descienda por debajo de los umbrales de seguridad.

---

### 8. Ejecución del Análisis ABC y Auditoría en Inventory 360

[Inventory 360](https://www.inventory360.shop) integra herramientas automáticas de auditoría:

1. **Clasificación ABC Automática**: El motor calcula instantáneamente el valor de consumo de cada producto y asigna las etiquetas A, B y C.
2. **Panel de Antigüedad y Alertas de Stock Estancado**: Identifique en segundos todos los artículos sin ventas en más de 90 o 180 días.
3. **Promociones y Descuentos en TPV en 1 Clic**: Aplique descuentos de liquidación o configure packs de productos al instante.
4. **Exportación de Informes de Capital de Trabajo**: Descargue auditorías completas en CSV, Excel o PDF en 11 idiomas con total privacidad en su dispositivo.
`
  },

  fr: {
    title: 'Classification ABC des Stocks et Liquidation des Stocks Dormants : Libérer du Fond de Roulement',
    excerpt: 'Méthodologie complète d’audit des stocks : Principe de Pareto 80/20, matrice ABC-XYZ de volatilité, coûts cachés d’entreposage et stratégie de liquidation en 5 paliers pour transformer les rossignols en trésorerie disponible.',
    category: 'Stratégie de Stock',
    keywords: [
      'classification ABC stock formule',
      'matrice ABC XYZ gestion des stocks',
      'liquider stock dormant rossignol commerce',
      'principe de pareto stocks 80 20',
      'coût de possession stock obsolète',
      'stratégie déstockage sans détruire la marque',
      'audit ancienneté des stocks retail',
      'libérer trésorerie fonds de roulement',
      'vente en lot grossiste déstockeur',
      'logiciel analyse ABC stock gratuit'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. Le Principe de Pareto 80/20 dans le Commerce de Détail' },
      { id: 'abc-classification-math', title: '2. L’Algorithme Mathématique de Classification ABC' },
      { id: 'abc-xyz-matrix', title: '3. La Matrice 9-Box ABC-XYZ de Volatilité de Demande' },
      { id: 'true-cost-dead-stock', title: '4. La Réalité Financière des Stocks Dormants (Dead Stock)' },
      { id: 'dead-stock-identification-audit', title: '5. Protocole Quantitatif d’Identification des Stocks Inactifs' },
      { id: 'five-step-liquidation-playbook', title: '6. Le Guide de Liquidation en 5 Paliers : Récupérer du Cash' },
      { id: 'prevention-guardrails', title: '7. Garde-Fous Automatisés Contre la Réapparition de Stocks Dormants' },
      { id: 'inventory-360-abc-setup', title: '8. Analyse ABC et Déstockage dans Inventory 360' }
    ],
    content: `
### 1. Le Principe de Pareto 80/20 dans le Commerce de Détail

Dans le commerce de détail, **80% du chiffre d'affaires est généré par 20% du catalogue**. Traiter tous les articles de manière identique conduit inévitablement à des tensions de trésorerie majeures :

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                COURBE DE PARETO DES STOCKS                  │
   80% │                           ┌─────────────────────────────────┤ ➔ CLASSE A (20% Catalogue = 80% Valeur)
       │                     ┌─────┘                                 │   • Révision quotidienne & suivi prioritaire
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ CLASSE B (30% Catalogue = 15% Valeur)
   40% │    ┌────┘                                                   │   • Révision bimensuelle & suivi modéré
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ CLASSE C (50% Catalogue = 5% Valeur)
       │                                                             │   • Stock minimal, risque de rossignols
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % TOTAL DES SKUs
\`\`\`

---

### 2. L’Algorithme Mathématique de Classification ABC

$$\\text{Valeur de Consommation Annuelle (ACV)} = \\text{Ventes Annuelles en Unités} \\times \\text{Coût d'Achat Unitaire}$$

---

### 3. La Matrice 9-Box ABC-XYZ de Volatilité de Demande

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Écart-Type de la Demande}}{\\text{Moyenne de la Demande}}$$

* **Classe X ($CV < 0.5$)** : Demande constante et prévisible.
* **Classe Y ($0.5 \\le CV \\le 1.0$)** : Demande saisonnière ou fluctuante.
* **Classe Z ($CV > 1.0$)** : Demande sporadique et imprévisible.

---

### 4. La Réalité Financière des Stocks Dormants (Dead Stock)

Conserver du stock dormant coûte entre **20% et 30% de sa valeur d'achat par an** en frais d'entreposage, dépréciation, assurances et coût d'opportunité du capital.

---

### 5. Protocole Quantitatif d’Identification des Stocks Inactifs

* **0 à 60 jours** : Stock Actif.
* **61 à 120 jours** : Rotation Lente.
* **121 à 180 jours** : Stock Stagnant.
* **Plus de 180 jours** : Stock Dormant (Rossignol).

---

### 6. Le Guide de Liquidation en 5 Paliers : Récupérer du Cash

\`\`\`
                      [ PYRAMIDE DE LIQUIDATION DES STOCKS ]

          ▲
         / \\     [ Palier 1 : Vente Couplée / Bundling en Caisse (Remise 0%-20%) ]
        /───\\    ────────────────────────────────────────────────────────────────
       /     \\   [ Palier 2 : Ventes Flash Privées / Clients VIP (Remise 30%-50%) ]
      /───────\\  ────────────────────────────────────────────────────────────────
     /         \\ [ Palier 3 : Déstockage Agressif sur Marketplaces (Remise 60%-70%) ]
    /───────────\\[ Palier 4 : Vente en Lot B2B aux Grossistes (Au Prix de Revient) ]
   /─────────────\\[ Palier 5 : Don Caritatif et Défiscalisation (Déduction Fiscale) ]
\`\`\`

---

### 7. Garde-Fous Automatisés Contre la Réapparition de Stocks Dormants

* **Accords de Reprise Fournisseur (RTV)**.
* **Plafond Budgétaire sur les Nouveautés**.
* **Blocage des Réapprovisionnements Automatiques**.

---

### 8. Analyse ABC et Déstockage dans Inventory 360

[Inventory 360](https://www.inventory360.shop) propose :
1. Calcul automatique de la classification ABC.
2. Alertes sur les articles sans vente depuis plus de 90 jours.
3. Création instantanée de remises et packs en caisse (POS).
4. Export des audits de trésorerie en CSV, Excel et PDF en 11 langues.
`
  },

  de: {
    title: 'ABC-Bestandsanalyse & Ladenhüter-Liquidation: Gebundenes Kapital erfolgreich freisetzen',
    excerpt: 'Praxisleitfaden zur Bestandsbereinigung: 80/20-Pareto-Prinzip, 9-Felder ABC-XYZ-Nachfragematrix, Berechnung wahrer Lagerhaltungskosten und 5-Stufen-Liquidationsplan für tote Bestände.',
    category: 'Bestandsstrategie',
    keywords: [
      'ABC Analyse Lagerbestand Formel Excel',
      'ABC XYZ Matrix Bestandsmanagement',
      'Ladenhüter liquidieren Einzelhandel',
      'Pareto Prinzip Lager 80 20',
      'Lagerhaltungskosten toter Bestand',
      'Abverkaufsstrategien ohne Markenschaden',
      'Bestandsreichweite Altersstruktur Audit',
      'Working Capital Freisetzung Lager',
      'B2B Restposten Großhandel',
      'Kostenlose ABC Analyse Software'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. Das 80/20-Pareto-Prinzip im Einzelhandelsinventar' },
      { id: 'abc-classification-math', title: '2. Der mathematische Algorithmus der ABC-Klassifizierung' },
      { id: 'abc-xyz-matrix', title: '3. Die 9-Felder ABC-XYZ-Matrix für Nachfragevolatilität' },
      { id: 'true-cost-dead-stock', title: '4. Die wahren finanziellen Kosten von Ladenhütern (Dead Stock)' },
      { id: 'dead-stock-identification-audit', title: '5. Quantitatives Audit zur Identifizierung toter Bestände' },
      { id: 'five-step-liquidation-playbook', title: '6. Der 5-Stufen-Liquidationsplan zur Kapitalfreisetzung' },
      { id: 'prevention-guardrails', title: '7. Automatische Schutzmechanismen gegen erneute Ladenhüter' },
      { id: 'inventory-360-abc-setup', title: '8. ABC-Analyse und Bestandsaudit in Inventory 360' }
    ],
    content: `
### 1. Das 80/20-Pareto-Prinzip im Einzelhandelsinventar

Im Handel erwirtschaften **20% der Artikel rund 80% des Jahresumsatzes**. Wer alle Artikel gleich behandelt, blockiert Liquidität und riskiert die Zahlungsunfähigkeit:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                PARETO-KURVE DES LAGERBESTANDS               │
   80% │                           ┌─────────────────────────────────┤ ➔ A-ARTIKEL (20% Sortiment = 80% Wert)
       │                     ┌─────┘                                 │   • Tägliche Überwachung & Priorität
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ B-ARTIKEL (30% Sortiment = 15% Wert)
   40% │    ┌────┘                                                   │   • Zweiwöchentliche Überprüfung
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ C-ARTIKEL (50% Sortiment = 5% Wert)
       │                                                             │   • Minimalbestand, Ladenhüter-Risiko
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % DES SORTIMENTS
\`\`\`

---

### 2. Der mathematische Algorithmus der ABC-Klassifizierung

$$\\text{Jährlicher Verbrauchswert (ACV)} = \\text{Jahresabsatz in Stück} \\times \\text{Einstandspreis}$$

---

### 3. Die 9-Felder ABC-XYZ-Matrix für Nachfragevolatilität

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Standardabweichung der Nachfrage}}{\\text{Mittelwert der Nachfrage}}$$

* **X-Artikel ($CV < 0.5$)**: Konstanter, sehr gut prognostizierbarer Bedarf.
* **Y-Artikel ($0.5 \\le CV \\le 1.0$)**: Saisonale oder schwankende Nachfrage.
* **Z-Artikel ($CV > 1.0$)**: Unregelmäßiger, sporadischer Bedarf.

---

### 4. Die wahren finanziellen Kosten von Ladenhütern (Dead Stock)

Tote Bestände verursachen jährliche Haltungskosten von **20% bis 30% ihres Einkaufswertes** durch gebundenes Kapital, Lagerflächenmiete, Versicherung und Wertverlust.

---

### 5. Quantitatives Audit zur Identifizierung toter Bestände

* **0–60 Tage**: Aktiver Bestand.
* **61–120 Tage**: Langsamdreher.
* **121–180 Tage**: Stagnierender Bestand.
* **Über 180 Tage**: Ladenhüter (Dead Stock).

---

### 6. Der 5-Stufen-Liquidationsplan zur Kapitalfreisetzung

\`\`\`
                    [ DIE 5-STUFIGE LIQUIDATIONSPYRAMIDE ]

          ▲
         / \\     [ Stufe 1: Bundling am POS mit A-Artikeln (0%-20% Rabatt) ]
        /───\\    ──────────────────────────────────────────────────────────
       /     \\   [ Stufe 2: Exklusiver VIP-Flash-Sale (30%-50% Rabatt) ]
      /───────\\  ──────────────────────────────────────────────────────────
     /         \\ [ Stufe 3: Marktplatz-Abverkauf / Outlet (60%-70% Rabatt) ]
    /───────────\\[ Stufe 4: B2B-Palettenverkauf an Restpostenhändler (EK-Preis) ]
   /─────────────\\[ Stufe 5: Gemeinnützige Spende & Steuerliche Abschreibung ]
\`\`\`

---

### 7. Automatische Schutzmechanismen gegen erneute Ladenhüter

* **Rückgabevereinbarungen mit Lieferanten (RTV)**.
* **Budgetgrenzen für Testsortimente**.
* **Automatische Nachbestellsperren für Schläferartikel**.

---

### 8. ABC-Analyse und Bestandsaudit in Inventory 360

[Inventory 360](https://www.inventory360.shop) bietet:
1. Automatische Einstufung in A-, B- und C-Kategorien.
2. Filter für Artikel ohne Abverkauf seit über 90/180 Tagen.
3. 1-Klick-Rabatte und Bundle-Preise an der Kasse (POS).
4. Export mehrsprachiger Bestandsberichte als CSV, Excel und PDF in 11 Sprachen.
`
  },

  hi: {
    title: 'एबीसी इन्वेंटरी वर्गीकरण और डेड स्टॉक निपटान: फंसी हुई कार्यशील पूंजी को मुक्त करना',
    excerpt: 'इन्वेंटरी ऑडिट और स्टॉक शुद्धिकरण गाइड: 80/20 पेरेटो सिद्धांत, मांग अस्थिरता की ABC-XYZ मैट्रिक्स, डेड स्टॉक की छिपी लागत और पुराने माल को नकदी में बदलने की 5-चरणीय रणनीति।',
    category: 'इन्वेंटरी रणनीति',
    keywords: [
      'ABC इन्वेंटरी वर्गीकरण फॉर्मूला',
      'ABC XYZ मैट्रिक्स स्टॉक प्रबंधन',
      'डेड स्टॉक निपटान रिटेल व्यापार',
      'पेरेटो सिद्धांत इन्वेंटरी 80 20',
      'पुराने स्टॉक की होल्डिंग लागत',
      'बिना ब्रांड नुकसान के डिस्काउंट रणनीति',
      'इन्वेंटरी आयु ऑडिट',
      'कार्यशील पूंजी मुक्त करना',
      'B2B थोक डिस्काउंट लॉट',
      'मुफ्त एबीसी इन्वेंटरी विश्लेषण सॉफ्टवेयर'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. रिटेल इन्वेंटरी में 80/20 पेरेटो सिद्धांत' },
      { id: 'abc-classification-math', title: '2. एबीसी वर्गीकरण का गणितीय एल्गोरिदम' },
      { id: 'abc-xyz-matrix', title: '3. मांग अस्थिरता की 9-बॉक्स ABC-XYZ मैट्रिक्स' },
      { id: 'true-cost-dead-stock', title: '4. डेड स्टॉक की वास्तविक वित्तीय लागत' },
      { id: 'dead-stock-identification-audit', title: '5. डेड स्टॉक पहचानने का ऑडिट प्रोटोकॉल' },
      { id: 'five-step-liquidation-playbook', title: '6. नकदी निकालने का 5-चरणीय निपटान प्लेबुक' },
      { id: 'prevention-guardrails', title: '7. दोबारा डेड स्टॉक बनने से रोकने के नियम' },
      { id: 'inventory-360-abc-setup', title: '8. Inventory 360 में एबीसी विश्लेषण और ऑडिट' }
    ],
    content: `
### 1. रिटेल इन्वेंटरी में 80/20 पेरेटो सिद्धांत

रिटेल में **80% बिक्री सिर्फ 20% सामान से होती है**। सभी सामानों को एक समान समझना व्यापार की सबसे बड़ी गलती है:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                 पेरेटो इन्वेंटरी वक्र                       │
   80% │                           ┌─────────────────────────────────┤ ➔ A-श्रेणी (20% सामान = 80% कुल मूल्य)
       │                     ┌─────┘                                 │   • दैनिक समीक्षा और सर्वोच्च प्राथमिकता
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ B-श्रेणी (30% सामान = 15% कुल मूल्य)
   40% │    ┌────┘                                                   │   • पाक्षिक समीक्षा
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ C-श्रेणी (50% सामान = 5% कुल मूल्य)
       │                                                             │   • न्यूनतम स्टॉक, डेड स्टॉक का खतरा
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     कुल SKU का %
\`\`\`

---

### 2. एबीसी वर्गीकरण का गणितीय एल्गोरिदम

$$\\text{वार्षिक खपत मूल्य (ACV)} = \\text{वार्षिक बिक्री यूनिट्स} \\times \\text{खरीद लागत}$$

---

### 3. मांग अस्थिरता की 9-बॉक्स ABC-XYZ मैट्रिक्स

* **X-श्रेणी**: स्थिर और अनुमानित मांग।
* **Y-श्रेणी**: मौसमी या मध्यम उतार-चढ़ाव।
* **Z-श्रेणी**: अनिश्चित और कभी-कभार होने वाली मांग।

---

### 4. डेड स्टॉक की वास्तविक वित्तीय लागत

डेड स्टॉक पर हर साल उसकी **लागत का 20% से 30%** रखरखाव खर्च और ब्याज के रूप में बर्बाद होता है।

---

### 5. डेड स्टॉक पहचानने का ऑडिट प्रोटोकॉल

* **0–60 दिन**: सक्रिय स्टॉक।
* **61–120 दिन**: धीमी गति वाला स्टॉक।
* **121–180 दिन**: रुका हुआ स्टॉक।
* **180+ दिन**: डेड स्टॉक (तत्काल निपटान आवश्यक)।

---

### 6. नकदी निकालने का 5-चरणीय निपटान प्लेबुक

1. **पीओएस बंडलिंग**: बेस्टसेलर सामान के साथ जोड़कर बेचना।
2. **वीआईपी सीक्रेट सेल**: खास ग्राहकों को निजी छूट।
3. **मार्केटप्लेस डिस्काउंट**: ऑनलाइन आउटलेट सेल।
4. **B2B थोक लॉट सेल**: अन्य व्यापारियों को लागत मूल्य पर बेचना।
5. **दान और टैक्स छूट**: गैर-लाभकारी संस्थाओं को दान।

---

### 7. दोबारा डेड स्टॉक बनने से रोकने के नियम

* सप्लायर रिटर्न एग्रीमेंट (RTV)।
* नए सामान पर बजट सीमा।
* धीमी गति वाले सामान के ऑटो-रीऑर्डर पर रोक।

---

### 8. Inventory 360 में एबीसी विश्लेषण और ऑडिट

[Inventory 360](https://www.inventory360.shop) में:
1. स्वचालित एबीसी वर्गीकरण।
2. 90/180 दिन से न बिके सामान की पहचान।
3. पीओएस पर 1-क्लिक डिस्काउंट और बंडल।
4. 11 भाषाओं में पीडीएफ और एक्सेल रिपोर्ट।
`
  },

  ja: {
    title: 'ABC在庫分析と不動在庫（デッドストック）現金化：眠れる運転資金を解放する実践ガイド',
    excerpt: '小売在庫の健全化マニュアル：パレートの法則（80/20ルール）、需要変動を加味した9軸ABC-XYZマトリクス、年間20〜30％に達する保管維持コストの構造、ブランド価値を毀損せず現金を回収する5段階の処分戦略。',
    category: '在庫戦略',
    keywords: [
      'ABC分析 在庫管理 計算式 Excel',
      'ABC XYZ マトリクス 需要予測',
      'デッドストック 不動在庫 処分方法',
      'パレートの法則 在庫 80 20',
      '在庫保管維持コスト 削減',
      'ブランドを傷つけない セール戦略',
      '在庫滞留期間 エイジング分析',
      '運転資金 キャッシュフロー 改善',
      'B2B 業者買取 在庫処分',
      '無料 ABC分析 在庫管理ソフト'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. 小売在庫におけるパレートの法則（80/20ルール）' },
      { id: 'abc-classification-math', title: '2. ABC在庫分類の数理計算アルゴリズム' },
      { id: 'abc-xyz-matrix', title: '3. 需要変動をとらえる9軸「ABC-XYZマトリクス」' },
      { id: 'true-cost-dead-stock', title: '4. 不動在庫（デッドストック）がもたらす真の財務損失' },
      { id: 'dead-stock-identification-audit', title: '5. 滞留日数によるデッドストック定量的判定SOP' },
      { id: 'five-step-liquidation-playbook', title: '6. 現金化のための5段階ディスポジション・プレイブック' },
      { id: 'prevention-guardrails', title: '7. 不動在庫の再発を防止する3つの自動安全策' },
      { id: 'inventory-360-abc-setup', title: '8. Inventory 360でのABC分析と在庫監査の実践' }
    ],
    content: `
### 1. 小売在庫におけるパレートの法則（80/20ルール）

小売業では、**売上高の80%がわずか20%の主力商品から生み出されます**。全SKUを一律に扱う管理方法は、資金ショートの主たる原因です：

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                   在庫のパレート分析曲線                    │
   80% │                           ┌─────────────────────────────────┤ ➔ Aランク品 (上位20%の商品 = 80%の売上)
       │                     ┌─────┘                                 │   • 毎日点検・最優先の発注管理
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ Bランク品 (中間30%の商品 = 15%の売上)
   40% │    ┌────┘                                                   │   • 隔週での定期点検
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ Cランク品 (下位50%の商品 = 5%の売上)
       │                                                             │   • 最小限の在庫、不動化リスク高
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     全SKU構成比
\`\`\`

---

### 2. ABC在庫分類の数理計算アルゴリズム

$$\\text{年間消費額 (ACV)} = \\text{年間販売数量} \\times \\text{仕入原価}$$

---

### 3. 需要変動をとらえる9軸「ABC-XYZマトリクス」

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{需要の標準偏差}}{\\text{需要の平均値}}$$

* **Xランク ($CV < 0.5$)**: 需要が極めて安定しており予測が容易。
* **Yランク ($0.5 \\le CV \\le 1.0$)**: 季節変動や中程度の波がある。
* **Zランク ($CV > 1.0$)**: 需要が突発的で予測困難。

---

### 4. 不動在庫（デッドストック）がもたらす真の財務損失

不動在庫を抱え続けると、**年間で仕入原価の20%〜30%**もの維持費用（資本コスト、倉庫代、保険、陳腐化損）が流出します。

---

### 5. 滞留日数によるデッドストック定量的判定SOP

* **0〜60日**: アクティブ在庫。
* **61〜120日**: 緩慢滞留在庫。
* **121〜180日**: 危険停滞在庫。
* **180日超**: 不動在庫（デッドストック・即時処分対象）。

---

### 6. 現金化のための5段階ディスポジション・プレイブック

\`\`\`
                    [ 在庫処分ディスポジション・ピラミッド ]

          ▲
         / \\     [ 第1層: Aランク品とのレジ前セット販売（割引 0%〜20%） ]
        /───\\    ──────────────────────────────────────────────────────
       /     \\   [ 第2層: VIP顧客限定シークレットセール（割引 30%〜50%） ]
      /───────\\  ──────────────────────────────────────────────────────
     /         \\ [ 第3層: 外部モール・アウトレット出品（割引 60%〜70%） ]
    /───────────\\[ 第4層: B2B買取業者への一括原価売却（仕入値回収） ]
   /─────────────\\[ 第5層: 寄付および税務上の損金処理（節税効果） ]
\`\`\`

---

### 7. 不動在庫の再発を防止する3つの自動安全策

* **仕入先との返品・交換特約（RTV）**。
* **新規開拓商品の仕入予算上限設定**。
* **停滞商品の自動発注ブロック**。

---

### 8. Inventory 360でのABC分析と在庫監査の実践

[Inventory 360](https://www.inventory360.shop) では：
1. ワンクリックでのABC自動ランク付け。
2. 90日・180日以上未販売商品の自動抽出。
3. POSレジでのセット販売・処分価格設定。
4. 11言語対応の監査帳票出力（CSV/Excel/PDF）。
`
  },

  zh: {
    title: 'ABC 库存分类法与滞销死库存（Dead Stock）极速变现：彻底盘活沉淀营运资金',
    excerpt: '零售库存体检与资金回笼全指南：80/20 帕累托法则、ABC-XYZ 需求波动九宫格矩阵、死库存持有成本深度剖析及不伤品牌的五级阶梯式清仓变现实操手册。',
    category: '库存战略',
    keywords: [
      'ABC库存分类法计算公式 Excel',
      'ABC XYZ 矩阵库存管理模型',
      '滞销死库存清仓变现方案',
      '帕累托二八法则库存应用',
      '死库存持有成本综合测算',
      '不损害品牌形象的打折策略',
      '库存库龄分析表 SOP',
      '盘活沉淀营运资金现金流',
      'B2B 尾货批发商打包出清',
      '免费 ABC 库存分析软件'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. 零售进销存中的 80/20 帕累托法则' },
      { id: 'abc-classification-math', title: '2. ABC 分类的数理计算算法与实操步骤' },
      { id: 'abc-xyz-matrix', title: '3. 需求波动率维度的 9 宫格「ABC-XYZ 矩阵」' },
      { id: 'true-cost-dead-stock', title: '4. 滞销死库存（Dead Stock）的真实财务吞噬成本' },
      { id: 'dead-stock-identification-audit', title: '5. 库龄量化诊断与死库存排查 SOP' },
      { id: 'five-step-liquidation-playbook', title: '6. 五级阶梯式清仓战术：安全回笼真金白银' },
      { id: 'prevention-guardrails', title: '7. 杜绝死库存再生的三大自动化防御防线' },
      { id: 'inventory-360-abc-setup', title: '8. 在 Inventory 360 中落地 ABC 分析与死库存审计' }
    ],
    content: `
### 1. 零售进销存中的 80/20 帕累托法则

在零售商业中，**80% 的营业额通常仅由 20% 的核心爆款 SKU 贡献**。对所有商品采取同等精力的进销存管理，是导致企业现金流枯竭的核心主因：

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                   库存帕累托分布曲线                        │
   80% │                           ┌─────────────────────────────────┤ ➔ A 类商品 (20% 品类 = 80% 资金周转贡献)
       │                     ┌─────┘                                 │   • 每日密切盘点，严防断货
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ B 类商品 (30% 品类 = 15% 资金周转贡献)
   40% │    ┌────┘                                                   │   • 双周定期审核，维持基准库存
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ C 类商品 (50% 品类 = 5% 资金周转贡献)
       │                                                             │   • 精简备货，死库存高发重灾区
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     全店 SKU 累计占比
\`\`\`

---

### 2. ABC 分类的数理计算算法与实操步骤

$$\\text{年度资金消耗总值 (ACV)} = \\text{年销售件数} \\times \\text{采购进货单价}$$

---

### 3. 需求波动率维度的 9 宫格「ABC-XYZ 矩阵」

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{需求标准差}}{\\text{需求均值}}$$

* **X 级 ($CV < 0.5$)**：需求极度平稳，可精准预测。
* **Y 级 ($0.5 \\le CV \\le 1.0$)**：存在季节性或规律性波动。
* **Z 级 ($CV > 1.0$)**：偶发性无规律需求。

---

### 4. 滞销死库存（Dead Stock）的真实财务吞噬成本

滞销货物静置在仓库货架上，每年将吞噬其**采购进价 20% 至 30%** 的持有成本（资金利息、仓库租金、保险与折旧）。

---

### 5. 库龄量化诊断与死库存排查 SOP

* **0–60 天**：健康活跃库存。
* **61–120 天**：慢动销预警库存。
* **121–180 天**：严重停滞库存。
* **超过 180 天**：死库存（必须立即强制执行清仓变现）。

---

### 6. 五级阶梯式清仓战术：安全回笼真金白银

\`\`\`
                    [ 死库存五级阶梯出清金字塔 ]

          ▲
         / \\     [ 第 1 级: 算法捆绑 / POS 前台顺手买单 (打折 0%-20%) ]
        /───\\    ────────────────────────────────────────────────────
       /     \\   [ 第 2 级: VIP 专属内购 / 隐藏链接闪购 (打折 30%-50%) ]
      /───────\\  ────────────────────────────────────────────────────
     /         \\ [ 第 3 级: 跨渠道特卖 / 二手与特卖平台 (打折 60%-70%) ]
    /───────────\\[ 第 4 级: B2B 尾货商整托打包平价出清 (按成本回款) ]
   /─────────────\\[ 第 5 级: 公益慈善捐赠与企业所得税税前列支扣除 ]
\`\`\`

---

### 7. 杜绝死库存再生的三大自动化防御防线

* **供应商滞销退换货协议（RTV）**。
* **试错新品采购额度熔断机制**。
* **滞销品自动化再订货锁定**。

---

### 8. 在 Inventory 360 中落地 ABC 分析与死库存审计

[Inventory 360](https://www.inventory360.shop) 提供：
1. 一键全自动 ABC 价值分级。
2. 90天/180天超长库龄商品秒级过滤。
3. 收银端 1 键打包捆绑与促销特价。
4. 11种语言导出符合财务审计规范的盘点报表（CSV/Excel/PDF）。
`
  },

  ar: {
    title: 'تصنيف المخزون ABC وتصفية البضائع الراكدة (Dead Stock): تحرير رأس المال العامل المجمد',
    excerpt: 'دليل شامل لتدقيق المخزون وتصفيته: مبدأ باريتو 80/20، ومصفوفة ABC-XYZ لتقلب الطلب، والتكلفة الحقيقية للاحتفاظ بالبضائع الراكدة، وخطة التصفية الخماسية لتحويل الركود إلى سيولة نقدية.',
    category: 'استراتيجية المخزون',
    keywords: [
      'تصنيف المخزون ABC معادلة',
      'مصفوفة ABC XYZ لإدارة المخزون',
      'تصفية البضائع الراكدة التجزئة',
      'مبدأ باريتو في المخازن 80 20',
      'تكلفة الاحتفاظ بالمخزون التالف',
      'استراتيجيات الخصم دون الإضرار بالعلامة',
      'تدقيق عمر المخزون والركود',
      'تحرير السيولة ورأس المال العامل',
      'بيع لوطات التصفية بالجملة',
      'برنامج تحليل ABC مجاني'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. مبدأ باريتو 80/20 في تجارة التجزئة' },
      { id: 'abc-classification-math', title: '2. الخوارزمية الرياضية لتصنيف المخزون ABC' },
      { id: 'abc-xyz-matrix', title: '3. مصفوفة ABC-XYZ التساعية لتقلبات الطلب' },
      { id: 'true-cost-dead-stock', title: '4. التكلفة المالية الحقيقية للبضائع الراكدة' },
      { id: 'dead-stock-identification-audit', title: '5. البروتوكول الكمي لتحديد المخزون الراكد' },
      { id: 'five-step-liquidation-playbook', title: '6. استراتيجية التصفية الخماسية لاسترداد السيولة' },
      { id: 'prevention-guardrails', title: '7. ضوابط تلقائية لمنع تكرار البضائع الراكدة' },
      { id: 'inventory-360-abc-setup', title: '8. تحليل ABC والتدقيق في Inventory 360' }
    ],
    content: `
### 1. مبدأ باريتو 80/20 في تجارة التجزئة

في تجارة التجزئة، **80% من الإيرادات تأتي من 20% فقط من المنتجات**. معاملة جميع الأصناف بالتساوي يؤدي إلى تجميد السيولة وخسائر فادحة:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                     منحنى باريتو للمخزون                     │
   80% │                           ┌─────────────────────────────────┤ ➔ الفئة A (20% من الأصناف = 80% من القيمة)
       │                     ┌─────┘                                 │   • مراجعة يومية وأولوية قصوى
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ الفئة B (30% من الأصناف = 15% من القيمة)
   40% │    ┌────┘                                                   │   • مراجعة دورية كل أسبوعين
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ الفئة C (50% من الأصناف = 5% من القيمة)
       │                                                             │   • مخزون منخفض، خطر ركود مرتفع
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     نسبة الأصناف الكلية
\`\`\`

---

### 2. الخوارزمية الرياضية لتصنيف المخزون ABC

$$\\text{قيمة الاستهلاك السنوي (ACV)} = \\text{المبيعات السنوية بالوحدات} \\times \\text{سعر التكلفة}$$

---

### 3. مصفوفة ABC-XYZ التساعية لتقلبات الطلب

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{الانحراف المعياري للطلب}}{\\text{متوسط الطلب}}$$

* **الفئة X**: طلب مستقر وقابل للتنبؤ.
* **الفئة Y**: طلب موسمي أو معتدل التقلب.
* **الفئة Z**: طلب متقطع وغير منتظم.

---

### 4. التكلفة المالية الحقيقية للبضائع الراكدة

الاحتفاظ بالبضائع الراكدة يكلف بين **20% و 30% من قيمتها سنوياً** كرسوم تخزين وتأمين وإهلاك وتجميد سيولة.

---

### 5. البروتوكول الكمي لتحديد المخزون الراكد

* **0–60 يوماً**: مخزون نشط.
* **61–120 يوماً**: بطيء الحركة.
* **121–180 يوماً**: راكد في خطر.
* **أكثر من 180 يوماً**: مخزون ميت يجب تصفيته فوراً.

---

### 6. استراتيجية التصفية الخماسية لاسترداد السيولة

1. **الدمج مع الأصناف الأكثر مبيعاً في الكاشير**.
2. **عروض خاصة وسرية لعملاء VIP**.
3. **التخفيضات الكبرى في قنوات البيع البديلة**.
4. **البيع بالجملة لتجار التصفية بسعر التكلفة**.
5. **التبرع الخيري والاستفادة من الإعفاءات الضريبية**.

---

### 7. ضوابط تلقائية لمنع تكرار البضائع الراكدة

* اتفاقيات الإرجاع للموردين (RTV).
* وضع سقوف مالية للأصناف التجريبية الجديدة.
* إيقاف إعادة الطلب التلقائي للأصناف الراكدة.

---

### 8. تحليل ABC والتدقيق في Inventory 360

[Inventory 360](https://www.inventory360.shop) يوفر:
1. تصنيف ABC تلقائي فوري للمنتجات.
2. فلترة الأصناف التي لم تبع منذ أكثر من 90/180 يوماً.
3. إنشاء عروض وحزم المنتجات بنقرة واحدة في نقطة البيع.
4. تصدير تقارير رأس المال العامل بـ 11 لغة بصيغ CSV و Excel و PDF.
`
  },

  pt: {
    title: 'Classificação de Estoque ABC e Liquidação de Estoque Parado: Liberando Capital de Giro',
    excerpt: 'Manual prático de saneamento de estoque: Princípio de Pareto 80/20, matriz 9-box ABC-XYZ de volatilidade, custos reais de manutenção e o plano de liquidação em 5 etapas para transformar itens obsoletos em dinheiro.',
    category: 'Estratégia de Estoque',
    keywords: [
      'classificação ABC de estoque fórmula excel',
      'matriz ABC XYZ gestão de estoque',
      'liquidar estoque parado varejo',
      'princípio de pareto estoque 80 20',
      'custo de manutenção estoque obsoleto',
      'estratégias de desova sem queimar marca',
      'auditoria de idade de estoque aging',
      'liberar capital de giro travado',
      'venda de lotes atacado B2B',
      'software análise ABC gratuito'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. O Princípio de Pareto 80/20 no Estoque do Varejo' },
      { id: 'abc-classification-math', title: '2. O Algoritmo Matemático de Classificação ABC' },
      { id: 'abc-xyz-matrix', title: '3. A Matriz 9-Box ABC-XYZ de Volatilidade de Demanda' },
      { id: 'true-cost-dead-stock', title: '4. O Custo Financeiro Real do Estoque Parado (Dead Stock)' },
      { id: 'dead-stock-identification-audit', title: '5. Protocolo de Auditoria e Idade de Estoque' },
      { id: 'five-step-liquidation-playbook', title: '6. O Manual de Liquidação em 5 Fases: Recuperar Dinheiro' },
      { id: 'prevention-guardrails', title: '7. Travas Automáticas Contra Novos Estoques Parados' },
      { id: 'inventory-360-abc-setup', title: '8. Análise ABC e Auditoria no Inventory 360' }
    ],
    content: `
### 1. O Princípio de Pareto 80/20 no Estoque do Varejo

No varejo, **80% do faturamento vem de apenas 20% do mix de produtos**. Tratar todos os itens de forma igualitária nas compras bloqueia o fluxo de caixa:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                  CURVA PARETO DE ESTOQUE                    │
   80% │                           ┌─────────────────────────────────┤ ➔ CLASSE A (20% Catálogo = 80% do Faturamento)
       │                     ┌─────┘                                 │   • Controle diário e prioridade máxima
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ CLASSE B (30% Catálogo = 15% do Faturamento)
   40% │    ┌────┘                                                   │   • Revisão quinzenal padrão
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ CLASSE C (50% Catálogo = 5% do Faturamento)
       │                                                             │   • Estoque enxuto, alto risco de encalhe
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % TOTAL DE SKUs
\`\`\`

---

### 2. O Algoritmo Matemático de Classificação ABC

$$\\text{Valor de Consumo Anual (ACV)} = \\text{Vendas Anuais em Unidades} \\times \\text{Custo Unitário}$$

---

### 3. A Matriz 9-Box ABC-XYZ de Volatilidade de Demanda

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Desvio Padrão da Demanda}}{\\text{Média da Demanda}}$$

* **Classe X ($CV < 0.5$)**: Demanda constante e altamente previsível.
* **Classe Y ($0.5 \\le CV \\le 1.0$)**: Demanda com sazonalidade moderada.
* **Classe Z ($CV > 1.0$)**: Demanda esporádica e imprevisível.

---

### 4. O Custo Financeiro Real do Estoque Parado (Dead Stock)

Manter produtos parados custa anualmente entre **20% e 30% do seu valor de compra** em armazenagem, custo de oportunidade do capital e depreciação.

---

### 5. Protocolo de Auditoria e Idade de Estoque

* **0 a 60 dias**: Estoque Ativo.
* **61 a 120 dias**: Giro Lento.
* **121 a 180 dias**: Estoque Estagnado.
* **Mais de 180 dias**: Estoque Parado (Ação de desova obrigatória).

---

### 6. O Manual de Liquidação em 5 Fases: Recuperar Dinheiro

1. **Kits e Venda Casada no PDV**: Combinar itens parados com campeões de venda.
2. **Vendas Privadas para Clientes VIP**: Ofertas secretas sem queimar o posicionamento da marca.
3. **Descontos em Canais Secundários e Marketplaces**.
4. **Venda B2B em Lotes para Desovadores** ao preço de custo.
5. **Doação para Instituições de Caridade e Dedução Fiscal**.

---

### 7. Travas Automáticas Contra Novos Estoques Parados

* **Acordos de Devolução ao Fornecedor (RTV)**.
* **Teto Orçamentário para Novos Produtos**.
* **Bloqueio Automático de Recompra para Itens Lentos**.

---

### 8. Análise ABC e Auditoria no Inventory 360

[Inventory 360](https://www.inventory360.shop) oferece:
1. Classificação ABC automática por produto.
2. Identificação rápida de itens parados há mais de 90/180 dias.
3. Criação de promoções e kits diretamente no PDV.
4. Exportação de relatórios de auditoria em 11 idiomas em CSV, Excel e PDF.
`
  },

  it: {
    title: 'Classificazione ABC dell\'Inventario e Liquidazione Merci Dormienti: Liberare Capitale Circolante',
    excerpt: 'Guida all\'audit e risanamento del magazzino: Principio di Pareto 80/20, matrice ABC-XYZ di volatilità della domanda, costi reali di mantenimento e piano di liquidazione in 5 fasi per convertire le scorte ferme in liquidità.',
    category: 'Strategia di Magazzino',
    keywords: [
      'classificazione ABC inventario formula excel',
      'matrice ABC XYZ gestione scorte',
      'liquidare merci dormienti dead stock retail',
      'principio di pareto magazzino 80 20',
      'costo mantenimento scorte obsolete',
      'strategie svendita senza rovinare il brand',
      'audit anzianità giacenze aging',
      'liberare capitale circolante magazzino',
      'vendita stock lotti ingrosso B2B',
      'software analisi ABC magazzino gratis'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. Il Principio di Pareto 80/20 nell\'Inventario Retail' },
      { id: 'abc-classification-math', title: '2. L\'Algoritmo Matematico di Classificazione ABC' },
      { id: 'abc-xyz-matrix', title: '3. La Matrice 9-Box ABC-XYZ di Volatilità della Domanda' },
      { id: 'true-cost-dead-stock', title: '4. La Reale Anatomia Finanziaria delle Merci Dormienti' },
      { id: 'dead-stock-identification-audit', title: '5. Protocollo Quantitativo per l\'Identificazione delle Giacenze Dormienti' },
      { id: 'five-step-liquidation-playbook', title: '6. Il Piano di Liquidazione in 5 Fasi: Recuperare Liquidità' },
      { id: 'prevention-guardrails', title: '7. Meccanismi Automatici di Protezione contro Nuove Giacenze Ferme' },
      { id: 'inventory-360-abc-setup', title: '8. Analisi ABC e Audit in Inventory 360' }
    ],
    content: `
### 1. Il Principio di Pareto 80/20 nell'Inventario Retail

Nel retail, **l'80% del fatturato è generato da appena il 20% degli articoli in catalogo**. Trattare tutti i prodotti allo stesso modo causa gravi crisi di liquidità:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                 CURVA DI PARETO DELLE SCORTE                │
   80% │                           ┌─────────────────────────────────┤ ➔ CLASSE A (20% Articoli = 80% del Valore)
       │                     ┌─────┘                                 │   • Controllo quotidiano e priorità assoluta
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ CLASSE B (30% Articoli = 15% del Valore)
   40% │    ┌────┘                                                   │   • Revisione quindicinale standard
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ CLASSE C (50% Articoli = 5% del Valore)
       │                                                             │   • Scorte minime, alto rischio invenduto
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % TOTALE DEI PRODOTTI
\`\`\`

---

### 2. L'Algoritmo Matematico di Classificazione ABC

$$\\text{Valore di Consumo Annuale (ACV)} = \\text{Vendite Annuali in Unità} \\times \\text{Costo Unitario d'Acquisto}$$

---

### 3. La Matrice 9-Box ABC-XYZ di Volatilità della Domanda

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Deviazione Standard della Domanda}}{\\text{Media della Domanda}}$$

* **Classe X ($CV < 0.5$)**: Domanda costante e altamente prevedibile.
* **Classe Y ($0.5 \\le CV \\le 1.0$)**: Domanda stagionale o moderatamente variabile.
* **Classe Z ($CV > 1.0$)**: Domanda sporadica e imprevedibile.

---

### 4. La Reale Anatomia Finanziaria delle Merci Dormienti

Mantenere merci invendute a magazzino costa tra il **20% e il 30% annuo del loro costo di acquisto** in affitti, assicurazione, movimentazione e deprezzamento.

---

### 5. Protocollo Quantitativo per l'Identificazione delle Giacenze Dormienti

* **0–60 giorni**: Scorte Attive.
* **61–120 giorni**: Bassa Rotazione.
* **121–180 giorni**: Scorte Stagnanti.
* **Oltre 180 giorni**: Merci Dormienti (Dead Stock).

---

### 6. Il Piano di Liquidazione in 5 Fasi: Recuperare Liquidità

1. **Bundle e Vendite Abbinate al POS**: Associare gli articoli fermi ai top seller.
2. **Vendite Private per Clienti VIP**: Offerte esclusive via newsletter protette da password.
3. **Svendite su Canali Secondari e Marketplace**.
4. **Vendita B2B in Lotti a Stockisti** al prezzo di costo.
5. **Donazione a Enti Benefici e Deduzione Fiscale**.

---

### 7. Meccanismi Automatici di Protezione contro Nuove Giacenze Ferme

* **Accordi di Reso con i Fornitori (RTV)**.
* **Tetti di Budget per Nuovi Articoli**.
* **Blocco Riordini Automatici per Prodotti a Bassa Rotazione**.

---

### 8. Analisi ABC e Audit in Inventory 360

[Inventory 360](https://www.inventory360.shop) include:
1. Classificazione automatica ABC del catalogo.
2. Rilevamento immediato dei prodotti fermi da oltre 90/180 giorni.
3. Impostazione rapida di bundle e sconti cassa al POS.
4. Esportazione report contabili in 11 lingue in formato CSV, Excel e PDF.
`
  },

  ru: {
    title: 'ABC-Анализ Запасов и Ликвидация Неликвидов (Dead Stock): Высвобождение Оборотного Капитала',
    excerpt: 'Полное руководство по аудиту и оздоровлению товарных остатков: Закон Парето 80/20, матрица 9-box ABC-XYZ по волатильности спроса, расчет скрытых затрат на хранение и 5-шаговый план распродажи неликвидов в чистый кэш.',
    category: 'Стратегия Запасов',
    keywords: [
      'ABC анализ запасов формула excel',
      'матрица ABC XYZ управление остатками',
      'ликвидация неликвидов dead stock ритейл',
      'закон парето запасы 80 20',
      'затраты на хранение мертвого запаса',
      'стратегии распродажи без ущерба бренду',
      'аудит оборачиваемости и возраста остатков',
      'высвобождение оборотного капитала склад',
      'продажа стоков оптом дисконтерам B2B',
      'бесплатная программа ABC анализа склада'
    ],
    tableOfContents: [
      { id: 'pareto-principle-inventory', title: '1. Принцип Парето 80/20 в Управлении Товарными Запасами' },
      { id: 'abc-classification-math', title: '2. Математический Алгоритм Расчета ABC-Классификации' },
      { id: 'abc-xyz-matrix', title: '3. Матрица Волатильности Спроса 9-Box «ABC-XYZ»' },
      { id: 'true-cost-dead-stock', title: '4. Истинная Стоимость Содержания Неликвидов (Dead Stock)' },
      { id: 'dead-stock-identification-audit', title: '5. Количественный Аудит и Выявление Зависших Остатков' },
      { id: 'five-step-liquidation-playbook', title: '6. 5-Ступенчатый План Ликвидации: Возврат Живых Денег' },
      { id: 'prevention-guardrails', title: '7. Автоматические Барьеры Против Появления Новых Неликвидов' },
      { id: 'inventory-360-abc-setup', title: '8. ABC-Анализ и Аудит Запасов в Inventory 360' }
    ],
    content: `
### 1. Принцип Парето 80/20 в Управлении Товарными Запасами

В розничной торговле **80% выручки приносят всего 20% топовых товаров**. Одинаковое отношение ко всем позициям приводит к вымыванию оборотного капитала:

\`\`\`
  100% ┌─────────────────────────────────────────────────────────────┐
       │                  КРИВАЯ ПАРЕТО ДЛЯ СКЛАДА                   │
   80% │                           ┌─────────────────────────────────┤ ➔ КЛАСС A (20% Каталога = 80% Выручки)
       │                     ┌─────┘                                 │   • Ежедневный контроль, приоритетный заказ
   60% │               ┌─────┘                                       │
       │         ┌─────┘                                             │ ➔ КЛАСС B (30% Каталога = 15% Выручки)
   40% │    ┌────┘                                                   │   • Ревизия раз в две недели
       │  ┌─┘                                                        │
   20% ├──┘                                                          │ ➔ КЛАСС C (50% Каталога = 5% Выручки)
       │                                                             │   • Минимальный остаток, зона риска неликвида
    0% └──────────────────┬───────────────────────┬──────────────────┘
                         20%                     50%                100%
                                     % ВСЕХ ПОЗИЦИЙ (SKU)
\`\`\`

---

### 2. Математический Алгоритм Расчета ABC-Классификации

$$\\text{Годовой Объем Потребления в Деньгах (ACV)} = \\text{Годовые Продажи в Штуках} \\times \\text{Закупочная Себестоимость}$$

---

### 3. Матрица Волатильности Спроса 9-Box «ABC-XYZ»

$$CV = \\frac{\\sigma}{\\mu} = \\frac{\\text{Стандартное Отклонение Спроса}}{\\text{Средний Спрос}}$$

* **Класс X ($CV < 0.5$)**: Стабильный, легко прогнозируемый спрос.
* **Класс Y ($0.5 \\le CV \\le 1.0$)**: Сезонный или колеблющийся спрос.
* **Класс Z ($CV > 1.0$)**: Непредсказуемый, эпизодический спрос.

---

### 4. Истинная Стоимость Содержания Неликвидов (Dead Stock)

Хранение мертвого груза на складе обходится бизнесу в **20–30% от его стоимости ежегодно** за счет заморозки оборотных средств, аренды, страховок и физического обесценивания.

---

### 5. Количественный Аудит и Выявление Зависших Остатков

* **0–60 дней**: Активный оборот.
* **61–120 дней**: Замедляющийся спрос.
* **121–180 дней**: Стагнирующий остаток.
* **Более 180 дней**: Мертвый запас (Dead Stock, требующий немедленной ликвидации).

---

### 6. 5-Ступенчатый План Ликвидации: Возврат Живых Денег

1. **Комплекты (Bundling) на кассе**: Продажа неликвида в связке с хитом продаж.
2. **Закрытые распродажи для постоянных VIP-клиентов**.
3. **Слив остатков на внешних маркетплейсах и аутлетах**.
4. **Оптовая продажа стоковым дисконтерам (B2B)** по себестоимости.
5. **Благотворительность и списание в убытки для снижения налога на прибыль**.

---

### 7. Автоматические Барьеры Против Появления Новых Неликвидов

* **Договоры обратного выкупа с поставщиками (RTV)**.
* **Лимиты бюджетов на тестовые закупки новинок**.
* **Блокировка автозаказа для низкооборачиваемых позиций**.

---

### 8. ABC-Анализ и Аудит Запасов в Inventory 360

[Inventory 360](https://www.inventory360.shop) предоставляет:
1. Автоматический расчет классов A, B и C в реальном времени.
2. Мгновенная фильтрация товаров без продаж более 90 и 180 дней.
3. Настройка скидок и комплектов прямо в модуле продаж (POS).
4. Экспорт подробных отчетов по замороженному капиталу на 11 языках в CSV, Excel и PDF.
`
  }
};

const i18nPath = 'd:/Website Dev/Free Inventory/inventory360/lib/blogI18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const targetKey = `'abc-inventory-classification-dead-stock-liquidation':`;
const newBlock = `'abc-inventory-classification-dead-stock-liquidation': ${JSON.stringify(blog8_translations, null, 2)},`;

if (code.includes(targetKey)) {
  const startIndex = code.indexOf(targetKey);
  const nextKey = `\n  '`;
  const nextIndex = code.indexOf(nextKey, startIndex + 10);
  const updatedCode = code.slice(0, startIndex) + newBlock + code.slice(nextIndex !== -1 ? nextIndex : undefined);
  fs.writeFileSync(i18nPath, updatedCode, 'utf8');
  console.log('Successfully updated Blog 8 (abc-inventory-classification-dead-stock-liquidation) with full 8-section content across all 11 languages!');
} else {
  // Insert after automated-purchase-orders-reorder-point-formulas
  const nextKey = `'omnichannel-ecommerce-inventory-synchronization':`;
  const nextIndex = code.indexOf(nextKey);

  if (nextIndex !== -1) {
    const updatedCode = code.slice(0, nextIndex) + newBlock + '\n  ' + code.slice(nextIndex);
    fs.writeFileSync(i18nPath, updatedCode, 'utf8');
    console.log('Successfully inserted Blog 8 (abc-inventory-classification-dead-stock-liquidation) with full 8-section content across all 11 languages!');
  } else {
    console.error('Could not locate insertion anchor for Blog 8');
  }
}
