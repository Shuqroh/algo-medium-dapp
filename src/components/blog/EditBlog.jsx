import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";

const EditBlog = ({ editBlog, blog }) => {
  const [title, setTitle] = useState(blog.title);
  const [image, setImage] = useState(blog.image);
  const [content, setContent] = useState(blog.content);

  const isFormFilled = useCallback(() => {
    return title && image && content;
  }, [title, image, content]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        variant="outline-dark"
        onClick={handleShow}
        className="btn w-50 py-3"
      >
        Edit
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Blog</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel controlId="inputName" label="Title" className="mb-3">
              <Form.Control
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter title"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Image URL"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Image URL"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputContent"
              label="Content"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="content"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              editBlog({
                title,
                image,
                content,
              });
              handleClose();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

EditBlog.propTypes = {
  editBlog: PropTypes.func.isRequired,
  blog: PropTypes.instanceOf(Object).isRequired,
};

export default EditBlog;
