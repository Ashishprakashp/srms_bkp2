import React, { useState, useEffect } from 'react';

const DynamicQueryComponent = () => {
  // State for query results
  const [results, setResults] = useState([]);
  // State for filter criteria
  const [filters, setFilters] = useState([{ field: 'studentId', operator: 'equals', value: '' }]);
  // State for sorting
  const [sortField, setSortField] = useState('studentId');
  const [sortDirection, setSortDirection] = useState('asc');
  // State for visible columns
  const [visibleColumns, setVisibleColumns] = useState(['studentId', 'name', 'branch', 'regulation', '_class', 'filled', 'approved']);
  // State for column selection modal
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  
  // Available fields from schemas
  const allFields = {
    // StudentAcc fields
    studentId: { type: 'string', label: 'Student ID', schema: 'StudentAcc' },
    name: { type: 'string', label: 'Name', schema: 'StudentAcc' },
    branch: { type: 'string', label: 'Branch', schema: 'StudentAcc' },
    regulation: { type: 'string', label: 'Regulation', schema: 'StudentAcc' },
    from_year: { type: 'string', label: 'From Year', schema: 'StudentAcc' },
    to_year: { type: 'string', label: 'To Year', schema: 'StudentAcc' },
    _class: { type: 'string', label: 'Class', schema: 'StudentAcc' },
    facultyAdvisor: { type: 'string', label: 'Faculty Advisor', schema: 'StudentAcc' },
    can_fill: { type: 'number', label: 'Can Fill', schema: 'StudentAcc' },
    filled: { type: 'number', label: 'Filled', schema: 'StudentAcc' },
    approved: { type: 'number', label: 'Approved', schema: 'StudentAcc' },
    refill: { type: 'number', label: 'Refill', schema: 'StudentAcc' },
    can_enroll: { type: 'string', label: 'Can Enroll', schema: 'StudentAcc' },
    enrolled: { type: 'string', label: 'Enrolled', schema: 'StudentAcc' },
    can_fill_grades: { type: 'string', label: 'Can Fill Grades', schema: 'StudentAcc' },
    grades_filled: { type: 'string', label: 'Grades Filled', schema: 'StudentAcc' },
    grades_approved: { type: 'string', label: 'Grades Approved', schema: 'StudentAcc' },
    
    // StudentGrades fields
    'enrolledCourses.courseCode': { type: 'string', label: 'Course Code', schema: 'StudentGrades' },
    'enrolledCourses.semester': { type: 'string', label: 'Semester', schema: 'StudentGrades' },
    'enrolledCourses.grade': { type: 'string', label: 'Grade', schema: 'StudentGrades' },
    'enrolledCourses.confirmation': { type: 'boolean', label: 'Confirmation', schema: 'StudentGrades' },
    'semesterSubmissions.gpa': { type: 'number', label: 'GPA', schema: 'StudentGrades' },
    'semesterSubmissions.totalCredits': { type: 'number', label: 'Total Credits', schema: 'StudentGrades' },
    
    // Course and other related fields
    'course_name': { type: 'string', label: 'Course Name', schema: 'Course' },
    'regulations.year': { type: 'string', label: 'Regulation Year', schema: 'Course' }
  };

  // Available operators based on field type
  const getOperators = (fieldType) => {
    const commonOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not Equals' }
    ];
    
    switch(fieldType) {
      case 'string':
        return [
          ...commonOperators,
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' }
        ];
      case 'number':
        return [
          ...commonOperators,
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
          { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
          { value: 'lessThanOrEqual', label: 'Less Than or Equal' }
        ];
      case 'boolean':
        return commonOperators;
      default:
        return commonOperators;
    }
  };

  // Function to add a new filter
  const addFilter = () => {
    setFilters([...filters, { field: 'studentId', operator: 'equals', value: '' }]);
  };

  // Function to remove a filter
  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // Function to update a filter
  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    
    // Reset operator when field changes
    if (key === 'field') {
      newFilters[index].operator = 'equals';
      newFilters[index].value = '';
    }
    
    setFilters(newFilters);
  };

  // Function to handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to toggle column visibility
  const toggleColumn = (field) => {
    if (visibleColumns.includes(field)) {
      setVisibleColumns(visibleColumns.filter(col => col !== field));
    } else {
      setVisibleColumns([...visibleColumns, field]);
    }
  };

  // Function to execute the query
  const executeQuery = async () => {
    setLoading(true);
    
    try {
      // In a real application, this would be an API call
      // For this example, we'll simulate results
      
      // Mock query building
      const query = filters.map(filter => {
        return {
          field: filter.field,
          operator: filter.operator,
          value: filter.value
        };
      });
      
      console.log('Executing query with filters:', query);
      console.log('Sorted by:', sortField, sortDirection);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock data
        const mockData = [
          { studentId: 'S001', name: 'John Doe', branch: 'CSE', regulation: '2020', _class: 'A', filled: 1, approved: 1, facultyAdvisor: 'Dr. Smith', from_year: '2020', to_year: '2024' },
          { studentId: 'S002', name: 'Jane Smith', branch: 'ECE', regulation: '2021', _class: 'B', filled: 0, approved: 0, facultyAdvisor: 'Dr. Johnson', from_year: '2021', to_year: '2025' },
          { studentId: 'S003', name: 'Bob Brown', branch: 'CSE', regulation: '2020', _class: 'A', filled: 1, approved: 0, facultyAdvisor: 'Dr. Davis', from_year: '2020', to_year: '2024' },
          { studentId: 'S004', name: 'Alice Green', branch: 'MECH', regulation: '2019', _class: 'C', filled: 1, approved: 1, facultyAdvisor: 'Dr. Wilson', from_year: '2019', to_year: '2023' },
          { studentId: 'S005', name: 'Charlie Wilson', branch: 'CIVIL', regulation: '2022', _class: 'A', filled: 0, approved: 0, facultyAdvisor: 'Dr. Brown', from_year: '2022', to_year: '2026' }
        ];
        
        setResults(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error executing query:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Dynamic Schema Query</h5>
        </div>
        <div className="card-body">
          {/* Filter Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Filters</h6>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={addFilter}
              >
                <i className="bi bi-plus-circle me-1"></i> Add Filter
              </button>
            </div>
            
            {filters.map((filter, index) => (
              <div key={index} className="row mb-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Field</label>
                  <select 
                    className="form-select"
                    value={filter.field}
                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                  >
                    {Object.entries(allFields).map(([key, field]) => (
                      <option key={key} value={key}>{field.label} ({field.schema})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Operator</label>
                  <select 
                    className="form-select"
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                  >
                    {getOperators(allFields[filter.field]?.type || 'string').map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Value</label>
                  <input 
                    type={allFields[filter.field]?.type === 'number' ? 'number' : 'text'}
                    className="form-control"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => removeFilter(index)}
                    disabled={filters.length === 1}
                  >
                    <i className="bi bi-trash me-1"></i> Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="mt-3">
              <button 
                className="btn btn-primary me-2" 
                onClick={executeQuery}
                disabled={loading}
              >
                {loading ? 
                  <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Querying...</> : 
                  <><i className="bi bi-search me-1"></i> Execute Query</>
                }
              </button>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                <i className={`bi bi-${showColumnSelector ? 'eye-slash' : 'eye'} me-1`}></i>
                {showColumnSelector ? 'Hide' : 'Select'} Columns
              </button>
            </div>
          </div>
          
          {/* Column Selector */}
          {showColumnSelector && (
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="mb-2">Select Columns to Display</h6>
              <div className="row">
                {Object.entries(allFields).map(([key, field]) => (
                  <div key={key} className="col-md-3 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`col-${key}`}
                        checked={visibleColumns.includes(key)}
                        onChange={() => toggleColumn(key)}
                      />
                      <label className="form-check-label" htmlFor={`col-${key}`}>
                        {field.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results Table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  {visibleColumns.map(col => (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        {allFields[col]?.label || col}
                        {sortField === col && (
                          <span className="ms-1">
                            <i className={`bi bi-caret-${sortDirection === 'asc' ? 'up' : 'down'}-fill`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleColumns.length} className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : results.length > 0 ? (
                  results.map((row, index) => (
                    <tr key={index}>
                      {visibleColumns.map(col => (
                        <td key={col}>
                          {row[col] !== undefined ? 
                            (typeof row[col] === 'boolean' ? 
                              (row[col] ? 
                                <i className="bi bi-check-circle-fill text-success"></i> : 
                                <i className="bi bi-x-circle-fill text-danger"></i>
                              ) : 
                              row[col]
                            ) : 
                            '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length} className="text-center">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      No results found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination (simplified) */}
          {results.length > 0 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex="-1">
                    <i className="bi bi-chevron-left"></i> Previous
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    Next <i className="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
      
      {/* Integration Instructions */}
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Backend Integration Guide</h5>
        </div>
        <div className="card-body">
          <p>To integrate with your MongoDB schemas, you'll need to create an API endpoint that:</p>
          <ol>
            <li>Receives the filter criteria, sort field, and sort direction</li>
            <li>Builds a MongoDB query based on filter operators</li>
            <li>Performs a join between the collections if needed</li>
            <li>Returns paginated results</li>
          </ol>
          <p>Example API route implementation:</p>
          <pre className="bg-light p-3 rounded">
{`// Example backend implementation (Express.js)
app.post('/api/student-query', async (req, res) => {
  try {
    const { filters, sortField, sortDirection, page = 1, limit = 10 } = req.body;
    
    // Build query from filters
    const query = {};
    
    filters.forEach(filter => {
      const { field, operator, value } = filter;
      
      switch(operator) {
        case 'equals':
          query[field] = value;
          break;
        case 'notEquals':
          query[field] = { $ne: value };
          break;
        case 'contains':
          query[field] = { $regex: value, $options: 'i' };
          break;
        case 'startsWith':
          query[field] = { $regex: '^' + value, $options: 'i' };
          break;
        case 'endsWith':
          query[field] = { $regex: value + '$', $options: 'i' };
          break;
        case 'greaterThan':
          query[field] = { $gt: Number(value) };
          break;
        case 'lessThan':
          query[field] = { $lt: Number(value) };
          break;
        case 'greaterThanOrEqual':
          query[field] = { $gte: Number(value) };
          break;
        case 'lessThanOrEqual':
          query[field] = { $lte: Number(value) };
          break;
      }
    });
    
    // Perform the query with sorting and pagination
    const results = await StudentAcc.find(query)
      .sort({ [sortField]: sortDirection === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    const total = await StudentAcc.countDocuments(query);
    
    res.json({
      results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DynamicQueryComponent;