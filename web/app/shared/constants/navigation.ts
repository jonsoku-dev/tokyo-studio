import {
	IconApplications,
	IconCommunity,
	IconDocuments,
	IconHome,
	IconMentoring,
	IconRoadmap,
	IconSettlement,
} from "../components/icons/NavigationIcons";

export const NAVIGATION_ITEMS = [
	{ name: "홈", href: "/", icon: IconHome },
	{ name: "로드맵", href: "/roadmap", icon: IconRoadmap },
	{ name: "지원 관리", href: "/applications", icon: IconApplications },
	{ name: "멘토링", href: "/mentoring", icon: IconMentoring },
	{ name: "커뮤니티", href: "/communities", icon: IconCommunity },
	{ name: "정착 가이드", href: "/settlement", icon: IconSettlement },
	{ name: "서류 보관소", href: "/documents", icon: IconDocuments },
] as const;
