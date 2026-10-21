import { useEffect, useState } from 'react'
import { getCourses, updateCourse, deleteCourse } from '../services/courseApi'

const emptyCourse = {
  code: '',
  title: '',
  credits: '',
}

function readError(err, fallback) {
  const data = err?.response?.data
  if (typeof data === 'string' && data.trim()) {
    return data
  }
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }
  return fallback
}

function Courses() {
  const [courses, setCourses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [course, setCourse] = useState(emptyCourse)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    const fetchCourses = async () => {
      try {
        const response = await getCourses()
        if (!active) return
        if (!Array.isArray(response.data)) {
          setCourses([])
          setError('Failed to load courses.')
          return
        }
        setCourses(response.data)
      } catch (err) {
        if (active) setError('Failed to load courses.')
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchCourses()
    return () => {
      active = false
    }
  }, [])

  const loadCourses = async () => {
    const response = await getCourses()
    if (!Array.isArray(response.data)) {
      throw new Error('Course API did not return a list.')
    }
    setCourses(response.data)
  }

  const handleEdit = (selectedCourse) => {
    setEditingId(selectedCourse.id)
    setCourse({
      code: String(selectedCourse.code ?? ''),
      title: String(selectedCourse.title ?? ''),
      credits: String(selectedCourse.credits ?? ''),
    })
    setMessage('')
    setError('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setCourse((previous) => ({ ...previous, [name]: value }))
  }

  const handleCancel = () => {
    setEditingId(null)
    setCourse(emptyCourse)
  }

  const handleUpdate = async (event) => {
    event.preventDefault()

    const updatedCourse = {
      code: String(course.code ?? '').trim(),
      title: String(course.title ?? '').trim(),
      credits: Number(course.credits),
    }

    if (!updatedCourse.code || !updatedCourse.title) {
      setMessage('')
      setError('Course code and title are required.')
      return
    }

    if (!Number.isInteger(updatedCourse.credits) || updatedCourse.credits < 1) {
      setMessage('')
      setError('Credits must be a whole number of at least 1.')
      return
    }

    setSaving(true)
    try {
      await updateCourse(editingId, updatedCourse)
    } catch (err) {
      console.error(err)
      setMessage('')
      setError(readError(err, 'Failed to update course. Check the API response.'))
      setSaving(false)
      return
    }

    try {
      await loadCourses()
      setEditingId(null)
      setCourse(emptyCourse)
      setError('')
      setMessage('Course updated successfully!')
    } catch (err) {
      console.error(err)
      setError('The course was updated, but the list could not be refreshed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return

    setSaving(true)
    try {
      await deleteCourse(id)
    } catch (err) {
      console.error(err)
      setMessage('')
      setError(readError(err, 'Failed to delete course. Check the API response.'))
      setSaving(false)
      return
    }

    try {
      await loadCourses()
      if (editingId === id) {
        setEditingId(null)
        setCourse(emptyCourse)
      }
      setError('')
      setMessage('Course deleted successfully!')
    } catch (err) {
      console.error(err)
      setError('The course was deleted, but the list could not be refreshed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-center mb-4">Course Management</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {editingId !== null && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-warning">
            <strong>Edit Course</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label" htmlFor="course-code">
                    Course Code
                  </label>
                  <input
                    id="course-code"
                    type="text"
                    name="code"
                    className="form-control"
                    value={course.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label" htmlFor="course-title">
                    Course Title
                  </label>
                  <input
                    id="course-title"
                    type="text"
                    name="title"
                    className="form-control"
                    value={course.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label" htmlFor="course-credits">
                    Credits
                  </label>
                  <input
                    id="course-credits"
                    type="number"
                    name="credits"
                    min="1"
                    step="1"
                    className="form-control"
                    value={course.credits}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {loading && <p>Loading courses...</p>}

      {!loading && courses.length === 0 && !error && (
        <p className="text-muted">No courses available.</p>
      )}

      {!loading && courses.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between">
            <strong>Course List</strong>
            <span>Total courses: {courses.length}</span>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.code}</td>
                      <td>{item.title}</td>
                      <td>{item.credits}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(item)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses
