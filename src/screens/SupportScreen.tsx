import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import {
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  ChevronRight,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Book,
  ExternalLink,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../theme';

type TabType = 'faq' | 'tickets' | 'contact';

const FAQ_ITEMS = [
  {
    id: 'getting-started',
    category: 'Getting Started',
    question: 'How do I create an account on Unifesto?',
    answer: 'Click on "Get Started" in the navigation bar. You can sign up using your email, Google account, or university email. No credit card required for free events.',
  },
  {
    id: 'create-event',
    category: 'Getting Started',
    question: 'How do I create my first event?',
    answer: 'After logging in, click "Host Event" in the navigation. Fill in basic details like event name, date, venue, and category. You can publish your event in under 5 minutes.',
  },
  {
    id: 'event-discovery',
    category: 'For Students',
    question: 'How do I find events in Hyderabad?',
    answer: 'Visit the "Discover" section to browse all events in Hyderabad. Use filters to narrow down by category (Hackathons, Cultural, Workshops, etc.), date, or organizer.',
  },
  {
    id: 'registration',
    category: 'For Students',
    question: 'Do I need an account to register for events?',
    answer: 'For free events, you can register without an account. For paid events or to access additional features like saved events, you\'ll need to create an account.',
  },
  {
    id: 'qr-ticket',
    category: 'For Students',
    question: 'Where is my QR ticket after registration?',
    answer: 'Your QR ticket is sent to your email immediately after registration. You can also access it from your account dashboard under "My Events".',
  },
  {
    id: 'ticketing',
    category: 'For Organizers',
    question: 'Can I sell paid tickets on Unifesto?',
    answer: 'Yes! Unifesto supports both free RSVP and paid ticketing. You can set ticket prices, capacity limits, and enable waitlists.',
  },
  {
    id: 'qr-checkin',
    category: 'For Organizers',
    question: 'How does QR check-in work?',
    answer: 'Use the Unifesto QR Check-in App on any device. Simply scan attendee QR codes at the gate. The system tracks attendance in real-time.',
  },
  {
    id: 'analytics',
    category: 'For Organizers',
    question: 'What analytics are available for my event?',
    answer: 'You get real-time registration tracking, check-in data, attendance reports, demographic insights, and conversion metrics.',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'email',
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    action: 'support@unifesto.app',
    onPress: () => Linking.openURL('mailto:support@unifesto.app'),
  },
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start Chat',
    onPress: () => Linking.openURL('https://wa.me/919848945690?text=Hi%20Unifesto%20Support'),
  },
  {
    id: 'whatsapp',
    icon: Phone,
    title: 'WhatsApp Support',
    description: 'Message us on WhatsApp',
    action: '+91 9848945690',
    onPress: () => Linking.openURL('https://wa.me/919848945690'),
  },
  {
    id: 'help',
    icon: Book,
    title: 'Help Center',
    description: 'Browse guides and tutorials',
    action: 'View Docs',
    onPress: () => Linking.openURL('https://unifesto.app/support'),
  },
];

export default function SupportScreen() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    padding: spacing[1],
    marginBottom: spacing[6],
    marginTop: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000000',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[3],
    width: '100%',
    maxWidth: 400,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  // Content
  contentContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  // FAQ
  faqContainer: {
    gap: spacing[6],
  },
  categoryContainer: {
    marginBottom: spacing[6],
  },
  categoryScroll: {
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  categoryChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
  },
  faqList: {
    gap: spacing[3],
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing[5],
    gap: spacing[4],
  },
  faqQuestionContent: {
    flex: 1,
  },
  faqCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[1],
  },
  faqQuestionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  faqAnswer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  // Contact
  contactContainer: {
    gap: spacing[8],
  },
  contactOptionsContainer: {
    gap: spacing[4],
  },
  contactOptionsTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.primary,
  },
  contactOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  contactOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.sm,
  },
  contactOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  contactOptionTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.primary,
  },
  contactOptionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  contactOptionAction: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  // Contact Form
  contactFormContainer: {
    gap: spacing[4],
  },
  contactFormTitle: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.primary,
  },
  contactFormSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  successMessage: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: spacing[4],
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contactForm: {
    gap: spacing[5],
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[2],
  },
  formInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    fontFamily: typography.fontFamily.primary,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  selectText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  submitText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: '#000000',
  },
  // Resources
  resourcesContainer: {
    gap: spacing[4],
  },
  resourcesTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.primary,
  },
  resources: {
    gap: spacing[3],
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: spacing[3],
  },
  resourceTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  resourceDescription: {
    flex: 2,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});

  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const categories = Array.from(new Set(FAQ_ITEMS.map((faq) => faq.category)));

  const filteredFaqs = FAQ_ITEMS.filter((faq) =>
    searchQuery === '' ||
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setFormData({ name: '', email: '', category: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: spacing[6], paddingBottom: spacing[8] }}>
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
              onPress={() => setActiveTab('faq')}
            >
              <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
                FAQ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
              onPress={() => setActiveTab('contact')}
            >
              <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar for FAQ */}
          {activeTab === 'faq' && (
            <View style={styles.searchContainer}>
              <HelpCircle size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for help..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <View style={styles.faqContainer}>
              {/* Category Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
                style={styles.categoryContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity key={category} style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* FAQ List */}
              <View style={styles.faqList}>
                {filteredFaqs.map((faq) => (
                  <View key={faq.id} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqQuestion}
                      onPress={() => toggleFaq(faq.id)}
                    >
                      <View style={styles.faqQuestionContent}>
                        <Text style={styles.faqCategory}>{faq.category}</Text>
                        <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      </View>
                      {expandedFaq === faq.id ? (
                        <ChevronUp size={20} color={colors.textMuted} strokeWidth={2} />
                      ) : (
                        <ChevronDown size={20} color={colors.textMuted} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                    {expandedFaq === faq.id && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <View style={styles.contactContainer}>
              {/* Contact Options */}
              <View style={styles.contactOptionsContainer}>
                <Text style={styles.contactOptionsTitle}>Choose your preferred support channel</Text>
                <View style={styles.contactOptions}>
                  {CONTACT_OPTIONS.map((option) => (
                    <TouchableOpacity 
                      key={option.id} 
                      style={styles.contactOption}
                      onPress={option.onPress}
                    >
                      <View style={styles.contactOptionIcon}>
                        <option.icon size={24} color="#000000" strokeWidth={2} />
                      </View>
                      <Text style={styles.contactOptionTitle}>{option.title}</Text>
                      <Text style={styles.contactOptionDescription}>{option.description}</Text>
                      <Text style={styles.contactOptionAction}>{option.action} →</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Contact Form */}
              <View style={styles.contactFormContainer}>
                <Text style={styles.contactFormTitle}>Send us a message</Text>
                <Text style={styles.contactFormSubtitle}>
                  Our support team will get back to you within 24 hours.
                </Text>

                {submitted ? (
                  <View style={styles.successMessage}>
                    <CheckCircle size={48} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.successTitle}>Message Sent!</Text>
                    <Text style={styles.successText}>
                      We've received your message and will respond within 24 hours.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.contactForm}>
                    <View style={styles.formRow}>
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Your Name</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="John Doe"
                          placeholderTextColor={colors.textMuted}
                          value={formData.name}
                          onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.formLabel}>Email Address</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="john@example.com"
                          placeholderTextColor={colors.textMuted}
                          value={formData.email}
                          onChangeText={(text) => setFormData({ ...formData, email: text })}
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Category</Text>
                      <TouchableOpacity style={styles.selectContainer}>
                        <Text style={styles.selectText}>
                          {formData.category || 'Select a category'}
                        </Text>
                        <ChevronDown size={20} color={colors.textMuted} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Message</Text>
                      <TextInput
                        style={[styles.formInput, styles.messageInput]}
                        placeholder="Describe your issue or question..."
                        placeholderTextColor={colors.textMuted}
                        value={formData.message}
                        onChangeText={(text) => setFormData({ ...formData, message: text })}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                      />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                      <LinearGradient
                        colors={['#3491ff', '#0062ff']}
                        style={styles.submitGradient}
                      >
                        <Send size={18} color="#000000" strokeWidth={2} />
                        <Text style={styles.submitText}>Send Message</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Helpful Resources */}
              <View style={styles.resourcesContainer}>
                <Text style={styles.resourcesTitle}>Helpful Resources</Text>
                <View style={styles.resources}>
                  {[
                    { title: 'About Unifesto', description: 'Learn about our mission and platform' },
                    { title: 'Products & Features', description: 'Explore all available tools and features' },
                    { title: 'Verification', description: 'Verify certificates and credentials' },
                  ].map((resource) => (
                    <TouchableOpacity key={resource.title} style={styles.resource}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceDescription}>{resource.description}</Text>
                      <ExternalLink size={16} color={colors.primary} strokeWidth={2} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

