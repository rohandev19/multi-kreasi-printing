import re

file_path = 'frontend/src/pages/public/CheckoutPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('`nimport { useCart } from \'../../../hooks/useCart\';', '\n')
content = content.replace("`n                  style={{ background: \"linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)\" }}`n                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.filter = \"brightness(1.1)\"; }}`n                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.filter = \"brightness(1)\"; }}", "\n                  style={{ background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)' }}\n                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}\n                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.filter = 'brightness(1)'; }}")

content = content.replace('`nstyle={{background:' , "\nstyle={{background:")

content = content.replace('`../', '../')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')