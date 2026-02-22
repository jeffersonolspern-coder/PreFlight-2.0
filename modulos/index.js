import { sigwxModule } from "./sigwx.js";
import { metarTafModule } from "./metar-taf.js";
import { nuvensModule } from "./nuvens.js";
import { sinaisLuminososModule } from "./sinais-luminosos.js";
import { notamModule } from "./notam.js";
import { rotaerModule } from "./rotaer.js";
import { espacosAereosModule } from "./espacos-aereos.js";

const MODULES = [
  sigwxModule,
  metarTafModule,
  nuvensModule,
  sinaisLuminososModule,
  notamModule,
  rotaerModule,
  espacosAereosModule
];

const MODULE_BY_KEY = new Map(MODULES.map((moduleConfig) => [moduleConfig.key, moduleConfig]));
const MODULE_BY_SLUG = new Map(MODULES.map((moduleConfig) => [moduleConfig.slug, moduleConfig]));

function getModuleByKey(key = "") {
  return MODULE_BY_KEY.get(String(key || "").trim()) || null;
}

function getModuleBySlug(slug = "") {
  return MODULE_BY_SLUG.get(String(slug || "").trim()) || null;
}

export { MODULES, MODULE_BY_KEY, MODULE_BY_SLUG, getModuleByKey, getModuleBySlug };
