import beautify from 'beautify';

const isJsonParsable = string => {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

const heading = (text, level) => {
    const breaks = level === 1 ? '\n\n' : '\n';
    return `${'#'.repeat(level)} ${text}${breaks}`;
}

const json = input => {
    if (!isJsonParsable(input)) {
        input = JSON.stringify(input);
    }
    input = beautify(input, {
        format: 'json'
    });
    return input;
}

const code = input => {
    return '```\n' + input + '\n```\n\n';
} 

const paragraph = input => {
    return input + '\n\n';
}

const fromValidation = result => {
    if(!result.msg) {
        return paragraph('No differences found');
    }
    let text = result.comment ? '// ' + result.comment + '\n' : ''
    text += json(result.msg);
    return code(text);
}


export default {
    paragraph,
    heading,
    json,
    code,
    fromValidation
}