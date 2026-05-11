import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Building2, Globe } from 'lucide-react-native';

// Mock data
const MOCK_ORGANIZATIONS = [
  {
    id: '1',
    name: 'Tech Innovators Inc.',
    description: 'Leading technology company focused on innovation and digital transformation',
    logo_url: 'https://picsum.photos/80/80?random=10',
    website: 'https://techinnovators.com',
  },
  {
    id: '2',
    name: 'Creative Studios',
    description: 'Award-winning creative agency specializing in branding and design',
    logo_url: 'https://picsum.photos/80/80?random=11',
    website: 'https://creativestudios.com',
  },
  {
    id: '3',
    name: 'Global Events Co.',
    description: 'Premier event management company with worldwide presence',
    logo_url: 'https://picsum.photos/80/80?random=12',
    website: 'https://globalevents.com',
  },
  {
    id: '4',
    name: 'Community Foundation',
    description: 'Non-profit organization dedicated to community development',
    website: 'https://communityfoundation.org',
  },
];

export default function OrganizationsScreen() {
  const [organizations] = useState(MOCK_ORGANIZATIONS);

  const renderOrganizationCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.orgCard}>
      <View style={styles.logoContainer}>
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.logo} />
        ) : (
          <Building2 size={40} color="#9CA3AF" />
        )}
      </View>
      <View style={styles.orgContent}>
        <Text style={styles.orgName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.orgDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.website && (
          <View style={styles.websiteRow}>
            <Globe size={14} color="#3B82F6" />
            <Text style={styles.websiteText} numberOfLines={1}>
              {item.website}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={organizations}
        renderItem={renderOrganizationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No organizations found</Text>
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
  orgCard: {
    flexDirection: 'row',
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  orgContent: {
    flex: 1,
    justifyContent: 'center',
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  orgDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  websiteText: {
    fontSize: 13,
    color: '#3B82F6',
    flex: 1,
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
