interface BlueprintDefinition {
    description: string;
    files: Record<string, string>;
}
declare const BLUEPRINTS: Record<string, BlueprintDefinition>;
export type BlueprintName = keyof typeof BLUEPRINTS;
export interface BlueprintResult {
    name: BlueprintName;
    directory: string;
    files: number;
}
export declare function listBlueprints(): Array<{
    name: BlueprintName;
    description: string;
}>;
export declare function generateBlueprint(name: BlueprintName, targetDir: string): Promise<BlueprintResult>;
export {};
//# sourceMappingURL=blueprint.service.d.ts.map