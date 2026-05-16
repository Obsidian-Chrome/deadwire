from html.parser import HTMLParser
import re

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.in_body = False
    
    def handle_starttag(self, tag, attrs):
        if tag == 'body':
            self.in_body = True
    
    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False
    
    def handle_data(self, data):
        if self.in_body:
            clean = data.strip()
            if clean and len(clean) > 1:
                self.text.append(clean)

parser = TextExtractor()
with open(r'c:\Users\djago\Documents\Deadwire\media\FichepersonnageRefugedAmarokFFXIV.html', 'r', encoding='utf-8') as f:
    content = f.read()
    parser.feed(content)

with open(r'c:\Users\djago\Documents\Deadwire\media\extracted_content.txt', 'w', encoding='utf-8') as f:
    for line in parser.text:
        f.write(line + '\n')

print(f"Extracted {len(parser.text)} text blocks")
