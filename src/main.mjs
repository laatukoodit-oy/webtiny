#!/usr/bin/env node
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import argParse from './argParse.js';  // Add `.js` to local imports

function getTagContent(html, tag) {
    const openTag = `<${tag}>`;
    const openTagIdx = html.indexOf(openTag)

    if (openTagIdx === -1) {
        console.error(`No opening tag found for <${tag}>`);
        process.exit(2);
    }

    const contentStart = openTagIdx + openTag.length;
    const endTagIdx = html.indexOf(`</${tag}>`);

    if (endTagIdx === -1) {
        console.error(`No end tag found for <${tag}>`);
        process.exit(2);
    }

    return html.slice(contentStart, endTagIdx);
}

const loaders = {
    '.png': 'dataurl',
    '.svg': 'dataurl',
    '.webp': 'dataurl',
    '.jpg': 'dataurl'
};

const options = {
    bundle: true,
    minify: true,
    write: false,
    define: { 'process.env.NODE_ENV': `"production"` }
};

async function injectScript(inputFilepath, outputFilepath, resolveDir) {
    const htmlContent = fs.readFileSync(inputFilepath, 'utf-8');
    const scriptContent = getTagContent(htmlContent, 'script');
    const styleContent = getTagContent(htmlContent, 'style');

    const bundledScript = await esbuild.build({
        stdin: {
            contents: scriptContent,
            loader: 'js',
            resolveDir
        },
        loader: loaders,
        ...options
    });

    const bundledStyle = await esbuild.build({
        stdin: {
            contents: styleContent,
            loader: 'css',
            resolveDir
        },
        loader: loaders,
        ...options
    });

    const a = (bundledScript.outputFiles[0].text.trim());
    const b = (bundledStyle.outputFiles[0].text.trim());

    let newContent = htmlContent.replace(scriptContent, a);
    newContent = newContent.replace(styleContent, b);
    newContent = newContent.replaceAll(/\n\s*/g, '');

    fs.writeFileSync(outputFilepath, newContent);
}

async function main() {
    const options = argParse();

    if (!options) {
        console.error(
            'Usage:\n' +
            '\ttinyweb -i [input] -o [output] -w [working_directory]'
        )

        process.exit(1);
    }

    const {input, output, workdir} = options;
    await injectScript(input, output, workdir);

    return 0;
}

await main();
