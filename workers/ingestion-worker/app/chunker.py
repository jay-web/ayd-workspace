def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def split_into_paragraphs(pages):
    blocks = []

    for page in pages:
        page_number = page["page_number"]
        text = page["text"]

        cleaned = text.replace("\r", "\n")
        paragraphs = cleaned.split("\n\n")

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            blocks.append({
                "page_number": page_number,
                "text": para
            })

    return blocks


def chunk_document(pages):
    blocks = split_into_paragraphs(pages)

    MAX_TOKENS = 700
    OVERLAP_TOKENS = 100

    chunks = []
    current_text = []
    current_tokens = 0
    current_page_start = None
    current_page_end = None
    chunk_index = 0

    for block in blocks:
        block_text = block["text"]
        block_page = block["page_number"]
        block_tokens = estimate_tokens(block_text)

        if current_page_start is None:
            current_page_start = block_page
        current_page_end = block_page

        if current_tokens + block_tokens > MAX_TOKENS and current_text:
            chunk_content = "\n\n".join(current_text)

            chunks.append({
                "chunk_index": chunk_index,
                "content": chunk_content,
                "page_number": current_page_start,
                "token_count": current_tokens,
                "metadata": {
                    "page_start": current_page_start,
                    "page_end": current_page_end,
                }
            })

            chunk_index += 1

            overlap_text = chunk_content[-(OVERLAP_TOKENS * 4):]
            current_text = [overlap_text]
            current_tokens = estimate_tokens(overlap_text)

            current_page_start = current_page_end
            current_page_end = block_page

        current_text.append(block_text)
        current_tokens += block_tokens

    if current_text:
        chunk_content = "\n\n".join(current_text)

        chunks.append({
            "chunk_index": chunk_index,
            "content": chunk_content,
            "page_number": current_page_start,
            "token_count": current_tokens,
            "metadata": {
                "page_start": current_page_start,
                "page_end": current_page_end,
            }
        })

    return chunks