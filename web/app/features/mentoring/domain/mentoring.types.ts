import { z } from "zod";
import {
	insertMentoringSessionSchema,
	selectMentoringSessionSchema,
} from "~/shared/db/schema";

export const MentoringSessionSchema = selectMentoringSessionSchema
	.pick({
		id: true,
		mentorName: true,
		topic: true,
		date: true,
		status: true,
	})
	.extend({
		status: z.enum(["scheduled", "completed", "canceled"]),
	});

export const CreateMentoringSessionSchema = insertMentoringSessionSchema.pick({
	mentorName: true,
	topic: true,
	date: true,
	userId: true,
});

export type MentoringSession = z.infer<typeof MentoringSessionSchema>;
export type CreateMentoringSessionDTO = z.infer<
	typeof CreateMentoringSessionSchema
>;
