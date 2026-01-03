import type { SVGProps } from "react";

export function IconHome(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-home"
			{...props}
		>
			<title id="icon-home">홈</title>
			<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			<polyline points="9 22 9 12 15 12 15 22" />
		</svg>
	);
}

export function IconRoadmap(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-roadmap"
			{...props}
		>
			<title id="icon-roadmap">로드맵</title>
			<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
			<line x1="8" y1="2" x2="8" y2="18" />
			<line x1="16" y1="6" x2="16" y2="22" />
		</svg>
	);
}

export function IconApplications(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-applications"
			{...props}
		>
			<title id="icon-applications">지원 관리</title>
			<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
			<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
		</svg>
	);
}

export function IconDocuments(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-documents"
			{...props}
		>
			<title id="icon-documents">서류 보관소</title>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
			<polyline points="10 9 9 9 8 9" />
		</svg>
	);
}

export function IconMentoring(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-mentoring"
			{...props}
		>
			<title id="icon-mentoring">멘토링</title>
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}

export function IconCommunity(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-community"
			{...props}
		>
			<title id="icon-community">커뮤니티</title>
			<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
		</svg>
	);
}

export function IconSettlement(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-labelledby="icon-settlement"
			{...props}
		>
			<title id="icon-settlement">정착 가이드</title>
			<polyline points="9 11 12 14 22 4" />
			<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
		</svg>
	);
}
