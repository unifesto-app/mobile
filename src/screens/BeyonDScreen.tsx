import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Rocket, 
  Users, 
  Award, 
  BookOpen, 
  Target,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Lightbulb,
  Briefcase,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 150 : 130;

const TRACKS = [
  {
    id: 'hackathon',
    title: 'Beyond Hackathon',
    subtitle: 'Build Solutions for Real-World Problems',
    icon: Lightbulb,
    color: '#3491ff',
    duration: 'August - November',
    activities: [
      'Team Formation',
      'Problem Solving',
      'Technical Workshops',
      'Product Development',
      'Demo Day',
      'Grand Finale',
    ],
  },
  {
    id: 'pitch',
    title: 'Beyond Pitch Competition',
    subtitle: 'Transform Ideas into Scalable Ventures',
    icon: TrendingUp,
    color: '#ec4899',
    duration: 'December - March',
    activities: [
      'Startup Ideation',
      'Business Model Design',
      'Mentorship Sessions',
      'Investor Readiness',
      'Pitch Day',
      'Grand Finale',
    ],
  },
];

const BENEFITS = [
  { icon: Users, text: 'Access to 20+ Industry Mentors' },
  { icon: BookOpen, text: '15+ Technical Workshops' },
  { icon: Target, text: 'Real-World Problem Solving' },
  { icon: Award, text: 'National Recognition & Awards' },
  { icon: Briefcase, text: 'Startup Ecosystem Opportunities' },
  { icon: TrendingUp, text: 'Industry Exposure & Networking' },
];

const STATS = [
  { value: '2,000+', label: 'Participants' },
  { value: '100+', label: 'Teams' },
  { value: '25+', label: 'Universities' },
  { value: '8', label: 'Months' },
];

export default function BeyonDScreen() {
  const router = useRouter();
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  useAnalyticsScreenTracking('BeyonD');

  const handleContactEmail = () => {
    Linking.openURL('mailto:beyond@unifesto.app');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+919703045690');
  };

  const handleWebsite = () => {
    Linking.openURL('https://beyond.unifesto.app');
  };

  const renderTrackCard = (track: typeof TRACKS[0]) => {
    const Icon = track.icon;
    const isExpanded = expandedTrack === track.id;

    return (
      <TouchableOpacity
        key={track.id}
        style={styles.trackCard}
        onPress={() => setExpandedTrack(isExpanded ? null : track.id)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[track.color + '15', track.color + '05']}
          style={styles.trackCardGradient}
        >
          <View style={styles.trackHeader}>
            <View style={[styles.trackIconContainer, { backgroundColor: track.color + '20' }]}>
              <Icon size={28} color={track.color} strokeWidth={2} />
            </View>
            <View style={styles.trackHeaderText}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackSubtitle}>{track.subtitle}</Text>
            </View>
          </View>

          <View style={styles.trackDuration}>
            <Calendar size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.trackDurationText}>{track.duration}</Text>
          </View>

          {isExpanded && (
            <View style={styles.trackActivities}>
              <Text style={styles.activitiesTitle}>Key Activities:</Text>
              {track.activities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: track.color }]} />
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: track.color }]}
            onPress={() => router.push({ pathname: '/events', params: { category: 'BeyonD' } })}
          >
            <Text style={styles.trackButtonText}>
              {isExpanded ? 'View Events' : 'Learn More'}
            </Text>
            <ExternalLink size={16} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderBenefit = (benefit: typeof BENEFITS[0], index: number) => {
    const Icon = benefit.icon;
    return (
      <View key={index} style={styles.benefitItem}>
        <View style={styles.benefitIconContainer}>
          <Icon size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={styles.benefitText}>{benefit.text}</Text>
      </View>
    );
  };

  const renderStat = (stat: typeof STATS[0], index: number) => (
    <View key={index} style={styles.statItem}>
      <GradientText style={styles.statValue}>{stat.value}</GradientText>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <GradientText style={styles.logoText}>BeyonD</GradientText>
          </View>
          <Text style={styles.tagline}>Dream. Build. Launch.</Text>
          <Text style={styles.subtitle}>India's Student Innovation Ecosystem</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {STATS.map(renderStat)}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Rocket size={24} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>About BeyonD</Text>
          </View>
          <Text style={styles.aboutText}>
            BeyonD by Unifesto is an annual innovation ecosystem designed to empower students to become builders, founders, innovators, and future leaders.
          </Text>
          <Text style={styles.aboutText}>
            Over eight months, participants engage in hackathons, startup pitching, technical workshops, mentorship sessions, networking opportunities, demo days, and grand finale showcases.
          </Text>
        </View>

        {/* Tracks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Choose Your Track</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Two parallel tracks to match your innovation journey
          </Text>
          {TRACKS.map(renderTrackCard)}
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={24} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>What You'll Gain</Text>
          </View>
          <View style={styles.benefitsGrid}>
            {BENEFITS.map(renderBenefit)}
          </View>
        </View>

        {/* Supporting Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={24} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Supporting Programs</Text>
          </View>
          <View style={styles.programsContainer}>
            {[
              'Technical Bootcamps',
              'Startup Workshops',
              'Founder Talks',
              'Networking Events',
              'Mentorship Clinics',
              'Industry Challenges',
              'Product Showcases',
              'Demo Days',
            ].map((program, index) => (
              <View key={index} style={styles.programChip}>
                <Text style={styles.programChipText}>{program}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <GradientText style={styles.ctaTitle}>Ready to Go BeyonD?</GradientText>
          <Text style={styles.ctaText}>
            Join India's most impactful student innovation ecosystem
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push({ pathname: '/events', params: { category: 'BeyonD' } })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={brandGradient}
              start={brandGradientStart}
              end={brandGradientEnd}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>Explore Events</Text>
              <ExternalLink size={20} color="#000000" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color={colors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Get in Touch</Text>
          </View>
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactItem} onPress={handleContactEmail}>
              <Mail size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.contactText}>beyond@unifesto.app</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handleContactPhone}>
              <Phone size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.contactText}>+91 97030 45690</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
              <ExternalLink size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.contactText}>beyond.unifesto.app</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[12],
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  logoText: {
    fontSize: typography.fontSize['5xl'],
    fontFamily: typography.fontFamily.primary,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    fontFamily: getFontFamily('semibold'),
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[6],
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '40%',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[12],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  sectionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  aboutText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  trackCard: {
    marginBottom: spacing[4],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.lg,
  },
  trackCardGradient: {
    padding: spacing[6],
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    gap: spacing[4],
  },
  trackIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackHeaderText: {
    flex: 1,
  },
  trackTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[1],
  },
  trackSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  trackDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  trackDurationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: getFontFamily('semibold'),
  },
  trackActivities: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  activitiesTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[3],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    marginTop: spacing[2],
  },
  trackButtonText: {
    fontSize: typography.fontSize.base,
    color: '#000000',
    fontFamily: getFontFamily('bold'),
  },
  benefitsGrid: {
    gap: spacing[4],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.card,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('semibold'),
  },
  programsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  programChip: {
    backgroundColor: colors.card,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  programChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: getFontFamily('semibold'),
  },
  ctaSection: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  ctaText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  ctaButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
  },
  ctaButtonText: {
    fontSize: typography.fontSize.lg,
    color: '#000000',
    fontFamily: getFontFamily('bold'),
  },
  contactContainer: {
    gap: spacing[4],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.card,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  contactText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('semibold'),
  },
});
