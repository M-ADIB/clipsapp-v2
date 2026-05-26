import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--surface-card)",
          "--normal-border": "var(--border-strong)",
          "--normal-text": "var(--foreground-strong)",
          "--success-bg": "var(--surface-card)",
          "--success-border": "var(--status-success)",
          "--success-text": "var(--foreground-strong)",
          "--error-bg": "var(--surface-card)",
          "--error-border": "var(--status-danger)",
          "--error-text": "var(--foreground-strong)",
          "--warning-bg": "var(--surface-card)",
          "--warning-border": "var(--status-warning)",
          "--warning-text": "var(--foreground-strong)",
          "--info-bg": "var(--surface-card)",
          "--info-border": "var(--status-info)",
          "--info-text": "var(--foreground-strong)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !shadow-2xl !backdrop-blur-sm !font-sans !text-[13px]",
          title: "!font-medium !text-[13px]",
          description: "!text-[12px] !opacity-70",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-lg !text-xs !font-semibold !px-3 !py-1.5",
          cancelButton:
            "!bg-surface-raised !text-foreground-muted !rounded-lg !text-xs !font-medium !px-3 !py-1.5",
          closeButton:
            "!bg-surface-raised !text-foreground-muted !border-border hover:!bg-surface-input hover:!text-foreground",
          success: "!border-l-4 !border-l-[var(--status-success)]",
          error: "!border-l-4 !border-l-[var(--status-danger)]",
          warning: "!border-l-4 !border-l-[var(--status-warning)]",
          info: "!border-l-4 !border-l-[var(--status-info)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
