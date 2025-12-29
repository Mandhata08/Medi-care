import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getResponseData, handleApiError } from '../../utils/apiHelpers';

function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/api/prescriptions/patient/my-prescriptions/');
      setPrescriptions(getResponseData(response));
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error(handleApiError(error, 'Failed to fetch prescriptions'));
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        My Prescriptions
      </Typography>
      <Box sx={{ mt: 2 }}>
        {prescriptions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No prescriptions found</Typography>
          </Paper>
        ) : (
          prescriptions.map((prescription) => (
            <Accordion key={prescription.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                  <Typography>
                    Prescription #{prescription.id} - {prescription.doctor_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(prescription.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>
                  Diagnosis: {prescription.diagnosis}
                </Typography>
                {prescription.notes && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Notes: {prescription.notes}
                  </Typography>
                )}
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Medicines:
                </Typography>
                <List>
                  {prescription.medicines.map((medicine, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={medicine.medicine_name}
                        secondary={`${medicine.dosage} - ${medicine.frequency} - ${medicine.duration}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {prescription.lab_tests && prescription.lab_tests.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Lab Tests Recommended:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {prescription.lab_tests.map((test, idx) => (
                        <Chip
                          key={idx}
                          label={test.test_name}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Container>
  );
}

export default MyPrescriptions;

