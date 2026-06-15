import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Download, Share2, QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows, brandGradient } from '../theme';

interface TicketDetailScreenProps {
  route: { params: { ticketId: string; ticket?: any } };
}

export default function TicketDetailScreen({ route }: TicketDetailScreenProps) {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  content: {
    padding: spacing[6],
  },
  titleSection: {
    marginBottom: spacing[8],
  },
  eventTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing[4],
    lineHeight: typography.fontSize['3xl'] * 1.2,
    fontFamily: typography.fontFamily.primary,
  },
  categoryBadge: {
    backgroundColor: 'rgba(52, 145, 255, 0.15)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  detailsSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[5],
    ...shadows.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.bold,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  qrSection: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing[4],
  },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.lg,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.text,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  ticketIdSection: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  ticketIdLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[1],
  },
  ticketId: {
    fontSize: typography.fontSize.xl,
    color: colors.primary,
    fontFamily: 'Courier',
  },
  qrInstruction: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: spacing[8],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[8],
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: '#3491ff', // Fallback for Android
    ...shadows.md,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
    minHeight: 44,
    width: '100%',
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    fontWeight: '400',
    color: '#000000',
    lineHeight: typography.fontSize.base * 1.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[4],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonTextSecondary: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
});

  const router = useRouter();
  const { ticket } = route.params;
  
  // Parse ticket if it's a string
  const ticketData = typeof ticket === 'string' ? JSON.parse(ticket) : ticket;
  
  // Format date and time
  const eventDate = ticketData.startDateTime ? new Date(ticketData.startDateTime) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  const venue = ticketData.venueName || ticketData.city || 'TBA';
  const category = ticketData.category || ticketData.type || 'General';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        {ticketData.coverImageUrl ? (
          <Image source={{ uri: ticketData.coverImageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={brandGradient} style={styles.heroImage} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.9)']}
          style={styles.heroGradient}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Event Title */}
        <View style={styles.titleSection}>
          <GradientText style={styles.eventTitle}>{ticketData.title}</GradientText>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Calendar size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Clock size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MapPin size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{venue}</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Your Ticket</Text>
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <QrCode size={180} color={colors.background} strokeWidth={1.5} />
            </View>
            <View style={styles.ticketIdSection}>
              <Text style={styles.ticketIdLabel}>TICKET ID</Text>
              <Text style={styles.ticketId}>#{ticketData.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <Text style={styles.qrInstruction}>
              Show this QR code at the venue for entry
            </Text>
          </View>
        </View>

        {/* Description */}
        {ticketData.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.descriptionText}>{ticketData.description}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <LinearGradient
              colors={brandGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Download size={20} color="#000000" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Download</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary} activeOpacity={0.7}>
            <Share2 size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionButtonTextSecondary}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Footer />
      </View>
    </ScrollView>
  );
}

