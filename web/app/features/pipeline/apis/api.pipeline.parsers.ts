import type { LoaderFunctionArgs } from "react-router";
import { loaderHandler } from "~/shared/lib";
import { PARSING_PLUGINS } from "../constants/parsing-plugins";
import type { AvailableParsersResponse } from "../domain/parsing.types";

/**
 * GET /api/pipeline/parsers
 *
 * Returns list of available parsing plugins with examples
 */
export const loader = loaderHandler(
	async (_: LoaderFunctionArgs): Promise<AvailableParsersResponse> => {
		return {
			parsers: PARSING_PLUGINS.getAllPlugins(),
		};
	},
);
