import { Command } from "commander";
import { registerBlueprintCommand } from "./commands/new.js";

export default function register(program: Command): void {
  registerBlueprintCommand(program);
}
