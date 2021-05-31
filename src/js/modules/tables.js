import el from './element.js';

/**
 * Table built or refresh and populate it with data
 * @param {Array} data in the format [[ "1st row, 1st cell", ... ], [ "2nd row, 1st cell", ... ], ...]
 * @param {HTMLElement} table
 * @returns {HTMLElement} table
 */
const get = (data, table) => {
    table.innerHTML = '';
    const tbody = el.tbody();
    data.forEach(rowData => {
        const tr = el.tr();
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
