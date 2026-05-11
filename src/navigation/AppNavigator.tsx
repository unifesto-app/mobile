import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Image, View, StyleSheet, Text } from 'react-native';
import { Home, Search, Ticket, HeadphonesIcon, ArrowLeft, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../components/CustomHeader';
import { useAuth } from '../context/AuthContext';
import { getProfile, Profile } from '../lib/api/profile';
import { getFontFamily } from '../theme/fontHelpers';
import { navigationRef } from './NavigationService';

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
import PreferencesScreen from '../screens/PreferencesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChangeWalletPasscodeScreen from '../screens/ChangeWalletPasscodeScreen';
import ReferralsScreen from '../screens/ReferralsScreen';
import LegalScreen from '../screens/LegalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    };

    loadProfile();
  }, [user]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderProfileIcon = (color: string, focused: boolean) => {
    if (profile?.avatar_url) {
      // Use actual avatar
      return (
        <View style={[
          styles.profileIconContainer,
          focused && styles.profileIconContainerActive
        ]}>
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.profileIcon}
          />
        </View>
      );
    } else {
      // Use gradient with initials
      return (
        <View style={[
          styles.profileIconContainer,
          focused && styles.profileIconContainerActive
        ]}>
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
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3491ff',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: 'rgba(30, 58, 138, 0.6)',
          paddingBottom: 20,
          paddingTop: 16,
          height: 80,
        },
        tabBarShowLabel: false,
        header: () => <CustomHeader />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={26} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Search size={26} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ticket size={26} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderProfileIcon(color, focused),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="AuthLoading"
      >
        {/* Auth Flow */}
        <Stack.Screen 
          name="AuthLoading" 
          component={AuthLoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Disable swipe gesture
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Disable swipe gesture
          }}
        />
        <Stack.Screen 
          name="UsernameSetup" 
          component={UsernameSetupScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent going back
          }}
        />

        {/* Public Screens - Accessible without authentication */}
        <Stack.Screen 
          name="Events" 
          component={EventsScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Events',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />

        {/* Main App */}
        <Stack.Screen 
          name="MainApp" 
          component={MainTabs}
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Disable swipe back to login
          }}
        />
        <Stack.Screen 
          name="EventDetail" 
          component={EventDetailScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Event Details',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="TicketDetail" 
          component={TicketDetailScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Ticket Details',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="OrganizationsList" 
          component={OrganizationsListScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Organizations',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="OrganizationDetail" 
          component={OrganizationDetailScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Organization Details',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Profile',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="EventRegistration" 
          component={EventRegistrationScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="RegistrationSuccess" 
          component={RegistrationSuccessScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Support',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="Wallet" 
          component={WalletScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: 'Wallet & Referrals',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(52, 145, 255, 0.3)',
            },
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
          })}
        />
        <Stack.Screen 
          name="Account" 
          component={AccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Preferences" 
          component={PreferencesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ChangeWalletPasscode" 
          component={ChangeWalletPasscodeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Referrals" 
          component={ReferralsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Legal" 
          component={LegalScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
