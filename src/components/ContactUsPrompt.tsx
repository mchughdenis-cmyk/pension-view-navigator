import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContactForm } from "@/components/marketing/ContactForm";
import { MessageSquare } from "lucide-react";

export function ContactUsPrompt() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-4 right-4 z-40 shadow-lg rounded-full h-12 px-4 gap-2"
        aria-label="Contact us"
      >
        <MessageSquare className="h-4 w-4" />
        Contact us
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get in touch</DialogTitle>
            <DialogDescription>
              Send us a message and our team will respond within one business day.
            </DialogDescription>
          </DialogHeader>
          <ContactForm />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContactUsPrompt;
