import { TomlReader } from "./bombadil";
import * as util from "util";
import * as fs from "fs";
const input = fs.readFileSync("/dev/stdin", "utf8");

const reader = new TomlReader();
reader.readToml(input, true);
if (reader.result) {
  console.log(util.inspect(reader.result, { showHidden: false, depth: null }));
} else {
  console.log(reader.errors);
}
