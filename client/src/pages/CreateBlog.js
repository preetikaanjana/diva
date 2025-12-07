import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogDB } from '../utils/database';
import './CreateBlog.css';

function CreateBlog() {
  const navigate = useNavigate();
  const location = useLocation(); // To get passed data
  const { user } = useAuth();

  // Check if we passed existing blog data (Edit Mode)
  const existingBlog = location.state?.blogData;

  // Initialize state with existing data if available
  const [title, setTitle] = useState(existingBlog?.title || '');
  const [coverImage, setCoverImage] = useState(existingBlog?.coverImage || null);
  const [tags, setTags] = useState(existingBlog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState(existingBlog?.content || '');
  const [submitting, setSubmitting] = useState(false);
  
  const contentEditableRef = useRef(null);
  const fileInputRef = useRef(null);

  // If editing, populate the rich text editor div on load
  useEffect(() => {
    if (existingBlog && contentEditableRef.current) {
      contentEditableRef.current.innerHTML = existingBlog.content;
    }
  }, [existingBlog]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  
  const removeImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    contentEditableRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) setContent(contentEditableRef.current.innerHTML);
  };

  const handlePublish = (e, isDraft = false) => {
    e.preventDefault();
    if (!title.trim() && !isDraft) return; 
    setSubmitting(true);

    // Create the blog object
    const blogPost = {
      // If editing, keep the OLD ID, otherwise make a new one
      id: existingBlog ? existingBlog.id : Date.now().toString(),
      title: title,
      content: content,
      tags: tags,
      coverImage: coverImage,
      // If editing, keep original date, otherwise new date
      createdAt: existingBlog ? existingBlog.createdAt : new Date().toISOString(),
      author: user?.username || 'Anonymous',
      userId: user?.id,
      likes: existingBlog ? existingBlog.likes : 0,
      isDraft: isDraft
    };

    try {
      if (existingBlog) {
        // UPDATE MODE: Update blog in database
        blogDB.updateBlog(existingBlog.id, blogPost);
        console.log('Blog updated successfully');
      } else {
        // CREATE MODE: Create new blog in database
        blogDB.createBlog(blogPost);
        console.log('Blog saved successfully');
      }
      
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save. Image might be too large.');
    }

    setTimeout(() => {
        setSubmitting(false);
        navigate(isDraft ? '/profile' : '/blog'); 
    }, 1000);
  };

  return (
    <div className="create-blog-wrapper">
      <h1 className="create-blog-title">{existingBlog ? 'Edit Blog' : 'Create Blog'}</h1>
      
      <form className="create-blog-card-wide" onSubmit={(e) => e.preventDefault()}>
        
        {/* Title */}
        <div>
          <label className="field-label">Title</label>
          <input
            className="text-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter an inspiring title..."
          />
        </div>

        {/* Image */}
        <div>
           <label className="field-label">Cover Image</label>
           <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
           {!coverImage ? (
             <div className="image-upload-box" onClick={triggerFileInput}>
               <span className="upload-icon">📷</span>
               <p>Click to upload a cover image</p>
             </div>
           ) : (
             <div className="image-preview-container">
               <img src={coverImage} alt="Cover" className="image-preview" />
               <button type="button" className="remove-image-btn" onClick={removeImage}>×</button>
             </div>
           )}
        </div>

        {/* Tags */}
        <div>
          <label className="field-label">Tags</label>
          <div className="tag-input-wrapper">
              {tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag} <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="tag-input-field"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
              />
            </div>
        </div>

        {/* Editor */}
        <div>
          <label className="field-label">Content</label>
          <div className="rich-text-editor">
            <div className="rich-text-toolbar">
              <button type="button" onClick={() => handleFormat('bold')}><b>B</b></button>
              <button type="button" onClick={() => handleFormat('italic')}><i>I</i></button>
              <button type="button" onClick={() => handleFormat('underline')}><u>U</u></button>
              <button type="button" onClick={() => handleFormat('insertUnorderedList')}>• List</button>
            </div>
            <div
              ref={contentEditableRef}
              className="rich-text-content"
              contentEditable
              onInput={handleContentChange}
              data-placeholder="Share your story here..."
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group-wide">
          <button type="button" className="save-draft-btn" onClick={(e) => handlePublish(e, true)}>
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="button" className="publish-btn" onClick={(e) => handlePublish(e, false)}>
            {submitting ? 'Updating...' : (existingBlog ? 'Update Blog' : 'Publish')}
          </button>
        </div>

      </form>
    </div>
  );
}

export default CreateBlog;