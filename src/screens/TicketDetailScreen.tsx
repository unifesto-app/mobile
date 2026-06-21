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
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows, brandGradient } from '../theme';

interface TicketDetailScreenProps {
  route: { params: { ticketId: string; ticket?: any } };
}

export default function TicketDetailScreen({ route }: TicketDetailScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { ticket } = route.params;
  
  // Parse ticket if it's a string
  const ticketData = typeof ticket === 'string' ? JSON.parse(ticket) : ticket;
  
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
    marginBottom: spacing[6],
  },
  eventTitle: {
    fontSize: typography.fontSize['3xl'],
    marginBottom: spacing[3],
    lineHeight: typography.fontSize['3xl'] * 1.2,
    fontFamily: typography.fontFamily.primary,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  eventMetaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  eventMetaDivider: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: typography.fontSize.sm * 1.5,
    marginHorizontal: spacing[2],
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
    borderColor: colors.primary,
    ...shadows.lg,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    padding: spacing[2],
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
    marginBottom: spacing[12],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});
  
  // Handle missing ticket data
  if (!ticketData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing[8] }]}>
        <Text style={{ fontSize: typography.fontSize.lg, color: colors.text, marginBottom: spacing[4], textAlign: 'center' }}>
          Ticket not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: typography.fontSize.base, color: colors.primary, fontFamily: typography.fontFamily.bold }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format date and time
  const eventDate = ticketData.startDateTime ? new Date(ticketData.startDateTime) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short',
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
          <View style={styles.eventMetaRow}>
            <Text style={styles.eventMetaText}>{category}</Text>
            <Text style={styles.eventMetaDivider}>•</Text>
            <Text style={styles.eventMetaText}>{formattedDate} · {formattedTime}</Text>
            <Text style={styles.eventMetaDivider}>•</Text>
            <Text style={styles.eventMetaText}>{venue}</Text>
          </View>
        </View>

        {/* Ticket Type Info */}
        {ticketData.ticketType && (
          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[6], borderWidth: 1, borderColor: colors.borderMuted }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing[2] }}>Ticket Type</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{ticketData.ticketType.name}</Text>
                {ticketData.ticketType.description && (
                  <Text style={{ color: colors.textMuted, fontSize: 13 }} numberOfLines={2}>{ticketData.ticketType.description}</Text>
                )}
              </View>
              <View style={{ backgroundColor: 'rgba(52,145,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 12 }}>
                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>
                  {parseFloat(ticketData.ticketType.price) === 0 ? 'Free' : `₹${ticketData.ticketType.price}`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              <QRCode
                value={ticketData.qrCode || ticketData.id || 'UNIFESTO'}
                size={180}
                color="#000000"
                backgroundColor="#ffffff"
              />
            </View>
            <View style={styles.ticketIdSection}>
              <Text style={styles.ticketIdLabel}>TICKET CODE</Text>
              <Text style={styles.ticketId}>
                {ticketData.ticketCode ? `#${ticketData.ticketCode}` : `#${ticketData.id.substring(0, 8).toUpperCase()}`}
              </Text>
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

        {/* Footer */}
        <Footer />
      </View>
    </ScrollView>
  );
}

