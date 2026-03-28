with open('superkicks_data.json', 'r') as f:
    content = f.read()

content = content.replace('"title": null', '"title": "CLASSIC NYLON"')
content = content.replace('\\n', '')

with open('superkicks_data.json', 'w') as f:
    f.write(content)

print('Done')
