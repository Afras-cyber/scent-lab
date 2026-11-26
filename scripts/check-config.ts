// `npm run check:config` lists every config problem, including placeholders
// that would block a production build.
import { allConfigs } from "../src/config/check";
import { validateConfig } from "../src/config/schema";

const problems = validateConfig(allConfigs, { strict: true });

if (problems.length === 0) {
  console.log("src/config is ready for production.");
} else {
  console.log(`src/config has ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
