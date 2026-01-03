import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { requireUserId } from "~/features/auth/utils/session.server";
import {
	actionHandler,
	BadRequestError,
	InternalError,
	loaderHandler,
	NotFoundError,
} from "~/shared/lib";
import { pipelineService } from "../domain/pipeline.service.server";
import { StepTypeEnum } from "../domain/pipeline.types";

const createStepSchema = z.object({
	applicationId: z.string().uuid(),
	stepType: StepTypeEnum,
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	summary: z.string().min(1).max(500),
	selfEvaluation: z.string().max(1000).nullable().optional(),
});

const updateStepSchema = z.object({
	stepId: z.string().uuid(),
	stepType: StepTypeEnum.optional(),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	summary: z.string().min(1).max(500).optional(),
	selfEvaluation: z.string().max(1000).nullable().optional(),
});

const deleteStepSchema = z.object({
	stepId: z.string().uuid(),
});

export const loader = loaderHandler(async ({ request }: LoaderFunctionArgs) => {
	await requireUserId(request);
	const url = new URL(request.url);
	const applicationId = url.searchParams.get("applicationId");

	if (!applicationId) {
		throw new BadRequestError("applicationId is required");
	}

	const steps = await pipelineService.getApplicationSteps(applicationId);
	return { steps };
});

export const action = actionHandler(async ({ request }: ActionFunctionArgs) => {
	await requireUserId(request);
	const method = request.method;

	if (method === "POST") {
		const body = await request.json();
		const parsed = createStepSchema.safeParse(body);

		if (!parsed.success) {
			throw new BadRequestError(parsed.error.message);
		}

		const { applicationId, stepType, date, summary, selfEvaluation } =
			parsed.data;

		try {
			const step = await pipelineService.addApplicationStep(applicationId, {
				stepType,
				date,
				summary,
				selfEvaluation: selfEvaluation ?? null,
			});
			return { success: true, step };
		} catch (error) {
			console.error("[Application Steps API] Create failed:", error);
			throw new InternalError("Failed to create step");
		}
	}

	if (method === "PATCH") {
		const body = await request.json();
		const parsed = updateStepSchema.safeParse(body);

		if (!parsed.success) {
			throw new BadRequestError(parsed.error.message);
		}

		const { stepId, ...updateData } = parsed.data;

		try {
			const step = await pipelineService.updateApplicationStep(
				stepId,
				updateData,
			);
			if (!step) {
				throw new NotFoundError("Step not found");
			}
			return { success: true, step };
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("[Application Steps API] Update failed:", error);
			throw new InternalError("Failed to update step");
		}
	}

	if (method === "DELETE") {
		const body = await request.json();
		const parsed = deleteStepSchema.safeParse(body);

		if (!parsed.success) {
			throw new BadRequestError(parsed.error.message);
		}

		try {
			const deleted = await pipelineService.deleteApplicationStep(
				parsed.data.stepId,
			);
			if (!deleted) {
				throw new NotFoundError("Step not found");
			}
			return { success: true };
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("[Application Steps API] Delete failed:", error);
			throw new InternalError("Failed to delete step");
		}
	}

	throw new BadRequestError("Method not allowed");
});
