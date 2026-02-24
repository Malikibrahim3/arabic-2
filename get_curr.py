import re

try:
    with open('/Users/malikibrahim/.gemini/antigravity/conversations/f0b426ea-2a7e-44a4-88e1-0a38e24a0d5c.pb', 'rb') as f:
        data = f.read()
    
    # Simple extraction of anything that looks like printable text
    text = ''.join(chr(b) if 32 <= b <= 126 or b == 10 else ' ' for b in data)
    
    # condense whitespace
    text = re.sub(r'\s+', ' ', text)
    
    idx = text.lower().find('master curriculum')
    if idx != -1:
        print(text[max(0, idx-50):idx+500])
    
    idx2 = text.find('Stage 4')
    if idx2 != -1:
        print(text[max(0, idx2-50):idx2+500])
except Exception as e:
    print(e)
