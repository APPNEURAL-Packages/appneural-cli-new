import fs from "fs/promises";
import path from "path";
import { ensureDir, pathExists } from "@appneural/cli-shared";
import { ValidationError } from "@appneural/cli-shared";
import { logger } from "@appneural/cli-shared";

interface BlueprintDefinition {
  description: string;
  files: Record<string, string>;
}

const BLUEPRINTS: Record<string, BlueprintDefinition> = {
  "nest-microservice": {
    description: "APPNEURAL NestJS microservice bootstrap",
    files: {
      "package.json": JSON.stringify(
        {
          name: "appneural-nest-microservice",
          version: "0.1.0",
          private: true,
          scripts: {
            start: "ts-node src/main.ts",
            dev: "ts-node-dev --respawn src/main.ts"
          },
          dependencies: {
            "@nestjs/common": "^10.0.0",
            "@nestjs/core": "^10.0.0",
            rxjs: "^7.8.0"
          },
          devDependencies: {
            "ts-node": "^10.9.2",
            "ts-node-dev": "^2.0.0",
            typescript: "^5.6.0"
          }
        },
        null,
        2
      ),
      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            module: "commonjs",
            target: "es2021",
            moduleResolution: "node",
            strict: true,
            skipLibCheck: true,
            outDir: "dist"
          },
          include: ["src"]
        },
        null,
        2
      ),
      "src/main.ts": `import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('APPNEURAL Nest microservice ready on port 3000');
}

void bootstrap();
`,
      "src/modules/app.module.ts": `import { Module } from '@nestjs/common';
import { AppController } from '../rest/app.controller';
import { AppService } from '../services/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
`,
      "src/rest/app.controller.ts": `import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller('health')
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  status() {
    return this.service.health();
  }
}
`,
      "src/services/app.service.ts": `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return { status: 'APPNEURAL_OK' };
  }
}
`,
      "README.md": `# APPNEURAL Nest Microservice

This blueprint bootstraps a focused NestJS service with health endpoint, ready to extend with modules, DTOs, and messaging patterns.
`
    }
  },
  "react-native-app": {
    description: "APPNEURAL React Native starter",
    files: {
      "package.json": JSON.stringify(
        {
          name: "appneural-react-native",
          private: true,
          version: "0.1.0",
          scripts: {
            start: "expo start",
            android: "expo run:android",
            ios: "expo run:ios"
          },
          dependencies: {
            expo: "~51.0.0",
            react: "18.2.0",
            "react-native": "0.74.0"
          },
          devDependencies: {
            typescript: "^5.6.0"
          }
        },
        null,
        2
      ),
      "App.tsx": `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
`,
      "src/navigation/index.tsx": `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);
`,
      "src/screens/HomeScreen.tsx": `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>APPNEURAL Mobile Ready</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});
`,
      "README.md": `# APPNEURAL React Native App

Opinionated Expo setup with navigation scaffold so mobile roles jump directly into feature work.
`
    }
  },
  webapp: {
    description: "APPNEURAL web frontend",
    files: {
      "package.json": JSON.stringify(
        {
          name: "appneural-webapp",
          private: true,
          version: "0.1.0",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview"
          },
          dependencies: {
            react: "18.2.0",
            "react-dom": "18.2.0"
          },
          devDependencies: {
            typescript: "^5.6.0",
            vite: "^5.0.0",
            "@vitejs/plugin-react": "^4.2.0"
          }
        },
        null,
        2
      ),
      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            target: "ES2021",
            module: "ESNext",
            jsx: "react-jsx",
            moduleResolution: "node",
            strict: true
          },
          include: ["src"]
        },
        null,
        2
      ),
      "src/main.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './pages/App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
`,
      "src/pages/App.tsx": `import React from 'react';

export const App = () => {
  return (
    <main>
      <h1>APPNEURAL Web Blueprint</h1>
      <p>All UI kits, telemetry, and quality tools plug in from day one.</p>
    </main>
  );
};
`,
      "README.md": `# APPNEURAL Webapp

Ready-to-go Vite React blueprint wired for APPNEURAL quality workflows.
`
    }
  },
};

export type BlueprintName = keyof typeof BLUEPRINTS;

export interface BlueprintResult {
  name: BlueprintName;
  directory: string;
  files: number;
}

export function listBlueprints(): Array<{ name: BlueprintName; description: string }> {
  return Object.entries(BLUEPRINTS).map(([name, blueprint]) => ({
    name: name as BlueprintName,
    description: blueprint.description
  }));
}

export async function generateBlueprint(name: BlueprintName, targetDir: string): Promise<BlueprintResult> {
  const blueprint = BLUEPRINTS[name];
  if (!blueprint) {
    throw new ValidationError("APPNEURAL blueprint not found", { name });
  }

  const destination = path.join(process.cwd(), targetDir);
  if (await pathExists(destination)) {
    throw new ValidationError("APPNEURAL target directory already exists", { destination });
  }
  await ensureDir(destination);

  let count = 0;
  for (const [relativePath, contents] of Object.entries(blueprint.files)) {
    const finalPath = path.join(destination, relativePath);
    await ensureDir(path.dirname(finalPath));
    await fs.writeFile(finalPath, contents, "utf-8");
    count += 1;
  }

  logger.info(`APPNEURAL blueprint '${name}' files created: ${count}`);
  return { name, directory: destination, files: count };
}
