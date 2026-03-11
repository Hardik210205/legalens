import logging

from fastapi import HTTPException, status

from ..config import get_settings
from ..schemas.ask import AskRequest, AskResponse

logger = logging.getLogger(__name__)
settings = get_settings()


def handle_ask(request: AskRequest, session_id: str) -> AskResponse:
    if not settings.RAG_ENABLED:
        return AskResponse(
            answer=(
                "RAG pipeline is disabled on this environment. "
                "Enable it by setting RAG_ENABLED=true in the backend configuration."
            ),
            sources=[],
            confidence=0.0,
        )

    try:
        import rag  # type: ignore

        result_text = rag.chain_with_memory.invoke(
            {"question": request.question},
            config={"configurable": {"session_id": session_id}},
        )
        sources = rag.get_last_sources() if hasattr(rag, "get_last_sources") else []
        confidence = (
            float(rag.get_last_confidence())
            if hasattr(rag, "get_last_confidence")
            else 0.0
        )
    except Exception as e:
        logger.exception("RAG invoke failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"RAG service unavailable: {type(e).__name__}: {e!s}",
        )

    return AskResponse(
        answer=str(result_text).strip(),
        sources=list(sources) if sources else [],
        confidence=confidence,
    )

