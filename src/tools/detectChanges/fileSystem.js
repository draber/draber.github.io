import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import beautify from 'beautify';



const mine = {
    beautifyFormat: file => {
        const extension = this.extension(file);
        return ['json', 'xml', 'html', 'js', 'css'].includes(extension) ? {
            format: extension
        } : {};
    },
    extension: file => {
        return file.split('.').pop().toLowerCase();
    },
    exists: async file => {
        return access(file, constants.F_OK, (err) => {
            return !!err;
        });
    },
    get: async () => {
        return fs.readFile()
    },
    getAsJson: (file) => {
        let contents = this.get(file);
        contents = JSON.parse(contents)

    },
    put: async (file, data, {
        pretty = false,
        encoding = 'utf8',
        mode = 0o666,
        flag = 'w',
        signal
    } = {}) => {
        if (_.isObjectLike(data)) {
            data = JSON.stringify(data);
        }
        if (pretty) {
            data = beautify(data, this.beautifyFormat(file));
        }
        const dir = path.dirname(file);
        if (await this.exists(dir)) {
            fs.mkdirSync(dir);
        }
        return fs.writeFile(file, data, {
            encoding,
            mode,
            flag,
            signal
        })
    }
}



export default {
    ...fs,
    ...all
}