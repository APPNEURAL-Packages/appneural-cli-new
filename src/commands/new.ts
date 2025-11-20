import { Command } from "commander";
import { logger, withSpinner, input } from "@appneural/cli-shared";
import { withTelemetry } from "@appneural/cli-shared";
import { BlueprintName, generateBlueprint, listBlueprints } from "../services/blueprint.service.js";
import { ValidationError } from "@appneural/cli-shared";

const BLUEPRINT_OPTIONS = listBlueprints();

export function registerBlueprintCommand(program: Command): void {
  program
    .command("new <blueprint>")
    .description("Generate an APPNEURAL project blueprint")
    .option("--dir <dir>", "Destination directory")
    .action((blueprint: string, options: { dir?: string }) =>
      withTelemetry("blueprint:new", async () => {
        const normalized = blueprint as BlueprintName;
        if (!BLUEPRINT_OPTIONS.find((entry) => entry.name === normalized)) {
          throw new ValidationError("APPNEURAL blueprint unsupported", { blueprint, options: BLUEPRINT_OPTIONS });
        }

        const target =
          options.dir ??
          (await input("APPNEURAL target directory", `appneural-${normalized}`));
        const result = await withSpinner("Scaffolding APPNEURAL blueprint", () =>
          generateBlueprint(normalized, target)
        );

        logger.success(
          `APPNEURAL blueprint '${result.name}' generated ${result.files} files at ${result.directory}`
        );
      })
    );
}
