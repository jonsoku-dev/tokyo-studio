import {
	Briefcase,
	CheckSquare,
	FileText,
	Home,
	Map as MapIcon,
	MessageSquare,
	Users,
} from "lucide-react";

export const NAVIGATION_ITEMS = [
	{ name: "Home", href: "/", icon: Home },
	{ name: "My Roadmap", href: "/roadmap", icon: MapIcon },
	{ name: "Pipeline", href: "/pipeline", icon: Briefcase },
	{ name: "Documents", href: "/documents", icon: FileText },
	{ name: "Mentoring", href: "/mentoring", icon: Users },
	{ name: "게시판", href: "/communities", icon: MessageSquare },
	{ name: "Settle Tokyo", href: "/settlement", icon: CheckSquare },
] as const;
