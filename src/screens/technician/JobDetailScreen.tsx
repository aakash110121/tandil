import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

const JobDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { jobId } = route.params;
  
  const [jobStatus, setJobStatus] = useState('in_progress');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldNotes, setFieldNotes] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const job = {
    id: jobId,
    customerName: 'Mohammed Ali Farm',
    customerPhone: '+971 50 123 4567',
    customerEmail: 'info@mohammedali.farm',
    service: 'Tree Watering & Irrigation Check',
    serviceDescription: 'Complete watering service for palm trees and fruit trees with moisture level assessment',
    address: 'Al Ain Oasis, Plot 245, Abu Dhabi, UAE',
    scheduledTime: '8:00 AM',
    estimatedDuration: '120 minutes',
    specialInstructions: 'Focus on the date palm section. Check drip irrigation system for any leaks.',
    price: 289.99,
    status: jobStatus,
    createdAt: '2024-01-15',
  };

  const handleStatusUpdate = (newStatus: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setJobStatus(newStatus);
      setIsLoading(false);
      Alert.alert('Status Updated', `Job status updated to ${newStatus.replace('_', ' ')}`);
    }, 1000);
  };

  const handleCompleteJob = () => {
    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => handleStatusUpdate('completed') },
      ]
    );
  };

  const handleCallCustomer = () => {
    Alert.alert('Call Customer', `Call ${job.customerName} at ${job.customerPhone}?`);
  };

  const handleMessageCustomer = () => {
    Alert.alert('Message Customer', `Send message to ${job.customerName}?`);
  };

  const handleUploadPhoto = (kind: 'before' | 'after') => {
    Alert.alert('Upload Photo', 'Camera/Gallery selection would open here', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Camera', 
        onPress: () => {
          // Simulate photo upload
          const uri = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400';
          if (kind === 'before') setBeforePhotos([...beforePhotos, uri]);
          else setAfterPhotos([...afterPhotos, uri]);
          Alert.alert('Success', 'Photo uploaded successfully!');
        }
      },
      { 
        text: 'Gallery', 
        onPress: () => {
          // Simulate photo upload
          const uri = 'https://images.unsplash.com/photo-1615486363561-9be0d9e74075?w=400';
          if (kind === 'before') setBeforePhotos([...beforePhotos, uri]);
          else setAfterPhotos([...afterPhotos, uri]);
          Alert.alert('Success', 'Photo uploaded successfully!');
        }
      },
    ]);
  };

  const handleSubmitReport = () => {
    if (!fieldNotes.trim()) {
      Alert.alert('Required', 'Please add field notes before submitting');
      return;
    }
    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      Alert.alert('Required', 'Please upload at least one BEFORE and one AFTER photo');
      return;
    }
    Alert.alert(
      'Submit Report',
      'Submit field report to supervisor?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            Alert.alert('Success', 'Field report submitted successfully!');
            navigation.goBack();
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return COLORS.info;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Job Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(jobStatus) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(jobStatus) }]}>
                {getStatusLabel(jobStatus)}
              </Text>
            </View>
            <Text style={styles.jobId}>Job #{job.id}</Text>
          </View>
          <Text style={styles.jobDate}>{job.createdAt}</Text>
        </View>

        {/* Service Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>{job.service}</Text>
            <Text style={styles.serviceDescription}>{job.serviceDescription}</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{job.scheduledTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="timer-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{job.estimatedDuration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>AED {job.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            <Text style={styles.customerName}>{job.customerName}</Text>
            <View style={styles.customerDetails}>
              <TouchableOpacity style={styles.customerDetail} onPress={handleCallCustomer}>
                <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                <Text style={styles.customerDetailText}>{job.customerPhone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customerDetail} onPress={handleMessageCustomer}>
                <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
                <Text style={styles.customerDetailText}>{job.customerEmail}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addressTitle}>Service Location</Text>
            </View>
            <Text style={styles.addressText}>{job.address}</Text>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Instructions */}
        {job.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{job.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Field Notes */}
        {jobStatus === 'in_progress' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field Notes</Text>
            <View style={styles.notesCard}>
              <TextInput
                style={styles.notesInput}
                placeholder="Enter observations, issues found, work completed..."
                value={fieldNotes}
                onChangeText={setFieldNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        )}

        {/* Photo Upload - Before / After */}
        {jobStatus === 'in_progress' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Before / After Photos</Text>
            <View style={styles.photosCard}>
              <Text style={styles.photoGroupTitle}>Before</Text>
              <View style={styles.photosGrid}>
                {beforePhotos.map((photo, index) => (
                  <View key={`b-${index}`} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => setBeforePhotos(beforePhotos.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.uploadButton} onPress={() => handleUploadPhoto('before')}>
                  <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                  <Text style={styles.uploadButtonText}>Add Before</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.photoGroupTitle, { marginTop: SPACING.md }]}>After</Text>
              <View style={styles.photosGrid}>
                {afterPhotos.map((photo, index) => (
                  <View key={`a-${index}`} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => setAfterPhotos(afterPhotos.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.uploadButton} onPress={() => handleUploadPhoto('after')}>
                  <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                  <Text style={styles.uploadButtonText}>Add After</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Job Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsContainer}>
            {jobStatus === 'assigned' && (
              <Button
                title="Start Visit"
                onPress={() => handleStatusUpdate('in_progress')}
                disabled={isLoading}
                style={styles.actionButton}
              />
            )}
            
            {jobStatus === 'in_progress' && (
              <>
                <Button
                  title="Submit Field Report to Supervisor"
                  onPress={handleSubmitReport}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
                <Button
                  title="Complete Visit"
                  onPress={handleCompleteJob}
                  disabled={isLoading}
                  variant="outline"
                  style={styles.actionButton}
                />
              </>
            )}
            
            <Button
              title="Call Customer"
              variant="outline"
              onPress={handleCallCustomer}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  jobId: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  jobDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  serviceDetails: {
    gap: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  customerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customerDetails: {
    gap: SPACING.sm,
  },
  customerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerDetailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addressTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  addressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  directionsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  instructionsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  actionButton: {
    width: '100%',
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  notesInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  photosCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  photoGroupTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoItem: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  uploadButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.xs,
  },
});

export default JobDetailScreen;
