import fs from 'fs';

const translations_post4 = {
  // Spanish
  es: {
    title: 'Trazabilidad de Lotes y Caducidades: Buenas Prácticas para Alimentación, Bebidas y Cosmética',
    excerpt: 'Domina la trazabilidad por lotes, algoritmos de rotación FIFO vs FEFO, normativas internacionales (FDA FSMA 204, UE MDR, GMP) y protocolos de retirada de producto en 5 minutos sin destruir stock sano.',
    category: 'Operaciones y Normativa',
    keywords: [
      'software trazabilidad lotes',
      'protocolo retirada de producto lote',
      'método rotación FIFO vs FEFO',
      'alertas fecha de caducidad TPV',
      'cumplimiento FDA FSMA 204 retail',
      'trazabilidad alimentación cosmética',
      'código de barras GS1 128 lotes',
      'reducción mermas por caducidad',
      'gestión de stock en cuarentena'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. El Coste Regulatorio y Financiero de las Mermas por Caducidad' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Mecánica Matemática de Rotación de Stock' },
      { id: 'regulatory-compliance-standards', title: '3. Marcos Regulatorios: FDA FSMA 204, Reglamento UE y GMP' },
      { id: 'surgical-recall-protocol', title: '4. Protocolo Quirúrgico de Retirada de Lote en 5 Minutos' },
      { id: 'expiry-alert-thresholds', title: '5. Embudo Dinámico de Alertas de Caducidad a 30/60/90 Días' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Codificación GS1-128 y DataMatrix 2D: Identificadores AI de Lote' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilidad de Mermas: Cálculo del Impacto Financiero Real' },
      { id: 'inventory-360-lot-setup', title: '8. Ejecución de Lotes y Caducidades en Inventory 360' },
    ],
    content: `
### 1. El Coste Regulatorio y Financiero de las Mermas por Caducidad

En los sectores de alimentación, bebidas especiales, cosmética natural, suplementos dietéticos y farmacia, el recuento genérico de unidades es un riesgo crítico.

A diferencia del comercio no perecedero, un artículo caducado no es solo capital inmovilizado, sino una pérdida directa que destruye el margen comercial:

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

La Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO) estima que el comercio minorista pierde entre un **1.8% y un 4.2% de su facturación anual** exclusivamente por productos caducados.

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

---

### 5. Embudo Dinámico de Alertas de Caducidad a 30/60/90 Días

\`\`\`
[ A 90 Días de Caducar ] ➔ 🟢 Monitorización de velocidad. Precio normal.
[ A 60 Días de Caducar ] ➔ 🟡 Alerta Amarilla. Mover producto al frontal de estantería.
[ A 30 Días de Caducar ] ➔ 🟠 Descuento automático del 25% o pack promocional.
[ A 10 Días de Caducar ] ➔ 🔴 Liquidación al 50% o donación a banco de alimentos.
[ 0 Días (Caducado) ]    ➔ ⛔ Bloqueo en TPV: Prohibida su venta en caja.
\`\`\`

---

### 6. Codificación GS1-128 y DataMatrix 2D: Identificadores AI de Lote

| Identificador de Aplicación (AI) | Dato Codificado | Ejemplo de Cadena | Interpretación |
| :--- | :--- | :--- | :--- |
| **(01)** | Código GTIN de Producto | \`00850012345678\` | Identificador SKU |
| **(10)** | Número de Lote / Batch | \`LOT-9921\` | Serie de Producción |
| **(17)** | Fecha de Caducidad (\`AAMMDD\`) | \`261130\` | Caduca el 30 Nov 2026 |
| **(21)** | Número de Serie Unitario | \`SN-883492\` | ID Individual Único |

---

### 7. Contabilidad de Mermas: Cálculo del Impacto Financiero Real

$$\\text{Tasa de Pérdida por Caducidad (\\%)} = \\left( \\frac{\\text{Coste Total de Unidades Caducadas}}{\\text{Coste Total de Mercancías Perecederas (COGS)}} \\right) \\times 100$$

---

### 8. Ejecución de Lotes y Caducidades en Inventory 360

[Inventory 360](https://www.inventory360.shop) incluye control de lotes integrado en local:
1. **Asignación de Lote al Recibir**: Introduzca el número de lote y fecha de vencimiento al registrar las compras para activar la cola FEFO.
2. **Alertas Visuales de Vencimiento**: Los paneles destacan automáticamente los lotes a 30, 60 y 90 días.
3. **Bloqueo Quirúrgico de Lotes**: Ponga en cuarentena un lote específico mientras el resto de existencias del producto sigue vendiéndose con normalidad.
4. **Informes de Auditoría Multilingües**: Exporte historiales completos en CSV, Excel o PDF en 11 idiomas con total privacidad.
`
  },

  // French
  fr: {
    title: 'Traçabilité des Lots et Dates de Péremption : Guide Pratique pour l\'Alimentaire et la Cosmétique',
    excerpt: 'Maîtrisez la traçabilité par lot, les algorithmes de rotation FIFO vs FEFO, la conformité réglementaire (FDA FSMA 204, normes UE) et le rappel ciblé de produits en moins de 5 minutes.',
    category: 'Opérations & Conformité',
    keywords: [
      'traçabilité des lots logiciel',
      'procédure rappel de lot',
      'rotation des stocks FIFO FEFO',
      'alerte date limite consommation DLC',
      'traçabilité alimentaire cosmétique',
      'code barre GS1 128 lot',
      'réduction démarque casse péremption'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Le Coût Financier et Réglementaire des Pertes de Périssables' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO : Mécanique Mathématique de Rotation des Stocks' },
      { id: 'regulatory-compliance-standards', title: '3. Normes Réglementaires : FDA FSMA 204, UE et BPF' },
      { id: 'surgical-recall-protocol', title: '4. Procédure de Rappel Ciblé de Lot en Moins de 5 Minutes' },
      { id: 'expiry-alert-thresholds', title: '5. Pipeline Dynamique d\'Alertes de Péremption à 30/60/90 Jours' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Encodage GS1-128 et DataMatrix 2D' },
      { id: 'spoilage-accounting-formulas', title: '7. Comptabilité des Pertes : Mesure du Coût Réel' },
      { id: 'inventory-360-lot-setup', title: '8. Gestion des Lots dans Inventory 360' },
    ],
    content: `
### 1. Le Coût Financier et Réglementaire des Pertes de Périssables

Dans l'agroalimentaire, les cosmétiques et la pharmacie, la gestion générique des stocks est une source majeure de pertes. La FAO estime que les détaillants perdent entre **1,8% et 4,2% de leur chiffre d'affaires annuel** en produits périmés.

---

### 2. FIFO vs. FEFO : Mécanique Mathématique de Rotation des Stocks

* **FIFO (First-In, First-Out)** : Sortie selon l'ordre d'arrivée en entrepôt.
* **FEFO (First-Expired, First-Out)** : Sortie prioritaire des articles dont la Date Limite de Consommation (DLC) est la plus proche, permettant de **réduire le gaspillage de 42% à 68%**.

---

### 3. Procédure de Rappel Ciblé de Lot en Moins de 5 Minutes

1. **Identification Immédiate** du numéro de lot concerné.
2. **Recherche Instantanée** dans le grand livre local (< 30 secondes).
3. **Mise en Quarantaine en 1 Clic** bloquant la vente en caisse.
4. **Extraction des Coordonnées Clients** ayant acheté ce lot pour rappel sanitaire.

---

### 4. Pipeline Dynamique d'Alertes de Péremption

* **90 Jours** : Surveillance normale des ventes.
* **60 Jours** : Mise en avant en tête de gondole.
* **30 Jours** : Démarque promotionnelle de -25%.
* **10 Jours** : Déstockage flash (-50%) ou don alimentaire.
* **0 Jour (Périmé)** : Blocage absolu au passage en caisse.

---

### 5. Gestion des Lots dans Inventory 360

[Inventory 360](https://www.inventory360.shop) intègre nativement la gestion des lots :
* Saisie du numéro de lot et de la DLC à la réception.
* Alertes visuelles automatiques sur les dates critiques.
* Rapports d'audit conformes exportables en 11 langues en CSV, Excel et PDF.
`
  },

  // German
  de: {
    title: 'Chargen- & Mindesthaltbarkeits-Tracking: Best Practices für Lebensmittel, Getränke & Kosmetik',
    excerpt: 'Beherrschen Sie Chargenrückverfolgung, FIFO vs. FEFO-Rotationsalgorithmen, behördliche Compliance (FDA FSMA 204, EU-Kosmetikverordnung, GMP) und gezielte Produktrückrufe in unter 5 Minuten.',
    category: 'Betrieb & Compliance',
    keywords: [
      'Chargenrückverfolgung Software',
      'Chargenrückruf Ablauf',
      'FIFO vs FEFO Methode',
      'MHD Ablaufwarnung Kasse',
      'Lebensmittel Kosmetik Chargenverwaltung',
      'GS1 128 Barcode Charge MHD',
      'Verderb Reduzierung Einzelhandel'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Finanzielle und regulatorische Risiken von Verderb' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Mathematische Bestandsrotation' },
      { id: 'regulatory-compliance-standards', title: '3. Regulatorische Rahmenbedingungen: FDA, EU & GMP' },
      { id: 'surgical-recall-protocol', title: '4. Der 5-Minuten-Präzisionsrückruf-Standard' },
      { id: 'expiry-alert-thresholds', title: '5. Dynamische 30/60/90-Tage MHD-Warnstufen' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128 & 2D-DataMatrix Barcode-Codierung' },
      { id: 'spoilage-accounting-formulas', title: '7. Abschreibungsrechnung: Echte Verderbkosten ermitteln' },
      { id: 'inventory-360-lot-setup', title: '8. Chargen- und MHD-Verwaltung in Inventory 360' },
    ],
    content: `
### 1. Finanzielle und regulatorische Risiken von Verderb

Im Handel mit Lebensmitteln, Nahrungsergänzungsmitteln und Kosmetika führt fehlende Chargenverwaltung zu hohen Verlusten. Händler verlieren laut FAO jährlich **1,8% bis 4,2% des Bruttoumsatzes** durch abgelaufene Waren.

---

### 2. FIFO vs. FEFO: Mathematische Bestandsrotation

* **FIFO (First-In, First-Out)**: Älteste Ware nach Wareneingangsdatum wird zuerst verkauft.
* **FEFO (First-Expired, First-Out)**: Ware mit kürzestem Mindesthaltbarkeitsdatum (MHD) wird priorisiert. Senkt Verderbverluste um **42% bis 68%**.

---

### 3. Der 5-Minuten-Präzisionsrückruf-Standard

1. **Chargen-Nummer** im System lokalisieren (< 30 Sekunden).
2. **1-Klick-Sperrung**: Kassen scannen betroffene Chargen automatisch abweisend.
3. **Kundenhistorie filtern**: Betroffene Käufer für Rückrufwarnungen exportieren.

---

### 4. Dynamische MHD-Warnstufen (30/60/90 Tage)

* **90 Tage**: Regulärer Verkauf.
* **60 Tage**: Platzierung im Regal vorne.
* **30 Tage**: Rabattierung (-25%) zur beschleunigten Abverkäuflichkeit.
* **10 Tage**: Abverkauf (-50%) oder Abgabe an Tafeln.
* **0 Tage (Abgelaufen)**: Automatische Kassensperre.

---

### 5. Chargen- und MHD-Verwaltung in Inventory 360

* Erfassung von Chargennummer und Verfallsdatum beim Wareneingang.
* Automatische FEFO-Warteschlange und Warnmeldungen.
* Revisionssichere Prüfberichte in 11 Sprachen als CSV, Excel und PDF.
`
  },

  // Hindi
  hi: {
    title: 'बैच, लॉट और समाप्ति तिथि ट्रैकिंग: खाद्य, पेय और सौंदर्य प्रसाधन रिटेलर्स के लिए संपूर्ण गाइड',
    excerpt: 'लॉट-स्तरीय ट्रेसेबिलिटी, FIFO बनाम FEFO स्टॉक रोटेशन नियम, नियामक अनुपालन और स्वस्थ स्टॉक को नुकसान पहुंचाए बिना 5 मिनट में सर्जिकल रिकॉल करने की कार्यप्रणाली।',
    category: 'परिचालन और अनुपालन',
    keywords: [
      'लॉट ट्रैकिंग सॉफ्टवेयर',
      'बैच नंबर रिकॉल प्रक्रिया',
      'FIFO बनाम FEFO विधि',
      'एक्सपायरी डेट अलर्ट पीओएस',
      'खाद्य एवं सौंदर्य प्रसाधन ट्रेसेबिलिटी',
      'GS1 128 बारकोड लॉट',
      'खराब माल कम करने के उपाय'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. खराब होने वाले सामान की वित्तीय और कानूनी लागत' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO बनाम FEFO: स्टॉक रोटेशन की गणितीय प्रणाली' },
      { id: 'regulatory-compliance-standards', title: '3. नियामक मानक: FDA, FSSAI और GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5 मिनट में सर्जिकल बैच रिकॉल प्रक्रिया' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90 दिन का डायनामिक एक्सपायरी अलर्ट सिस्टम' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128 और 2D बारकोड एनकोडिंग' },
      { id: 'spoilage-accounting-formulas', title: '7. खराब माल की लागत का वास्तविक वित्तीय हिसाब' },
      { id: 'inventory-360-lot-setup', title: '8. Inventory 360 में बैच और एक्सपायरी प्रबंधन' },
    ],
    content: `
### 1. खराब होने वाले सामान की वित्तीय और कानूनी लागत

किराना, डेयरी, सौंदर्य प्रसाधन और दवाओं के व्यापार में एक्सपायरी तारीख का ध्यान न रखने पर भारी नुकसान होता है। वैश्विक आंकड़ों के अनुसार रिटेल स्टोर हर साल अपनी कुल बिक्री का **1.8% से 4.2%** खराब माल के कारण गंवा देते हैं।

---

### 2. FIFO बनाम FEFO स्टॉक रोटेशन

* **FIFO (First-In, First-Out)**: जो माल पहले आया, वह पहले बिकेगा।
* **FEFO (First-Expired, First-Out)**: जिसकी समाप्ति तिथि (Expiry Date) सबसे पहले है, वह पहले बिकेगा। इससे नुकसान **42% से 68% तक कम** हो जाता है।

---

### 3. 5 मिनट में सर्जिकल बैच रिकॉल

1. खराब बैच की पहचान और 30 सेकंड में सिस्टम में लोकेशन का पता लगाना।
2. 1-क्लिक में क्वारंटाइन लॉक ताकि बिलिंग काउंटर पर वह माल स्कैन ही न हो सके।
3. उस बैच को खरीदने वाले ग्राहकों की सूची तुरंत निकाल कर सुरक्षा संदेश भेजना।

---

### 4. 30/60/90 दिन का एक्सपायरी अलर्ट

* **90 दिन शेष**: सामान्य बिक्री दर।
* **60 दिन शेष**: उत्पाद को दुकान के मुख्य रैक पर आगे रखना।
* **30 दिन शेष**: 25% का विशेष डिस्काउंट ऑफर।
* **10 दिन शेष**: 50% क्लीयरेंस सेल।
* **0 दिन (समाप्त)**: बिलिंग काउंटर पर पूर्ण प्रतिबंध।

---

### 5. Inventory 360 में बैच प्रबंधन

* सामान की आवक पर लॉट नंबर और एक्सपायरी तिथि दर्ज करना।
* रंग-बिरंगे अलर्ट बैज द्वारा निकट आ रही एक्सपायरी की चेतावनी।
* 11 भाषाओं में विस्तृत ऑडिट रिपोर्ट CSV, Excel और PDF में डाउनलोड।
`
  },

  // Japanese
  ja: {
    title: 'ロット管理・賞味期限トラッキング：食品・飲料・コスメ小売業のための実践ガイド',
    excerpt: 'ロット追跡、FIFO（先入れ先出し）vs FEFO（賞味期限先出し）数理アルゴリズム、規制コンプライアンス（食品衛生法・GMP）、健全在庫を守る5分間リコール手順を網羅。',
    category: '業務運用＆コンプライアンス',
    keywords: [
      'ロット管理 システム',
      'リコール 手順',
      'FIFO FEFO 先入れ先出し 違い',
      '賞味期限アラート POS',
      '食品 化粧品 在庫追跡',
      'GS1 128 バーコード ロット',
      '廃棄ロス 削減'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. 廃棄ロスと規制遵守がもたらす財務的インパクト' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO：在庫回転アルゴリズムの比較' },
      { id: 'regulatory-compliance-standards', title: '3. 主要規制フレームワーク：食品衛生法・薬機法・GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5分間で完了する対象ロット限定リコール手順' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90日段階的賞味期限アラートパイプライン' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128＆2次元データマトリックスの活用' },
      { id: 'spoilage-accounting-formulas', title: '7. 廃棄損の真実の保有コスト計算式' },
      { id: 'inventory-360-lot-setup', title: '8. Inventory 360でのロット＆期限管理運用' },
    ],
    content: `
### 1. 廃棄ロスと規制遵守がもたらす財務的インパクト

食品スーパー、オーガニックコスメ、サプリメント、医薬品分野において、単なる数量管理は重大なリスクを招きます。小売店は賞味期限切れ廃棄により**年間売上の1.8%〜4.2%**を喪失しています。

---

### 2. FIFO vs. FEFO：在庫回転アルゴリズム

* **FIFO（先入れ先出し）**：入荷日時が古い順に出荷。
* **FEFO（期限先出し）**：賞味期限が近い順に出荷。廃棄ロスを**42%〜68%大幅削減**。

---

### 3. 5分間で完了する対象ロット限定リコール手順

1. 汚染・回収ロットの即時検索（30秒以内）。
2. ワンクリックでの「回収隔離」設定（POSレジでのスキャンを自動拒否）。
3. 過去の購入顧客リストを1クリック抽出して緊急連絡。

---

### 4. 30/60/90日段階的賞味期限アラート

* **90日前**：通常販売と動向監視。
* **60日前**：店舗手前棚へのフェイシング変更。
* **30日前**：25%引きセール・バンドル販売。
* **10日前**：50%引き売り切り処分。
* **期限切れ（0日）**：POSレジでの会計を絶対禁止。

---

### 5. Inventory 360でのロット運用

* 入庫時のロット番号・消費期限登録。
* 危険期限に近づいたロットの自動警告。
* 11言語対応の監査レポート出力（CSV/Excel/PDF）。
`
  },

  // Chinese (Simplified)
  zh: {
    title: '批次号与保质期管理全景实战：食品生鲜、美妆与医药零售的先进追溯规范',
    excerpt: '深度解析批次级可追溯性构建、FIFO（先进先出）与 FEFO（先到期先出）数理轮换模型、法规合规标准及5分钟精准批次召回标准作业程序（SOP）。',
    category: '运营管理与法规合规',
    keywords: [
      '批次追踪库存系统',
      '产品批次召回SOP',
      'FIFO与FEFO对比',
      '保质期到期预警POS',
      '食品美妆追溯法规',
      'GS1 128条形码批次',
      '降低生鲜临期损耗'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. 易腐损耗与法规违规的双重财务代价' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO：库存轮换算法的数理机制' },
      { id: 'regulatory-compliance-standards', title: '3. 核心监管框架：食品安全法与GMP规范' },
      { id: 'surgical-recall-protocol', title: '4. 5分钟精准批次召回标准作业程序（SOP）' },
      { id: 'expiry-alert-thresholds', title: '5. 30/60/90天动态阶梯式临期预警流水线' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. GS1-128与二维DataMatrix的AI标识符编码' },
      { id: 'spoilage-accounting-formulas', title: '7. 损耗会计：量化真实的库存报废持有成本' },
      { id: 'inventory-360-lot-setup', title: '8. 在 Inventory 360 中落地批次与效期管理' },
    ],
    content: `
### 1. 易腐损耗与法规违规的双重财务代价

在生鲜食品、高端酒水、天然美妆和营养保健品零售中，按总件数模糊记账是极其危险的。联合国粮农组织（FAO）统计，零售商因临期过期直接造成的损耗占**年销售总额的1.8%至4.2%**。

---

### 2. FIFO vs. FEFO：库存轮换算法

* **FIFO（先进先出）**：按采购入库时间先后出库。
* **FEFO（先到期先出）**：无论到货先后，严格按保质期临近程度优先排面陈列与收银，可将**过期损耗降低42%至68%**。

---

### 3. 5分钟精准批次召回标准作业程序（SOP）

1. **定位受污染批次**（30秒内检索本地账本）。
2. **一键锁定隔离**：收银台扫码时自动触发警报并拒绝结算。
3. **反向追溯客户档案**：一键导出已购该批次的会员名单以便紧急通告。

---

### 4. 30/60/90天动态阶梯式临期预警

* **距到期90天**：正常动销监测。
* **距到期60天**：调整至排面前端陈列。
* **距到期30天**：自动触发7.5折促销或捆绑销售。
* **距到期10天**：5折清仓或公益捐赠。
* **已过期（0天）**：收银端绝对禁售。

---

### 5. 在 Inventory 360 中落地批次管理

* 入库时登记供应商批次号与保质期。
* 仪表盘色彩化高亮展示临期风险批次。
* 支持以11种语言导出符合审计规范的 CSV、Excel 和 PDF 报表。
`
  },

  // Arabic
  ar: {
    title: 'تتبع التشغيلات وتواريخ الصلاحية: أفضل الممارسات لتجزئة الأغذية ومستحضرات التجميل',
    excerpt: 'دليل تشغيلي شامل لتتبع أرقام التشغيلات (Lots)، وخوارزميات تدوير المخزون FIFO مقابل FEFO، والامتثال التنظيمي، وإجراء استدعاء دقيق للتشغيلات في أقل من 5 دقائق.',
    category: 'العمليات والامتثال',
    keywords: [
      'برنامج تتبع أرقام التشغيلات',
      'إجراءات سحب واستدعاء البضائع',
      'مقارنة FIFO و FEFO',
      'تنبيهات تاريخ الصلاحية نقاط البيع',
      'تتبع الأغذية والتجميل',
      'باركود GS1 128 تشغيلات',
      'تقليل التوالف المنتهية الصلاحية'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. التكاليف المالية والتنظيمية لتلف البضائع المنتهية الصلاحية' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. مقارنة FIFO و FEFO: آليات تدوير المخزون رياضياً' },
      { id: 'regulatory-compliance-standards', title: '3. الأطر التنظيمية ومعايير سلامة الأغذية' },
      { id: 'surgical-recall-protocol', title: '4. خطة سحب واستدعاء التشغيلات المعيبة في 5 دقائق' },
      { id: 'expiry-alert-thresholds', title: '5. خط التنبيهات التدريجي للصلاحية (30/60/90 يوماً)' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. ترميز باركود GS1-128 والرموز ثنائية الأبعاد' },
      { id: 'spoilage-accounting-formulas', title: '7. محاسبة التوالف: حساب الخسارة المالية الفعلية' },
      { id: 'inventory-360-lot-setup', title: '8. إدارة الصلاحية والتشغيلات في Inventory 360' },
    ],
    content: `
### 1. التكاليف المالية لتلف المنتجات

في قطاعات الأغذية ومستحضرات التجميل والأدوية، يؤدي غياب التتبع الدقيق إلى خسارة **1.8% إلى 4.2% من إجمالي الإيرادات السنوية** بسبب انتهاء الصلاحية.

---

### 2. مقارنة FIFO و FEFO

* **FIFO (الوارد أولاً يصرف أولاً)**: يعتمد على تاريخ وصول البضاعة.
* **FEFO (المنتهي أولاً يصرف أولاً)**: يعتمد على تاريخ انتهاء الصلاحية، مما يخفض التوالف بنسبة **42% إلى 68%**.

---

### 3. استدعاء التشغيلات المعيبة في 5 دقائق

1. تحديد مكان التشغيلة فورياً داخل المستودع (< 30 ثانية).
2. حجز التشغيلة بنقرة واحدة ومنع بيعها آلياً على شاشات نقاط البيع.
3. استخراج بيانات العملاء الذين اشتروا منها لإرسال تنبيهات السلامة.

---

### 4. التنبيهات التدريجية للصلاحية

* **90 يوماً**: البيع بالسعر الرسمي.
* **60 يوماً**: نقل المنتجات لمقدمة الرفوف.
* **30 يوماً**: خصم ترويجي 25%.
* **10 أيام**: تصفية بخصم 50%.
* **0 يوم (منتهي)**: منع البيع في الكاشير تماماً.

---

### 5. إدارة التشغيلات في Inventory 360

* تسجيل رقم التشغيلة وتاريخ الانتهاء عند الاستلام.
* لوحة تحكم ذكية ترصد تواريخ الصلاحية بالألوان.
* تصدير تقارير المطابقة والتدقيق بـ 11 لغة بصيغ CSV و Excel و PDF.
`
  },

  // Portuguese
  pt: {
    title: 'Rastreamento de Lotes e Validade: Melhores Práticas para Alimentos, Bebidas e Cosméticos',
    excerpt: 'Domine a rastreabilidade no nível do lote, algoritmos de rotação FIFO vs FEFO, conformidade com órgãos reguladores (Anvisa, FDA) e recall cirúrgico em menos de 5 minutos.',
    category: 'Operações e Conformidade',
    keywords: [
      'software rastreamento de lotes',
      'procedimento de recall de lote',
      'diferença FIFO e FEFO estoque',
      'alerta data de validade PDV',
      'rastreabilidade alimentos cosméticos',
      'código de barras GS1 128 lote',
      'redução de perdas por validade'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. O Custo Financeiro e Regulatório das Perdas por Validade' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: A Mecânica de Rotação de Estoque' },
      { id: 'regulatory-compliance-standards', title: '3. Normas Regulatórias: Anvisa, FDA e Boas Práticas (GMP)' },
      { id: 'surgical-recall-protocol', title: '4. Procedimento Padrão de Recall de Lote em 5 Minutos' },
      { id: 'expiry-alert-thresholds', title: '5. Linha de Alertas de Validade em 30/60/90 Dias' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Códigos GS1-128 e DataMatrix 2D' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilidade de Avarias: Medindo a Perda Real' },
      { id: 'inventory-360-lot-setup', title: '8. Gestão de Lotes no Inventory 360' },
    ],
    content: `
### 1. O Custo Financeiro das Perdas por Validade

No comércio de alimentos, cosméticos e suplementos, a falta de controle de validade destrói as margens de lucro. O varejo perde entre **1,8% e 4,2% do faturamento bruto anual** com descarte de itens vencidos.

---

### 2. FIFO vs. FEFO

* **FIFO (Primeiro que Entra, Primeiro que Sai)**: Ordenado pela data de chegada.
* **FEFO (Primeiro que Vence, Primeiro que Sai)**: Prioriza os itens com vencimento mais próximo, **reduzindo descartes em até 68%**.

---

### 3. Recall de Lote em 5 Minutos

1. Localização exata das unidades em estoque (< 30 segundos).
2. Bloqueio instantâneo do lote (o PDV rejeita o código de barras).
3. Rastreamento dos clientes que compraram o item para alerta preventivo.

---

### 4. Alertas Escalonados de Validade

* **90 Dias**: Monitoramento preventivo.
* **60 Dias**: Posicionamento na frente da prateleira.
* **30 Dias**: Promoção com 25% de desconto.
* **10 Dias**: Queima de estoque (50% OFF) ou doação.
* **Vencido (0 Dia)**: Proibição total de venda no caixa.

---

### 5. Gestão de Lotes no Inventory 360

* Cadastro de lote e vencimento na entrada de notas de compra.
* Avisos visuais automáticos nos relatórios de estoque.
* Exportação de relatórios em 11 idiomas em CSV, Excel e PDF.
`
  },

  // Italian
  it: {
    title: 'Tracciabilità di Lotti e Scadenze: Best Practice per il Settore Alimentare, Beverage e Cosmetica',
    excerpt: 'Padroneggia la tracciabilità dei lotti, gli algoritmi di rotazione FIFO vs FEFO, la conformità normativa (HACCP, UE 1223/2009) e la procedura di richiamo mirato del lotto in meno di 5 minuti.',
    category: 'Operazioni e Normativa',
    keywords: [
      'software tracciabilità lotti',
      'procedura richiamo lotto prodotto',
      'rotazione scorte FIFO FEFO',
      'avviso data di scadenza cassa',
      'tracciabilità alimentare cosmetica',
      'codice a barre GS1 128 lotto',
      'riduzione scarti scaduti'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Il Costo Economico e Normativo dei Prodotti Deperibili' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Meccanica Matematica della Rotazione Scorte' },
      { id: 'regulatory-compliance-standards', title: '3. Normative di Settore: HACCP, Norme UE e GMP' },
      { id: 'surgical-recall-protocol', title: '4. Procedura Operativa di Richiamo del Lotto in 5 Minuti' },
      { id: 'expiry-alert-thresholds', title: '5. Pipeline di Allarmi Scadenza a 30/60/90 Giorni' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Codifica GS1-128 e DataMatrix 2D' },
      { id: 'spoilage-accounting-formulas', title: '7. Contabilità degli Scarti: Calcolo della Perdita Reale' },
      { id: 'inventory-360-lot-setup', title: '8. Gestione Lotti e Scadenze in Inventory 360' },
    ],
    content: `
### 1. Il Costo Economico dei Prodotti Deperibili

Nei settori alimentare, cosmetico e parafarmaceutico, la mancata gestione delle scadenze provoca una perdita media compresa tra l'**1,8% e il 4,2% del fatturato annuo**.

---

### 2. FIFO vs. FEFO

* **FIFO (First-In, First-Out)**: Prelievo in base alla data di arrivo in magazzino.
* **FEFO (First-Expired, First-Out)**: Priorità ai prodotti con scadenza più ravvicinata, con un **abbattimento degli scarti fino al 68%**.

---

### 3. Procedura di Richiamo in 5 Minuti

1. Individuazione istantanea delle unità a magazzino (< 30 secondi).
2. Blocco in quarantena in 1 clic con rifiuto automatico alla cassa.
3. Estrazione dei clienti acquirenti per avviso immediato.

---

### 4. Pipeline di Allarmi Scadenza

* **90 Giorni**: Monitoraggio standard.
* **60 Giorni**: Spostamento sul fronte scaffale.
* **30 Giorni**: Sconto promozionale del 25%.
* **10 Giorni**: Vendita promozionale al 50% o donazione.
* **Scaduto (0 Giorni)**: Blocco assoluto della vendita.

---

### 5. Gestione Lotti in Inventory 360

* Registrazione numero di lotto e scadenza al carico merci.
* Badge visivi di allerta nei report di magazzino.
* Esportazione di report di conformità in 11 lingue in CSV, Excel e PDF.
`
  },

  // Russian
  ru: {
    title: 'Учет Партий, Серий и Сроков Годности: Руководство для Продуктового, Косметического и Фарма-Ритейла',
    excerpt: 'Полное практическое руководство: поштучный партионный учет, алгоритмы ротации FIFO vs FEFO, регуляторный комплаенс (Честный Знак, ХАССП, GMP) и локальный отзыв партии за 5 минут.',
    category: 'Операции и Регламенты',
    keywords: [
      'партионный учет программа',
      'регламент отзыва партии товара',
      'ротация склада FIFO FEFO',
      'контроль сроков годности на кассе',
      'учет сроков годности косметика продукты',
      'штрихкод GS1 128 срок годности',
      'снижение списаний просрочки'
    ],
    tableOfContents: [
      { id: 'financial-regulatory-stakes', title: '1. Финансовые и Юридические Риски Списания Просрочки' },
      { id: 'fifo-vs-fefo-mechanics', title: '2. FIFO vs. FEFO: Математика Ротации Складских Запасов' },
      { id: 'regulatory-compliance-standards', title: '3. Стандарты Регулирования: ХАССП, ЕАЭС и GMP' },
      { id: 'surgical-recall-protocol', title: '4. 5-Минутный Регламент Выборочного Отзыва Партии' },
      { id: 'expiry-alert-thresholds', title: '5. Каскадная Система Предупреждений за 30/60/90 Дней' },
      { id: 'gs1-128-datamatrix-encoding', title: '6. Кодирование GS1-128 и DataMatrix: Теги Партий и Сроков' },
      { id: 'spoilage-accounting-formulas', title: '7. Учет Списаний: Расчет Реального Ущерба от Порчи' },
      { id: 'inventory-360-lot-setup', title: '8. Настройка Партий и Сроков Годности в Inventory 360' },
    ],
    content: `
### 1. Финансовые и Юридические Риски Списания Просрочки

В торговле продуктами питания, косметикой и аптечным ассортиментом отсутствие контроля партий ведет к прямым убыткам. По данным FAO, розничные сети теряют от **1.8% до 4.2% годовой выручки** исключительно на списаниях просроченной продукции.

---

### 2. FIFO vs. FEFO: Математика Ротации Запасов

* **FIFO (First-In, First-Out)**: Списание по дате поступления на склад.
* **FEFO (First-Expired, First-Out)**: Приоритетная продажа товаров с ближайшим сроком годности. Снижает потери от порчи на **42%–68%**.

---

### 3. 5-Минутный Регламент Выборочного Отзыва Партии

1. Мгновенный поиск партии по локальной базе (< 30 секунд).
2. Блокировка в 1 клик: кассовый узел автоматически отклоняет штрихкод отозванного лота.
3. Экспорт списка покупателей данной партии для срочного оповещения.

---

### 4. Каскадная Система Предупреждений (30/60/90 Дней)

* **90 Дней**: Стандартная скорость продаж.
* **60 Дней**: Перемещение на передний план витрины.
* **30 Дней**: Автоматическая скидка 25% или бандл.
* **10 Дней**: Распродажа со скидкой 50%.
* **0 Дней (Просрочено)**: Полный запрет продажи на кассе.

---

### 5. Настройка Партий и Сроков Годности в Inventory 360

* Ввод номера партии и срока годности при оприходовании накладной.
* Цветовые индикаторы приближающихся сроков в отчетах.
* Экспорт аудиторских отчетов на 11 языках в CSV, Excel и PDF.
`
  }
};

// Now read existing lib/blogI18n.ts and merge translations for post 4
const i18nPath = 'd:/Website Dev/Free Inventory/inventory360/lib/blogI18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const post4Str = `'batch-lot-expiry-date-tracking-guide': ${JSON.stringify(translations_post4, null, 2)},\n`;

// Find markers
const startMarker = `'barcode-label-printing-sku-system-guide':`;

const startIndex = code.indexOf(startMarker);

if (startIndex !== -1) {
  const newCode = code.slice(0, startIndex) + post4Str + '  ' + code.slice(startIndex);
  fs.writeFileSync(i18nPath, newCode, 'utf8');
  console.log('Successfully inserted complete translations for post 4 into lib/blogI18n.ts!');
} else {
  console.error('Could not locate startMarker in lib/blogI18n.ts');
}
