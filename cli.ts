import * as ts from "typescript";
import cheerio from "cheerio";
import _glob from "glob";
import { promisify } from "util";
import { promises as fs } from "fs";
const glob = promisify(_glob);
import { purgeMapGetters } from "./transformers/purgeMapGetters";
import { purgeMapMutations } from "./transformers/purgeMapMutations";
import { purgeMapActions } from "./transformers/purgeMapActions";

async function run() {
  const files = await glob(`${process.argv[2]}`);
  await Promise.all([
    files.map(async (path) => {
      const sfc = await fs.readFile(path, { encoding: "utf8" });
      const $ = cheerio.load(sfc);
      const src = $("script")!.html();
      if (!src) {
        return;
      }
      const sourceFile = ts.createSourceFile(
        "index.ts",
        src,
        ts.ScriptTarget.ESNext
      );
      const result = ts.transform(sourceFile, [
        purgeMapGetters,
        purgeMapMutations,
        purgeMapActions,
      ]);
      result.dispose();

      const printer = ts.createPrinter();
      const scriptBody = printer.printFile(
        result.transformed[0] as ts.SourceFile
      );
      await fs.writeFile(path.replace(".vue", ".ts"), scriptBody, {
        encoding: "utf8",
      });
    }),
  ]);
}

run();
