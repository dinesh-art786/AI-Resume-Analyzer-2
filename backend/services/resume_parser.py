
from io import BytesIO
from pypdf import PdfReader
from docx import Document


def extract_resume_text(file_bytes: bytes, extension: str) -> str:

    stream = BytesIO(file_bytes)

    # ======================================
    # PDF EXTRACTION
    # ======================================

    if extension.lower() == "pdf":

        reader = PdfReader(stream)

        extracted_text = []

        for page in reader.pages:

            page_text = page.extract_text() or ""

            extracted_text.append(page_text)

        return "\n".join(extracted_text)

    # ======================================
    # DOCX EXTRACTION
    # ======================================

    if extension.lower() == "docx":

        document = Document(stream)

        extracted_text = []

        # Extract normal paragraphs
        for paragraph in document.paragraphs:

            if paragraph.text.strip():

                extracted_text.append(paragraph.text)

        # Extract tables
        for table in document.tables:

            for row in table.rows:

                row_text = []

                for cell in row.cells:

                    if cell.text.strip():

                        row_text.append(cell.text.strip())

                if row_text:

                    extracted_text.append(" ".join(row_text))

        return "\n".join(extracted_text)

    raise ValueError("Unsupported file format")
