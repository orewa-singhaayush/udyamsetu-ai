import fitz

pdf_path = r"D:\udyamsetu-ai\backend\data\food\Licensing & Registration.pdf"

doc = fitz.open(pdf_path)

print("Total pages:", len(doc))

for page_number, page in enumerate(doc):
    text = page.get_text()

    print(f"\n--- PAGE {page_number + 1} ---")
    print(text[:2000])