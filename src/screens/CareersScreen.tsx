import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Briefcase, MapPin, DollarSign } from 'lucide-react-native';
import { getFontFamily } from '../theme/fontHelpers';

// Mock data
const MOCK_CAREERS = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Innovators Inc.',
    description: 'We are looking for an experienced software engineer to join our team',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary_range: '$120k - $180k',
    status: 'active',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Creative Studios',
    description: 'Join our design team to create amazing user experiences',
    location: 'New York, NY',
    type: 'full-time',
    salary_range: '$90k - $130k',
    status: 'active',
  },
  {
    id: '3',
    title: 'Marketing Intern',
    company: 'Global Events Co.',
    description: 'Learn marketing strategies in a fast-paced environment',
    location: 'Remote',
    type: 'internship',
    salary_range: '$20/hour',
    status: 'active',
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'Tech Innovators Inc.',
    description: 'Analyze data and provide insights to drive business decisions',
    location: 'Austin, TX',
    type: 'contract',
    salary_range: '$80k - $100k',
    status: 'closed',
  },
];

export default function CareersScreen() {
  const [careers] = useState(MOCK_CAREERS);

  const getJobTypeColor = (type?: string) => {
    switch (type) {
      case 'full-time':
        return '#10B981';
      case 'part-time':
        return '#F59E0B';
      case 'contract':
        return '#8B5CF6';
      case 'internship':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const renderCareerCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.careerCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        {item.type && (
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getJobTypeColor(item.type) + '20' },
            ]}
          >
            <Text style={[styles.typeText, { color: getJobTypeColor(item.type) }]}>
              {item.type}
            </Text>
          </View>
        )}
      </View>

      {item.company && (
        <Text style={styles.company}>{item.company}</Text>
      )}

      {item.description && (
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.detailsContainer}>
        {item.location && (
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}
        {item.salary_range && (
          <View style={styles.detailRow}>
            <DollarSign size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.salary_range}</Text>
          </View>
        )}
      </View>

      {item.status && (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.status === 'active' ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Actively Hiring' : 'Position Closed'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={careers}
        renderItem={renderCareerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No career opportunities found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  careerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: getFontFamily('600'),
    color: '#111827',
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontFamily: getFontFamily('600'),
    textTransform: 'capitalize',
  },
  company: {
    fontSize: 16,
    fontFamily: getFontFamily('500'),
    color: '#3B82F6',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: getFontFamily('500'),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
