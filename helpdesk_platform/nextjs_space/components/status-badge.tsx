"use client";

import { TicketStatus, statusLabels, statusColors } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn(statusColors[status] ?? "bg-gray-100 text-gray-800")}>
      {statusLabels[status] ?? status}
    </Badge>
  );
}
