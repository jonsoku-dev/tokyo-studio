/**
 * 맵 위치 데이터 시드 스크립트
 * 사용: pnpm tsx app/features/map/scripts/seed-locations.ts
 */

import { db } from "@itcom/db/client";
import { mapLocations } from "@itcom/db/schema";

const tokyoLocations = [
	// Government - 정부 기관
	{
		category: "government",
		nameEn: "Shibuya Ward Office",
		nameJa: "渋谷区役所",
		nameKo: "시부야 구청",
		address: "1-13-9 Shibuya, Shibuya Ward, Tokyo 150-8010",
		latitude: 35.6548,
		longitude: 139.7038,
		phone: "03-3463-1211",
		hours: "08:30-17:00",
		station: "Shibuya Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "government",
		nameEn: "Shinjuku Ward Office",
		nameJa: "新宿区役所",
		nameKo: "신주쿠 구청",
		address: "1-4-1 Kasuga, Shinjuku Ward, Tokyo 160-8484",
		latitude: 35.6907,
		longitude: 139.7318,
		phone: "03-3209-1111",
		hours: "08:30-17:00",
		station: "Shinjuku Station (JR/Metro)",
		area: "tokyo",
	},
	{
		category: "government",
		nameEn: "Minato Ward Office",
		nameJa: "港区役所",
		nameKo: "미나토 구청",
		address: "1-5-25 Shibakoen, Minato Ward, Tokyo 105-8511",
		latitude: 35.6555,
		longitude: 139.7457,
		phone: "03-3578-2111",
		hours: "08:30-17:00",
		station: "Roppongi Station (Tokyo Metro)",
		area: "tokyo",
	},

	// Immigration - 이민청
	{
		category: "immigration",
		nameEn: "Tokyo Immigration Bureau",
		nameJa: "東京入管局",
		nameKo: "도쿄 이민국",
		address: "3-5-1 Konan, Minato Ward, Tokyo 108-0075",
		latitude: 35.6282,
		longitude: 139.7389,
		phone: "03-5796-7111",
		hours: "09:00-16:00",
		station: "Shinagawa Station (JR)",
		area: "tokyo",
	},

	// Banking - 은행
	{
		category: "banking",
		nameEn: "SMBC Shibuya Branch",
		nameJa: "三井住友銀行渋谷支店",
		nameKo: "SMBC 시부야 지점",
		address: "2-21-1 Shibuya, Shibuya Ward, Tokyo 150-0002",
		latitude: 35.6627,
		longitude: 139.7002,
		phone: "0120-300-333",
		hours: "09:00-15:00",
		station: "Shibuya Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "banking",
		nameEn: "MUFG Bank Shinjuku Branch",
		nameJa: "三菱UFJ銀行新宿支店",
		nameKo: "MUFG 신주쿠 지점",
		address: "5-10-2 Shinjuku, Shinjuku Ward, Tokyo 160-0022",
		latitude: 35.6895,
		longitude: 139.7084,
		phone: "0120-860-333",
		hours: "09:00-15:00",
		station: "Shinjuku Station (JR/Metro)",
		area: "tokyo",
	},
	{
		category: "banking",
		nameEn: "Mizuho Bank Ginza Branch",
		nameJa: "みずほ銀行銀座支店",
		nameKo: "미즈호 긴자 지점",
		address: "8-11-2 Ginza, Chuo Ward, Tokyo 104-0061",
		latitude: 35.6709,
		longitude: 139.7735,
		phone: "0120-110-321",
		hours: "09:00-15:00",
		station: "Ginza Station (Tokyo Metro)",
		area: "tokyo",
	},

	// Mobile Carriers - 이동통신
	{
		category: "mobile",
		nameEn: "NTT Docomo Shibuya Shop",
		nameJa: "NTTドコモ渋谷ショップ",
		nameKo: "NTT 도코모 시부야 매장",
		address: "1-12-8 Shibuya, Shibuya Ward, Tokyo 150-0002",
		latitude: 35.6591,
		longitude: 139.7051,
		phone: "0120-800-000",
		hours: "10:00-19:00",
		station: "Shibuya Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "mobile",
		nameEn: "SoftBank Shinjuku Branch",
		nameJa: "ソフトバンク新宿店",
		nameKo: "소프트뱅크 신주쿠 매장",
		address: "3-32-10 Shinjuku, Shinjuku Ward, Tokyo 160-0022",
		latitude: 35.6896,
		longitude: 139.7066,
		phone: "0800-919-0157",
		hours: "10:00-19:00",
		station: "Shinjuku Station (JR/Metro)",
		area: "tokyo",
	},
	{
		category: "mobile",
		nameEn: "au Roppongi Shop",
		nameJa: "au六本木ショップ",
		nameKo: "au 롯폰기 매장",
		address: "6-8-23 Roppongi, Minato Ward, Tokyo 106-0032",
		latitude: 35.6635,
		longitude: 139.7319,
		phone: "0077-7-111",
		hours: "10:00-19:00",
		station: "Roppongi Station (Tokyo Metro)",
		area: "tokyo",
	},

	// Housing - 주택/주거 지역
	{
		category: "housing",
		nameEn: "Shibuya Residential Area",
		nameJa: "渋谷住宅地区",
		nameKo: "시부야 주거 지역",
		address: "Shibuya Ward, Tokyo",
		latitude: 35.6648,
		longitude: 139.7029,
		phone: null,
		hours: null,
		station: "Shibuya Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "housing",
		nameEn: "Nakameguro Residential Area",
		nameJa: "中目黒住宅地区",
		nameKo: "나카메구로 주거 지역",
		address: "Meguro Ward, Tokyo",
		latitude: 35.6444,
		longitude: 139.7149,
		phone: null,
		hours: null,
		station: "Nakameguro Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "housing",
		nameEn: "Ebisu Residential Area",
		nameJa: "恵比寿住宅地区",
		nameKo: "에비스 주거 지역",
		address: "Shibuya Ward, Tokyo",
		latitude: 35.6453,
		longitude: 139.7149,
		phone: null,
		hours: null,
		station: "Ebisu Station (JR/Tokyo Metro)",
		area: "tokyo",
	},

	// Shopping - 편의점 (멀티복합기)
	{
		category: "shopping",
		nameEn: "7-Eleven Shibuya Crossing",
		nameJa: "セブンイレブン渋谷センター街",
		nameKo: "7-일레븐 시부야 교차로",
		address: "2-29-5 Shibuya, Shibuya Ward, Tokyo 150-0002",
		latitude: 35.6592,
		longitude: 139.7019,
		phone: "03-3496-2711",
		hours: "24:00",
		station: "Shibuya Station (Tokyo Metro)",
		area: "tokyo",
	},
	{
		category: "shopping",
		nameEn: "Family Mart Shinjuku Station",
		nameJa: "ファミリーマート新宿駅前",
		nameKo: "패밀리마트 신주쿠 역전",
		address: "3-38-1 Shinjuku, Shinjuku Ward, Tokyo 160-0022",
		latitude: 35.6896,
		longitude: 139.7024,
		phone: "03-3341-5511",
		hours: "24:00",
		station: "Shinjuku Station (JR/Metro)",
		area: "tokyo",
	},
	{
		category: "shopping",
		nameEn: "Lawson Roppongi",
		nameJa: "ローソン六本木",
		nameKo: "로손 롯폰기",
		address: "6-10-1 Roppongi, Minato Ward, Tokyo 106-0032",
		latitude: 35.6655,
		longitude: 139.7297,
		phone: "03-3402-1100",
		hours: "24:00",
		station: "Roppongi Station (Tokyo Metro)",
		area: "tokyo",
	},
];

async function seedLocations() {
	console.log("🌱 시작: 위치 데이터 시드...");

	try {
		// 기존 데이터 확인
		const existing = await db.query.mapLocations.findMany({
			limit: 1,
		});

		if (existing.length > 0) {
			console.log("⚠️  이미 위치 데이터가 존재합니다. 스킵합니다.");
			return;
		}

		// 데이터 삽입
		const result = await db.insert(mapLocations).values(
			tokyoLocations.map((loc) => ({
				...loc,
				latitude: loc.latitude.toString(),
				longitude: loc.longitude.toString(),
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
		);

		console.log(`✅ ${tokyoLocations.length}개의 위치 데이터가 성공적으로 삽입되었습니다.`);
	} catch (error) {
		console.error("❌ 시드 데이터 삽입 실패:", error);
		process.exit(1);
	}
}

seedLocations()
	.then(() => {
		console.log("✨ 완료!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
