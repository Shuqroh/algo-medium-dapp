import React from "react";
import PropTypes from "prop-types";
import { Badge, Button, Card, Col, Form, Stack } from "react-bootstrap";
import { truncateAddress } from "../../utils/conversions";
import Identicon from "../utils/Identicon";
import EditBlog from "./EditBlog";
import ViewBlog from "./ViewPost";

const Blog = ({
  address,
  blog,
  editBlog,
  deleteBlog,
  upvoteBlog,
  downvoteBlog,
}) => {
  const { title, image, appId, owner } = blog;

  return (
    <Col key={appId}>
      <Card className="h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon size={28} address={addr} />
            <span className="font-monospace text-secondary">
              Author:{" "}
              <a
                href={`https://testnet.algoexplorer.io/address/${owner}`}
                target="_blank"
                rel="noreferrer"
              >
                {truncateAddress(owner)}
              </a>
            </span>
            <Badge bg="secondary" className="ms-auto">
              Published
            </Badge>
          </Stack>
        </Card.Header>
        <div className="ratio ratio-4x3">
          <img src={image} alt={title} style={{ objectFit: "cover" }} />
        </div>
        <Card.Body className="d-flex flex-column text-center">
          <Card.Title>{title}</Card.Title>
          {/* <Card.Text className="flex-grow-1">{location}</Card.Text> */}
          <Form className="d-flex align-content-stretch flex-row gap-2">
            {blog.owner === address ? (
              <EditBlog blog={blog} editBlog={editBlog} />
            ) : (
              <ViewBlog blog={blog} />
            )}
            {blog.owner === address ? (
              <ViewBlog blog={blog} />
            ) : (
              <>
                <Button
                  variant="outline-dark"
                  onClick={() => upvoteBlog(blog)}
                  className="btn"
                >
                  {blog.upvote}
                  <i className="bi bi-hand-thumbs-up-fill"></i>
                </Button>
                <Button
                  variant="outline-dark"
                  onClick={() => downvoteBlog(blog)}
                  className="btn"
                >
                  {blog.downvote}
                  <i className="bi bi-hand-thumbs-down-fill"></i>
                </Button>
              </>
            )}
            {blog.owner === address && (
              <Button
                variant="outline-danger"
                onClick={() => deleteBlog(blog)}
                className="btn"
              >
                <i className="bi bi-trash"></i>
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Col>
  );
};

Blog.propTypes = {
  address: PropTypes.string.isRequired,
  blog: PropTypes.instanceOf(Object).isRequired,
  editBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
  upvoteBlog: PropTypes.func.isRequired,
  downvoteBlog: PropTypes.func.isRequired,
};

export default Blog;
