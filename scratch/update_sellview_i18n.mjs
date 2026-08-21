import fs from 'fs';

const i18nPath = 'lib/i18n.ts';
let code = fs.readFileSync(i18nPath, 'utf8');

const extraKeys = {
  en: {
    select_receipt_format: 'Select Receipt Paper Format',
    format_80mm_short_desc: 'Standard POS',
    format_58mm_short_desc: 'Mobile Thermal',
    format_a4_short_desc: 'Full Invoice',
    auto_print_receipts: 'Auto-Print Receipts',
    auto_print_desc: 'Automatically trigger print dialog when sale completes',
    print_test_btn: 'Print Test'
  },
  es: {
    select_receipt_format: 'Seleccionar Formato de Papel',
    format_80mm_short_desc: 'TPV Estándar',
    format_58mm_short_desc: 'Térmico Móvil',
    format_a4_short_desc: 'Factura Completa',
    auto_print_receipts: 'Impresión Automática',
    auto_print_desc: 'Abrir diálogo de impresión automáticamente al cobrar',
    print_test_btn: 'Imprimir Prueba'
  },
  fr: {
    select_receipt_format: 'Sélectionner le Format du Papier',
    format_80mm_short_desc: 'Caisse Standard',
    format_58mm_short_desc: 'Thermique Mobile',
    format_a4_short_desc: 'Facture Complète',
    auto_print_receipts: 'Impression Automatique',
    auto_print_desc: 'Ouvrir automatiquement l’impression après chaque vente',
    print_test_btn: 'Imprimer Test'
  },
  de: {
    select_receipt_format: 'Beleg-Druckformat auswählen',
    format_80mm_short_desc: 'Standard-Kasse',
    format_58mm_short_desc: 'Mobiler Thermobon',
    format_a4_short_desc: 'Vollständige Rechnung',
    auto_print_receipts: 'Automatischer Bondruck',
    auto_print_desc: 'Druckdialog nach Abschluss des Verkaufs automatisch öffnen',
    print_test_btn: 'Testdruck'
  },
  hi: {
    select_receipt_format: 'रसीद पेपर प्रारूप चुनें',
    format_80mm_short_desc: 'मानक पीओएस',
    format_58mm_short_desc: 'मोबाइल थर्मल',
    format_a4_short_desc: 'पूर्ण इनवॉयस',
    auto_print_receipts: 'स्वचालित रसीद प्रिंटिंग',
    auto_print_desc: 'बिक्री पूरी होने पर प्रिंट संवाद स्वतः खोलें',
    print_test_btn: 'टेस्ट प्रिंट करें'
  },
  ja: {
    select_receipt_format: 'レシート用紙形式を選択',
    format_80mm_short_desc: '標準POSロール',
    format_58mm_short_desc: 'モバイルサーマル',
    format_a4_short_desc: 'フル請求書',
    auto_print_receipts: '自動レシート印刷',
    auto_print_desc: '会計完了時に印刷ダイアログを自動表示',
    print_test_btn: 'テスト印刷'
  },
  zh: {
    select_receipt_format: '选择单据打印尺寸与格式',
    format_80mm_short_desc: '标准收银卷纸',
    format_58mm_short_desc: '便携蓝牙小票',
    format_a4_short_desc: '完整商业发票',
    auto_print_receipts: '结账后自动出单',
    auto_print_desc: '每笔销售结算完成后自动唤起系统打印',
    print_test_btn: '打印测试单'
  },
  ar: {
    select_receipt_format: 'اختر قياس ورق الطباعة',
    format_80mm_short_desc: 'كاشير قياسي',
    format_58mm_short_desc: 'حراري محمول',
    format_a4_short_desc: 'فاتورة شاملة',
    auto_print_receipts: 'طباعة تلقائية للإيصال',
    auto_print_desc: 'فتح نافذة الطباعة تلقائياً فور إتمام البيع',
    print_test_btn: 'طباعة تجريبية'
  },
  pt: {
    select_receipt_format: 'Selecionar Formato do Cupom',
    format_80mm_short_desc: 'PDV Padrão',
    format_58mm_short_desc: 'Térmico Móvel',
    format_a4_short_desc: 'Nota Completa',
    auto_print_receipts: 'Impressão Automática de Cupons',
    auto_print_desc: 'Abrir diálogo de impressão automaticamente ao concluir a venda',
    print_test_btn: 'Imprimir Teste'
  },
  it: {
    select_receipt_format: 'Seleziona Formato Carta Scontrino',
    format_80mm_short_desc: 'POS Standard',
    format_58mm_short_desc: 'Termico Portatile',
    format_a4_short_desc: 'Fattura Completa',
    auto_print_receipts: 'Stampa Automatica Scontrini',
    auto_print_desc: 'Apri automaticamente la finestra di stampa al termine della vendita',
    print_test_btn: 'Stampa Prova'
  },
  ru: {
    select_receipt_format: 'Выберите формат чековой бумаги',
    format_80mm_short_desc: 'Стандартный чек',
    format_58mm_short_desc: 'Мобильный термочек',
    format_a4_short_desc: 'Полная накладная',
    auto_print_receipts: 'Автоматическая печать чека',
    auto_print_desc: 'Автоматически открывать окно печати после проведения оплаты',
    print_test_btn: 'Пробная печать'
  }
};

for (const [lang, keys] of Object.entries(extraKeys)) {
  const langKey = `${lang}: {`;
  const langIndex = code.indexOf(langKey);
  if (langIndex === -1) continue;

  const nextLangIndex = code.indexOf(`\n  },`, langIndex);
  if (nextLangIndex === -1) continue;

  let additions = '\n';
  for (const [k, v] of Object.entries(keys)) {
    const existingCheck = code.slice(langIndex, nextLangIndex);
    if (!existingCheck.includes(`    ${k}:`)) {
      additions += `    ${k}: ${JSON.stringify(v)},\n`;
    }
  }

  code = code.slice(0, nextLangIndex) + additions.slice(0, -1) + code.slice(nextLangIndex);
}

fs.writeFileSync(i18nPath, code, 'utf8');
console.log('Successfully updated lib/i18n.ts with extra POS modal keys!');
