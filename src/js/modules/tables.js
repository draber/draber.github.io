import el from './element.js';
import {
    prefix
} from '../modules/string.js';

/**
 * Table built or refresh and populate it with data
 * @param {Array} data in the format [[ "1st row, 1st cell", ... ], [ "2nd row, 1st cell", ... ], ...]
 * @param {HTMLElement} table
 * @param {Boolean} markCompleted should completed rows (i.e. the second value === 0)
 * @param {String} highlightMarker keyword in a cell that highlights the row
 * @returns {HTMLElement} table
 */
const get = (data, table = null, markCompleted = true, highlightMarker = '') => {
    table = table || el.table({
        classNames: ['pane']
    });
    table.innerHTML = '';
    const tbody = el.tbody();
    let completable = false;
    let position;
    data.forEach((rowData, i) => {
        if(i === 0 && rowData.includes('?')){
            completable = true;
            position = rowData.indexOf('?')
        }
        const classNames = [];
        if(markCompleted && i > 0 && completable && rowData.indexOf(0) === position){
            classNames.push(prefix('complete', 'd'));
        }
        if(highlightMarker && rowData.includes(highlightMarker)) {
            classNames.push(prefix('highlight', 'd'));
        }
        const tr = el.tr({
            classNames: classNames
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