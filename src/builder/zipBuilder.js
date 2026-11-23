/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import fs from "fs/promises";
import { existsSync } from "fs";
import zlib from "zlib";
import { logger, getSetup } from "./bootstrap.js";

export const id = "Zip";

/**
 * Files of the store package, relative to build/
 * @param {Object} setup
 * @returns {Promise<String[]>}
 */
const getFiles = async (setup) => {
    const icons = (await fs.readdir(`${setup.buildPath}/assets`))
        .filter((file) => /^icon\d+\.png$/.test(file))
        .map((file) => `assets/${file}`);
    return [
        "assets/",
        ...icons,
        "content.js",
        "LICENSE.md",
        "manifest.json",
        "readme.md",
        `release-notes.${setup.version}.md`,
        `${setup.name}.js`,
        `${setup.name}.min.js`,
    ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return c >>> 0;
});

const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const byte of buf) {
        c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
};

/**
 * Date in MS-DOS format, local time like most zip tools
 * @param {Date} date
 * @returns {{time: Number, date: Number}}
 */
const dosDateTime = (date) => ({
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
});

/**
 * Minimal zip writer: deflate, no encryption, no zip64 (the package is well below 4 GB)
 * @param {{name: String, data: Buffer, mtime: Date, dir: Boolean}[]} entries
 * @returns {Buffer}
 */
const createZip = (entries) => {
    const local = [];
    const central = [];
    let offset = 0;

    for (const entry of entries) {
        const name = Buffer.from(entry.name, "utf8");
        const compressed = entry.dir ? Buffer.alloc(0) : zlib.deflateRawSync(entry.data, { level: 9 });
        const method = entry.dir ? 0 : 8;
        const crc = entry.dir ? 0 : crc32(entry.data);
        const { time, date } = dosDateTime(entry.mtime);

        const header = Buffer.alloc(30);
        header.writeUInt32LE(0x04034b50, 0);
        header.writeUInt16LE(20, 4); // version needed
        header.writeUInt16LE(0x0800, 6); // flags: UTF-8 names
        header.writeUInt16LE(method, 8);
        header.writeUInt16LE(time, 10);
        header.writeUInt16LE(date, 12);
        header.writeUInt32LE(crc, 14);
        header.writeUInt32LE(compressed.length, 18);
        header.writeUInt32LE(entry.data.length, 22);
        header.writeUInt16LE(name.length, 26);
        header.writeUInt16LE(0, 28); // extra field length
        local.push(header, name, compressed);

        const record = Buffer.alloc(46);
        record.writeUInt32LE(0x02014b50, 0);
        record.writeUInt16LE(20, 4); // version made by
        record.writeUInt16LE(20, 6); // version needed
        record.writeUInt16LE(0x0800, 8);
        record.writeUInt16LE(method, 10);
        record.writeUInt16LE(time, 12);
        record.writeUInt16LE(date, 14);
        record.writeUInt32LE(crc, 16);
        record.writeUInt32LE(compressed.length, 20);
        record.writeUInt32LE(entry.data.length, 24);
        record.writeUInt16LE(name.length, 28);
        // extra, comment, disk number, internal attributes: 0
        record.writeUInt32LE(entry.dir ? 0x10 : 0, 38); // external attributes, MS-DOS directory flag
        record.writeUInt32LE(offset, 42);
        central.push(record, name);

        offset += header.length + name.length + compressed.length;
    }

    const centralSize = central.reduce((sum, buf) => sum + buf.length, 0);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(offset, 16);

    return Buffer.concat([...local, ...central, end]);
};

/**
 * Packs the extension for the stores into build/build-<version>.zip.
 * Skipped with a warning as long as there are no release notes for this version.
 * @returns {Promise<void>} rejects when a file is missing or the zip can't be written
 */
export async function build() {
    const setup = getSetup();
    const notes = `${setup.buildPath}/release-notes.${setup.version}.md`;
    if (!existsSync(notes)) {
        logger.warn(`${id}: ${notes} not found, no zip for ${setup.version}`);
        return;
    }

    const entries = [];
    for (const name of await getFiles(setup)) {
        const file = `${setup.buildPath}/${name}`;
        const stat = await fs.stat(file);
        const dir = name.endsWith("/");
        entries.push({ name, dir, mtime: stat.mtime, data: dir ? Buffer.alloc(0) : await fs.readFile(file) });
    }

    const outFile = `${setup.buildPath}/build-${setup.version}.zip`;
    await fs.writeFile(outFile, createZip(entries));
    logger.success(`${id}: ${entries.length} files -> ${outFile}`);
}
