function argParse() {
    const args = process.argv.slice(2);
    const options = {output: null, input: null, workdir: '.'}

    for (let pos = 0; args[pos]; pos++) {
        switch (args[pos]) {
        case '-o':
            options.output = args[++pos];
            break;
        case '-i':
            options.input = args[++pos];
            break;
        case '-w':
            options.workdir = args[++pos];
            break;
        case undefined:
            return options;
        default:
            return false;
        }
    }

    if (options.output === undefined || options.input === undefined) {
        return false;
    }
    else {
        return options;
    }
};

module.exports = argParse;
