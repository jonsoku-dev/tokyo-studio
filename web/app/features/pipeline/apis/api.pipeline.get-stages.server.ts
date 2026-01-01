import type { LoaderFunctionArgs } from "react-router";
import { loaderHandler } from "~/shared/lib";
import { pipelineService } from "../domain/pipeline.service.server";

/**
 * GET /api/pipeline/stages
 *
 * Fetches all available pipeline stages from the database
 */
export const loader = loaderHandler(async (_: LoaderFunctionArgs) => {
	const stages = await pipelineService.getStages();
	return { stages };
});
