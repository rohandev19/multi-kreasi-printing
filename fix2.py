import re

file_path = 'frontend/src/pages/public/CheckoutPage.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
	'className="w-full h-14 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"`n                  style={{ background: "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)" }}`n                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.filter = "brightness(1.1)"; }}`n                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.filter = "brightness(1)"; }}',
	'''className="w-full h-14 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)' }}
                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.filter = 'brightness(1)'; }}''')

with open(file_path, 'w') as f:
    f.write(content)
print('Done')