import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActionSheetIOS, Platform } from 'react-native';
import {
  View,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';


import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { getFontFamily } from '../../src/theme/fontHelpers';
import SpaceDetailScreen from '../../src/screens/SpaceDetailScreen';
import {
  getSpaceById,
  joinSpace,
  leaveSpace,
  Space,
} from '../../src/lib/api/spaces';

export default function SpaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, activeTheme } = useTheme();
  const { user, token } = useAuth();

  const [space, setSpace] = useState<Space | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadSpace();
  }, [id]);

  const loadSpace = async () => {
    try {
      const spaceData = await getSpaceById(id, token || undefined);
      setSpace(spaceData);
      setIsMember(!!(spaceData.userRole || (spaceData.userRoles && spaceData.userRoles.length > 0)));
    } catch (error) {
      console.error('Error loading space:', error);
    }
  };

  const handleShare = async () => {
    if (!space) return;

    try {
      await Share.share({
        message: `Check out ${space.name} on Unifesto!`,
        url: `https://unifesto.app/space/${space.slug || id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMore = () => {
    setMenuVisible(true);
  };

  const showActionSheet = () => {
    const options = user && isMember
      ? ['Leave Space', 'Copy Link', 'Report Space', 'Cancel']
      : ['Copy Link', 'Report Space', 'Cancel'];
    const cancelIndex = options.length - 1;
    const destructiveIndex = user && isMember ? 0 : 1;
    ActionSheetIOS.showActionSheetWithOptions(
      { options, destructiveButtonIndex: destructiveIndex, cancelButtonIndex: cancelIndex, title: space?.name },
      (index) => {
        if (user && isMember) {
          if (index === 0) handleJoinLeave();
          else if (index === 1) handleCopyLink();
          else if (index === 2) handleReport();
        } else {
          if (index === 0) handleCopyLink();
          else if (index === 1) handleReport();
        }
      }
    );
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleReport = () => {
    closeMenu();
    setTimeout(() => {
      Alert.alert('Report Space', 'Report functionality coming soon');
    }, 300);
  };

  const handleCopyLink = async () => {
    closeMenu();
    if (!space) return;
    
    // Copy to clipboard (you might need expo-clipboard)
    Alert.alert('Link Copied', 'Space link copied to clipboard');
  };

  const handleJoinLeave = async () => {
    if (!user || !token) {
      Alert.alert('Sign In Required', 'Please sign in to join this space');
      return;
    }

    if (!space) return;

    try {
      setLoading(true);

      if (isMember) {
        await leaveSpace(token, id);
        setIsMember(false);
        Alert.alert('Success', `You have left ${space.name}`);
      } else {
        try {
          await joinSpace(token, id);
          setIsMember(true);
          Alert.alert('Success', `You have joined ${space.name}`);
        } catch (joinError: any) {
          if (joinError?.message?.includes('already a member')) {
            setIsMember(true);
          } else {
            throw joinError;
          }
        }
      }

      await loadSpace();
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update membership'
      );
    } finally {
      setLoading(false);
    }
  };

  // Create dynamic styles
  const dynamicStyles = StyleSheet.create({
    divider: {
      width: 1,
      height: 20,
      backgroundColor: activeTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      marginHorizontal: 4,
    },
  });

  console.log('activeTheme =', activeTheme);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Space',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: activeTheme === 'dark' ? '#ffffff' : '#000000',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: true,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: activeTheme === 'dark' ? '#ffffff' : '#000000',
          },
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={24} color='#ffffff' />
              </TouchableOpacity>
              <MenuView
                title={space?.name || 'Options'}
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === 'leave') handleJoinLeave();
                  else if (nativeEvent.event === 'copy') handleCopyLink();
                  else if (nativeEvent.event === 'report') handleReport();
                }}
                actions={[
                  ...(user && isMember ? [{
                    id: 'leave',
                    title: 'Leave Space',
                                        attributes: { destructive: true },
                  }] : []),
                  {
                    id: 'copy',
                    title: 'Copy Link',
                                      },
                  {
                    id: 'report',
                    title: 'Report Space',
                                        attributes: { destructive: true },
                  },
                ]}
                shouldOpenOnLongPress={false}
              >
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={24} color='#ffffff' />
                </TouchableOpacity>
              </MenuView>
            </View>
          ),
        }}
      />

      <SpaceDetailScreen
        route={{ params: { spaceId: id } }}
        onMembershipChange={(member) => setIsMember(member)}
      />

      {/* More Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                {/* Menu Header */}
                <View style={[styles.menuHeader, { borderBottomColor: colors.borderMuted }]}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>
                    {space?.name || 'Space Options'}
                  </Text>
                </View>

                {/* Menu Items */}
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={handleCopyLink}
                >
                  <Ionicons name="link-outline" size={22} color={colors.text} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    Copy Link
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={handleReport}
                >
                  <Ionicons name="flag-outline" size={22} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                    Report Space
                  </Text>
                </Pressable>

                {/* Cancel Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    { borderTopColor: colors.borderMuted },
                    pressed && { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={closeMenu}
                >
                  <Text style={[styles.cancelText, { color: colors.textMuted }]}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: {
    color: '#EF4444',
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    letterSpacing: -0.2,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontFamily: getFontFamily('semibold'),
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    textAlign: 'center',
  },
});