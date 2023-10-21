import React from "react";
import { Button, Modal } from "react-bootstrap";

export default function MovieLinkModal({ show, handleApply, handleCancel }) {
  return (
    <div>
      <Modal show={show} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>لینک فیلم جدید </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          یک لینک فیلم جدید توسط اعضا اضافه شد، اعمال شود؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            لغو
          </Button>
          <Button variant="primary" onClick={handleApply}>
            اعمال
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
