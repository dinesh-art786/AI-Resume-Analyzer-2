
from io import BytesIO
import re

from pypdf import PdfReader
from docx import Document


def clean_extracted_text(text: str) -> str:
    """Clean unnecessary spaces and blank lines."""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    lines = []

    for line in text.split("\n"):
        line = re.sub(r"\s+", " ", line).strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""

    try:
        reader = PdfReader(BytesIO(file_bytes))

        extracted_text = []

        for page in reader.pages:
            page_text = page.extract_text() or ""

            if page_text.strip():
                extracted_text.append(page_text)

        return clean_extracted_text("\n".join(extracted_text))

    except Exception as error:
        raise ValueError("Could not read the PDF file.") from error


def extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from a DOCX file."""

    try:
        document = Document(BytesIO(file_bytes))

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
                    extracted_text.append(" | ".join(row_text))

        return clean_extracted_text("\n".join(extracted_text))

    except Exception as error:
        raise ValueError("Could not read the DOCX file.") from error


def extract_resume_text(file_bytes: bytes, extension: str) -> str:
    """Extract resume text from PDF or DOCX."""

    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    extension = extension.lower().strip().lstrip(".")

    if extension == "pdf":
        extracted_text = extract_pdf_text(file_bytes)

    elif extension == "docx":
        extracted_text = extract_docx_text(file_bytes)

    else:
        raise ValueError("Unsupported file format. Upload PDF or DOCX.")

    if not extracted_text.strip():
        raise ValueError(
            "No readable text found in the resume. "
            "Scanned PDFs may require OCR."
        )

    return extracted_text
