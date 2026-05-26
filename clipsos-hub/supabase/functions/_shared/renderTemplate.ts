// renderTemplate.ts — Deno twin of src/lib/email/renderTemplate.ts.
// Keep this file in sync with the UI version so the preview always
// matches what gets sent.

export interface EmailTemplateInput {
  edit_mode: "visual" | "html" | string;
  subject: string;
  preview_text?: string | null;
  headline?: string | null;
  body?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  body_html: string;
}

export interface MasterTemplate {
  wrapper_html: string;
  logo_url: string;
  accent_color: string;
  footer_html: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

export function interpolate(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    return vars[key] ?? `{{${key}}}`;
  });
}

/**
 * Build the CONTENT block from structured fields (visual mode).
 * This is ONLY the inner content — headline, body, CTA — not the full
 * HTML document. The full document shell comes from the master template.
 */
export function buildVisualContent(input: EmailTemplateInput, accentColor = "#000000"): string {
  const headline = input.headline ?? "";
  const body = (input.body ?? "").replace(/\n/g, "<br/>");
  const cta =
    input.cta_text && input.cta_url
      ? `<a href="${input.cta_url}" style="display:inline-block;background:${accentColor};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${input.cta_text}</a>`
      : "";
  const preview = input.preview_text
    ? `<div style="display:none;max-height:0;overflow:hidden;">${input.preview_text}</div>`
    : "";

  return `${preview}${headline ? `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:#09090b;">${headline}</h1>` : ""}${body ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">${body}</p>` : ""}${cta ? `<div style="margin:24px 0 8px;">${cta}</div>` : ""}`;
}

/**
 * Apply the master template wrapper around inner content.
 * Replaces {{CONTENT}}, {{LOGO_BLOCK}}, {{FOOTER_HTML}}, and the
 * accent color in the wrapper.
 */
export function applyMasterWrapper(contentHtml: string, master: MasterTemplate): string {
  const logoBlock = master.logo_url
    ? `<img src="${master.logo_url}" alt="Logo" style="max-height:40px;max-width:200px;" />`
    : "";

  let html = master.wrapper_html;
  html = html.replace(/\{\{CONTENT\}\}/g, contentHtml);
  html = html.replace(/\{\{LOGO_BLOCK\}\}/g, logoBlock);
  html = html.replace(/\{\{FOOTER_HTML\}\}/g, master.footer_html);
  html = html.replace(/\{\{ACCENT_COLOR\}\}/g, master.accent_color);

  return html;
}

/**
 * Legacy wrapVisual — builds a full standalone HTML document.
 * Used as fallback when no master template exists.
 */
export function wrapVisual(input: EmailTemplateInput): string {
  const headline = input.headline ?? "";
  const body = (input.body ?? "").replace(/\n/g, "<br/>");
  const cta =
    input.cta_text && input.cta_url
      ? `<a href="${input.cta_url}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${input.cta_text}</a>`
      : "";
  const preview = input.preview_text
    ? `<div style="display:none;max-height:0;overflow:hidden;">${input.preview_text}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${input.subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    ${preview}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:40px 32px 24px;">
                ${headline ? `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:#09090b;">${headline}</h1>` : ""}
                ${body ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">${body}</p>` : ""}
                ${cta ? `<div style="margin:24px 0 8px;">${cta}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;">
                Sent by ClipsOS · This is an automated message
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Render an individual template into final {subject, html}.
 * Backward-compatible: works without a master template.
 */
export function renderTemplate(
  template: EmailTemplateInput,
  vars: Record<string, string> = {},
): RenderedEmail {
  const baseHtml = template.edit_mode === "html" ? template.body_html : wrapVisual(template);

  return {
    subject: interpolate(template.subject, vars),
    html: interpolate(baseHtml, vars),
  };
}

/**
 * Render with master template wrapper.
 * Builds inner content, injects into the master shell, then interpolates variables.
 */
export function renderWithMaster(
  template: EmailTemplateInput,
  master: MasterTemplate,
  vars: Record<string, string> = {},
): RenderedEmail {
  // Build the inner content
  const contentHtml =
    template.edit_mode === "html"
      ? template.body_html
      : buildVisualContent(template, master.accent_color);

  // Wrap in master
  const fullHtml = applyMasterWrapper(contentHtml, master);

  return {
    subject: interpolate(template.subject, vars),
    html: interpolate(fullHtml, vars),
  };
}
