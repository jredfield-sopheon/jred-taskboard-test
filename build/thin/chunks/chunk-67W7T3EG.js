/*!
 *
 * Bryntum TaskBoard 5.6.2
 *
 * Copyright(c) 2023 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import {
  PdfExport,
  PrintMixin_default
} from "./chunk-6RG3ITZU.js";
import {
  GridFeatureManager
} from "./chunk-GGOYEX2W.js";
import {
  __publicField
} from "./chunk-MZVS5JQA.js";

// ../Grid/lib/Grid/feature/export/Print.js
var Print = class extends PrintMixin_default(PdfExport) {
};
/**
 * @hideConfigs clientURL, exportServer, fetchOptions, fileFormat, fileName, openAfterExport, openInNewTab, sendAsBinary
 */
/**
 * @hideFunctions processExportContent, receiveExportContent, showExportDialog
 */
__publicField(Print, "$name", "Print");
Print._$name = "Print";
GridFeatureManager.registerFeature(Print, false, "Grid");

export {
  Print
};
//# sourceMappingURL=chunk-67W7T3EG.js.map
