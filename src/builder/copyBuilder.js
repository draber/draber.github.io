/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fs from "fs/promises";
import { logger, getSetup } from "./bootstrap.js";
import { getVariants } from "./jsBuilder.js";

export const id = "Copy";

/**
 * Copies the scripts of this run from build/ to assets/js/, where the bookmarklet loads them from.
 * Runs after the JS build, never at the same time.
 * @returns {Promise<void>} rejects when a file can't be copied
 */
export async function build() {
    const setup = getSetup();
    await fs.mkdir(setup.bmlPath, { recursive: true });
    for (const { file } of getVariants(setup)) {
        const from = `${setup.buildPath}/${file}`;
        const to = `${setup.bmlPath}/${file}`;
        await fs.copyFile(from, to);
        logger.success(`${id}: ${from} -> ${to}`);
    }
}
