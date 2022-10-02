import React, { useState } from "react";
import PropTypes from "prop-types";
import { Badge, Button, Modal, Stack } from "react-bootstrap";
import Identicon from "../utils/Identicon";
import { truncateAddress } from "../../utils/conversions";

const ViewBlog = ({ blog }) => {
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
        Read Blog
      </Button>

      <Modal size="lg" show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{blog.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="ratio ratio-4x3">
            <img
              src={blog.image}
              alt={blog.title}
              style={{ objectFit: "cover" }}
            />
          </div>
          <p>{blog.content}</p>

          <Stack direction="horizontal" gap={2}>
            <Identicon size={28} address={blog.owner} />
            <span className="font-monospace text-secondary">
              <h6>Author:</h6>{" "}
              <a
                href={`https://testnet.algoexplorer.io/address/${blog.owner}`}
                target="_blank"
                rel="noreferrer"
              >
                {truncateAddress(blog.owner)}
              </a>
            </span>
            <Badge bg="secondary" className="ms-auto">
              Published
            </Badge>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ViewBlog.propTypes = {
  blog: PropTypes.instanceOf(Object).isRequired,
};

export default ViewBlog;
