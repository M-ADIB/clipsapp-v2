import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Video } from "lucide-react";
import { toast } from "sonner";

interface GuestGateDialogProps {
  onComplete: (info: { name: string; email: string }) => void;
  videoTitle?: string;
}

export function GuestGateDialog({ onComplete, videoTitle = "this video" }: GuestGateDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("guest_reviewer_name", trimmedName);
      localStorage.setItem("guest_reviewer_email", trimmedEmail);
      toast.success(`Welcome, ${trimmedName}!`);
      onComplete({ name: trimmedName, email: trimmedEmail });
    } catch (err) {
      toast.error("Failed to save reviewer details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="[&>button]:hidden max-w-md border-border/80 bg-background/95 backdrop-blur-md shadow-2xl z-[250] sm:rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Video className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Review Invitation
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Please enter your name and email to access and comment on {videoTitle}.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="guest-name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Your Name
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/75">
                <User className="h-4 w-4" />
              </span>
              <Input
                id="guest-name"
                type="text"
                placeholder="e.g. John Doe"
                className="pl-9 h-10 border-border/50 bg-muted/20 focus:bg-background transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="guest-email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/75">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                id="guest-email"
                type="email"
                placeholder="e.g. john@example.com"
                className="pl-9 h-10 border-border/50 bg-muted/20 focus:bg-background transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-medium transition-all shadow-md active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Accessing..." : "Access Video Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
