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
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import TemplateForm from '../../components/admin/TemplateForm';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const handleToggleStatus = async (templateId, currentStatus) => {
    try {
      await axios.put(`/api/templates/${templateId}/status`);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle template status', error);
    }
  };

  const handleSubmitTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await axios.put(`/api/templates/${editingTemplate.templateId}`, templateData);
      } else {
        await axios.post('/api/templates', templateData);
      }
      fetchTemplates();
      setOpenDialog(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Document Templates
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<Add />} 
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        New Template
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Approval Flow</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.templateId}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.description}</TableCell>
                <TableCell>
                  {template.approvalFlow.facultyAdvisor && 'FA '}
                  {template.approvalFlow.hod && 'HOD '}
                  {!template.approvalFlow.facultyAdvisor && !template.approvalFlow.hod && 'None'}
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={template.active}
                        onChange={() => handleToggleStatus(template.templateId, template.active)}
                      />
                    }
                    label={template.active ? 'Active' : 'Inactive'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setEditingTemplate(template);
                    setOpenDialog(true);
                  }}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditingTemplate(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
        <DialogContent>
          <TemplateForm 
            template={editingTemplate} 
            onSubmit={handleSubmitTemplate} 
            onCancel={() => {
              setOpenDialog(false);
              setEditingTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TemplatesPage;