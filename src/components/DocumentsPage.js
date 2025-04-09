import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Box
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  draft: 'default',
  submitted: 'primary',
  fa_approved: 'info',
  hod_approved: 'success',
  rejected: 'error',
  completed: 'success'
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchTemplates();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`/api/students/${user.userId}/documents`);
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      setTemplates(res.data.filter(t => t.active));
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Documents</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/student/documents/new')}
        >
          New Document
        </Button>
      </Box>

      {templates.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Available Templates</Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {templates.map(template => (
              <Paper key={template.templateId} sx={{ p: 2, minWidth: 200 }}>
                <Typography variant="subtitle1">{template.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {template.description}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/student/documents/new/${template.templateId}`)}
                >
                  Create
                </Button>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.documentId}>
                <TableCell>
                  {templates.find(t => t.templateId === document.templateId)?.name || 'Unknown Template'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={document.status.replace('_', ' ')} 
                    color={statusColors[document.status]} 
                  />
                </TableCell>
                <TableCell>
                  {document.submittedAt ? new Date(document.submittedAt).toLocaleString() : 'Not submitted'}
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/student/documents/${document.documentId}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DocumentsPage;