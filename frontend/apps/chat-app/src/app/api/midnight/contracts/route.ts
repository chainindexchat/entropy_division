import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

interface ContractInfo {
  name: string;
  path: string;
  packageName: string;
}

export async function GET() {
  try {
    const contracts: ContractInfo[] = [];

    // Path to packages directory
    const packagesDir = join(process.cwd(), "../../packages");

    // Read all directories in packages
    const packageDirs = await readdir(packagesDir, { withFileTypes: true });

    for (const dir of packageDirs) {
      if (dir.isDirectory()) {
        // Check for dist folder with .compact files
        const distPath = join(packagesDir, dir.name, "dist");

        try {
          const distFiles = await readdir(distPath);
          const compactFiles = distFiles.filter((f) => f.endsWith(".compact"));

          for (const file of compactFiles) {
            contracts.push({
              name: file.replace(".compact", ""),
              path: `/packages/${dir.name}/dist/${file}`,
              packageName: dir.name,
            });
          }
        } catch (_err) {
          // Directory doesn't exist or no permission, skip
          continue;
        }
      }
    }

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("Failed to list contracts:", error);
    return NextResponse.json(
      { error: "Failed to list contracts" },
      { status: 500 },
    );
  }
}
