import { Archive, CheckCircle2, Lock, type LucideIcon } from "lucide-react";
import { z } from "zod";

export const SettlementTemplateStatusSchema = z.enum([
	"draft",
	"published",
	"archived",
]);

export type SettlementTemplateStatus = z.infer<
	typeof SettlementTemplateStatusSchema
>;

export const TEMPLATE_STATUS: Record<string, SettlementTemplateStatus> = {
	DRAFT: "draft",
	PUBLISHED: "published",
	ARCHIVED: "archived",
};

export interface StatusConfig {
	label: string;
	icon: LucideIcon;
	color: string;
	badgeVariant: "neutral" | "primary" | "secondary" | "outline"; // generic usage
	dotColor: string;
}

export const TEMPLATE_STATUS_CONFIG: Record<
	SettlementTemplateStatus,
	StatusConfig
> = {
	draft: {
		label: "비공개 (Draft)",
		icon: Lock,
		color: "text-gray-500",
		badgeVariant: "neutral",
		dotColor: "bg-gray-400",
	},
	published: {
		label: "공개 (Published)",
		icon: CheckCircle2,
		color: "text-green-600",
		badgeVariant: "primary",
		dotColor: "bg-green-500",
	},
	archived: {
		label: "보관 (Archived)",
		icon: Archive,
		color: "text-orange-500",
		badgeVariant: "secondary",
		dotColor: "bg-orange-400",
	},
};
