import el from './element.js';
import settings from './settings.js';

const stored = settings.getStored();

const add = (app, plugin, key, title, optional) => {
    let slot = el.$(`[data-plugin="${key}"]`, app);
    if(!slot){
        slot = el.create({
            data: {
                plugin: key
            }});
        app.append(slot);
    }
    const available = (stored[key] ? stored[key].v : optional);
    if(optional) {
       settings.set(key, { v: available, t: `Display "${title}"` });
    }    
    app.addEventListener(`sba${key}`, evt => {
        if(evt.detail.enabled){
            add(app, plugin, key, title, optional);
        }
        else {
            remove(plugin, key, title);
        }
    });
    slot.append(plugin);
}

const remove = (plugin, key, title) => {
    if(!plugin) {
        console.error(`Plugin "${title}" not initialized`);
        return null;
    }
    const slot = el.$(`[data-plugin="${key}"]`);
    slot.removeChild(slot.firstChild);
    settings.set(key, { v: false, t: `Display ${title}` });
    return null;
}

export default {
    add,
    remove
}