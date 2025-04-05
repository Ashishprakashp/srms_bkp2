import React, { useState } from 'react';
import { Table, Form, Button, Row, Col, Card, Spinner ,Pagination} from 'react-bootstrap';
import axios from 'axios';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';


const DynamicQuery = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true
      });
    } finally {
      navigate('/', { replace: true }); // Replace history entry
      window.location.reload(); // Optional: Refresh the page to clear state
    }
  };
// Available attributes with metadata
const availableAttributes = [
// Personal Information
{
label: 'Register No',
path: 'studentId',
type: 'string',
operators: ['equals', 'startsWith', 'endsWith']
},
{
label: 'Name',
path: 'name',
type: 'string',
operators: ['equals', 'contains', 'startsWith', 'endsWith']
},
{
label: 'Branch',
path: 'branch',
type: 'enum',
enumOptions: ['MCA', 'MBA', 'MSc', 'BCom', 'BSc'],
operators: ['equals']
},
{
label: 'Regulation',
path: 'regulation',
type: 'enum',
enumOptions: ['2020', '2021', '2022', '2023', '2024'],
operators: ['equals']
},
{
label: 'Class',
path: 'account._class',
type: 'enum',
enumOptions: ['REG', 'SS'],
operators: ['equals']
},
// Other collection attributes
{
label: 'Community',
path: 'personalInformation.community',
type: 'enum',
enumOptions: ['OC', 'BC', 'MBC', 'SC', 'ST'],
operators: ['equals']
},
{
label: 'Sex',
path: 'personalInformation.sex',
type: 'enum',
enumOptions: ['M', 'F'],
operators: ['equals']
},
{
label: 'Blood Group',
path: 'personalInformation.blood',
type: 'enum',
enumOptions: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
operators: ['equals']
},
// Family Information
{
label: 'Father Name',
path: 'familyInformation.fatherName',
type: 'string',
operators: ['equals', 'contains']
},
{
label: 'Mother Name',
path: 'familyInformation.motherName',
type: 'string',
operators: ['equals', 'contains']
},
{
label: 'Father Income',
path: 'familyInformation.fatherInc',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number'
},
// Education
{
label: 'XII Percentage',
path: 'education.xiiPercentage',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number'
},
{
label: 'X Percentage',
path: 'education.xPercentage',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number'
},
{
label: 'UG Percentage',
path: 'education.ugPercentage',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number'
},
// StudentAccs
{
label: 'Class',
path: 'account._class',
type: 'enum',
enumOptions: ['REG', 'SS'],
operators: ['equals']
},
{
label: 'Grades Approved',
path: 'account.grades_approved',
type: 'enum',
enumOptions: ['0', '1'],
operators: ['equals']
},
// StudentGrades
{
label: 'Sem 1 GPA',
path: 'grades.semesterSubmissions.1.gpa',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number',
step: '0.01'
},
{
label: 'Sem 2 GPA',
path: 'grades.semesterSubmissions.2.gpa',
type: 'number',
operators: ['equals', 'greaterThan', 'lessThan'],
inputType: 'number',
step: '0.01'
}
];

const [filters, setFilters] = useState([]);
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(false);
const [queriedAttributes, setQueriedAttributes] = useState([]);
const [sortConfig, setSortConfig] = useState({
key: 'studentId',
direction: 'asc'
});

// Filter management
const addFilter = () => {
setFilters([...filters, { 
id: Date.now(),
attributePath: availableAttributes[0].path,
operator: availableAttributes[0].operators[0],
value: ''
}]);
};

const removeFilter = (id) => {
setFilters(filters.filter(filter => filter.id !== id));
};

const updateFilter = (id, key, value) => {
setFilters(filters.map(filter => {
if (filter.id === id) {
if (key === 'attributePath') {
const newAttribute = availableAttributes.find(a => a.path === value);
return {
...filter,
attributePath: value,
operator: newAttribute.operators[0],
value: ''
};
}
return { ...filter, [key]: value };
}
return filter;
}));
};

// Query building with proper numeric handling
const buildQuery = () => {
  const queryConditions = filters.map(filter => {
    const attribute = availableAttributes.find(a => a.path === filter.attributePath);
    if (!attribute || !filter.value) return null;

    // Map frontend paths to backend query paths
    // Update the buildQuery function's path mapping
let backendPath = filter.attributePath;
if (filter.attributePath.startsWith('personalInformation.')) {
  backendPath = `details.personalInformation.${filter.attributePath.split('.')[1]}`;
} else if (filter.attributePath.startsWith('familyInformation.')) {
  backendPath = `details.familyInformation.${filter.attributePath.split('.')[1]}`;
} else if (filter.attributePath.startsWith('education.')) {
  backendPath = `details.education.${filter.attributePath.split('.')[1]}`;
} else if (filter.attributePath.startsWith('grades.')) {
  const parts = filter.attributePath.split('.');
  backendPath = `grades.semesterSubmissions.${parts[2]}.${parts[3]}`;
} else if (filter.attributePath.startsWith('account.')) { // Add this block
  backendPath = filter.attributePath.replace('account.', '');
}

    // Rest of the condition building...
    const { type } = attribute;
    const { operator, value } = filter;

    if (type === 'number') {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) return null;

      switch (operator) {
        case 'equals': return { [backendPath]: numericValue };
        case 'greaterThan': return { [backendPath]: { $gt: numericValue } };
        case 'lessThan': return { [backendPath]: { $lt: numericValue } };
        default: return { [backendPath]: numericValue };
      }
    }

    switch (operator) {
      case 'equals': return { [backendPath]: value };
      case 'contains': return { [backendPath]: { $regex: value, $options: 'i' } };
      case 'startsWith': return { [backendPath]: { $regex: `^${value}`, $options: 'i' } };
      case 'endsWith': return { [backendPath]: { $regex: `${value}$`, $options: 'i' } };
      default: return { [backendPath]: value };
    }
  }).filter(condition => condition !== null);

  return queryConditions.length > 0 ? { $and: queryConditions } : {};
};
// Sorting function
const requestSort = (key) => {
let direction = 'asc';
if (sortConfig.key === key && sortConfig.direction === 'asc') {
direction = 'desc';
}
setSortConfig({ key, direction });
};

// Enhanced getNestedValue function
// Update the getNestedValue function
// Verify the getNestedValue function handles grades correctly
const getNestedValue = (obj, path) => {
  try {
    if (obj[path] !== undefined) return obj[path] || '-';
    
    if (path.startsWith('account.')) {
      const accountField = path.replace('account.', '');
      return obj.account?.[accountField] || '-';
    }
    
    // Handle grades.semesterSubmissions paths
    if (path.startsWith('grades.semesterSubmissions.')) {
      const parts = path.split('.');
      const semester = parts[2];
      const field = parts[3];
      const gpa = obj.grades?.semesterSubmissions?.[semester]?.[field];
      return gpa !== null && gpa !== undefined ? gpa.toFixed(2) : '-';
    }
    
    return path.split('.').reduce((o, p) => o?.[p], obj) || '-';
  } catch (error) {
    console.error(`Error accessing path ${path}:`, error);
    return '-';
  }
};

// Apply sorting to students data
const sortedStudents = React.useMemo(() => {
if (!students.length) return [];
const sortableItems = [...students];
sortableItems.sort((a, b) => {
// Get values to compare
let aValue = getNestedValue(a, sortConfig.key);
let bValue = getNestedValue(b, sortConfig.key);

// Convert to numbers if possible for numeric comparison

if (!isNaN(aValue)) aValue = Number(aValue);
if (!isNaN(bValue)) bValue = Number(bValue);

// Handle null/undefined values
if (aValue === '-' || aValue === null || aValue === undefined) return 1;
if (bValue === '-' || bValue === null || bValue === undefined) return -1;

if (aValue < bValue) {
return sortConfig.direction === 'asc' ? -1 : 1;
}
if (aValue > bValue) {
return sortConfig.direction === 'asc' ? 1 : -1;
}
return 0;
});
return sortableItems;
}, [students, sortConfig]);


// Render sort indicator
const getSortIndicator = (key) => {
if (sortConfig.key !== key) return null;
return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
};


// Data fetching with proper error handling
// Update the fetchStudents function
const fetchStudents = async () => {
setLoading(true);
try {
const query = buildQuery();
const response = await axios.post('http://localhost:5000/query-students', { 
query,
sortField: sortConfig.key,
sortDirection: sortConfig.direction
});
const processedData = response.data.map(student => ({
_id: student._id,
// Direct from studentacc
studentId: student.studentId || '-',
name: student.name || '-',
branch: student.branch || '-',
regulation: student.regulation || '-',
// Account info
account: {
_class: student._class || '-',
facultyAdvisor: student.facultyAdvisor || '-'
},
// From other collections
personalInformation: student.personalInformation || {},
familyInformation: student.familyInformation || {},
education: student.education || {},
grades: student.grades || {
semesterSubmissions: {
'1': { gpa: null },
'2': { gpa: null }
}
}
}));

setStudents(processedData);
setQueriedAttributes([...new Set(filters.map(filter => filter.attributePath))]);
} catch (error) {
console.error('Fetch error:', error);
alert(`Error: ${error.response?.data?.message || error.message}`);
} finally {
setLoading(false);
}
};
const resetFilters = () => {
setFilters([]);
setStudents([]);
setQueriedAttributes([]);
};
const downloadExcel = () => {
  // Create worksheet data
  const worksheetData = [
    ["ANNA UNIVERSITY"],
    ["DEPARTMENT OF IST"],
    [],
    ["Applied Filters:", ...filters.map(filter => {
      const attribute = availableAttributes.find(a => a.path === filter.attributePath);
      return `${attribute?.label} ${filter.operator} ${filter.value}`;
    })],
    [], // Empty row
    [
      'Register No',
      'Name',
      'Branch',
      ...queriedAttributes.map(path => 
        availableAttributes.find(a => a.path === path)?.label || path
      )
    ]
  ];

  // Add student data
  sortedStudents.forEach(student => {
    worksheetData.push([
      student.studentId,
      student.name,
      student.branch,
      ...queriedAttributes.map(path => {
        const value = getNestedValue(student, path);
        // Convert numbers to proper Excel numeric type
        return typeof value === 'number' ? Number(value.toFixed(2)) : value;
      })
    ]);
  });

  // Create worksheet
  const worksheet = utils.aoa_to_sheet(worksheetData);
  
  // Create workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Students");

  // Set column widths
  const cols = [
    { wch: 15 }, // Register No
    { wch: 30 }, // Name
    { wch: 10 }, // Branch
    ...queriedAttributes.map(() => ({ wch: 20 })) // Dynamic columns
  ];
  worksheet['!cols'] = cols;

  // Write file
  const date = new Date().toISOString().split('T')[0];
  writeFile(workbook, `AnnaUniv_IST_Students_${date}.xlsx`);
};

const indexOfLastStudent = currentPage * studentsPerPage;
const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

const PaginationComponent = () => (
  <Pagination className="mt-3 justify-content-center">
    {[...Array(Math.ceil(sortedStudents.length / studentsPerPage)).keys()].map((number) => (
      <Pagination.Item
        key={number + 1}
        active={number + 1 === currentPage}
        onClick={() => setCurrentPage(number + 1)}
      >
        {number + 1}
      </Pagination.Item>
    ))}
  </Pagination>
);



return (
  <>
  <TitleBar />
  <div className="d-flex vh-100">
        <SideBar onLogoutClick={() => setShowLogoutModal(true)} />
        <div className='main-content-ad-dboard flex-grow-1 overflow-y-auto'>
<div className="p-4">
<Button className="float-end px-4" onClick={() => navigate('/admin-dashboard/student-mgmt')}>Back</Button>
<h2 className="mb-4">Student Query System</h2>

{showLogoutModal && (
              <div className="logout-modal-overlay">
                <div className="logout-modal-content p-5">
                  <h3 className='text-center'>Confirm Logout ?</h3>
                  <div className="modal-buttons mt-5" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="secondary" className='fs-5 px-5' onClick={() => setShowLogoutModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" className='fs-5 px-5' onClick={handleLogout}>
                     Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}
<Card className="mb-4">
<Card.Header>
<div className="d-flex justify-content-between align-items-center">
<span>Filters</span>
<div>
<Button variant="primary" onClick={addFilter} className="me-2">
Add Filter
</Button>
<Button variant="secondary" onClick={resetFilters}>
Reset
</Button>
</div>
</div>
</Card.Header>
<Card.Body>
{filters.length === 0 ? (
<div className="text-center text-muted py-3">
No filters added. Click "Add Filter" to start querying.
</div>
) : (
<>
{filters.map((filter) => {
const attribute = availableAttributes.find(a => a.path === filter.attributePath);
return (
<Row key={filter.id} className="mb-3 align-items-center">
<Col md={4}>
<Form.Select
value={filter.attributePath}
onChange={(e) => updateFilter(filter.id, 'attributePath', e.target.value)}
>
{availableAttributes.map((attr) => (
<option key={attr.path} value={attr.path}>{attr.label}</option>
))}
</Form.Select>
</Col>
<Col md={2}>
<Form.Select
value={filter.operator}
onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
>
{attribute?.operators.map((op) => (
<option key={op} value={op}>
{op.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
</option>
))}
</Form.Select>
</Col>
<Col md={4}>
{attribute?.type === 'enum' ? (
<Form.Select
value={filter.value}
onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
>
<option value="">Select Value</option>
{attribute.enumOptions.map((val) => (
<option key={val} value={val}>{val}</option>
))}
</Form.Select>
) : (
<Form.Control
type={attribute?.inputType || 'text'}
value={filter.value}
onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
placeholder={`Enter ${attribute?.label.toLowerCase()}`}
step={attribute?.step || undefined}
/>
)}
</Col>
<Col md={2}>
<Button variant="danger" onClick={() => removeFilter(filter.id)}>
Remove
</Button>
</Col>
</Row>
);
})}
<div className="d-flex justify-content-end mt-3">
<Button variant="success" onClick={fetchStudents} disabled={loading}>
{loading ? (
<>
<Spinner as="span" animation="border" size="sm" className="me-2" />
Searching...
</>
) : 'Search Students'}
</Button>
<Button variant="primary" onClick={downloadExcel} disabled={students.length === 0} className='ms-5'>
      Download Excel
    </Button>
</div>

</>
)}
</Card.Body>
</Card>
<Card>
<Card.Header>Results ({students.length} students found)</Card.Header>
<Card.Body>
{loading ? (
<div className="text-center py-4">
<Spinner animation="border" variant="primary" />
<p className="mt-2">Loading student data...</p>
</div>
) : students.length > 0 ? (
<div className="table-responsive">
<Table striped bordered hover>
<thead>
<tr>
<th onClick={() => requestSort('studentId')} style={{ cursor: 'pointer' }}>
Register No{getSortIndicator('studentId')}
</th>
<th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
Name{getSortIndicator('name')}
</th>
<th onClick={() => requestSort('branch')} style={{ cursor: 'pointer' }}>
Branch{getSortIndicator('branch')}
</th>
{queriedAttributes.map(path => {
const attr = availableAttributes.find(a => a.path === path);
return (
<th key={path} onClick={() => requestSort(path)} style={{ cursor: 'pointer' }}>
{attr?.label || path}{getSortIndicator(path)}
</th>
);
})}
</tr>
</thead>
<tbody>
  {currentStudents.map((student) => (
    <tr key={student._id}>
      <td>{student.studentId}</td>
      <td>{student.name}</td>
      <td>{student.branch}</td>
      {queriedAttributes.map(path => {
        const value = getNestedValue(student, path);
        return <td key={path}>{value === '-' ? '' : value}</td>;
      })}
    </tr>
  ))}
</tbody>
</Table>
<PaginationComponent />
</div>
) : (
<div className="text-center py-4 text-muted">
{filters.length > 0 ? 'No students match your filters' : 'Add filters and search to find students'}
</div>
)}
</Card.Body>
</Card>
</div>
</div>
</div>
</>
);

};

export default DynamicQuery;

