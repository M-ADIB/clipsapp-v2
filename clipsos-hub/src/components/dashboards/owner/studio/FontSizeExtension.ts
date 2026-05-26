/**
 * FontSize — Custom TipTap extension for font-size support.
 *
 * Adds `fontSize` attribute to the `textStyle` mark and exposes
 * `setFontSize` / `unsetFontSize` commands.
 *
 * Usage:
 *   import { FontSize } from "./FontSizeExtension";
 *   // …extensions: [TextStyle, FontSize, …]
 *   editor.chain().focus().setFontSize("18px").run();
 */
import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /** Set the font size (e.g. "14px", "1.2em"). */
      setFontSize: (size: string) => ReturnType;
      /** Remove font-size override, reverting to default. */
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});
