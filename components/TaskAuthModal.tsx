import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ShieldAlert, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface TaskAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  taskDescription?: string;
}

export function TaskAuthModal({
  isOpen,
  onClose,
  taskTitle = "Authentication Required to Attempt Tasks",
  taskDescription = "You are currently browsing as a guest. Please Sign In or Create an Official Account to access diagnostic assessments, generate personal competency reports, or record your learning progress.",
}: TaskAuthModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-border bg-card shadow-elevated">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <ShieldAlert className="size-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {taskTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {taskDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
          <p className="font-semibold text-secondary mb-1">Why Sign In?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
            <li>Personalized skill gap scoring mapped to your MoSPI designation</li>
            <li>Official diagnostic test evaluation & certification badges</li>
            <li>Sync learning milestones directly with iGOT Karmayogi</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Continue Browsing
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              navigate("/signup");
            }}
            className="text-xs gap-1.5"
          >
            <UserPlus className="size-3.5" /> Sign Up
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5"
          >
            <LogIn className="size-3.5" /> Sign In <ArrowRight className="size-3" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
