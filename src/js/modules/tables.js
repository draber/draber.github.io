import el from './element.js';

/**
 * Populate a table with data
 * @param {Array} data in the format [[ "1st row, 1st cell", ... ], [ "2nd row, 1st cell", ... ], ...]
 * @returns (HTMLElement) the populated table
 */
const refresh = (data, table) => { 
    table.innerHTML = '';
    const tbody = el.tbody();
    data.forEach((rowData) => {
        const tr = el.tr();
        rowData.forEach((cellData) => {
            tr.append(el.td({
                text: cellData
            }))
        })
        tbody.append(tr);
    });
    table.append(tbody);
}

/**
 * Initial table built
 * @param {Array} data 
 * @returns {HTMLElement} table
 */
const build = data => {    
    const table = el.table({
        classNames: ['pane']
    });     
    refresh(data, table);
    return table;
}

export default {
    build,
    refresh
};