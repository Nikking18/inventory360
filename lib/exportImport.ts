import {
  getAllFromStore,
  putManyToStore,
  clearAllStores,
} from './db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SupportedLanguage } from './i18n';

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeCSVValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  // CSV Formula Injection Prevention: If cell starts with =, +, -, @, \t, \r, prefix with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// Master multilingual label dictionary for all exported CSV, Excel, PDF documents, PO Slips, and Pick Lists
const EXPORT_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'Product Name': 'Product Name',
    Product: 'Product Name',
    SKU: 'SKU',
    Category: 'Category',
    Supplier: 'Supplier',
    'Cost Price': 'Cost Price',
    'Retail Price': 'Retail Price',
    Cost: 'Cost',
    Retail: 'Retail',
    'Tax %': 'Tax Rate %',
    'Tax Rate': 'Tax Rate',
    'Stock On Hand': 'Stock On Hand',
    Stock: 'Stock',
    'Stock Quantity': 'Stock Quantity',
    'Reorder Threshold': 'Reorder Threshold',
    'Reorder Point': 'Reorder Point',
    'Total Cost Valuation': 'Total Cost Valuation',
    'Total Retail Valuation': 'Total Retail Valuation',
    'Cost Valuation': 'Cost Valuation',
    'Retail Valuation': 'Retail Valuation',
    'Total Valuation': 'Total Valuation',
    'Inventory Status': 'Inventory Status',
    Status: 'Status',
    'Units Sold': 'Units Sold',
    'Total Revenue': 'Total Revenue',
    Revenue: 'Revenue',
    'Total COGS': 'Total COGS',
    COGS: 'COGS',
    'Gross Profit': 'Gross Profit',
    Profit: 'Profit',
    'Gross Margin %': 'Gross Margin %',
    'Margin %': 'Margin %',
    'Transaction Ref': 'Transaction Ref',
    'Sale #': 'Sale #',
    'PO #': 'PO #',
    'P.O. #': 'P.O. #',
    'Date & Time': 'Date & Time',
    Date: 'Date',
    'Issued Date': 'Issued Date',
    'Expected Date': 'Expected Date',
    'Movement Type': 'Movement Type',
    'Outlet / Location': 'Outlet / Location',
    Location: 'Location',
    Outlet: 'Outlet',
    'Quantity Delta': 'Quantity Delta',
    'Quantity Change': 'Quantity Change',
    'Previous Stock': 'Previous Stock',
    'Resulting Stock': 'Resulting Stock',
    'New Stock': 'New Stock',
    'Audit Notes / Reason': 'Audit Notes / Reason',
    Notes: 'Notes',
    Customer: 'Customer Name',
    'Customer Name': 'Customer Name',
    Channel: 'Sales Channel',
    'Sales Channel': 'Sales Channel',
    'Payment Method': 'Payment Method',
    Payment: 'Payment Method',
    Method: 'Method',
    'Items Count': 'Items Count',
    Items: 'Items Count',
    'Order Qty': 'Order Qty',
    Subtotal: 'Subtotal',
    Tax: 'Tax / GST',
    Total: 'Total Amount',
    'Tax Collected': 'Tax Collected',
    'Taxable Amount': 'Taxable Amount',
    'Gross Sales': 'Gross Sales',
    'Net Sales': 'Net Sales',
    'Net Profit': 'Net Profit',
    'Official Inventory Record': 'Official Inventory Record',
    Generated: 'Generated',
    'Total Records': 'Total Records',
    'FINANCIAL & ANALYTICS REPORT': 'FINANCIAL & ANALYTICS REPORT',
    'Master Stock Levels Valuation Report': 'MASTER STOCK LEVELS VALUATION REPORT',
    'Stock Valuation Report': 'STOCK VALUATION REPORT',
    'Sales Audit & Transaction Ledger': 'SALES AUDIT & TRANSACTION LEDGER',
    'Inventory Valuation & Stock Status': 'INVENTORY VALUATION & STOCK STATUS',
    'Purchase Orders & Procurement Ledger': 'PURCHASE ORDERS & PROCUREMENT LEDGER',
    'Tax Collection & Audit Report': 'TAX COLLECTION & AUDIT REPORT',
    'Product Profitability & Margins Report': 'PRODUCT PROFITABILITY & MARGINS REPORT',
    'Sales Velocity & Stock Turnover Report': 'SALES VELOCITY & STOCK TURNOVER REPORT',
    PO_HEADER: 'OFFICIAL PURCHASE ORDER & REQUISITION SLIP',
    PURCHASE_ORDER: 'PURCHASE ORDER',
    PO_NUMBER: 'P.O. #',
    ISSUED: 'Issued',
    VENDOR_DETAILS: 'VENDOR / SUPPLIER DETAILS',
    APPROVED_VENDOR: 'Approved Commercial Vendor Partner',
    PAYMENT_TERMS: 'Payment Terms: Net 30 Days',
    SHIP_TO: 'SHIP TO / RECEIVING DESTINATION',
    EXPECTED_DATE: 'Expected Date',
    ATTN_RECEIVING: 'Attn: Warehouse Inbound & Receiving Dock',
    ITEM_DESC: 'ITEM DESCRIPTION & SKU',
    UNIT_PRICE: 'UNIT PRICE',
    TAX_RATE: 'TAX RATE',
    ORDER_QTY: 'ORDER QTY',
    LINE_TOTAL: 'LINE TOTAL',
    TERMS_INSTRUCTIONS: 'TERMS & DELIVERY INSTRUCTIONS:',
    SUBTOTAL: 'Subtotal:',
    TAX_TOTAL: 'Taxes / GST Total:',
    TOTAL_AMOUNT: 'TOTAL AMOUNT:',
    AUTH_OFFICER: 'AUTHORIZED PURCHASING OFFICER',
    RECEIVING_ACCEPT: 'RECEIVING & INSPECTION ACCEPTANCE',
    AUTH_SIGN: 'Authorized Signature & Date',
    RECEIVER_SIGN: 'Receiver Signature, Date & Stamp',
    PICK_HEADER: 'WAREHOUSE FULFILLMENT & BATCH PICK LIST',
    BATCH_PICK_LIST: 'BATCH PICK LIST',
    ORDERS_QUEUED: 'Orders Queued',
    PENDING_SHIPMENTS: 'Pending Shipments',
    PICK_INSTRUCTIONS_TITLE: 'DISPATCH PICKING INSTRUCTIONS:',
    CHECK: 'CHECK',
    ITEM_CODE: 'SKU / ITEM CODE',
    PICK_QTY: 'PICK QTY',
    PICKER_SIGN: 'PICKER SIGN',
    PICKER_SIGNOFF: 'WAREHOUSE PICKER SIGN-OFF',
    SUPERVISOR_AUDIT: 'DISPATCH SUPERVISOR AUDIT',
    Healthy: 'Healthy',
    'Low Stock': 'Low Stock',
    'Out of Stock': 'Out of Stock',
    Completed: 'Completed',
    Pending: 'Pending',
    'In Transit': 'In Transit',
    Refunded: 'Refunded',
    Cash: 'Cash',
    Card: 'Card',
    'Bank Transfer': 'Bank Transfer',
    'In-Store POS': 'In-Store POS',
    Adjustment: 'Adjustment',
    'Transfer In': 'Transfer In',
    'Transfer Out': 'Transfer Out',
    Sale: 'Sale',
    'PO Receiving': 'PO Receiving',
  },
  es: {
    'Product Name': 'Nombre del Producto',
    Product: 'Nombre del Producto',
    SKU: 'Código SKU',
    Category: 'Categoría',
    Supplier: 'Proveedor',
    'Cost Price': 'Precio de Costo',
    'Retail Price': 'Precio de Venta',
    Cost: 'Costo',
    Retail: 'Venta',
    'Tax %': '% Impuesto',
    'Tax Rate': 'Tasa Impuesto',
    'Stock On Hand': 'Stock Disponible',
    Stock: 'Existencias',
    'Stock Quantity': 'Cantidad en Stock',
    'Reorder Threshold': 'Punto de Reorden',
    'Reorder Point': 'Punto de Reorden',
    'Total Cost Valuation': 'Valoración Total al Costo',
    'Total Retail Valuation': 'Valoración Total a la Venta',
    'Cost Valuation': 'Valoración al Costo',
    'Retail Valuation': 'Valoración de Venta',
    'Total Valuation': 'Valoración Total',
    'Inventory Status': 'Estado de Inventario',
    Status: 'Estado',
    'Units Sold': 'Unidades Vendidas',
    'Total Revenue': 'Ingresos Totales',
    Revenue: 'Ingresos',
    'Total COGS': 'Costo de Ventas (COGS)',
    COGS: 'Costo de Ventas',
    'Gross Profit': 'Beneficio Bruto',
    Profit: 'Beneficio',
    'Gross Margin %': '% Margen Bruto',
    'Margin %': '% Margen',
    'Transaction Ref': 'Ref. Transacción',
    'Sale #': 'N.º de Venta',
    'PO #': 'N.º O.C.',
    'P.O. #': 'N.º O.C.',
    'Date & Time': 'Fecha y Hora',
    Date: 'Fecha',
    'Issued Date': 'Fecha de Emisión',
    'Expected Date': 'Fecha Prevista',
    'Movement Type': 'Tipo de Movimiento',
    'Outlet / Location': 'Sucursal / Ubicación',
    Location: 'Ubicación',
    Outlet: 'Sucursal',
    'Quantity Delta': 'Variación de Cantidad',
    'Quantity Change': 'Cambio de Cantidad',
    'Previous Stock': 'Stock Anterior',
    'Resulting Stock': 'Stock Resultante',
    'New Stock': 'Nuevo Stock',
    'Audit Notes / Reason': 'Notas de Auditoría / Motivo',
    Notes: 'Notas',
    Customer: 'Nombre del Cliente',
    'Customer Name': 'Nombre del Cliente',
    Channel: 'Canal de Venta',
    'Sales Channel': 'Canal de Venta',
    'Payment Method': 'Método de Pago',
    Payment: 'Método de Pago',
    Method: 'Método',
    'Items Count': 'Cant. Artículos',
    Items: 'Artículos',
    'Order Qty': 'Cant. Pedida',
    Subtotal: 'Subtotal',
    Tax: 'Impuestos / IVA',
    Total: 'Importe Total',
    'Tax Collected': 'Impuestos Recaudados',
    'Taxable Amount': 'Base Imponible',
    'Gross Sales': 'Ventas Brutas',
    'Net Sales': 'Ventas Netas',
    'Net Profit': 'Beneficio Neto',
    'Official Inventory Record': 'Registro Oficial de Inventario',
    Generated: 'Generado el',
    'Total Records': 'Total de Registros',
    'FINANCIAL & ANALYTICS REPORT': 'INFORME FINANCIERO Y ANALÍTICO',
    'Master Stock Levels Valuation Report': 'INFORME GENERAL DE VALORACIÓN DE STOCK',
    'Stock Valuation Report': 'INFORME DE VALORACIÓN DE STOCK',
    'Sales Audit & Transaction Ledger': 'LIBRO DE VENTAS Y AUDITORÍA DE TRANSACCIONES',
    'Inventory Valuation & Stock Status': 'VALORACIÓN DE INVENTARIO Y ESTADO DE STOCK',
    'Purchase Orders & Procurement Ledger': 'LIBRO DE ÓRDENES DE COMPRA Y APROVISIONAMIENTO',
    'Tax Collection & Audit Report': 'INFORME DE RECAUDACIÓN FISCAL E IVA',
    'Product Profitability & Margins Report': 'INFORME DE RENTABILIDAD Y MÁRGENES DE PRODUCTOS',
    'Sales Velocity & Stock Turnover Report': 'INFORME DE ROTACIÓN DE INVENTARIO Y VELOCIDAD DE VENTA',
    PO_HEADER: 'ORDEN DE COMPRA OFICIAL Y SOLICITUD DE PEDIDO',
    PURCHASE_ORDER: 'ORDEN DE COMPRA',
    PO_NUMBER: 'N.º O.C.',
    ISSUED: 'Emitido el',
    VENDOR_DETAILS: 'DATOS DEL PROVEEDOR',
    APPROVED_VENDOR: 'Proveedor Comercial Aprobado',
    PAYMENT_TERMS: 'Condiciones de Pago: 30 Días',
    SHIP_TO: 'DESTINO DE ENTREGA / RECEPCIÓN',
    EXPECTED_DATE: 'Fecha Prevista',
    ATTN_RECEIVING: 'A la atención de: Muelle de Recepción de Almacén',
    ITEM_DESC: 'DESCRIPCIÓN DEL ARTÍCULO Y SKU',
    UNIT_PRICE: 'PRECIO UNITARIO',
    TAX_RATE: 'TASA IMPUESTO',
    ORDER_QTY: 'CANT. PEDIDA',
    LINE_TOTAL: 'TOTAL LÍNEA',
    TERMS_INSTRUCTIONS: 'TÉRMINOS E INSTRUCCIONES DE ENTREGA:',
    SUBTOTAL: 'Subtotal:',
    TAX_TOTAL: 'Impuestos / IVA Total:',
    TOTAL_AMOUNT: 'IMPORTE TOTAL:',
    AUTH_OFFICER: 'RESPONSABLE DE COMPRAS AUTORIZADO',
    RECEIVING_ACCEPT: 'RECEPCIÓN E INSPECCIÓN CONFORME',
    AUTH_SIGN: 'Firma Autorizada y Fecha',
    RECEIVER_SIGN: 'Firma Receptor, Fecha y Sello',
    PICK_HEADER: 'LISTA DE PREPARACIÓN DE PEDIDOS (PICK LIST)',
    BATCH_PICK_LIST: 'LISTA DE PICKING',
    ORDERS_QUEUED: 'Pedidos en Cola',
    PENDING_SHIPMENTS: 'Envíos Pendientes',
    PICK_INSTRUCTIONS_TITLE: 'INSTRUCCIONES DE PREPARACIÓN DE DESPACHO:',
    CHECK: 'VERIF.',
    ITEM_CODE: 'SKU / CÓDIGO',
    PICK_QTY: 'CANT. PICK',
    PICKER_SIGN: 'FIRMA PICKER',
    PICKER_SIGNOFF: 'FIRMA DEL PREPARADOR DE PEDIDOS',
    SUPERVISOR_AUDIT: 'AUDITORÍA DEL SUPERVISOR DE DESPACHO',
    Healthy: 'Saludable',
    'Low Stock': 'Stock Bajo',
    'Out of Stock': 'Agotado',
    Completed: 'Completado',
    Pending: 'Pendiente',
    'In Transit': 'En Tránsito',
    Refunded: 'Reembolsado',
    Cash: 'Efectivo',
    Card: 'Tarjeta',
    'Bank Transfer': 'Transferencia Bancaria',
    'In-Store POS': 'TPV en Tienda',
    Adjustment: 'Ajuste de Stock',
    'Transfer In': 'Transferencia Entrada',
    'Transfer Out': 'Transferencia Salida',
    Sale: 'Venta',
    'PO Receiving': 'Recepción de Compra',
  },
  fr: {
    'Product Name': 'Nom du Produit',
    Product: 'Nom du Produit',
    SKU: 'Référence SKU',
    Category: 'Catégorie',
    Supplier: 'Fournisseur',
    'Cost Price': "Prix d'Achat",
    'Retail Price': 'Prix de Vente',
    Cost: 'Coût',
    Retail: 'Vente',
    'Tax %': 'Taux TVA %',
    'Tax Rate': 'Taux TVA',
    'Stock On Hand': 'Stock en Réserve',
    Stock: 'Stock',
    'Stock Quantity': 'Quantité en Stock',
    'Reorder Threshold': 'Seuil de Réapprovisionnement',
    'Reorder Point': 'Seuil de Réapprovisionnement',
    'Total Cost Valuation': "Valorisation Totale d'Achat",
    'Total Retail Valuation': 'Valorisation Totale de Vente',
    'Cost Valuation': 'Valorisation au Coût',
    'Retail Valuation': 'Valorisation à la Vente',
    'Total Valuation': 'Valorisation Totale',
    'Inventory Status': 'État du Stock',
    Status: 'Statut',
    'Units Sold': 'Unités Vendues',
    'Total Revenue': 'Chiffre d’Affaires Total',
    Revenue: 'Chiffre d’Affaires',
    'Total COGS': 'Coût des Marchandises Vendues',
    COGS: 'Coût des Marchandises',
    'Gross Profit': 'Marge Brute',
    Profit: 'Bénéfice',
    'Gross Margin %': '% Marge Brute',
    'Margin %': '% Marge',
    'Transaction Ref': 'Réf. Transaction',
    'Sale #': 'N° Vente',
    'PO #': 'N° BDC',
    'P.O. #': 'N° BDC',
    'Date & Time': 'Date et Heure',
    Date: 'Date',
    'Issued Date': 'Date d’Émission',
    'Expected Date': 'Date Prévue',
    'Movement Type': 'Type de Mouvement',
    'Outlet / Location': 'Point de Vente / Dépôt',
    Location: 'Emplacement',
    Outlet: 'Point de Vente',
    'Quantity Delta': 'Variation de Quantité',
    'Quantity Change': 'Changement de Quantité',
    'Previous Stock': 'Stock Précédent',
    'Resulting Stock': 'Stock Résultant',
    'New Stock': 'Nouveau Stock',
    'Audit Notes / Reason': 'Notes d’Audit / Motif',
    Notes: 'Remarques',
    Customer: 'Nom du Client',
    'Customer Name': 'Nom du Client',
    Channel: 'Canal de Vente',
    'Sales Channel': 'Canal de Vente',
    'Payment Method': 'Mode de Paiement',
    Payment: 'Paiement',
    Method: 'Méthode',
    'Items Count': 'Nombre d’Articles',
    Items: 'Articles',
    'Order Qty': 'Qté Commandée',
    Subtotal: 'Sous-total',
    Tax: 'TVA / Taxes',
    Total: 'Montant Total',
    'Tax Collected': 'TVA Collectée',
    'Taxable Amount': 'Montant Hors Taxe',
    'Gross Sales': 'Ventes Brutes',
    'Net Sales': 'Ventes Nettes',
    'Net Profit': 'Bénéfice Net',
    'Official Inventory Record': 'Rapport Officiel des Stocks',
    Generated: 'Généré le',
    'Total Records': 'Total des Lignes',
    'FINANCIAL & ANALYTICS REPORT': 'RAPPORT FINANCIER & ANALYTIQUE',
    'Master Stock Levels Valuation Report': 'RAPPORT GÉNÉRAL DE VALORISATION DES STOCKS',
    'Stock Valuation Report': 'RAPPORT DE VALORISATION DES STOCKS',
    'Sales Audit & Transaction Ledger': 'REGISTRE DES VENTES & AUDIT DES TRANSACTIONS',
    'Inventory Valuation & Stock Status': 'VALORISATION DES STOCKS & DISPONIBILITÉ',
    'Purchase Orders & Procurement Ledger': 'JOURNAL DES ACHATS & APPROVISIONNEMENTS',
    'Tax Collection & Audit Report': 'RAPPORT DE COLLECTE DE TVA ET TAXES',
    'Product Profitability & Margins Report': 'RAPPORT DE RENTABILITÉ & MARGES PRODUITS',
    'Sales Velocity & Stock Turnover Report': 'RAPPORT DE ROTATION DES STOCKS & VÉLOCITÉ DES VENTES',
    PO_HEADER: 'BON DE COMMANDE OFFICIEL ET BORDEREAU D’APPROVISIONNEMENT',
    PURCHASE_ORDER: 'BON DE COMMANDE',
    PO_NUMBER: 'N° BDC',
    ISSUED: 'Émis le',
    VENDOR_DETAILS: 'COORDONNÉES DU FOURNISSEUR',
    APPROVED_VENDOR: 'Partenaire Fournisseur Agréé',
    PAYMENT_TERMS: 'Modalités de Règlement : 30 Jours Net',
    SHIP_TO: 'DESTINATION DE LIVRAISON / RÉCEPTION',
    EXPECTED_DATE: 'Date Prévue',
    ATTN_RECEIVING: 'À l’attention de : Quai de Réception Entrepôt',
    ITEM_DESC: 'DÉSIGNATION DE L’ARTICLE ET SKU',
    UNIT_PRICE: 'PRIX UNITAIRE',
    TAX_RATE: 'TAUX TVA',
    ORDER_QTY: 'QTÉ COMMANDÉE',
    LINE_TOTAL: 'TOTAL LIGNE',
    TERMS_INSTRUCTIONS: 'CONDITIONS ET INSTRUCTIONS DE LIVRAISON :',
    SUBTOTAL: 'Sous-total :',
    TAX_TOTAL: 'TVA / Taxes Totales :',
    TOTAL_AMOUNT: 'MONTANT TOTAL :',
    AUTH_OFFICER: 'RESPONSABLE DES ACHATS HABILITÉ',
    RECEIVING_ACCEPT: 'RÉCEPTION ET CONTRÔLE CONFORME',
    AUTH_SIGN: 'Signature Autorisée et Date',
    RECEIVER_SIGN: 'Signature Réceptionnaire, Date et Cachet',
    PICK_HEADER: 'BORDEREAU DE PRÉPARATION DE COMMANDE (PICK LIST)',
    BATCH_PICK_LIST: 'LISTE DE PRÉPARATION',
    ORDERS_QUEUED: 'Commandes en File',
    PENDING_SHIPMENTS: 'Expéditions en Attente',
    PICK_INSTRUCTIONS_TITLE: 'INSTRUCTIONS DE PRÉLÈVEMENT EXPÉDITION :',
    CHECK: 'POINT.',
    ITEM_CODE: 'SKU / CODE ARTICLE',
    PICK_QTY: 'QTÉ À PRÉLEVER',
    PICKER_SIGN: 'VISA PRÉPARATEUR',
    PICKER_SIGNOFF: 'VISA DU PRÉPARATEUR DE COMMANDE',
    SUPERVISOR_AUDIT: 'CONTRÔLE DU SUPERVISEUR D’EXPÉDITION',
    Healthy: 'Optimal',
    'Low Stock': 'Stock Faible',
    'Out of Stock': 'Rupture',
    Completed: 'Terminé',
    Pending: 'En attente',
    'In Transit': 'En transit',
    Refunded: 'Remboursé',
    Cash: 'Espèces',
    Card: 'Carte Bancaire',
    'Bank Transfer': 'Virement Bancaire',
    'In-Store POS': 'Caisse Magasin',
    Adjustment: 'Ajustement de Stock',
    'Transfer In': 'Transfert Entrant',
    'Transfer Out': 'Transfert Sortant',
    Sale: 'Vente POS',
    'PO Receiving': 'Réception Fournisseur',
  },
  de: {
    'Product Name': 'Produktname',
    Product: 'Produktname',
    SKU: 'Artikelnummer (SKU)',
    Category: 'Kategorie',
    Supplier: 'Lieferant',
    'Cost Price': 'Einkaufspreis',
    'Retail Price': 'Verkaufspreis',
    Cost: 'EK-Preis',
    Retail: 'VK-Preis',
    'Tax %': 'MwSt. %',
    'Tax Rate': 'Steuersatz',
    'Stock On Hand': 'Lagerbestand',
    Stock: 'Bestand',
    'Stock Quantity': 'Lagerbestand',
    'Reorder Threshold': 'Mindestbestand',
    'Reorder Point': 'Bestellpunkt',
    'Total Cost Valuation': 'Gesamtbewertung zu EK',
    'Total Retail Valuation': 'Gesamtbewertung zu VK',
    'Cost Valuation': 'Bewertung zu EK',
    'Retail Valuation': 'Bewertung zu VK',
    'Total Valuation': 'Gesamtbewertung',
    'Inventory Status': 'Bestandsstatus',
    Status: 'Status',
    'Units Sold': 'Verkaufte Einheiten',
    'Total Revenue': 'Gesamtumsatz',
    Revenue: 'Umsatz',
    'Total COGS': 'Wareneinsatz (COGS)',
    COGS: 'Wareneinsatz',
    'Gross Profit': 'Rohertrag',
    Profit: 'Gewinn',
    'Gross Margin %': 'Rohertragsmarge %',
    'Margin %': 'Marge %',
    'Transaction Ref': 'Transaktions-Ref.',
    'Sale #': 'Verkaufs-Nr.',
    'PO #': 'Bestell-Nr.',
    'P.O. #': 'Bestell-Nr.',
    'Date & Time': 'Datum & Uhrzeit',
    Date: 'Datum',
    'Issued Date': 'Ausstellungsdatum',
    'Expected Date': 'Liefertermin',
    'Movement Type': 'Bewegungsart',
    'Outlet / Location': 'Filiale / Lagerort',
    Location: 'Standort',
    Outlet: 'Filiale',
    'Quantity Delta': 'Mengenänderung',
    'Quantity Change': 'Mengenänderung',
    'Previous Stock': 'Vorheriger Bestand',
    'Resulting Stock': 'Neuer Bestand',
    'New Stock': 'Neuer Bestand',
    'Audit Notes / Reason': 'Prüfvermerk / Grund',
    Notes: 'Notizen',
    Customer: 'Kundenname',
    'Customer Name': 'Kundenname',
    Channel: 'Vertriebskanal',
    'Sales Channel': 'Vertriebskanal',
    'Payment Method': 'Zahlungsart',
    Payment: 'Zahlung',
    Method: 'Methode',
    'Items Count': 'Artikelanzahl',
    Items: 'Artikel',
    'Order Qty': 'Bestellmenge',
    Subtotal: 'Zwischensumme',
    Tax: 'MwSt. / Steuern',
    Total: 'Gesamtbetrag',
    'Tax Collected': 'Eingenommene MwSt.',
    'Taxable Amount': 'Steuerpflichtiger Betrag',
    'Gross Sales': 'Bruttoumsatz',
    'Net Sales': 'Nettoumsatz',
    'Net Profit': 'Nettogewinn',
    'Official Inventory Record': 'Amtliches Bestandsregister',
    Generated: 'Erstellt am',
    'Total Records': 'Datensätze gesamt',
    'FINANCIAL & ANALYTICS REPORT': 'FINANZ- & ANALYSEBERICHT',
    'Master Stock Levels Valuation Report': 'BESTANDSBEWERTUNGSBERICHT (GESAMT)',
    'Stock Valuation Report': 'LAGERWERTBERICHT',
    'Sales Audit & Transaction Ledger': 'VERKAUFSBUCH & TRANSAKTIONSPRÜFUNG',
    'Inventory Valuation & Stock Status': 'LAGERBEWERTUNG & BESTANDSSTATUS',
    'Purchase Orders & Procurement Ledger': 'BESTELLBUCH & BESCHAFFUNGSPROTOKOLLE',
    'Tax Collection & Audit Report': 'STEUERBERICHT & MWST-PRÜFUNG',
    'Product Profitability & Margins Report': 'PRODUKTRENTABILITÄT & MARGENBERICHT',
    'Sales Velocity & Stock Turnover Report': 'LAGERUMSCHLAG & VERKAUFSGESCHWINDIGKEIT',
    PO_HEADER: 'OFFIZIELLE BESTELLUNG & LIEFERANFORDERUNG',
    PURCHASE_ORDER: 'BESTELLSCHEIN',
    PO_NUMBER: 'Bestell-Nr.',
    ISSUED: 'Ausgestellt am',
    VENDOR_DETAILS: 'LIEFERANTENANGABEN',
    APPROVED_VENDOR: 'Zugelassener Handelspartner',
    PAYMENT_TERMS: 'Zahlungsbedingungen: 30 Tage netto',
    SHIP_TO: 'LIEFERADRESSE / WARENEINGANG',
    EXPECTED_DATE: 'Liefertermin',
    ATTN_RECEIVING: 'Z. H.: Wareneingang & Laderampe',
    ITEM_DESC: 'ARTIKELBEZEICHNUNG & SKU',
    UNIT_PRICE: 'EINZELPREIS',
    TAX_RATE: 'MWST-SATZ',
    ORDER_QTY: 'BESTELLMENGE',
    LINE_TOTAL: 'POSITIONSGESAMT',
    TERMS_INSTRUCTIONS: 'LIEFER- UND ZAHLUNGSBEDINGUNGEN:',
    SUBTOTAL: 'Zwischensumme:',
    TAX_TOTAL: 'MwSt. Gesamt:',
    TOTAL_AMOUNT: 'GESAMTBETRAG:',
    AUTH_OFFICER: 'AUTORISIERTER EINKAUFSLEITER',
    RECEIVING_ACCEPT: 'WARENEINGANGS- UND PRÜFBESTÄTIGUNG',
    AUTH_SIGN: 'Unterschrift & Datum',
    RECEIVER_SIGN: 'Empfängerunterschrift, Datum & Stempel',
    PICK_HEADER: 'LAGER-KOMMISSIONIERLISTE (PICKLISTE)',
    BATCH_PICK_LIST: 'SAMMEL-PICKLISTE',
    ORDERS_QUEUED: 'Aufträge in Warteschlange',
    PENDING_SHIPMENTS: 'Ausstehende Sendungen',
    PICK_INSTRUCTIONS_TITLE: 'KOMMISSIONIERANWEISUNGEN:',
    CHECK: 'GEPRÜFT',
    ITEM_CODE: 'SKU / ARTIKELNUMMER',
    PICK_QTY: 'PICK-MENGE',
    PICKER_SIGN: 'KOMMISSIONIERER',
    PICKER_SIGNOFF: 'UNTERSCHRIFT KOMMISSIONIERER',
    SUPERVISOR_AUDIT: 'VERSANDKONTROLLE SUPERVISOR',
    Healthy: 'Optimal',
    'Low Stock': 'Niedriger Bestand',
    'Out of Stock': 'Ausverkauft',
    Completed: 'Abgeschlossen',
    Pending: 'Ausstehend',
    'In Transit': 'Im Transit',
    Refunded: 'Erstattet',
    Cash: 'Barzahlung',
    Card: 'Kartenzahlung',
    'Bank Transfer': 'Banküberweisung',
    'In-Store POS': 'Kasse Ladenlokal',
    Adjustment: 'Bestandskorrektur',
    'Transfer In': 'Lagerzugang',
    'Transfer Out': 'Lagerabgang',
    Sale: 'Verkauf',
    'PO Receiving': 'Wareneingang',
  },
  hi: {
    'Product Name': 'उत्पाद का नाम',
    Product: 'उत्पाद का नाम',
    SKU: 'एसकेयू कोड (SKU)',
    Category: 'श्रेणी (Category)',
    Supplier: 'आपूर्तिकर्ता (Supplier)',
    'Cost Price': 'लागत मूल्य',
    'Retail Price': 'बिक्री मूल्य',
    Cost: 'लागत',
    Retail: 'खुदरा मूल्य',
    'Tax %': 'कर दर %',
    'Tax Rate': 'कर दर',
    'Stock On Hand': 'उपलब्ध स्टॉक',
    Stock: 'स्टॉक',
    'Stock Quantity': 'स्टॉक मात्रा',
    'Reorder Threshold': 'पुनः ऑर्डर सीमा',
    'Reorder Point': 'पुनः ऑर्डर बिंदु',
    'Total Cost Valuation': 'कुल लागत मूल्यांकन',
    'Total Retail Valuation': 'कुल खुदरा मूल्यांकन',
    'Cost Valuation': 'लागत मूल्यांकन',
    'Retail Valuation': 'खुदरा मूल्यांकन',
    'Total Valuation': 'कुल मूल्यांकन',
    'Inventory Status': 'इन्वेंट्री स्थिति',
    Status: 'स्थिति',
    'Units Sold': 'बेची गई इकाइयाँ',
    'Total Revenue': 'कुल राजस्व',
    Revenue: 'राजस्व',
    'Total COGS': 'माल की कुल लागत (COGS)',
    COGS: 'माल की लागत',
    'Gross Profit': 'सकल लाभ (Gross Profit)',
    Profit: 'लाभ',
    'Gross Margin %': 'सकल मार्जिन %',
    'Margin %': 'मार्जिन %',
    'Transaction Ref': 'लेन-देन संदर्भ',
    'Sale #': 'बिक्री संख्या',
    'PO #': 'पी.ओ. संख्या',
    'P.O. #': 'पी.ओ. संख्या',
    'Date & Time': 'दिनांक और समय',
    Date: 'दिनांक',
    'Issued Date': 'जारी करने की तिथि',
    'Expected Date': 'अपेक्षित तिथि',
    'Movement Type': 'आवाजाही का प्रकार',
    'Outlet / Location': 'शाखा / गोदाम',
    Location: 'स्थान',
    Outlet: 'शाखा',
    'Quantity Delta': 'मात्रा अंतर',
    'Quantity Change': 'मात्रा परिवर्तन',
    'Previous Stock': 'पिछला स्टॉक',
    'Resulting Stock': 'नया स्टॉक',
    'New Stock': 'नया स्टॉक',
    'Audit Notes / Reason': 'ऑडिट विवरण / कारण',
    Notes: 'विवरण',
    Customer: 'ग्राहक का नाम',
    'Customer Name': 'ग्राहक का नाम',
    Channel: 'बिक्री चैनल',
    'Sales Channel': 'बिक्री चैनल',
    'Payment Method': 'भुगतान विधि',
    Payment: 'भुगतान',
    Method: 'विधि',
    'Items Count': 'आइटम संख्या',
    Items: 'आइटम',
    'Order Qty': 'ऑर्डर मात्रा',
    Subtotal: 'उप-योग',
    Tax: 'कर / जीएसटी',
    Total: 'कुल देय राशि',
    'Tax Collected': 'एकत्रित कर',
    'Taxable Amount': 'कर योग्य राशि',
    'Gross Sales': 'सकल बिक्री',
    'Net Sales': 'शुद्ध बिक्री',
    'Net Profit': 'शुद्ध लाभ',
    'Official Inventory Record': 'आधिकारिक इन्वेंट्री रिकॉर्ड',
    Generated: 'उत्पन्न',
    'Total Records': 'कुल रिकॉर्ड',
    'FINANCIAL & ANALYTICS REPORT': 'वित्तीय और विश्लेषण रिपोर्ट',
    'Master Stock Levels Valuation Report': 'मास्टर स्टॉक स्तर मूल्यांकन रिपोर्ट',
    'Stock Valuation Report': 'स्टॉक मूल्यांकन रिपोर्ट',
    'Sales Audit & Transaction Ledger': 'बिक्री ऑडिट और लेनदेन बहीखाता',
    'Inventory Valuation & Stock Status': 'इन्वेंट्री मूल्यांकन और स्टॉक स्थिति',
    'Purchase Orders & Procurement Ledger': 'खरीद आदेश और खरीद बहीखाता',
    'Tax Collection & Audit Report': 'कर संग्रह और ऑडिट रिपोर्ट',
    'Product Profitability & Margins Report': 'उत्पाद लाभप्रदता और मार्जिन रिपोर्ट',
    'Sales Velocity & Stock Turnover Report': 'बिक्री गति और स्टॉक टर्नओवर रिपोर्ट',
    PO_HEADER: 'आधिकारिक खरीद आदेश (PURCHASE ORDER SLIP)',
    PURCHASE_ORDER: 'खरीद आदेश (PO)',
    PO_NUMBER: 'पी.ओ. संख्या',
    ISSUED: 'जारी किया गया',
    VENDOR_DETAILS: 'विक्रेता / आपूर्तिकर्ता विवरण',
    APPROVED_VENDOR: 'स्वीकृत वाणिज्यिक विक्रेता',
    PAYMENT_TERMS: 'भुगतान की शर्तें: 30 दिन',
    SHIP_TO: 'डिलीवरी गंतव्य / स्टोर शाखा',
    EXPECTED_DATE: 'अपेक्षित तिथि',
    ATTN_RECEIVING: 'प्राप्तकर्ता: गोदाम इनबाउंड डॉक',
    ITEM_DESC: 'वस्तु विवरण और एसकेयू',
    UNIT_PRICE: 'इकाई मूल्य',
    TAX_RATE: 'जीएसटी/कर दर',
    ORDER_QTY: 'ऑर्डर मात्रा',
    LINE_TOTAL: 'कुल राशि',
    TERMS_INSTRUCTIONS: 'नियम और डिलीवरी निर्देश:',
    SUBTOTAL: 'उप-योग:',
    TAX_TOTAL: 'कुल जीएसटी / टैक्स:',
    TOTAL_AMOUNT: 'कुल देय राशि:',
    AUTH_OFFICER: 'अधिकृत खरीद अधिकारी',
    RECEIVING_ACCEPT: 'सामग्री प्राप्ति एवं निरीक्षण स्वीकृति',
    AUTH_SIGN: 'अधिकृत हस्ताक्षर और दिनांक',
    RECEIVER_SIGN: 'प्राप्तकर्ता के हस्ताक्षर, दिनांक और मोहर',
    PICK_HEADER: 'वेयरहाउस ऑर्डर पिक लिस्ट (PICK LIST)',
    BATCH_PICK_LIST: 'बैच पिक लिस्ट',
    ORDERS_QUEUED: 'कतारबद्ध ऑर्डर',
    PENDING_SHIPMENTS: 'लंबित शिपमेंट',
    PICK_INSTRUCTIONS_TITLE: 'डिस्पैच पिकिंग निर्देश:',
    CHECK: 'जाँच',
    ITEM_CODE: 'एसकेयू / आइटम कोड',
    PICK_QTY: 'पिक मात्रा',
    PICKER_SIGN: 'पिकर हस्ताक्षर',
    PICKER_SIGNOFF: 'वेयरहाउस पिकर सत्यापन',
    SUPERVISOR_AUDIT: 'डिस्पैच सुपरवाइजर ऑडिट',
    Healthy: 'पर्याप्त',
    'Low Stock': 'कम स्टॉक',
    'Out of Stock': 'स्टॉक समाप्त',
    Completed: 'पूर्ण',
    Pending: 'लंबित',
    'In Transit': 'पारगमन में',
    Refunded: 'वापस किया गया',
    Cash: 'नकद',
    Card: 'कार्ड',
    'Bank Transfer': 'बैंक ट्रांसफर',
    'In-Store POS': 'स्टोर पीओएस',
    Adjustment: 'स्टॉक समायोजन',
    'Transfer In': 'आवक स्थानांतरण',
    'Transfer Out': 'जावक स्थानांतरण',
    Sale: 'बिक्री',
    'PO Receiving': 'पीओ प्राप्ति',
  },
  ja: {
    'Product Name': '商品名',
    Product: '商品名',
    SKU: '商品コード (SKU)',
    Category: 'カテゴリー',
    Supplier: '仕入先',
    'Cost Price': '仕入原価',
    'Retail Price': '販売価格',
    Cost: '原価',
    Retail: '売価',
    'Tax %': '消費税率 %',
    'Tax Rate': '税率',
    'Stock On Hand': '現在庫数',
    Stock: '在庫',
    'Stock Quantity': '在庫数量',
    'Reorder Threshold': '発注点',
    'Reorder Point': '発注点',
    'Total Cost Valuation': '原価ベース総在庫評価額',
    'Total Retail Valuation': '売価ベース総在庫評価額',
    'Cost Valuation': '原価評価額',
    'Retail Valuation': '売価評価額',
    'Total Valuation': '総評価額',
    'Inventory Status': '在庫ステータス',
    Status: 'ステータス',
    'Units Sold': '販売数量',
    'Total Revenue': '総売上高',
    Revenue: '売上',
    'Total COGS': '売上原価 (COGS)',
    COGS: '売上原価',
    'Gross Profit': '粗利益',
    Profit: '利益',
    'Gross Margin %': '粗利益率 %',
    'Margin %': '利益率 %',
    'Transaction Ref': '取引番号',
    'Sale #': '売上伝票番号',
    'PO #': '発注番号',
    'P.O. #': '発注番号',
    'Date & Time': '日時',
    Date: '日付',
    'Issued Date': '発行日',
    'Expected Date': '納品予定日',
    'Movement Type': '移動種別',
    'Outlet / Location': '店舗 / 倉庫',
    Location: '拠点',
    Outlet: '店舗',
    'Quantity Delta': '数量増減',
    'Quantity Change': '数量増減',
    'Previous Stock': '変更前在庫',
    'Resulting Stock': '変更後在庫',
    'New Stock': '新在庫',
    'Audit Notes / Reason': '棚卸事由・備考',
    Notes: '備考',
    Customer: '顧客名',
    'Customer Name': '顧客名',
    Channel: '販売チャネル',
    'Sales Channel': '販売チャネル',
    'Payment Method': '決済方法',
    Payment: '決済方法',
    Method: '決済方法',
    'Items Count': '商品点数',
    Items: '商品点数',
    'Order Qty': '発注数量',
    Subtotal: '税抜小計',
    Tax: '消費税',
    Total: '税込合計金額',
    'Tax Collected': '預り消費税',
    'Taxable Amount': '課税対象額',
    'Gross Sales': '総売上',
    'Net Sales': '純売上',
    'Net Profit': '純利益',
    'Official Inventory Record': '公式在庫台帳記録',
    Generated: '出力日時',
    'Total Records': '総レコード件数',
    'FINANCIAL & ANALYTICS REPORT': '財務およびアナリティクスレポート',
    'Master Stock Levels Valuation Report': '在庫水準および評価額台帳レポート',
    'Stock Valuation Report': '在庫評価額レポート',
    'Sales Audit & Transaction Ledger': '売上監査および取引台帳',
    'Inventory Valuation & Stock Status': '在庫評価および在庫状況',
    'Purchase Orders & Procurement Ledger': '発注および調達台帳',
    'Tax Collection & Audit Report': '消費税集計および税務監査レポート',
    'Product Profitability & Margins Report': '商品別採算性および粗利分析レポート',
    'Sales Velocity & Stock Turnover Report': '在庫回転率および販売速度レポート',
    PO_HEADER: '公式発注伝票および仕入要求書',
    PURCHASE_ORDER: '発注書 (PURCHASE ORDER)',
    PO_NUMBER: '発注番号',
    ISSUED: '発行日',
    VENDOR_DETAILS: '仕入先企業情報',
    APPROVED_VENDOR: '承認済み提携仕入先',
    PAYMENT_TERMS: '支払条件: 翌月末払い (30日)',
    SHIP_TO: '納入先店舗 / 倉庫',
    EXPECTED_DATE: '納品予定日',
    ATTN_RECEIVING: '受取担当: 入荷検品バース',
    ITEM_DESC: '品名・仕様およびSKUコード',
    UNIT_PRICE: '仕入単価',
    TAX_RATE: '税率',
    ORDER_QTY: '発注数量',
    LINE_TOTAL: '金額 (小計)',
    TERMS_INSTRUCTIONS: '取引条件および納品注意事項:',
    SUBTOTAL: '税抜合計:',
    TAX_TOTAL: '消費税合計:',
    TOTAL_AMOUNT: '税込総発注額:',
    AUTH_OFFICER: '発注承認責任者',
    RECEIVING_ACCEPT: '入荷検収受領印',
    AUTH_SIGN: '承認者署名・日付',
    RECEIVER_SIGN: '受領者署名・日付・受領印',
    PICK_HEADER: '出庫指示書およびピッキングリスト',
    BATCH_PICK_LIST: '一括ピッキングリスト',
    ORDERS_QUEUED: '出荷対象注文数',
    PENDING_SHIPMENTS: '出荷待ち件数',
    PICK_INSTRUCTIONS_TITLE: '出荷ピッキング作業指示:',
    CHECK: '確認',
    ITEM_CODE: 'SKU / 品目コード',
    PICK_QTY: 'ピック数',
    PICKER_SIGN: '作業者印',
    PICKER_SIGNOFF: 'ピッキング作業者署名',
    SUPERVISOR_AUDIT: '出荷検品管理者確認印',
    Healthy: '適正',
    'Low Stock': '残少',
    'Out of Stock': '在庫切れ',
    Completed: '完了',
    Pending: '保留中',
    'In Transit': '輸送中',
    Refunded: '返金済み',
    Cash: '現金',
    Card: 'クレジットカード',
    'Bank Transfer': '銀行振込',
    'In-Store POS': '店頭POS',
    Adjustment: '在庫調整',
    'Transfer In': '入庫移動',
    'Transfer Out': '出庫移動',
    Sale: '売上',
    'PO Receiving': '仕入れ入荷',
  },
  zh: {
    'Product Name': '商品名称',
    Product: '商品名称',
    SKU: '商品编码 (SKU)',
    Category: '商品分类',
    Supplier: '供货商',
    'Cost Price': '进货成本价',
    'Retail Price': '零售销售价',
    Cost: '成本',
    Retail: '零售价',
    'Tax %': '税率 %',
    'Tax Rate': '税率',
    'Stock On Hand': '现有库存量',
    Stock: '库存',
    'Stock Quantity': '库存数量',
    'Reorder Threshold': '补货预警点',
    'Reorder Point': '补货点',
    'Total Cost Valuation': '成本总估值',
    'Total Retail Valuation': '零售总估值',
    'Cost Valuation': '成本估值',
    'Retail Valuation': '零售估值',
    'Total Valuation': '总估值',
    'Inventory Status': '库存状态',
    Status: '状态',
    'Units Sold': '销售件数',
    'Total Revenue': '总营业额',
    Revenue: '营业额',
    'Total COGS': '销售成本 (COGS)',
    COGS: '销售成本',
    'Gross Profit': '毛利润',
    Profit: '利润',
    'Gross Margin %': '毛利率 %',
    'Margin %': '利润率 %',
    'Transaction Ref': '交易流水号',
    'Sale #': '销售单号',
    'PO #': '采购单号',
    'P.O. #': '采购单号',
    'Date & Time': '日期与时间',
    Date: '日期',
    'Issued Date': '开单日期',
    'Expected Date': '预计到货日',
    'Movement Type': '出入库类型',
    'Outlet / Location': '所属门店 / 仓库',
    Location: '库位地点',
    Outlet: '门店',
    'Quantity Delta': '变动数量',
    'Quantity Change': '变动数量',
    'Previous Stock': '变动前库存',
    'Resulting Stock': '变动后库存',
    'New Stock': '变动后库存',
    'Audit Notes / Reason': '盘点备注 / 原因',
    Notes: '备注',
    Customer: '客户姓名',
    'Customer Name': '客户姓名',
    Channel: '销售渠道',
    'Sales Channel': '销售渠道',
    'Payment Method': '支付方式',
    Payment: '支付方式',
    Method: '方式',
    'Items Count': '商品种类数',
    Items: '商品数',
    'Order Qty': '订购数量',
    Subtotal: '不含税小计',
    Tax: '税金 / 增值税',
    Total: '订单应付总额',
    'Tax Collected': '实收税额',
    'Taxable Amount': '应税金额',
    'Gross Sales': '销售总额',
    'Net Sales': '净销售额',
    'Net Profit': '净利润',
    'Official Inventory Record': '官方库存盘点总账',
    Generated: '导出时间',
    'Total Records': '总记录数',
    'FINANCIAL & ANALYTICS REPORT': '财务与数据分析总账报告',
    'Master Stock Levels Valuation Report': '主库存水平与资产估值报告',
    'Stock Valuation Report': '库存估值报告',
    'Sales Audit & Transaction Ledger': '销售审计与交易流水明细账',
    'Inventory Valuation & Stock Status': '库存估值与状态报表',
    'Purchase Orders & Procurement Ledger': '采购订单与供应链采购总账',
    'Tax Collection & Audit Report': '税务汇总与审计核算报表',
    'Product Profitability & Margins Report': '商品盈利能力与毛利分析报表',
    'Sales Velocity & Stock Turnover Report': '周转率与销售动销率分析报表',
    PO_HEADER: '官方采购订单与供货清单',
    PURCHASE_ORDER: '采购订单 (PO)',
    PO_NUMBER: '采购单号',
    ISSUED: '开单日期',
    VENDOR_DETAILS: '供货商企业资料',
    APPROVED_VENDOR: '认证合作供应商',
    PAYMENT_TERMS: '结算账期: 30天账期',
    SHIP_TO: '收货仓库 / 门店目的地',
    EXPECTED_DATE: '预计到货日',
    ATTN_RECEIVING: '收货部门: 仓库入库质检处',
    ITEM_DESC: '商品名称规格与SKU',
    UNIT_PRICE: '进货单价',
    TAX_RATE: '税率',
    ORDER_QTY: '订购数量',
    LINE_TOTAL: '分项总计',
    TERMS_INSTRUCTIONS: '交付条款与验货须知:',
    SUBTOTAL: '不含税小计:',
    TAX_TOTAL: '税额总计:',
    TOTAL_AMOUNT: '订单应付总额:',
    AUTH_OFFICER: '采购审批负责人',
    RECEIVING_ACCEPT: '仓库验货签收确认',
    AUTH_SIGN: '审批人签名与日期',
    RECEIVER_SIGN: '验货人签名、日期与盖章',
    PICK_HEADER: '仓库出库拣货单 (PICK LIST)',
    BATCH_PICK_LIST: '批量拣货清单',
    ORDERS_QUEUED: '排队订单数',
    PENDING_SHIPMENTS: '待发货包裹',
    PICK_INSTRUCTIONS_TITLE: '出库拣货指引说明:',
    CHECK: '核对',
    ITEM_CODE: 'SKU / 商品码',
    PICK_QTY: '拣货数量',
    PICKER_SIGN: '拣货签名',
    PICKER_SIGNOFF: '拣货员签名确认',
    SUPERVISOR_AUDIT: '发货主管复核确认',
    Healthy: '正常',
    'Low Stock': '库存不足',
    'Out of Stock': '缺货',
    Completed: '已完成',
    Pending: '待处理',
    'In Transit': '运输中',
    Refunded: '已退款',
    Cash: '现金',
    Card: '银行卡',
    'Bank Transfer': '银行对公转账',
    'In-Store POS': '店内收银台',
    Adjustment: '库存调整',
    'Transfer In': '调拨入库',
    'Transfer Out': '调拨出库',
    Sale: '零售出库',
    'PO Receiving': '采购入库',
  },
  ar: {
    'Product Name': 'اسم المنتج',
    Product: 'اسم المنتج',
    SKU: 'رمز المنتج (SKU)',
    Category: 'التصنيف',
    Supplier: 'المورد',
    'Cost Price': 'سعر التكلفة',
    'Retail Price': 'سعر البيع',
    Cost: 'التكلفة',
    Retail: 'سعر التجزئة',
    'Tax %': 'نسبة الضريبة %',
    'Tax Rate': 'نسبة الضريبة',
    'Stock On Hand': 'المخزون المتوفر',
    Stock: 'المخزون',
    'Stock Quantity': 'كمية المخزون',
    'Reorder Threshold': 'نقطة إعادة الطلب',
    'Reorder Point': 'نقطة إعادة الطلب',
    'Total Cost Valuation': 'إجمالي التقييم بسعر التكلفة',
    'Total Retail Valuation': 'إجمالي التقييم بسعر البيع',
    'Cost Valuation': 'تقييم التكلفة',
    'Retail Valuation': 'تقييم البيع',
    'Total Valuation': 'التقييم الإجمالي',
    'Inventory Status': 'حالة المخزون',
    Status: 'الحالة',
    'Units Sold': 'الوحدات المباعة',
    'Total Revenue': 'إجمالي الإيرادات',
    Revenue: 'الإيرادات',
    'Total COGS': 'تكلفة البضاعة المباعة',
    COGS: 'تكلفة المبيعات',
    'Gross Profit': 'إجمالي الربح',
    Profit: 'الربح',
    'Gross Margin %': 'هامش الربح %',
    'Margin %': 'الهامش %',
    'Transaction Ref': 'رقم المعاملة',
    'Sale #': 'رقم الفاتورة',
    'PO #': 'رقم أمر الشراء',
    'P.O. #': 'رقم أمر الشراء',
    'Date & Time': 'التاريخ والوقت',
    Date: 'التاريخ',
    'Issued Date': 'تاريخ الإصدار',
    'Expected Date': 'التاريخ المتوقع',
    'Movement Type': 'نوع الحركة',
    'Outlet / Location': 'الفرع / المستودع',
    Location: 'الموقع',
    Outlet: 'الفرع',
    'Quantity Delta': 'فارق الكمية',
    'Quantity Change': 'تغير الكمية',
    'Previous Stock': 'المخزون السابق',
    'Resulting Stock': 'المخزون الناتج',
    'New Stock': 'المخزون الجديد',
    'Audit Notes / Reason': 'ملاحظات الجرد / السبب',
    Notes: 'ملاحظات',
    Customer: 'اسم العميل',
    'Customer Name': 'اسم العميل',
    Channel: 'قناة البيع',
    'Sales Channel': 'قناة البيع',
    'Payment Method': 'طريقة الدفع',
    Payment: 'طريقة الدفع',
    Method: 'الطريقة',
    'Items Count': 'عدد الأصناف',
    Items: 'الأصناف',
    'Order Qty': 'الكمية المطلوبة',
    Subtotal: 'المجموع الفرعي',
    Tax: 'الضريبة / القيمة المضافة',
    Total: 'المبلغ الإجمالي',
    'Tax Collected': 'الضريبة المحصلة',
    'Taxable Amount': 'المبلغ الخاضع للضريبة',
    'Gross Sales': 'المبيعات الإجمالية',
    'Net Sales': 'صافي المبيعات',
    'Net Profit': 'صافي الربح',
    'Official Inventory Record': 'سجل المخزون الرسمي',
    Generated: 'تاريخ التوليد',
    'Total Records': 'إجمالي السجلات',
    'FINANCIAL & ANALYTICS REPORT': 'تقرير الأداء المالي والتحليلات',
    'Master Stock Levels Valuation Report': 'تقرير تقييم ومستويات المخزون العام',
    'Stock Valuation Report': 'تقرير تقييم المخزون',
    'Sales Audit & Transaction Ledger': 'سجل المبيعات والتدقيق المالي',
    'Inventory Valuation & Stock Status': 'تقييم المخزون وحالة التوفر',
    'Purchase Orders & Procurement Ledger': 'سجل أوامر الشراء والتوريد',
    'Tax Collection & Audit Report': 'تقرير تحصيل الضرائب والتدقيق المالي',
    'Product Profitability & Margins Report': 'تقرير ربحية المنتجات وهوامش الربح',
    'Sales Velocity & Stock Turnover Report': 'تقرير سرعة المبيعات ومعدل دوران المخزون',
    PO_HEADER: 'أمر شراء رسمي وسند توريد',
    PURCHASE_ORDER: 'أمر الشراء (PO)',
    PO_NUMBER: 'رقم أمر الشراء',
    ISSUED: 'تاريخ الإصدار',
    VENDOR_DETAILS: 'بيانات المورد',
    APPROVED_VENDOR: 'مورد تجاري معتمد',
    PAYMENT_TERMS: 'شروط الدفع: سداد خلال 30 يوماً',
    SHIP_TO: 'وجهة الاستلام / الفرع',
    EXPECTED_DATE: 'التاريخ المتوقع',
    ATTN_RECEIVING: 'عناية: رصيف استلام المستودع',
    ITEM_DESC: 'وصف الصنف ورمز SKU',
    UNIT_PRICE: 'سعر الوحدة',
    TAX_RATE: 'نسبة الضريبة',
    ORDER_QTY: 'الكمية المطلوبة',
    LINE_TOTAL: 'إجمالي البند',
    TERMS_INSTRUCTIONS: 'شروط وتعليمات التوريد:',
    SUBTOTAL: 'المجموع الفرعي:',
    TAX_TOTAL: 'إجمالي ضريبة القيمة المضافة:',
    TOTAL_AMOUNT: 'المبلغ الإجمالي المستحق:',
    AUTH_OFFICER: 'مسؤول المشتريات المعتمد',
    RECEIVING_ACCEPT: 'إقرار استلام وفحص البضاعة',
    AUTH_SIGN: 'التوقيع المعتمد والتاريخ',
    RECEIVER_SIGN: 'توقيع المستلم، التاريخ والختم',
    PICK_HEADER: 'قائمة تجهيز وفرز الطلبات (PICK LIST)',
    BATCH_PICK_LIST: 'قائمة الفرز المجمعة',
    ORDERS_QUEUED: 'الطلبات المجدولة',
    PENDING_SHIPMENTS: 'الشحنات المعلقة',
    PICK_INSTRUCTIONS_TITLE: 'تعليمات فرز وتجهيز الشحن:',
    CHECK: 'تدقيق',
    ITEM_CODE: 'رمز الصنف / SKU',
    PICK_QTY: 'كمية الفرز',
    PICKER_SIGN: 'توقيع جامع الطلب',
    PICKER_SIGNOFF: 'تأكيد مسؤول التجهيز',
    SUPERVISOR_AUDIT: 'تدقيق مشرف الشحن',
    Healthy: 'ممتاز',
    'Low Stock': 'مخزون منخفض',
    'Out of Stock': 'نفد المخزون',
    Completed: 'مكتمل',
    Pending: 'قيد الانتظار',
    'In Transit': 'قيد النقل',
    Refunded: 'مسترجع',
    Cash: 'نقداً',
    Card: 'بطاقة بنكية',
    'Bank Transfer': 'تحويل بنكي',
    'In-Store POS': 'نقطة بيع المتجر',
    Adjustment: 'تعديل مخزون',
    'Transfer In': 'وارد مناقلة',
    'Transfer Out': 'صادر مناقلة',
    Sale: 'مبيعات',
    'PO Receiving': 'استلام مشتريات',
  },
  pt: {
    'Product Name': 'Nome do Produto',
    Product: 'Nome do Produto',
    SKU: 'Código SKU',
    Category: 'Categoria',
    Supplier: 'Fornecedor',
    'Cost Price': 'Preço de Custo',
    'Retail Price': 'Preço de Venda',
    Cost: 'Custo',
    Retail: 'Venda',
    'Tax %': '% Imposto',
    'Tax Rate': 'Alíquota Imposto',
    'Stock On Hand': 'Estoque Disponível',
    Stock: 'Estoque',
    'Stock Quantity': 'Quantidade em Estoque',
    'Reorder Threshold': 'Ponto de Reposição',
    'Reorder Point': 'Ponto de Reposição',
    'Total Cost Valuation': 'Valor Total ao Custo',
    'Total Retail Valuation': 'Valor Total de Venda',
    'Cost Valuation': 'Valor ao Custo',
    'Retail Valuation': 'Valor de Venda',
    'Total Valuation': 'Valor Total',
    'Inventory Status': 'Status do Estoque',
    Status: 'Status',
    'Units Sold': 'Unidades Vendidas',
    'Total Revenue': 'Receita Total',
    Revenue: 'Receita',
    'Total COGS': 'Custo dos Produtos Vendidos (CPV)',
    COGS: 'CPV',
    'Gross Profit': 'Lucro Bruto',
    Profit: 'Lucro',
    'Gross Margin %': '% Margem Bruta',
    'Margin %': '% Margem',
    'Transaction Ref': 'Ref. Transação',
    'Sale #': 'Nº da Venda',
    'PO #': 'Nº do Pedido',
    'P.O. #': 'Nº do Pedido',
    'Date & Time': 'Data e Hora',
    Date: 'Data',
    'Issued Date': 'Data de Emissão',
    'Expected Date': 'Data Prevista',
    'Movement Type': 'Tipo de Movimentação',
    'Outlet / Location': 'Filial / Localização',
    Location: 'Localização',
    Outlet: 'Filial',
    'Quantity Delta': 'Variação de Qtd',
    'Quantity Change': 'Variação de Qtd',
    'Previous Stock': 'Estoque Anterior',
    'Resulting Stock': 'Estoque Resultante',
    'New Stock': 'Novo Estoque',
    'Audit Notes / Reason': 'Notas de Auditoria / Motivo',
    Notes: 'Notas',
    Customer: 'Nome do Cliente',
    'Customer Name': 'Nome do Cliente',
    Channel: 'Canal de Vendas',
    'Sales Channel': 'Canal de Vendas',
    'Payment Method': 'Forma de Pagamento',
    Payment: 'Pagamento',
    Method: 'Forma',
    'Items Count': 'Qtd de Itens',
    Items: 'Itens',
    'Order Qty': 'Qtd Pedida',
    Subtotal: 'Subtotal',
    Tax: 'Impostos',
    Total: 'Valor Total',
    'Tax Collected': 'Impostos Recolhidos',
    'Taxable Amount': 'Base de Cálculo',
    'Gross Sales': 'Vendas Brutas',
    'Net Sales': 'Vendas Líquidas',
    'Net Profit': 'Lucro Líquido',
    'Official Inventory Record': 'Registro Oficial de Inventário',
    Generated: 'Gerado em',
    'Total Records': 'Total de Registros',
    'FINANCIAL & ANALYTICS REPORT': 'RELATÓRIO FINANCEIRO E ANALÍTICO',
    'Master Stock Levels Valuation Report': 'RELATÓRIO GERAL DE VALORAÇÃO DE ESTOQUE',
    'Stock Valuation Report': 'RELATÓRIO DE VALORAÇÃO DE ESTOQUE',
    'Sales Audit & Transaction Ledger': 'LIVRO DE VENDAS E AUDITORIA DE TRANSAÇÕES',
    'Inventory Valuation & Stock Status': 'VALORAÇÃO DE INVENTÁRIO E STATUS DE ESTOQUE',
    'Purchase Orders & Procurement Ledger': 'LIVRO DE PEDIDOS DE COMPRA E SUPRIMENTOS',
    'Tax Collection & Audit Report': 'RELATÓRIO DE ARRECADAÇÃO FISCAL E TRIBUTOS',
    'Product Profitability & Margins Report': 'RELATÓRIO DE LUCRATIVIDADE E MARGENS POR PRODUTO',
    'Sales Velocity & Stock Turnover Report': 'RELATÓRIO DE GIRO DE ESTOQUE E VELOCIDADE DE VENDAS',
    PO_HEADER: 'PEDIDO DE COMPRA OFICIAL E SOLICITAÇÃO',
    PURCHASE_ORDER: 'PEDIDO DE COMPRA (PO)',
    PO_NUMBER: 'Nº do Pedido',
    ISSUED: 'Emitido em',
    VENDOR_DETAILS: 'DADOS DO FORNECEDOR',
    APPROVED_VENDOR: 'Parceiro Fornecedor Homologado',
    PAYMENT_TERMS: 'Condições de Pagamento: 30 Dias',
    SHIP_TO: 'DESTINO DE ENTREGA / RECEBIMENTO',
    EXPECTED_DATE: 'Data Prevista',
    ATTN_RECEIVING: 'A/C: Doca de Recebimento de Estoque',
    ITEM_DESC: 'DESCRIÇÃO DO ITEM E SKU',
    UNIT_PRICE: 'PREÇO UNITÁRIO',
    TAX_RATE: 'ALÍQUOTA IMPOSTO',
    ORDER_QTY: 'QTD PEDIDA',
    LINE_TOTAL: 'TOTAL DO ITEM',
    TERMS_INSTRUCTIONS: 'TERMOS E INSTRUÇÕES DE ENTREGA:',
    SUBTOTAL: 'Subtotal:',
    TAX_TOTAL: 'Impostos Totais:',
    TOTAL_AMOUNT: 'VALOR TOTAL:',
    AUTH_OFFICER: 'RESPONSÁVEL DE COMPRAS AUTORIZADO',
    RECEIVING_ACCEPT: 'RECEBIMENTO E CONFERÊNCIA CONFORME',
    AUTH_SIGN: 'Assinatura Autorizada e Data',
    RECEIVER_SIGN: 'Assinatura do Recebedor, Data e Carimbo',
    PICK_HEADER: 'LISTA DE SEPARAÇÃO DE PEDIDOS (PICK LIST)',
    BATCH_PICK_LIST: 'LISTA DE PICKING EM LOTE',
    ORDERS_QUEUED: 'Pedidos em Fila',
    PENDING_SHIPMENTS: 'Envios Pendentes',
    PICK_INSTRUCTIONS_TITLE: 'INSTRUÇÕES DE SEPARAÇÃO E EXPEDIÇÃO:',
    CHECK: 'CONF.',
    ITEM_CODE: 'SKU / CÓDIGO',
    PICK_QTY: 'QTD PICK',
    PICKER_SIGN: 'VISTO SEPARADOR',
    PICKER_SIGNOFF: 'ASSINATURA DO SEPARADOR DE PEDIDOS',
    SUPERVISOR_AUDIT: 'AUDITORIA DO SUPERVISOR DE EXPEDIÇÃO',
    Healthy: 'Adequado',
    'Low Stock': 'Estoque Baixo',
    'Out of Stock': 'Esgotado',
    Completed: 'Concluído',
    Pending: 'Pendente',
    'In Transit': 'Em Trânsito',
    Refunded: 'Reembolsado',
    Cash: 'Dinheiro',
    Card: 'Cartão',
    'Bank Transfer': 'Transferência Bancária / PIX',
    'In-Store POS': 'PDV na Loja',
    Adjustment: 'Ajuste de Estoque',
    'Transfer In': 'Transferência Entrada',
    'Transfer Out': 'Transferência Saída',
    Sale: 'Venda PDV',
    'PO Receiving': 'Recebimento de Compras',
  },
  it: {
    'Product Name': 'Nome Prodotto',
    Product: 'Nome Prodotto',
    SKU: 'Codice SKU',
    Category: 'Categoria',
    Supplier: 'Fornitore',
    'Cost Price': 'Prezzo di Costo',
    'Retail Price': 'Prezzo di Vendita',
    Cost: 'Costo',
    Retail: 'Vendita',
    'Tax %': 'IVA %',
    'Tax Rate': 'Aliquota IVA',
    'Stock On Hand': 'Giacenza Attuale',
    Stock: 'Giacenza',
    'Stock Quantity': 'Quantità a Magazzino',
    'Reorder Threshold': 'Soglia di Riordino',
    'Reorder Point': 'Punto di Riordino',
    'Total Cost Valuation': 'Valorizzazione Totale al Costo',
    'Total Retail Valuation': 'Valorizzazione Totale alla Vendita',
    'Cost Valuation': 'Valorizzazione Costo',
    'Retail Valuation': 'Valorizzazione Vendita',
    'Total Valuation': 'Valorizzazione Totale',
    'Inventory Status': 'Stato Inventario',
    Status: 'Stato',
    'Units Sold': 'Unità Vendute',
    'Total Revenue': 'Fatturato Totale',
    Revenue: 'Fatturato',
    'Total COGS': 'Costo del Venduto (COGS)',
    COGS: 'Costo del Venduto',
    'Gross Profit': 'Utile Lordo',
    Profit: 'Utile',
    'Gross Margin %': '% Margine Lordo',
    'Margin %': '% Margine',
    'Transaction Ref': 'Rif. Transazione',
    'Sale #': 'N. Vendita',
    'PO #': 'N. ODA',
    'P.O. #': 'N. ODA',
    'Date & Time': 'Data e Ora',
    Date: 'Data',
    'Issued Date': 'Data Emissione',
    'Expected Date': 'Data Prevista',
    'Movement Type': 'Tipo Movimento',
    'Outlet / Location': 'Filiale / Ubicazione',
    Location: 'Ubicazione',
    Outlet: 'Filiale',
    'Quantity Delta': 'Variazione Quantità',
    'Quantity Change': 'Variazione Quantità',
    'Previous Stock': 'Giacenza Precedente',
    'Resulting Stock': 'Nuova Giacenza',
    'New Stock': 'Nuova Giacenza',
    'Audit Notes / Reason': 'Note di Rettifica / Motivo',
    Notes: 'Note',
    Customer: 'Nome Cliente',
    'Customer Name': 'Nome Cliente',
    Channel: 'Canale di Vendita',
    'Sales Channel': 'Canale di Vendita',
    'Payment Method': 'Metodo di Pagamento',
    Payment: 'Pagamento',
    Method: 'Metodo',
    'Items Count': 'Totale Articoli',
    Items: 'Articoli',
    'Order Qty': 'Qta Ordinata',
    Subtotal: 'Subtotale',
    Tax: 'IVA / Imposte',
    Total: 'Importo Totale',
    'Tax Collected': 'IVA Incassata',
    'Taxable Amount': 'Imponibile',
    'Gross Sales': 'Vendite Lorde',
    'Net Sales': 'Vendite Nette',
    'Net Profit': 'Utile Netto',
    'Official Inventory Record': 'Registro Ufficiale Inventario',
    Generated: 'Generato il',
    'Total Records': 'Totale Record',
    'FINANCIAL & ANALYTICS REPORT': 'REPORT FINANZIARIO ED ANALITICO',
    'Master Stock Levels Valuation Report': 'REPORT GENERALE VALORIZZAZIONE MAGAZZINO',
    'Stock Valuation Report': 'REPORT VALORIZZAZIONE GIACENZE',
    'Sales Audit & Transaction Ledger': 'MASTRO VENDITE E AUDIT TRANSAZIONI',
    'Inventory Valuation & Stock Status': 'VALORIZZAZIONE INVENTARIO E DISPONIBILITÀ',
    'Purchase Orders & Procurement Ledger': 'REGISTRO ORDINI DI ACQUISTO E FORNITURE',
    'Tax Collection & Audit Report': 'REPORT FISCALE E INCASSO IVA',
    'Product Profitability & Margins Report': 'REPORT REDDITIVITÀ E MARGINALITÀ PRODOTTI',
    'Sales Velocity & Stock Turnover Report': 'REPORT ROTAZIONE MAGAZZINO E VELOCITÀ VENDITE',
    PO_HEADER: 'ORDINE D’ACQUISTO UFFICIALE E RICHIESTA FORNITURA',
    PURCHASE_ORDER: 'ORDINE D’ACQUISTO (PO)',
    PO_NUMBER: 'N. ODA',
    ISSUED: 'Emesso il',
    VENDOR_DETAILS: 'DATI FORNITORE',
    APPROVED_VENDOR: 'Fornitore Commerciale Accreditato',
    PAYMENT_TERMS: 'Termini di Pagamento: 30 Giorni Data Fattura',
    SHIP_TO: 'DESTINAZIONE MERCI / RICEVIMENTO',
    EXPECTED_DATE: 'Data Prevista',
    ATTN_RECEIVING: 'All’attenzione di: Banchina Ricevimento Merci',
    ITEM_DESC: 'DESCRIZIONE ARTICOLO E SKU',
    UNIT_PRICE: 'PREZZO UNITARIO',
    TAX_RATE: 'ALIQUOTA IVA',
    ORDER_QTY: 'QTA ORDINATA',
    LINE_TOTAL: 'TOTALE RIGA',
    TERMS_INSTRUCTIONS: 'TERMINI E ISTRUZIONI DI CONSEGNA:',
    SUBTOTAL: 'Subtotale:',
    TAX_TOTAL: 'Totale IVA / Imposte:',
    TOTAL_AMOUNT: 'IMPORTO TOTALE:',
    AUTH_OFFICER: 'RESPONSABILE ACQUISTI AUTORIZZATO',
    RECEIVING_ACCEPT: 'COLLAUDO E RICEVIMENTO MERCI CONFORME',
    AUTH_SIGN: 'Firma Autorizzata e Data',
    RECEIVER_SIGN: 'Firma Ricevitore, Data e Timbro',
    PICK_HEADER: 'DISTINTA DI PRELIEVO MAGAZZINO (PICK LIST)',
    BATCH_PICK_LIST: 'LISTA DI PRELIEVO',
    ORDERS_QUEUED: 'Ordini in Coda',
    PENDING_SHIPMENTS: 'Spedizioni in Sospeso',
    PICK_INSTRUCTIONS_TITLE: 'ISTRUZIONI DI PRELIEVO SPEDIZIONE:',
    CHECK: 'SPUNTA',
    ITEM_CODE: 'SKU / CODICE',
    PICK_QTY: 'QTA PICK',
    PICKER_SIGN: 'SIGLA OPERATORE',
    PICKER_SIGNOFF: 'FIRMA OPERATORE DI PRELIEVO',
    SUPERVISOR_AUDIT: 'VERIFICA SUPERVISORE SPEDIZIONI',
    Healthy: 'Ottimale',
    'Low Stock': 'Scorta Bassa',
    'Out of Stock': 'Esaurito',
    Completed: 'Completato',
    Pending: 'In attesa',
    'In Transit': 'In transito',
    Refunded: 'Rimborsato',
    Cash: 'Contanti',
    Card: 'Carta di Credito',
    'Bank Transfer': 'Bonifico Bancario',
    'In-Store POS': 'Cassa Punto Vendita',
    Adjustment: 'Rettifica Giacenza',
    'Transfer In': 'Trasferimento Entrata',
    'Transfer Out': 'Trasferimento Uscita',
    Sale: 'Vendita POS',
    'PO Receiving': 'Ricevimento Fornitore',
  },
  ru: {
    'Product Name': 'Наименование товара',
    Product: 'Наименование товара',
    SKU: 'Артикул (SKU)',
    Category: 'Категория',
    Supplier: 'Поставщик',
    'Cost Price': 'Себестоимость',
    'Retail Price': 'Розничная цена',
    Cost: 'Себестоимость',
    Retail: 'Цена',
    'Tax %': 'Ставка НДС %',
    'Tax Rate': 'Ставка налога',
    'Stock On Hand': 'Остаток на складе',
    Stock: 'Остаток',
    'Stock Quantity': 'Количество на складе',
    'Reorder Threshold': 'Порог дозаказа',
    'Reorder Point': 'Точка дозаказа',
    'Total Cost Valuation': 'Общая оценка по себестоимости',
    'Total Retail Valuation': 'Общая оценка по розничным ценам',
    'Cost Valuation': 'Оценка по себестоимости',
    'Retail Valuation': 'Оценка по рознице',
    'Total Valuation': 'Общая стоимость',
    'Inventory Status': 'Статус остатка',
    Status: 'Статус',
    'Units Sold': 'Продано единиц',
    'Total Revenue': 'Общая выручка',
    Revenue: 'Выручка',
    'Total COGS': 'Себестоимость продаж (COGS)',
    COGS: 'Себестоимость продаж',
    'Gross Profit': 'Валовая прибыль',
    Profit: 'Прибыль',
    'Gross Margin %': '% Валовой маржи',
    'Margin %': '% Маржи',
    'Transaction Ref': 'Номер транзакции',
    'Sale #': 'Номер продажи',
    'PO #': 'Номер заказа',
    'P.O. #': 'Номер заказа',
    'Date & Time': 'Дата и время',
    Date: 'Дата',
    'Issued Date': 'Дата оформления',
    'Expected Date': 'Ожидаемая дата',
    'Movement Type': 'Тип операции',
    'Outlet / Location': 'Торговая точка / Склад',
    Location: 'Склад/Локация',
    Outlet: 'Торговая точка',
    'Quantity Delta': 'Изменение количества',
    'Quantity Change': 'Изменение количества',
    'Previous Stock': 'Предыдущий остаток',
    'Resulting Stock': 'Текущий остаток',
    'New Stock': 'Новый остаток',
    'Audit Notes / Reason': 'Причина / Примечание',
    Notes: 'Примечания',
    Customer: 'Имя покупателя',
    'Customer Name': 'Имя покупателя',
    Channel: 'Канал продаж',
    'Sales Channel': 'Канал продаж',
    'Payment Method': 'Способ оплаты',
    Payment: 'Способ оплаты',
    Method: 'Метод',
    'Items Count': 'Количество позиций',
    Items: 'Позиции',
    'Order Qty': 'Кол-во в заказе',
    Subtotal: 'Подытог',
    Tax: 'НДС / Налог',
    Total: 'Итого к оплате',
    'Tax Collected': 'Собранный НДС',
    'Taxable Amount': 'Налогооблагаемая база',
    'Gross Sales': 'Валовые продажи',
    'Net Sales': 'Чистые продажи',
    'Net Profit': 'Чистая прибыль',
    'Official Inventory Record': 'Официальная ведомость складского учета',
    Generated: 'Сформировано',
    'Total Records': 'Всего записей',
    'FINANCIAL & ANALYTICS REPORT': 'ФИНАНСОВЫЙ И АНАЛИТИЧЕСКИЙ ОТЧЕТ',
    'Master Stock Levels Valuation Report': 'СВОДНЫЙ ОТЧЕТ ОЦЕНКИ ОСТАТКОВ СКЛАДА',
    'Stock Valuation Report': 'ВЕДОМОСТЬ ОЦЕНКИ СКЛАДА',
    'Sales Audit & Transaction Ledger': 'ЖУРНАЛ ПРОДАЖ И АУДИТ ТРАНЗАКЦИЙ',
    'Inventory Valuation & Stock Status': 'ОЦЕНКА СКЛАДСКИХ ОСТАТКОВ И СТАТУС НАЛИЧИЯ',
    'Purchase Orders & Procurement Ledger': 'ЖУРНАЛ ЗАКАЗОВ НА ЗАКУПКУ И СНАБЖЕНИЯ',
    'Tax Collection & Audit Report': 'ОТЧЕТ ПО СБОРУ НАЛОГОВ И АУДИТ НДС',
    'Product Profitability & Margins Report': 'ОТЧЕТ ПО РЕНТАБЕЛЬНОСТИ И МАРЖИНАЛЬНОСТИ ТОВАРОВ',
    'Sales Velocity & Stock Turnover Report': 'ОТЧЕТ ПО ОБОРАЧИВАЕМОСТИ И ДИНАМИКЕ ПРОДАЖ',
    PO_HEADER: 'ОФИЦИАЛЬНЫЙ ЗАКАЗ-НАРЯД ПОСТАВЩИКУ (ЗАКАЗ НА ЗАКУПКУ)',
    PURCHASE_ORDER: 'ЗАКАЗ НА ЗАКУПКУ (PO)',
    PO_NUMBER: 'Номер заказа',
    ISSUED: 'Дата оформления',
    VENDOR_DETAILS: 'РЕКВИЗИТЫ ПОСТАВЩИКА',
    APPROVED_VENDOR: 'Аккредитованный торговый партнер',
    PAYMENT_TERMS: 'Условия оплаты: Оплата в течение 30 дней',
    SHIP_TO: 'ПУНКТ НАЗНАЧЕНИЯ / ПРИЕМКА',
    EXPECTED_DATE: 'Ожидаемая дата',
    ATTN_RECEIVING: 'Кому: Зона приемки и разгрузки склада',
    ITEM_DESC: 'НАИМЕНОВАНИЕ ТОВАРА И АРТИКУЛ (SKU)',
    UNIT_PRICE: 'ЦЕНА ЗА ЕД.',
    TAX_RATE: 'СТАВКА НДС',
    ORDER_QTY: 'КОЛ-ВО',
    LINE_TOTAL: 'СУММА',
    TERMS_INSTRUCTIONS: 'УСЛОВИЯ И ИНСТРУКЦИИ ПО ПОСТАВКЕ:',
    SUBTOTAL: 'Подытог без НДС:',
    TAX_TOTAL: 'Сумма НДС:',
    TOTAL_AMOUNT: 'ИТОГО К ОПЛАТЕ:',
    AUTH_OFFICER: 'ОТВЕТСТВЕННЫЙ СОТРУДНИК ОТДЕЛА ЗАКУПОК',
    RECEIVING_ACCEPT: 'ПРИЕМКА И КОНТРОЛЬ КАЧЕСТВА ПРОЙДЕНЫ',
    AUTH_SIGN: 'Подпись уполномоченного лица и дата',
    RECEIVER_SIGN: 'Подпись кладовщика, дата и печать',
    PICK_HEADER: 'СКЛАДСКОЙ ЛИСТ СБОРКИ ЗАКАЗОВ (PICK LIST)',
    BATCH_PICK_LIST: 'СБОРНЫЙ ЛИСТ КОМПЛЕКТАЦИИ',
    ORDERS_QUEUED: 'Заказов в очереди',
    PENDING_SHIPMENTS: 'Ожидает отгрузки',
    PICK_INSTRUCTIONS_TITLE: 'ИНСТРУКЦИИ ПО КОМПЛЕКТАЦИИ И ОТГРУЗКЕ:',
    CHECK: 'ОТМЕТКА',
    ITEM_CODE: 'АРТИКУЛ / КОД ТОВАРА',
    PICK_QTY: 'КОЛ-ВО',
    PICKER_SIGN: 'ПОДПИСЬ',
    PICKER_SIGNOFF: 'ПОДПИСЬ КОМПЛЕКТОВЩИКА',
    SUPERVISOR_AUDIT: 'ПРОВЕРКА НАЧАЛЬНИКА СКЛАДА',
    Healthy: 'В норме',
    'Low Stock': 'Мало на складе',
    'Out of Stock': 'Нет в наличии',
    Completed: 'Завершено',
    Pending: 'В ожидании',
    'In Transit': 'В пути',
    Refunded: 'Возврат средств',
    Cash: 'Наличные',
    Card: 'Банковская карта',
    'Bank Transfer': 'Безналичный расчет',
    'In-Store POS': 'Касса магазина',
    Adjustment: 'Корректировка остатка',
    'Transfer In': 'Входящее перемещение',
    'Transfer Out': 'Исходящее перемещение',
    Sale: 'Продажа',
    'PO Receiving': 'Приемка поставки',
  },
};

export function translateLabel(
  key: string,
  lang: SupportedLanguage = 'en',
  currencySymbol?: string
): string {
  if (!key) return '';

  // Check if key has currency pattern e.g. "Total Revenue ($)" or "Cost (€)"
  const currMatch = key.match(/^(.+?)\s*\([\$€£¥₹\w]+\)$/);
  const baseKey = currMatch ? currMatch[1].trim() : key.trim();
  const hasCurrencySuffix = !!currMatch;

  const dict = EXPORT_TRANSLATIONS[lang] || EXPORT_TRANSLATIONS.en;
  let translated = (dict && dict[baseKey]) || (EXPORT_TRANSLATIONS.en && EXPORT_TRANSLATIONS.en[baseKey]) || baseKey;

  if (hasCurrencySuffix) {
    const symbol = currencySymbol && currencySymbol.trim() ? currencySymbol : '$';
    return `${translated} (${symbol})`;
  }

  return translated;
}

export function translateRowData<T extends Record<string, any>>(
  rows: T[],
  lang: SupportedLanguage = 'en',
  currencySymbol?: string
): Record<string, any>[] {
  if (!rows || !rows.length) return [];
  const symbol = currencySymbol && currencySymbol.trim() ? currencySymbol : '$';

  return rows.map((row) => {
    const newRow: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      const translatedKey = translateLabel(k, lang, currencySymbol);
      let translatedVal = v;

      if (typeof v === 'string') {
        const dict = EXPORT_TRANSLATIONS[lang] || EXPORT_TRANSLATIONS.en;
        if (dict && dict[v]) {
          translatedVal = dict[v];
        } else if (v.startsWith('$') && symbol !== '$') {
          // Replace leading USD $ with active currency symbol
          translatedVal = `${symbol}${v.slice(1)}`;
        }
      }
      newRow[translatedKey] = translatedVal;
    }
    return newRow;
  });
}

export async function exportWorkspaceJSON(): Promise<string> {
  const products = await getAllFromStore('products');
  const categories = await getAllFromStore('categories');
  const suppliers = await getAllFromStore('suppliers');
  const customers = await getAllFromStore('customers');
  const locations = await getAllFromStore('locations');
  const sales = await getAllFromStore('sales');
  const purchaseOrders = await getAllFromStore('purchaseOrders');
  const stockMovements = await getAllFromStore('stockMovements');
  const expenses = await getAllFromStore('expenses');
  const settings = await getAllFromStore('settings');

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      products,
      categories,
      suppliers,
      customers,
      locations,
      sales,
      purchaseOrders,
      stockMovements,
      expenses,
      settings,
    },
  };

  return JSON.stringify(payload, null, 2);
}

export async function downloadWorkspaceJSON(filename = 'inventory360_emergency_backup.json'): Promise<void> {
  const json = await exportWorkspaceJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importWorkspaceJSON(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      console.error('Invalid backup JSON: Missing root data object.');
      return false;
    }

    const { data } = parsed;

    // Validate that data object contains recognized store structures
    const validStoreKeys = ['products', 'categories', 'suppliers', 'customers', 'locations', 'sales', 'purchaseOrders', 'stockMovements', 'expenses', 'settings'];
    const hasValidKey = validStoreKeys.some((key) => key in data && Array.isArray(data[key]));
    if (!hasValidKey) {
      console.error('Invalid backup JSON: No recognized entity arrays found in data payload.');
      return false;
    }

    await clearAllStores();

    // 1. Sanitize Products
    if (Array.isArray(data.products) && data.products.length) {
      const sanitizedProducts = data.products
        .filter((p: any) => p && typeof p === 'object' && p.id && (p.name || p.title))
        .map((p: any) => ({
          id: String(p.id),
          name: String(p.name || p.title).trim(),
          sku: String(p.sku || p.barcode || `SKU-${Date.now()}`).toUpperCase().trim(),
          barcode: p.barcode ? String(p.barcode).trim() : undefined,
          description: p.description ? String(p.description) : undefined,
          categoryId: String(p.categoryId || 'cat_gen'),
          categoryName: String(p.categoryName || 'General'),
          costPrice: typeof p.costPrice === 'number' && !isNaN(p.costPrice) ? Math.max(0, p.costPrice) : 0,
          retailPrice: typeof p.retailPrice === 'number' && !isNaN(p.retailPrice) ? Math.max(0, p.retailPrice) : 0,
          stockQuantity: typeof p.stockQuantity === 'number' && !isNaN(p.stockQuantity) ? Math.max(0, Math.floor(p.stockQuantity)) : 0,
          reorderPoint: typeof p.reorderPoint === 'number' && !isNaN(p.reorderPoint) ? Math.max(0, Math.floor(p.reorderPoint)) : 5,
          supplierId: p.supplierId ? String(p.supplierId) : undefined,
          supplierName: p.supplierName ? String(p.supplierName) : undefined,
          status: p.status === 'Low Stock' || p.status === 'Out of Stock' ? p.status : 'Healthy',
          locationQuantities: p.locationQuantities && typeof p.locationQuantities === 'object' ? p.locationQuantities : {},
          variants: Array.isArray(p.variants) ? p.variants : [],
          customFields: p.customFields && typeof p.customFields === 'object' ? p.customFields : {},
          taxRate: typeof p.taxRate === 'number' ? p.taxRate : undefined,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
      await putManyToStore('products', sanitizedProducts);
    }

    // 2. Sanitize Categories
    if (Array.isArray(data.categories) && data.categories.length) {
      const sanitizedCategories = data.categories
        .filter((c: any) => c && typeof c === 'object' && c.id && c.name)
        .map((c: any) => ({
          id: String(c.id),
          name: String(c.name).trim(),
          description: c.description ? String(c.description) : undefined,
        }));
      await putManyToStore('categories', sanitizedCategories);
    }

    // 3. Sanitize Suppliers
    if (Array.isArray(data.suppliers) && data.suppliers.length) {
      const sanitizedSuppliers = data.suppliers
        .filter((s: any) => s && typeof s === 'object' && s.id && s.name)
        .map((s: any) => ({
          id: String(s.id),
          name: String(s.name).trim(),
          contactPerson: s.contactPerson ? String(s.contactPerson) : undefined,
          email: s.email ? String(s.email).trim() : undefined,
          phone: s.phone ? String(s.phone).trim() : undefined,
          address: s.address ? String(s.address) : undefined,
          leadTimeDays: typeof s.leadTimeDays === 'number' ? s.leadTimeDays : 5,
          rating: typeof s.rating === 'number' ? s.rating : 5.0,
        }));
      await putManyToStore('suppliers', sanitizedSuppliers);
    }

    // 4. Sanitize Customers
    if (Array.isArray(data.customers) && data.customers.length) {
      const sanitizedCustomers = data.customers
        .filter((c: any) => c && typeof c === 'object' && c.id && c.name)
        .map((c: any) => ({
          id: String(c.id),
          name: String(c.name).trim(),
          email: c.email ? String(c.email).trim() : undefined,
          phone: c.phone ? String(c.phone).trim() : undefined,
          address: c.address ? String(c.address) : undefined,
          totalSpend: typeof c.totalSpend === 'number' ? c.totalSpend : 0,
          ordersCount: typeof c.ordersCount === 'number' ? c.ordersCount : 0,
          createdAt: c.createdAt || new Date().toISOString(),
        }));
      await putManyToStore('customers', sanitizedCustomers);
    }

    // 5. Sanitize Locations
    if (Array.isArray(data.locations) && data.locations.length) {
      const sanitizedLocations = data.locations
        .filter((l: any) => l && typeof l === 'object' && l.id && l.name)
        .map((l: any) => ({
          id: String(l.id),
          name: String(l.name).trim(),
          code: String(l.code || 'LOC').toUpperCase().trim(),
          address: l.address ? String(l.address) : undefined,
          isMain: Boolean(l.isMain),
        }));
      await putManyToStore('locations', sanitizedLocations);
    }

    // 6. Sanitize Sales
    if (Array.isArray(data.sales) && data.sales.length) {
      const sanitizedSales = data.sales
        .filter((s: any) => s && typeof s === 'object' && s.id && Array.isArray(s.items))
        .map((s: any) => ({
          id: String(s.id),
          saleNumber: String(s.saleNumber || `SAL-${Date.now()}`),
          items: s.items.map((it: any) => ({
            productId: String(it.productId || ''),
            productName: String(it.productName || 'Item'),
            sku: String(it.sku || ''),
            unitPrice: typeof it.unitPrice === 'number' ? it.unitPrice : 0,
            unitCost: typeof it.unitCost === 'number' ? it.unitCost : 0,
            quantity: typeof it.quantity === 'number' ? it.quantity : 1,
            total: typeof it.total === 'number' ? it.total : 0,
          })),
          subtotal: typeof s.subtotal === 'number' ? s.subtotal : 0,
          tax: typeof s.tax === 'number' ? s.tax : 0,
          discount: typeof s.discount === 'number' ? s.discount : 0,
          total: typeof s.total === 'number' ? s.total : 0,
          paymentMethod: String(s.paymentMethod || 'Cash'),
          status: String(s.status || 'Completed'),
          locationId: String(s.locationId || 'loc_main'),
          locationName: String(s.locationName || 'Main Store'),
          customerName: s.customerName ? String(s.customerName) : undefined,
          channel: s.channel ? String(s.channel) : 'In-Store POS',
          createdAt: s.createdAt || new Date().toISOString(),
        }));
      await putManyToStore('sales', sanitizedSales);
    }

    // 7. Sanitize Purchase Orders
    if (Array.isArray(data.purchaseOrders) && data.purchaseOrders.length) {
      const sanitizedPOs = data.purchaseOrders
        .filter((po: any) => po && typeof po === 'object' && po.id && po.poNumber)
        .map((po: any) => ({
          id: String(po.id),
          poNumber: String(po.poNumber),
          supplierId: String(po.supplierId || ''),
          supplierName: String(po.supplierName || 'Vendor'),
          status: String(po.status || 'Pending'),
          items: Array.isArray(po.items) ? po.items : [],
          subtotal: typeof po.subtotal === 'number' ? po.subtotal : 0,
          tax: typeof po.tax === 'number' ? po.tax : 0,
          total: typeof po.total === 'number' ? po.total : 0,
          notes: po.notes ? String(po.notes) : undefined,
          createdAt: po.createdAt || new Date().toISOString(),
        }));
      await putManyToStore('purchaseOrders', sanitizedPOs);
    }

    // 8. Sanitize Stock Movements
    if (Array.isArray(data.stockMovements) && data.stockMovements.length) {
      const sanitizedMovements = data.stockMovements
        .filter((m: any) => m && typeof m === 'object' && m.id && m.productId)
        .map((m: any) => ({
          id: String(m.id),
          productId: String(m.productId),
          productName: String(m.productName || 'Product'),
          sku: String(m.sku || ''),
          locationId: String(m.locationId || 'loc_main'),
          locationName: String(m.locationName || 'Main Store'),
          type: String(m.type || 'Adjustment'),
          quantityChange: typeof m.quantityChange === 'number' ? m.quantityChange : 0,
          previousStock: typeof m.previousStock === 'number' ? m.previousStock : 0,
          newStock: typeof m.newStock === 'number' ? m.newStock : 0,
          notes: m.notes ? String(m.notes) : undefined,
          createdAt: m.createdAt || new Date().toISOString(),
        }));
      await putManyToStore('stockMovements', sanitizedMovements);
    }

    // 9. Sanitize Expenses
    if (Array.isArray(data.expenses) && data.expenses.length) {
      const sanitizedExpenses = data.expenses
        .filter((e: any) => e && typeof e === 'object' && e.id && typeof e.amount === 'number')
        .map((e: any) => ({
          id: String(e.id),
          description: String(e.description || 'Expense'),
          category: String(e.category || 'General'),
          amount: Math.max(0, e.amount),
          date: e.date || new Date().toISOString(),
          locationId: e.locationId ? String(e.locationId) : undefined,
        }));
      await putManyToStore('expenses', sanitizedExpenses);
    }

    // 10. Sanitize Settings
    if (data.settings && typeof data.settings === 'object') {
      const s = Array.isArray(data.settings) ? data.settings[0] : data.settings;
      if (s && typeof s === 'object') {
        const sanitizedSettings = {
          id: 'settings',
          businessName: String(s.businessName || 'Enterprise Store'),
          ownerName: String(s.ownerName || 'Store Manager'),
          currencySymbol: String(s.currencySymbol || '$'),
          currencyCode: String(s.currencyCode || 'USD'),
          language: String(s.language || 'en'),
          theme: String(s.theme || 'dark'),
          taxRate: typeof s.taxRate === 'number' ? s.taxRate : 8.5,
          taxNumber: s.taxNumber ? String(s.taxNumber) : undefined,
          logoUrl: s.logoUrl ? String(s.logoUrl) : '',
          primaryLocationId: s.primaryLocationId ? String(s.primaryLocationId) : 'loc_main',
          address: s.address ? String(s.address) : undefined,
          phone: s.phone ? String(s.phone) : undefined,
          email: s.email ? String(s.email) : undefined,
        };
        await putManyToStore('settings', [sanitizedSettings]);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to import workspace JSON:', err);
    return false;
  }
}

export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  language: SupportedLanguage = 'en',
  currencySymbol?: string
): void {
  if (!rows || !rows.length) return;
  const translatedRows = translateRowData(rows, language, currencySymbol);
  const keys = Object.keys(translatedRows[0]);
  const header = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(',');
  const csvLines = translatedRows.map((row) =>
    keys.map((k) => sanitizeCSVValue(row[k])).join(',')
  );

  // Add UTF-8 BOM (\uFEFF) so Excel opens CSV files with special currency symbols & international text properly
  const csvContent = '\uFEFF' + [header, ...csvLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  language: SupportedLanguage = 'en',
  currencySymbol?: string
): void {
  if (!rows || !rows.length) return;
  const translatedRows = translateRowData(rows, language, currencySymbol);
  const keys = Object.keys(translatedRows[0]);

  let tableHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  tableHTML += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  tableHTML += `<table border="1" style="font-family: Arial, sans-serif; font-size: 11px; border-collapse: collapse;"><thead><tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">`;

  keys.forEach((k) => {
    tableHTML += `<th style="padding: 10px 12px; border: 1px solid #334155; text-align: left;">${escapeHtml(k)}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;

  translatedRows.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHTML += `<tr style="background-color: ${bg};">`;
    keys.forEach((k) => {
      let val = row[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      tableHTML += `<td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${escapeHtml(val)}</td>`;
    });
    tableHTML += `</tr>`;
  });

  tableHTML += `</tbody></table></body></html>`;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF<T extends Record<string, any>>(
  filename: string,
  title: string,
  rows: T[],
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string,
  language: SupportedLanguage = 'en',
  currencySymbol?: string
): void {
  if (!rows || !rows.length) return;
  const translatedRows = translateRowData(rows, language, currencySymbol);
  const keys = Object.keys(translatedRows[0]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const leftMargin = 36;
  const rightMargin = 806;

  let headerTextX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 20, 32, 32);
      headerTextX = leftMargin + 40;
    } catch {}
  }

  // Clean Print-Friendly Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), headerTextX, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  const translatedTitle = translateLabel(title, language, currencySymbol);
  doc.text(translatedTitle.toUpperCase(), headerTextX, 46);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  const taxInfo = taxNumber ? ` | GSTIN/TAX ID: ${taxNumber}` : '';
  const officialRecordLabel = translateLabel('Official Inventory Record', language);
  const generatedLabel = translateLabel('Generated', language);
  const totalRecordsLabel = translateLabel('Total Records', language);
  doc.text(`${officialRecordLabel} | ${generatedLabel}: ${new Date().toLocaleString()} | ${totalRecordsLabel}: ${rows.length}${taxInfo}`, headerTextX, 58);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(leftMargin, 66, rightMargin, 66);

  const tableData = translatedRows.map((r) =>
    keys.map((k) => {
      let val = r[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      return String(val ?? '');
    })
  );

  autoTable(doc, {
    startY: 74,
    head: [keys.map((k) => k.toUpperCase())],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [20, 20, 20],
      lineWidth: 0.5,
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: leftMargin, right: 36 },
  });

  doc.save(`${filename}.pdf`);
}

export function downloadPOSlipPDF(
  po: {
    poNumber: string;
    supplierName: string;
    locationName?: string;
    status: string;
    createdAt: string;
    expectedDate?: string;
    subtotal: number;
    tax?: number;
    total: number;
    notes?: string;
    items: Array<{
      productName: string;
      sku: string;
      unitCost: number;
      orderedQuantity: number;
      taxRate?: number;
      total: number;
    }>;
  },
  currencySymbol: string,
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string,
  language: SupportedLanguage = 'en'
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = 595.28;
  const leftMargin = 36;
  const rightMargin = 559;
  const printableWidth = rightMargin - leftMargin;

  // Safe ASCII representation for currency in jsPDF default fonts
  const curr = currencySymbol && currencySymbol.trim() ? currencySymbol : '$';

  let brandX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 26, 38, 38);
      brandX = leftMargin + 46;
    } catch {}
  }

  // 1. Clean Print-Friendly Top Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), brandX, 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(translateLabel('PO_HEADER', language), brandX, 50);

  if (taxNumber) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`GSTIN / TAX ID: ${taxNumber}`, brandX, 62);
  }

  // Document Badge (Right aligned)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('PURCHASE_ORDER', language), rightMargin, 38, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`${translateLabel('PO_NUMBER', language)}: ${po.poNumber}`, rightMargin, 51, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const issuedLabel = translateLabel('ISSUED', language);
  const statusLabel = translateLabel('Status', language);
  const translatedStatus = translateLabel(po.status, language);
  doc.text(`${issuedLabel}: ${new Date(po.createdAt).toLocaleDateString()} | ${statusLabel}: ${translatedStatus.toUpperCase()}`, rightMargin, 63, { align: 'right' });

  // Top Rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.25);
  doc.line(leftMargin, 74, rightMargin, 74);

  // 2. Info Cards Section (Vendor & Ship-To side-by-side)
  const cardY = 84;
  const cardWidth = (printableWidth - 14) / 2;
  const cardHeight = 64;

  // Card 1: Vendor / Supplier
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, cardY, cardWidth, cardHeight, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 90, 90);
  doc.text(translateLabel('VENDOR_DETAILS', language), leftMargin + 10, cardY + 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(po.supplierName, leftMargin + 10, cardY + 30, { maxWidth: cardWidth - 20 });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(translateLabel('APPROVED_VENDOR', language), leftMargin + 10, cardY + 44);
  doc.text(translateLabel('PAYMENT_TERMS', language), leftMargin + 10, cardY + 54);

  // Card 2: Ship-To Destination
  const rightCardX = leftMargin + cardWidth + 14;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(rightCardX, cardY, cardWidth, cardHeight, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 90, 90);
  doc.text(translateLabel('SHIP_TO', language), rightCardX + 10, cardY + 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(po.locationName || 'Main Hub', rightCardX + 10, cardY + 30, { maxWidth: cardWidth - 20 });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  const expectedDateLabel = translateLabel('EXPECTED_DATE', language);
  doc.text(`${expectedDateLabel}: ${po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : 'ASAP'}`, rightCardX + 10, cardY + 44);
  doc.text(translateLabel('ATTN_RECEIVING', language), rightCardX + 10, cardY + 54);

  // 3. Line Items Table (Includes Item-Level Tax % column)
  const tableData = po.items.map((item, idx) => [
    idx + 1,
    `${item.productName}\nSKU: ${item.sku}`,
    `${curr}${item.unitCost.toFixed(2)}`,
    item.taxRate !== undefined ? `${item.taxRate}%` : 'Standard',
    item.orderedQuantity,
    `${curr}${item.total.toFixed(2)}`,
  ]);

  const colItemDesc = translateLabel('ITEM_DESC', language);
  const colUnitPrice = translateLabel('UNIT_PRICE', language);
  const colTaxRate = translateLabel('TAX_RATE', language);
  const colOrderQty = translateLabel('ORDER_QTY', language);
  const colLineTotal = translateLabel('LINE_TOTAL', language);

  autoTable(doc, {
    startY: 158,
    head: [['#', colItemDesc, colUnitPrice, colTaxRate, colOrderQty, colLineTotal]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 215 },
      2: { cellWidth: 70, halign: 'right' },
      3: { cellWidth: 58, halign: 'center' },
      4: { cellWidth: 65, halign: 'right' },
      5: { cellWidth: 90, halign: 'right' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [20, 20, 20],
      lineWidth: 0.5,
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    margin: { left: leftMargin, right: pageWidth - rightMargin },
  });

  // 4. Financial Summary & Notes
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const notesWidth = 300;
  const totalsWidth = printableWidth - notesWidth - 14;
  const totalsX = leftMargin + notesWidth + 14;

  // Notes Box (Left)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, finalY, notesWidth, 68, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text(translateLabel('TERMS_INSTRUCTIONS', language), leftMargin + 10, finalY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const notesContent = po.notes || 'Please include Packing Slip with this PO # on all packages. Items must be inspected upon dock delivery before invoice sign-off.';
  doc.text(notesContent, leftMargin + 10, finalY + 28, { maxWidth: notesWidth - 20 });

  // Totals Box (Right)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(totalsX, finalY, totalsWidth, 68, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(translateLabel('SUBTOTAL', language), totalsX + 10, finalY + 16);
  doc.text(`${curr}${po.subtotal.toFixed(2)}`, rightMargin - 10, finalY + 16, { align: 'right' });

  doc.text(translateLabel('TAX_TOTAL', language), totalsX + 10, finalY + 30);
  doc.text(`${curr}${(po.tax || 0).toFixed(2)}`, rightMargin - 10, finalY + 30, { align: 'right' });

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(totalsX + 10, finalY + 38, rightMargin - 10, finalY + 38);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('TOTAL_AMOUNT', language), totalsX + 10, finalY + 54);
  doc.text(`${curr}${po.total.toFixed(2)}`, rightMargin - 10, finalY + 54, { align: 'right' });

  // 5. Signatures & Approvals (Positioned near bottom)
  const sigY = Math.max(finalY + 105, 735);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(leftMargin, sigY, leftMargin + 210, sigY);
  doc.line(rightMargin - 210, sigY, rightMargin, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('AUTH_OFFICER', language), leftMargin, sigY + 12);
  doc.text(translateLabel('RECEIVING_ACCEPT', language), rightMargin - 210, sigY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(translateLabel('AUTH_SIGN', language), leftMargin, sigY + 22);
  doc.text(translateLabel('RECEIVER_SIGN', language), rightMargin - 210, sigY + 22);

  // 6. Running Footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 795, rightMargin, 795);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Inventory360 Enterprise ERP - Official Procurement Document', leftMargin, 807);
  doc.text(`Page 1 of 1 | Printed: ${new Date().toLocaleString()}`, rightMargin, 807, { align: 'right' });

  // Directly save / download PDF
  doc.save(`PO_Slip_${po.poNumber}.pdf`);
}

export function downloadPickListPDF(
  pickItems: Array<{ sku: string; name: string; quantity: number }>,
  pendingOrdersCount: number,
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string,
  language: SupportedLanguage = 'en'
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = 595.28;
  const leftMargin = 36;
  const rightMargin = 559;
  const printableWidth = rightMargin - leftMargin;

  let brandX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 26, 38, 38);
      brandX = leftMargin + 46;
    } catch {}
  }

  // 1. Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), brandX, 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(translateLabel('PICK_HEADER', language), brandX, 50);

  if (taxNumber) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`GSTIN / TAX ID: ${taxNumber}`, brandX, 62);
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('BATCH_PICK_LIST', language), rightMargin, 38, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const generatedLabel = translateLabel('Generated', language);
  const queuedLabel = translateLabel('ORDERS_QUEUED', language);
  const pendingLabel = translateLabel('PENDING_SHIPMENTS', language);
  doc.text(`${generatedLabel}: ${new Date().toLocaleString()}`, rightMargin, 51, { align: 'right' });
  doc.text(`${queuedLabel}: ${pendingOrdersCount} ${pendingLabel}`, rightMargin, 63, { align: 'right' });

  // Top Rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.25);
  doc.line(leftMargin, 74, rightMargin, 74);

  // 2. Summary Card
  const totalUnits = pickItems.reduce((a, b) => a + b.quantity, 0);
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, 84, printableWidth, 42, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('PICK_INSTRUCTIONS_TITLE', language), leftMargin + 10, 100);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Retrieve total ${totalUnits} units across ${pickItems.length} SKUs for staging & packaging. Verify barcode labels before transferring to packing station.`,
    leftMargin + 10,
    114,
    { maxWidth: printableWidth - 20 }
  );

  // 3. Line Items Table with Checkboxes
  const tableData = pickItems.map((item, idx) => [
    '[  ]',
    idx + 1,
    item.sku,
    item.name,
    item.quantity,
    '________',
  ]);

  const colCheck = translateLabel('CHECK', language);
  const colItemCode = translateLabel('ITEM_CODE', language);
  const colProductDesc = translateLabel('Product Name', language);
  const colPickQty = translateLabel('PICK_QTY', language);
  const colPickerSign = translateLabel('PICKER_SIGN', language);

  autoTable(doc, {
    startY: 136,
    head: [[colCheck, '#', colItemCode, colProductDesc, colPickQty, colPickerSign]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
    },
    columnStyles: {
      0: { cellWidth: 45, halign: 'center' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 110 },
      3: { cellWidth: 210 },
      4: { cellWidth: 65, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 68, halign: 'center' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [20, 20, 20],
      lineWidth: 0.5,
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    margin: { left: leftMargin, right: pageWidth - rightMargin },
  });

  // 4. Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  const sigY = Math.max(finalY, 730);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(leftMargin, sigY, leftMargin + 210, sigY);
  doc.line(rightMargin - 210, sigY, rightMargin, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(translateLabel('PICKER_SIGNOFF', language), leftMargin, sigY + 12);
  doc.text(translateLabel('SUPERVISOR_AUDIT', language), rightMargin - 210, sigY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Picker Name & Timestamp', leftMargin, sigY + 22);
  doc.text('Supervisor Verification & Stamp', rightMargin - 210, sigY + 22);

  // 5. Running Footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 795, rightMargin, 795);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Inventory360 Enterprise ERP - Warehouse Dispatch Control Slip', leftMargin, 807);
  doc.text(`Page 1 of 1 | Printed: ${new Date().toLocaleString()}`, rightMargin, 807, { align: 'right' });

  // Download PDF
  doc.save(`Warehouse_Batch_Pick_List_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Keep printPOSlipDocument as an alias if needed
export const printPOSlipDocument = downloadPOSlipPDF;

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Helper to parse a single CSV row following RFC 4180
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      rows.push(obj);
    }
  }

  return rows;
}
