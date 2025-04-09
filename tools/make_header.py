#!/usr/bin/env python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-i', '--input', required=True)
parser.add_argument('output')
args = parser.parse_args()

with open(args.input, 'rb') as f:
    html_gz = f.read()

zip_size = len(html_gz)
headers = (
    r"HTTP/1.1 200 OK",
    r"Content-Encoding: gzip",
    r"Content-Type: text/html",
    f"Content-Length: {zip_size}",
)

headers = (', '.join(f"'{c}'" for c in h) for h in headers)
header_lines = ", '\\r', '\\n',".join(l for l in headers)
hex_html_gz = ', '.join(f'0x{b:02x}' for b in html_gz)

with open(args.output, 'w') as f:
    f.write(
f'''#pragma once

const unsigned char index_html[] PROGMEM = {{
    {header_lines}, '\\r', '\\n', '\\r', '\\n',
    {hex_html_gz}
}};
'''
    )

