import fitz  # PyMuPDF


def extract_pdf_pages(file_bytes: bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    pages = []

    for i in range(len(doc)):
        page = doc[i]
        text = page.get_text()

        pages.append({
            "page_number": i + 1,
            "text": text.strip()
})

    return pages