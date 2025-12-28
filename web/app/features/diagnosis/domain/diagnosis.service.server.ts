import { db } from "~/shared/db/client.server";
import { profiles } from "~/shared/db/schema";
import { eq } from "drizzle-orm";
import { type InsertProfile, InsertProfileSchema } from "./diagnosis.types";

export const diagnosisService = {
    async createProfile(data: InsertProfile) {
        return await db.insert(profiles).values(data).returning();
    },

    async getProfile(userId: string) {
        return await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId)
        });
    },

    async updateProfile(userId: string, data: Partial<InsertProfile>) {
        return await db.update(profiles)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(profiles.userId, userId))
            .returning();
    },

    calculateRecommendations(profile: InsertProfile) {
        const recommendations = [];
        const { jpLevel, enLevel, jobFamily, level } = profile;
        const years = 1; // Default or derived from level

        // 1. Language Strategy
        let langStrategy = "";
        if (["N1", "N2", "Native"].includes(jpLevel)) {
            langStrategy = "Direct_JP";
            recommendations.push({
                title: "Direct Application (Japanese Companies)",
                type: "channel",
                description: "Your Japanese level allows you to compete with local candidates. Apply directly to companies using Wantedly or Green.",
                tags: ["Wantedly", "Green", "Direct"]
            });
        } else if (["Business", "Native"].includes(enLevel)) {
            langStrategy = "Global_EN";
            recommendations.push({
                title: "Global/English-First Companies",
                type: "channel",
                description: "Focus on Rakuten, LINE, Mercari, and startups that operate in English.",
                tags: ["LinkedIn", "Tokyodev", "Japan Dev"]
            });
        } else {
            langStrategy = "Agent_KR";
            recommendations.push({
                title: "Korean Recruitment Agents",
                type: "channel",
                description: "Use your Korean background as leverage. Connect with agents specializing in KR-JP bridging.",
                tags: ["KOREC", "WorldJob", "Agent"]
            });
        }

        // 2. Role Strategy
        if (years >= 5 || level === "senior" || level === "lead") {
            recommendations.push({
                title: "High-Skilled Visa Target",
                type: "visa",
                description: "You likely qualify for the HSP (Highly Skilled Professional) Visa (80 points+).",
                tags: ["HSP Visa", "Fast-Track"]
            });
        }

        // 3. Skill Strategy
        if (jobFamily === "frontend") {
            recommendations.push({
                title: "Portfolio is Key",
                type: "action",
                description: "Japanese companies value modern stack (Next.js/React) and design sensibility. Polish your portfolio site.",
            });
        } else if (jobFamily === "backend") {
            recommendations.push({
                title: "System Design & Cloud",
                type: "action",
                description: "Highlight your AWS/GCP experience and system design capabilities. Coding tests are common.",
            });
        }

        return {
            strategy: langStrategy,
            items: recommendations
        };
    }
};
