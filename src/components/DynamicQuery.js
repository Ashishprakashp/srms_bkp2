import React, { useState , useEffect ,useRef} from 'react';
import { Table, Form, Button, Row, Col, Card, Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';
import TitleBar from './TitleBar.js';
import SideBar from './SideBar.js';
import { useNavigate } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DynamicQuery = () => {
  
  const [maxSemesters, setMaxSemesters] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState(null);
  const attributeDropdownRefs = useRef({});
  
  
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true
      });
    } finally {
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  const semesterGpaAttributes = Array.from({ length: maxSemesters }, (_, i) => ({
    label: `Sem ${i + 1} GPA`,
    path: `grades.semesterSubmissions.${i + 1}.gpa`,
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan'],
    inputType: 'number',
    step: '0.01'
  }));

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
      enumOptions: ['MCA', 'MTECH IT', 'MTECH IT AI & DS', 'BTECH IT'],
      operators: ['equals']
    },
    {
      label: 'Regulation',
      path: 'regulation',
      type: 'enum',
      enumOptions: ['2020', '2021', '2022', '2023', '2024'],
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
    // StudentGrades (dynamic semesters)
    ...semesterGpaAttributes,
    {
      label: 'CGPA',
      path: 'cgpa',
      type: 'number',
      operators: ['equals', 'greaterThan', 'lessThan'],
      inputType: 'number',
      step: '0.01'
    },
    {
      label: 'Batch',
      path: 'batch',
      type: 'string',
      operators: ['equals', 'contains']
    },
    {
      label: 'Arrears',
      path: 'arrears',
      type: 'arrears',
      operators: ['equals', 'greaterThan', 'lessThan', 'hasSubject'],
      inputType: 'number'
    },
  ];

  const [filters, setFilters] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queriedAttributes, setQueriedAttributes] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'studentId',
    direction: 'asc'
  });


  useEffect(() => {
    const branchFilter = filters.find(f => f.attributePath === 'branch');
    if (branchFilter) {
      const branchValue = branchFilter.value.toUpperCase();
      let newMax = 4;
      if (branchValue.startsWith('BTECH')) {
        newMax = 8;
      } else if (branchValue.startsWith('MCA') || branchValue.startsWith('MTECH')) {
        newMax = 4;
      }
      setMaxSemesters(newMax);
    } else {
      setMaxSemesters(4);
    }
  }, [filters]);

  // Filter management
  const addFilter = () => {
    const newFilter = { 
      id: Date.now(),
      attributePath: availableAttributes[0].path,
      operator: availableAttributes[0].operators[0],
      value: '',
      searchTerm: ''
    };
    setFilters([...filters, newFilter]);
    setActiveFilterId(newFilter.id);
  };

  const removeFilter = (id) => {
    setFilters(filters.filter(filter => filter.id !== id));
  };

  const updateFilter = (id, updates) => {
    setFilters(filters.map(filter => {
      if (filter.id === id) {
        // When attributePath changes, reset operator and value
        if (updates.attributePath && updates.attributePath !== filter.attributePath) {
          const newAttribute = availableAttributes.find(a => a.path === updates.attributePath);
          return {
            ...filter,
            attributePath: updates.attributePath,
            operator: newAttribute.operators[0],
            value: newAttribute.type === 'enum' ? newAttribute.enumOptions[0] : '',
            searchTerm: newAttribute.label
          };
        }
        return { ...filter, ...updates };
      }
      return filter;
    }));
  };

  const getFilteredAttributes = (searchTerm) => {
    if (!searchTerm) return availableAttributes;
    return availableAttributes.filter(attr => 
      attr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderFilters = () => {
    return filters.map((filter) => {
      const attribute = availableAttributes.find(a => a.path === filter.attributePath);
      const isEnum = attribute?.type === 'enum';
      const filteredAttributes = getFilteredAttributes(filter.searchTerm);
      const isActive = activeFilterId === filter.id;
  
      // Calculate display value - show search term when typing, otherwise show selected attribute label
      const displayValue = isActive ? filter.searchTerm : (attribute?.label || '');
  
      return (
        <Row key={filter.id} className="mb-3 align-items-center">
          <Col md={4}>
            <div 
              className="position-relative"
              ref={el => attributeDropdownRefs.current[filter.id] = el}
              onClick={(e) => e.stopPropagation()}
            >
              <Form.Control
                type="text"
                value={displayValue}
                onChange={(e) => {
                  updateFilter(filter.id, { 
                    searchTerm: e.target.value,
                    // Clear attributePath if user is typing something different
                    attributePath: e.target.value === '' ? '' : 
                      (attribute?.label === e.target.value ? filter.attributePath : '')
                  });
                }}
                onFocus={() => {
                  setActiveFilterId(filter.id);
                  // Initialize search term with current attribute label if empty
                  if (!filter.searchTerm && attribute) {
                    updateFilter(filter.id, { searchTerm: attribute.label });
                  }
                }}
                placeholder="Search attribute..."
              />
              {isActive && (
                <div 
                  className="position-absolute w-100 bg-white border mt-1"
                  style={{ 
                    zIndex: 1000, 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    display: filteredAttributes.length > 0 ? 'block' : 'none'
                  }}
                >
                  {filteredAttributes.map((attr) => (
                    <div
                      key={attr.path}
                      className="p-2 hover-bg-light cursor-pointer"
                      onClick={() => {
                        updateFilter(filter.id, { 
                          attributePath: attr.path,
                          searchTerm: attr.label
                        });
                        setActiveFilterId(null);
                      }}
                    >
                      <div><strong>{attr.label}</strong></div>
                      <small className="text-muted">{attr.path}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
          <Col md={2}>
            <Form.Select 
              value={filter.operator} 
              onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
            >
              {attribute?.operators.map((op) => (
                <option key={op} value={op}>
                  {op === 'hasSubject' ? 'Has Subject' : 
                   op.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            {filter.operator === 'hasSubject' ? (
              <Form.Control
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                placeholder="Enter subject code"
              />
            ) : isEnum ? (
              <Form.Select
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
              >
                {attribute.enumOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type={attribute?.inputType || 'text'}
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
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
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if we clicked outside all attribute dropdowns
      const clickedOutsideAll = Object.values(attributeDropdownRefs.current).every(ref => {
        return ref && !ref.contains(event.target);
      });
  
      if (clickedOutsideAll) {
        setActiveFilterId(null);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Query building with proper numeric handling
  const buildQuery = () => {
    const queryConditions = filters.map(filter => {
      const attribute = availableAttributes.find(a => a.path === filter.attributePath);
      if (!attribute || !filter.value) return null;

      // Handle arrears specially
      if (filter.attributePath === 'arrears') {
        if (filter.operator === 'hasSubject') {
          return {
            'arrears.subject_code': filter.value,
            'arrears.status': 'active'
          };
        } else {
          const numericValue = parseInt(filter.value);
          if (isNaN(numericValue)) return null;
          
          const comparison = filter.operator === 'equals' ? '$eq' : 
                            filter.operator === 'greaterThan' ? '$gt' : '$lt';
          
                            return {
  $expr: {
    [comparison]: [
      {
        $size: {
          $filter: {
            input: {
              $cond: [ // ✅ Ensure input is always an array
                { $isArray: "$arrears" },
                "$arrears",
                []
              ]
            },
            as: 'arr',
            cond: { $eq: ['$$arr.status', 'active'] }
          }
        }
      },
      numericValue
    ]
  }
};
        }
      }

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
      } else if (filter.attributePath.startsWith('account.')) {
        backendPath = filter.attributePath.replace('account.', '');
      }
      
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

  const getNestedValue = (obj, path) => {
    try {
      if (path === 'batch') {
        return obj.from_year && obj.to_year 
          ? `${obj.from_year}-${obj.to_year}` 
          : '-';
      }

      if (path === 'arrears') {
        if (!obj.arrears || !Array.isArray(obj.arrears)) return 0;
        return obj.arrears.filter(arr => arr.status === 'active').length;
      }

      if (obj[path] !== undefined) return obj[path] || '-';
      
      if (path.startsWith('account.')) {
        const accountField = path.replace('account.', '');
        return obj.account?.[accountField] || '-';
      }
      
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
      let aValue = getNestedValue(a, sortConfig.key);
      let bValue = getNestedValue(b, sortConfig.key);

      if (!isNaN(aValue)) aValue = Number(aValue);
      if (!isNaN(bValue)) bValue = Number(bValue);

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

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = buildQuery();
      console.log(query);
      const response = await axios.post('http://localhost:5000/query-students', { 
        query: query,
        sortField: sortConfig.key,
        sortDirection: sortConfig.direction
      });
      console.log(response.data);
      const processedData = response.data.map(student => ({
        _id: student._id,
        studentId: student.studentId || '-',
        name: student.name || '-',
        branch: student.branch || '-',
        from_year: student.from_year || '-',
        to_year: student.to_year || '-', 
        regulation: student.regulation || '-',
        batch: student.from_year && student.to_year 
                ? `${student.from_year}-${student.to_year}` 
                : '-',
        cgpa: student.cgpa || null, 
        arrears: student.arrears || [], 
        account: {
          _class: student._class || '-',
          facultyAdvisor: student.facultyAdvisor || '-'
        },
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
      // console.log(processedData);
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
    const worksheetData = [
      ["ANNA UNIVERSITY"],
      ["DEPARTMENT OF IST"],
      [],
      ["Applied Filters:", ...filters.map(filter => {
        const attribute = availableAttributes.find(a => a.path === filter.attributePath);
        return `${attribute?.label} ${filter.operator} ${filter.value}`;
      })],
      [],
      [
        'S.no',
        'Register No',
        'Name',
        'Branch',
        'Batch', 
        ...queriedAttributes.map(path => {
          
          if (path === 'arrears') return 'Active Arrears Count';
          return availableAttributes.find(a => a.path === path)?.label || path;
        })
      ]
    ];

    sortedStudents.forEach((student, index) => {
      worksheetData.push([
        index + 1,
        student.studentId,
        student.name,
        student.branch,
        student.from_year && student.to_year 
          ? `${student.from_year}-${student.to_year}`
          : '-',
        ...queriedAttributes.map(path => {
          if (path === 'cgpa') {
            return student.cgpa ? student.cgpa.toFixed(2) : '-';
          }
          if (path === 'arrears') {
            return student.arrears?.filter(arr => arr.status === 'active').length || 0;
          }
          const value = getNestedValue(student, path);
          return typeof value === 'number' ? Number(value.toFixed(2)) : value;
        })
      ]);
    });

    const worksheet = utils.aoa_to_sheet(worksheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Students");

    const cols = [
      { wch: 10 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      ...queriedAttributes.map(() => ({ wch: 20 }))
    ];
    worksheet['!cols'] = cols;

    const date = new Date().toISOString().split('T')[0];
    writeFile(workbook, `AnnaUniv_IST_Students_${date}.xlsx`);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

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

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    // Add logo (replace with your actual logo path)
    const logoUrl = '/AnnaUniLogo.png'; // Update this path
    doc.addImage(logoUrl, 'PNG', 20, 5, 20, 20); // Centered horizontally (A4 landscape width: 297mm)
  
    // Header text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTMENT OF INFORMATION SCIENCE AND TECHNOLOGY', 50, 15);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('COLLEGE OF ENGINEERING GUIDY CAMPUS', 50, 20);
    
    doc.setFontSize(12);
    doc.text('ANNA UNIVERSITY, CHENNAI – 600 025', 50, 25);
    doc.setLineWidth(0.5);
  doc.line(10, 28, 287, 28);
    // Table data
    const headers = [
      'S.no',
      'Register No',
      'Name',
      'Branch',
      'Batch',
      ...queriedAttributes.map(path => {
        if (path === 'arrears') return 'Active Arrears';
        return availableAttributes.find(a => a.path === path)?.label || path;
      })
    ];
  
    const data = sortedStudents.map((student, index) => [
      index + 1,
      student.studentId,
      student.name,
      student.branch,
      student.batch,
      ...queriedAttributes.map(path => {
        if (path === 'arrears') {
          return student.arrears?.filter(arr => arr.status === 'active').length || 0;
        }
        if (path === 'cgpa') {
          return student.cgpa ? student.cgpa.toFixed(2) : '-';
        }
        const value = getNestedValue(student, path);
        return typeof value === 'number' ? value.toFixed(2) : value;
      })
    ]);
  
    // Generate table using autoTable directly
    autoTable(doc, {
      head: [headers],
    body: data,
    startY: 50,
    styles: {
      fontSize: 11,           // Reduced font size
    cellPadding: 1.5,      // Reduced from default 3
    lineHeight: 1.2,       // Tighter line spacing
      lineColor: [0, 0, 0], // Black borders
      lineWidth: 0.2,
      valign: 'middle'
    },
    headStyles: {
      fontSize: 11,           // Match header font size
    cellPadding: 1.5  ,     // Match header padding
      fillColor: [255, 255, 255], // White header background
      textColor: [0, 0, 0],       // Black text
      fontStyle: 'bold',
      lineColor: [0, 0, 0],       // Black borders
      lineWidth: 0.3
    },
    bodyStyles: {
      fontSize: 10,           // Smaller body font
    cellPadding: 1.5   ,    // Consistent padding
      fillColor: [255, 255, 255], // Transparent rows
      textColor: [0, 0, 0],       // Black text
      lineColor: [0, 0, 0],       // Black borders
      lineWidth: 0.2
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] // Keep same as body for no striping
    },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text('© Anna University - Department of IST', data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });
  
    doc.save(`AnnaUniv_IST_Students_${new Date().toISOString().split('T')[0]}.pdf`);
  };
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
            {renderFilters()}
            <div className="d-flex justify-content-end mt-3">
              <Button variant="success" onClick={fetchStudents} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Searching...
                  </>
                ) : 'Search Students'}
              </Button>
              <Button 
    variant="danger" 
    onClick={downloadPDF} 
    disabled={students.length === 0} 
    className='ms-3'
  >
    Download PDF
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
                          <th>S.no</th>
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
                        {currentStudents.map((student,index) => (
                          <tr key={student._id}>
                            <td>{(currentPage - 1) * studentsPerPage + index + 1}</td>
                            <td>{student.studentId}</td>
                            <td>{student.name}</td>
                            <td>{student.branch}</td>
                            {queriedAttributes.map(path => {
                              let value;
                              if (path === 'arrears') {
                                value = student.arrears?.filter(arr => arr.status === 'active').length || 0;
                              } else {
                                value = getNestedValue(student, path);
                              }
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