from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, log_audit
from app.db.database import get_db
from app.db.models import Comment, Document, RoleEnum, User
from app.schemas.document import CommentCreate, CommentResponse

router = APIRouter()


@router.get("/documents/{document_id}/comments", response_model=list[CommentResponse])
def list_comments(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    comments = db.query(Comment).filter(Comment.document_id == document_id).order_by(Comment.created_at.asc()).all()
    return comments


@router.post("/documents/{document_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(document_id: int, payload: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if payload.parent_id is not None:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id, Comment.document_id == document_id).first()
        if not parent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")
    comment = Comment(
        document_id=document_id,
        user_id=current_user.id,
        body=payload.body,
        parent_id=payload.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    log_audit(db, current_user.id, "CREATE_COMMENT", "Comment", comment.id, details=f"document_id={document_id}")
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if current_user.role not in {RoleEnum.ADMIN, RoleEnum.JUDGE} and comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
    log_audit(db, current_user.id, "DELETE_COMMENT", "Comment", comment_id)
