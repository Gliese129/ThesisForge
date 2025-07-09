from model.article import ArticleOutline

def format_outline_info(outline: ArticleOutline) -> str:
    lines = [
        f"Title: {outline.title}",
        f"Subject Area: {outline.subject_area}",
        f"Purpose: {outline.purpose}",
        f"Target Audience: {outline.target_audience}",
        f"Language: {outline.language}",
    ]

    # Word Count
    if outline.min_word_count is not None or outline.max_word_count is not None:
        if outline.min_word_count and outline.max_word_count:
            lines.append(f"Word Count: {outline.min_word_count} - {outline.max_word_count}")
        elif outline.min_word_count:
            lines.append(f"Word Count: {outline.min_word_count}+")
        elif outline.max_word_count:
            lines.append(f"Word Count: up to {outline.max_word_count}")

    lines.append(f"Require References: {'Yes' if outline.require_references else 'No'}")
    lines.append(f"Include Formulas: {'Yes' if outline.include_formulas else 'No'}")

    if outline.preferred_tone:
        lines.append(f"Preferred Tone: {outline.preferred_tone}")
    if outline.focus_area:
        lines.append(f"Focus Area: {outline.focus_area}")
    if outline.avoid_topics:
        lines.append(f"Avoid Topics: {outline.avoid_topics}")
    if outline.existing_notes:
        lines.append(f"Existing Notes: [{outline.existing_notes}]")
    lines.append(f"Need Abstract: {'Yes' if outline.need_abstract else 'No'}")

    return "\n".join(lines)

def format_extra_questions(outline: ArticleOutline) -> str:
    if not outline.additional_questions:
        return "No additional questions provided."

    questions = [f"{i+1}. {q.question} (Answer: {q.answer})" for i, q in enumerate(outline.additional_questions)]
    return "\n".join(questions)
