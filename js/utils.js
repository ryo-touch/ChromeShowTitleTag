/**
 * HTML特殊文字をエンティティに変換する関数
 * @param {string} string - 変換する文字列
 * @param {number|string|Array} quoteStyle - クォートの処理方法
 * @param {boolean} doubleEncode - 既存のエンティティを再エンコードするかどうか
 * @returns {string} エスケープされた文字列
 */
function htmlSpecialChars(string, quoteStyle = 2, doubleEncode = true) {
  // 定数定義
  const QUOTE_STYLES = {
    ENT_NOQUOTES: 0,      // クォートをエスケープしない
    ENT_HTML_QUOTE_SINGLE: 1, // シングルクォートのみエスケープ
    ENT_HTML_QUOTE_DOUBLE: 2, // ダブルクォートのみエスケープ
    ENT_COMPAT: 2,        // ダブルクォートのみエスケープ（互換性のため）
    ENT_QUOTES: 3,        // シングル・ダブル両方エスケープ
  };

  // 入力を文字列に変換
  string = String(string);

  // エスケープ処理のマッピング
  const entities = {
    '&': doubleEncode ? '&amp;' : '&',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  // クォートスタイルの解析
  let finalQuoteStyle = 0;

  if (typeof quoteStyle === 'number') {
    finalQuoteStyle = quoteStyle;
  } else if (Array.isArray(quoteStyle) || typeof quoteStyle === 'string') {
    // 配列または文字列の場合、ビットOR演算で組み合わせる
    const styles = Array.isArray(quoteStyle) ? quoteStyle : [quoteStyle];

    for (const style of styles) {
      if (QUOTE_STYLES[style] !== undefined) {
        finalQuoteStyle |= QUOTE_STYLES[style];
      }
    }
  }

  // 変換ルールの適用
  let result = string
    .replace(/[&<>]/g, char => entities[char]);

  // クォートスタイルに応じた処理
  if (!(finalQuoteStyle & QUOTE_STYLES.ENT_NOQUOTES)) {
    if (finalQuoteStyle & QUOTE_STYLES.ENT_HTML_QUOTE_DOUBLE) {
      result = result.replace(/"/g, entities['"']);
    }

    if (finalQuoteStyle & QUOTE_STYLES.ENT_HTML_QUOTE_SINGLE) {
      result = result.replace(/'/g, entities["'"]);
    }
  }

  return result;
};

// コンテンツスクリプトでimportなしで使えるようにグローバルにも公開
if (typeof window !== 'undefined') {
  window.htmlSpecialChars = htmlSpecialChars;
}
