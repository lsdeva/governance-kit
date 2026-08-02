/*
 * Minimal .xlsx writer — no dependencies, no CDN, no build step.
 *
 * An .xlsx is a ZIP of XML parts. We build the ZIP by hand using STORED
 * (uncompressed) entries, which needs only a CRC32 implementation — no DEFLATE,
 * no third-party library to vendor, audit, or keep patched. Registers are a few
 * hundred rows of text, so the size cost of not compressing is irrelevant.
 *
 * Produces a genuine Excel file with:
 *   - a styled, frozen header row
 *   - column widths
 *   - dropdown (data validation) columns
 *   - autofilter
 *
 * Exposed as window.GKXlsx.build(sheets) -> Blob
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------- CRC32

  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function utf8(str) {
    return new TextEncoder().encode(str);
  }

  // ------------------------------------------------------------------ ZIP

  function zip(files) {
    // files: [{name, data:Uint8Array}]
    var chunks = [];
    var central = [];
    var offset = 0;

    files.forEach(function (f) {
      var nameBytes = utf8(f.name);
      var crc = crc32(f.data);
      var size = f.data.length;

      var local = new Uint8Array(30 + nameBytes.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);   // local file header signature
      dv.setUint16(4, 20, true);           // version needed
      dv.setUint16(6, 0, true);            // flags
      dv.setUint16(8, 0, true);            // method 0 = STORED
      dv.setUint16(10, 0, true);           // mod time
      dv.setUint16(12, 0x21, true);        // mod date (1 Jan 1980)
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);        // compressed size
      dv.setUint32(22, size, true);        // uncompressed size
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);           // extra length
      local.set(nameBytes, 30);

      chunks.push(local, f.data);

      var cd = new Uint8Array(46 + nameBytes.length);
      var cdv = new DataView(cd.buffer);
      cdv.setUint32(0, 0x02014b50, true);  // central directory signature
      cdv.setUint16(4, 20, true);          // version made by
      cdv.setUint16(6, 20, true);          // version needed
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);          // STORED
      cdv.setUint16(12, 0, true);
      cdv.setUint16(14, 0x21, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push(cd);

      offset += local.length + size;
    });

    var centralSize = central.reduce(function (n, c) { return n + c.length; }, 0);
    var end = new Uint8Array(22);
    var edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, offset, true);

    return new Blob(chunks.concat(central, [end]),
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }

  // ------------------------------------------------------------------ XML

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
      // Strip control characters Excel rejects outright.
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  }

  function colLetter(n) {
    var s = "";
    while (n > 0) {
      var m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = (n - m - 1) / 26;
    }
    return s;
  }

  function isNumeric(v) {
    return v !== "" && v !== null && v !== undefined &&
      typeof v !== "boolean" && !isNaN(v) && isFinite(v) &&
      // Leave IDs like "AI-001" and dates alone.
      /^-?\d+(\.\d+)?$/.test(String(v).trim());
  }

  function sheetXml(sheet) {
    var cols = sheet.columns;
    var rows = sheet.rows || [];
    var out = [];

    out.push('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
    out.push('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">');

    out.push("<cols>");
    cols.forEach(function (c, i) {
      out.push('<col min="' + (i + 1) + '" max="' + (i + 1) +
        '" width="' + (c.width || 18) + '" customWidth="1"/>');
    });
    out.push("</cols>");

    out.push('<sheetViews><sheetView workbookViewId="0">' +
      '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
      "</sheetView></sheetViews>");

    out.push("<sheetData>");

    // Header
    out.push('<row r="1">');
    cols.forEach(function (c, i) {
      out.push('<c r="' + colLetter(i + 1) + '1" t="inlineStr" s="1">' +
        "<is><t>" + esc(c.name) + "</t></is></c>");
    });
    out.push("</row>");

    rows.forEach(function (row, ri) {
      var r = ri + 2;
      out.push('<row r="' + r + '">');
      cols.forEach(function (c, ci) {
        var ref = colLetter(ci + 1) + r;
        var v = row[ci];
        if (v === "" || v === null || v === undefined) return;
        if (typeof v === "string" && v.charAt(0) === "=") {
          out.push('<c r="' + ref + '"><f>' + esc(v.slice(1)) + "</f></c>");
        } else if (isNumeric(v)) {
          out.push('<c r="' + ref + '"><v>' + Number(v) + "</v></c>");
        } else {
          out.push('<c r="' + ref + '" t="inlineStr"><is><t>' +
            esc(v) + "</t></is></c>");
        }
      });
      out.push("</row>");
    });
    out.push("</sheetData>");

    var last = Math.max(rows.length + 1, 2);
    out.push('<autoFilter ref="A1:' + colLetter(cols.length) + last + '"/>');

    var dvs = cols.map(function (c, i) {
      if (!c.choices || !c.choices.length) return null;
      var letter = colLetter(i + 1);
      // Excel rejects a list formula over 255 characters.
      var joined = c.choices.join(",");
      if (joined.length > 250) return null;
      return '<dataValidation type="list" allowBlank="1" showInputMessage="1"' +
        ' showErrorMessage="1" sqref="' + letter + "2:" + letter + (last + 200) + '">' +
        "<formula1>&quot;" + esc(joined) + "&quot;</formula1></dataValidation>";
    }).filter(Boolean);

    if (dvs.length) {
      out.push('<dataValidations count="' + dvs.length + '">');
      out.push(dvs.join(""));
      out.push("</dataValidations>");
    }

    out.push("</worksheet>");
    return out.join("");
  }

  var STYLES =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2">' +
    '<font><sz val="11"/><name val="Calibri"/></font>' +
    '<font><sz val="11"/><color rgb="FFFFFFFF"/><b/><name val="Calibri"/></font>' +
    "</fonts>" +
    '<fills count="3">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF3F51B5"/>' +
    '<bgColor indexed="64"/></patternFill></fill>' +
    "</fills>" +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1">' +
    '<alignment vertical="top" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1"' +
    ' applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
    "</cellXfs>" +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    "</styleSheet>";

  function build(sheets) {
    var files = [];

    var types = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
      '<Default Extension="xml" ContentType="application/xml"/>',
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'];
    sheets.forEach(function (s, i) {
      types.push('<Override PartName="/xl/worksheets/sheet' + (i + 1) +
        '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>');
    });
    types.push("</Types>");
    files.push({ name: "[Content_Types].xml", data: utf8(types.join("")) });

    files.push({
      name: "_rels/.rels",
      data: utf8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>")
    });

    var wb = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"',
      ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
      "<sheets>"];
    sheets.forEach(function (s, i) {
      // Excel forbids : \ / ? * [ ] in sheet names and caps them at 31 chars.
      var nm = String(s.name || ("Sheet" + (i + 1)))
        .replace(/[:\\\/?*\[\]]/g, " ").slice(0, 31);
      wb.push('<sheet name="' + esc(nm) + '" sheetId="' + (i + 1) +
        '" r:id="rId' + (i + 1) + '"/>');
    });
    wb.push("</sheets></workbook>");
    files.push({ name: "xl/workbook.xml", data: utf8(wb.join("")) });

    var rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'];
    sheets.forEach(function (s, i) {
      rels.push('<Relationship Id="rId' + (i + 1) +
        '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"' +
        ' Target="worksheets/sheet' + (i + 1) + '.xml"/>');
    });
    rels.push('<Relationship Id="rId' + (sheets.length + 1) +
      '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"' +
      ' Target="styles.xml"/>');
    rels.push("</Relationships>");
    files.push({ name: "xl/_rels/workbook.xml.rels", data: utf8(rels.join("")) });

    files.push({ name: "xl/styles.xml", data: utf8(STYLES) });

    sheets.forEach(function (s, i) {
      files.push({
        name: "xl/worksheets/sheet" + (i + 1) + ".xml",
        data: utf8(sheetXml(s))
      });
    });

    return zip(files);
  }

  window.GKXlsx = { build: build, colLetter: colLetter };
})();
