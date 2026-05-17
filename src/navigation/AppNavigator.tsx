import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Image, View, StyleSheet, Text, Linking, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Ticket, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../context/AuthContext';
import { getProfile, Profile } from '../lib/api/profile';
import { getFontFamily } from '../theme/fontHelpers';
import { navigationRef } from './NavigationService';
import { linking } from './LinkingConfiguration';
import { getEventIdFromSlug, getOrganizationIdFromSlug } from '../lib/api/deepLinking';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

// Auth Screens
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import UsernameSetupScreen from '../screens/UsernameSetupScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import TicketsScreen from '../screens/TicketsScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import SupportScreen from '../screens/SupportScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import OrganizationsScreen from '../screens/OrganizationsScreen';
import OrganizationsListScreen from '../screens/OrganizationsListScreen';
import OrganizationDetailScreen from '../screens/OrganizationDetailScreen';
import CareersScreen from '../screens/CareersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventRegistrationScreen from '../screens/EventRegistrationScreen';
import RegistrationSuccessScreen from '../screens/RegistrationSuccessScreen';
import WalletScreen from '../screens/WalletScreen';

// Profile Sub-Screens
import AccountScreen from '../screens/AccountScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import ReferralsScreen from '../screens/ReferralsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const makeHeaderOptions = (navigation: any, title: string) => ({
  headerShown: true,
  title,
  headerStyle: {
    backgroundColor: '#000000',
  },
  headerShadowVisible: true,
  headerTitleStyle: {
    fontSize: 18,
    fontFamily: getFontFamily('600'),
    color: '#ffffff',
  },
  headerTintColor: '#3491ff',
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ marginLeft: 6 }}
    >
      <ArrowLeft size={24} color="#3491ff" strokeWidth={2} />
    </TouchableOpacity>
  ),
});

// ── Main Tab Navigator ────────────────────────────────────────────────────────
function MainTabs() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getProfile();
        if (userProfile) setProfile(userProfile);
      }
    };
    loadProfile();
  }, [user]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const renderProfileIcon = (color: string, focused: boolean) => {
    if (profile?.avatar_url) {
      return (
        <View style={[styles.profileIconContainer, focused && styles.profileIconContainerActive]}>
          <Image source={{ uri: profile.avatar_url }} style={styles.profileIcon} />
        </View>
      );
    }
    return (
      <View style={[styles.profileIconContainer, focused && styles.profileIconContainerActive]}>
        <LinearGradient
          colors={['#3491ff', '#0062ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileIconGradient}
        >
          <Text style={styles.profileIconText}>
            {getInitials(profile?.name || 'U')}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3491ff',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 80 + (Platform.OS === 'android' ? insets.bottom : 0),
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingBottom: Platform.OS === 'ios' ? 0 : 8 + insets.bottom,
          paddingTop: 20,
        },
        tabBarShowLabel: false,
        headerTransparent: true,
        headerShadowVisible: false,
        header: () => <CustomHeader />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home size={26} color={color} strokeWidth={2} /> }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: ({ color }) => <Search size={26} color={color} strokeWidth={2} /> }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{ tabBarIcon: ({ color }) => <Ticket size={26} color={color} strokeWidth={2} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, focused }) => renderProfileIcon(color, focused) }}
      />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ──────────────────────────────────────────────────────
export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  // Set Android system navigation bar and status bar
  useEffect(() => {
    if (Platform.OS === 'android') {

      // Set navigation bar (Ignored/warnings on Android 15+ edge-to-edge)
      // NavigationBar.setBackgroundColorAsync('#000000').catch(() => { });
      // NavigationBar.setButtonStyleAsync('light').catch(() => { });
      SystemUI.setBackgroundColorAsync('#000000').catch(() => { });

      // Set status bar
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor('#000000');
      StatusBar.setBarStyle('light-content');
    }
  }, []);

  // Handle deep links with slug-to-ID conversion
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      let path = url;
      for (const prefix of linking.prefixes || []) {
        if (url.startsWith(prefix)) {
          path = url.substring(prefix.length);
          break;
        }
      }

      const eventMatch = path.match(/^\/events\/([^/?]+)/);
      if (eventMatch) {
        const slugOrId = eventMatch[1];
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        if (!isUUID) {
          const eventId = await getEventIdFromSlug(slugOrId);
          if (eventId && navigationRef.current) {
            (navigationRef.current as any).navigate('EventDetail', { eventId });
            return;
          }
        } else if (navigationRef.current) {
          (navigationRef.current as any).navigate('EventDetail', { eventId: slugOrId });
          return;
        }
      }

      const orgMatch = path.match(/^\/org\/([^/?]+)/);
      if (orgMatch) {
        const slugOrId = orgMatch[1];
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
        if (!isUUID) {
          const organizationId = await getOrganizationIdFromSlug(slugOrId);
          if (organizationId && navigationRef.current) {
            (navigationRef.current as any).navigate('OrganizationDetail', { organizationId });
            return;
          }
        } else if (navigationRef.current) {
          (navigationRef.current as any).navigate('OrganizationDetail', { organizationId: slugOrId });
          return;
        }
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="AuthLoading"
      >
        {/* ── Auth Flow ── */}
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} options={{ gestureEnabled: false }} />

        {/* ── Main App ── */}
        <Stack.Screen name="MainApp" component={MainTabs} options={{ gestureEnabled: false }} />
        <Stack.Screen name="EventRegistration" component={EventRegistrationScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />

        {/* ── Screens with native header ── */}
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Events')}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Event Details')}
        />
        <Stack.Screen
          name="TicketDetail"
          component={TicketDetailScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Ticket Details')}
        />
        <Stack.Screen
          name="OrganizationsList"
          component={OrganizationsListScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Organizations')}
        />
        <Stack.Screen
          name="OrganizationDetail"
          component={OrganizationDetailScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Organization')}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Profile')}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Support')}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Wallet')}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Edit Profile')}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Notifications')}
        />
        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Permissions')}
        />
        <Stack.Screen
          name="Appearance"
          component={AppearanceScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Appearance')}
        />
        <Stack.Screen
          name="Referrals"
          component={ReferralsScreen}
          options={({ navigation }) => makeHeaderOptions(navigation, 'Referrals')}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  profileIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileIconContainerActive: {
    borderColor: '#3491ff',
  },
  profileIcon: {
    width: '100%',
    height: '100%',
  },
  profileIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 10,
    fontFamily: getFontFamily('700'),
    color: '#000000',
  },
});
