import type { WidgetLayout } from "@itcom/db/schema";
import { Code2, Zap } from "lucide-react";
import { Link } from "react-router";
import type { WidgetData } from "../../types/widget-data.types";

interface SkillRadarWidgetProps {
	size: WidgetLayout["size"];
	widgetData: WidgetData;
}

// 스킬 레벨 색상
const getLevelColor = (level: number) => {
	if (level >= 80) return "bg-green-500";
	if (level >= 60) return "bg-blue-500";
	if (level >= 40) return "bg-yellow-500";
	return "bg-gray-400";
};

/**
 * Skill Radar Widget (Phase 3B)
 * 기술 스택 시각화
 */
export default function SkillRadarWidget({
	size: _size,
	widgetData,
}: SkillRadarWidgetProps) {
	const { skills, topSkills } = widgetData.skillRadar;

	if (skills.length === 0) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
					<Code2 className="h-7 w-7 text-primary-600" />
				</div>
				<div>
					<p className="font-medium text-gray-900">스킬을 등록해주세요</p>
					<p className="mt-1 text-gray-500 text-sm">
						보유 기술 스택을 추가하면 분석됩니다
					</p>
				</div>
				<Link
					to="/onboarding"
					className="inline-block rounded-lg bg-primary-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary-700"
				>
					스킬 등록하기 →
				</Link>
			</div>
		);
	}

	const maxSkills = _size === "compact" ? 3 : 6;
	const displaySkills = skills.slice(0, maxSkills);

	return (
		<div className="space-y-4">
			{/* 상위 스킬 태그 */}
			{topSkills.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{topSkills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 font-medium text-primary-700 text-sm"
						>
							<Zap className="h-3 w-3" />
							{skill}
						</span>
					))}
				</div>
			)}

			{/* 스킬 바 */}
			<div className="space-y-3">
				{displaySkills.map((skill) => (
					<div key={skill.name}>
						<div className="mb-1 flex items-center justify-between">
							<span className="text-gray-700 text-sm">{skill.name}</span>
							<span className="font-medium text-gray-500 text-xs">
								{skill.level}%
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-gray-100">
							<div
								className={`h-full rounded-full transition-all duration-500 ${getLevelColor(skill.level)}`}
								style={{ width: `${skill.level}%` }}
							/>
						</div>
					</div>
				))}
			</div>

			{/* 더보기 (Expanded) */}
			{_size === "expanded" && skills.length > maxSkills && (
				<Link
					to="/profile/skills"
					className="block text-center font-medium text-primary-600 text-sm hover:text-primary-700"
				>
					모든 스킬 보기 →
				</Link>
			)}
		</div>
	);
}
