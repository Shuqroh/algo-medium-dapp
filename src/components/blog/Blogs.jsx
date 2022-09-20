import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddBlog from "./AddBlog";
import Blog from "./Blog";
import Loader from "../utils/Loader";
import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import {
  createBlogAction,
  deleteAction,
  downvoteAction,
  editAction,
  getBlogsAction,
  upvoteAction,
} from "../../utils/contract";

const Blogs = ({ address, fetchBalance }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBlogs = async () => {
    setLoading(true);
    toast(<NotificationSuccess text="Fetching Blogs" />);
    getBlogsAction()
      .then((datas) => {
        if (datas) {
          setBlogs(datas);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally((_) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getBlogs();
  }, []);

  const createBlog = async (data) => {
    setLoading(true);
    createBlogAction(address, data)
      .then(() => {
        toast(<NotificationSuccess text="Blog added successfully." />);
        getBlogs();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast(<NotificationError text="Failed to create a blog." />);
        setLoading(false);
      });
  };

  const editBlog = async (blog) => {
    setLoading(true);
    editAction(address, blog)
      .then(() => {
        toast(<NotificationSuccess text="Blog edit successfully" />);
        getBlogs();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast(<NotificationError text="Failed to edit blog." />);
        setLoading(false);
      });
  };

  const upvoteBlog = async (blog) => {
    setLoading(true);
    upvoteAction(address, blog)
      .then(() => {
        toast(<NotificationSuccess text="Blog upvoted successfully" />);
        getBlogs();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast(<NotificationError text="Failed to upvote blog." />);
        setLoading(false);
      });
  };

  const downvoteBlog = async (blog) => {
    setLoading(true);
    downvoteAction(address, blog)
      .then(() => {
        toast(<NotificationSuccess text="Blog downvoted successfully" />);
        getBlogs();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast(<NotificationError text="Failed to downvote blog." />);
        setLoading(false);
      });
  };

  const deleteBlog = async (property) => {
    setLoading(true);
    deleteAction(address, property.appId)
      .then(() => {
        toast(<NotificationSuccess text="Blog deleted successfully" />);
        getBlogs();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast(<NotificationError text="Failed to delete blog." />);
        setLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-4 fw-bold mb-0">Blogs</h1>
        <AddBlog createBlog={createBlog} />
      </div>
      <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
        <>
          {blogs.map((data, index) => (
            <Blog
              address={address}
              blog={data}
              editBlog={editBlog}
              deleteBlog={deleteBlog}
              upvoteBlog={upvoteBlog}
              downvoteBlog={downvoteBlog}
              key={index}
            />
          ))}
        </>
      </Row>
    </>
  );
};

Blogs.propTypes = {
  address: PropTypes.string.isRequired,
  fetchBalance: PropTypes.func.isRequired,
};

export default Blogs;
