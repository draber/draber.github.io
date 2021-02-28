import el from './element.js';
import {
    prefix
} from '../modules/string.js';

/**
 * Table built or refresh and populate it with data
 * @param {Array} data in the format [[ "1st row, 1st cell", ... ], [ "2nd row, 1st cell", ... ], ...]
 * @param {HTMLElement} table
 * @param {String} highlighter keyword in a cell that highlights the row
 * @returns {HTMLElement} table
 */
const get = (data, table = null, highlighter = '') => {
    table = table || el.table({
        classNames: ['pane']
    });
    table.innerHTML = '';
    const tbody = el.tbody();
    data.forEach(rowData => {
        const tr = el.tr({
            classNames: highlighter && rowData.includes(highlighter) ? [prefix('highlight', 'd')] : []
        });
        rowData.forEach(cellData => {
            tr.append(el.td({
                text: cellData
            }))
        })
        tbody.append(tr);
    });
    table.append(tbody);
    return table;
}

export default {
    get
};