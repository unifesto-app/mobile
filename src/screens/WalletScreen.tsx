import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Share,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  Gift,
  Share as ShareIcon,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Tag,
  X,
  Sparkles,
  User,
  Users,
  Coins,
  Ticket,
  Zap,
  Award,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import CustomHeader from '../components/CustomHeader';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import Skeleton from '../components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';
import { getWallet, getTransactions, redeemCode } from '../lib/api/wallet';
import { getReferral } from '../lib/api/referrals';

interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  source: string;
  coins: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface ReferralInfo {
  referralCode: string;
  totalReferred: number;
  totalCoinsEarned: number;
}

interface WalletBalance {
  balance: number;
  currency: string;
}

const HEADER_TOP_OFFSET = 150;

// Animation styles (defined at module level for animation components)
const animationColors = {
  primary: '#3491ff',
  text: '#000000',
  background: '#ffffff',
  card: '#f9f9f9',
};

const styles = StyleSheet.create({
  animationContainer: { alignItems: 'center', marginVertical: 20 },
  coinFlowSection: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  coinAnimation: { position: 'relative' },
  coinCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  coinSymbol: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  coinPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#ffb700' },
  arrowFlow: { width: 60, height: 2, backgroundColor: '#e0e0e0', position: 'relative' },
  flowDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: animationColors.primary },
  walletIconContainer: { padding: 10, backgroundColor: animationColors.card, borderRadius: 10 },
  animatedTextContainer: { marginTop: 10 },
  animatedText: { fontSize: 14, color: animationColors.text, fontWeight: '600' },
  animatedTextEarn: { color: animationColors.primary },
  benefitsAnimation: { flexDirection: 'column', gap: 15, marginVertical: 20 },
  benefitIconRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
  benefitItem: { alignItems: 'center', gap: 8 },
  benefitIconAnimated: { padding: 12, backgroundColor: animationColors.card, borderRadius: 10 },
  benefitLabel: { fontSize: 12, color: animationColors.text },
  referralAnimation: { alignItems: 'center', marginVertical: 30 },
  userNode: { alignItems: 'center', position: 'relative' },
  userGlow: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: animationColors.primary },
  userCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: animationColors.card, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  referralYouLabel: { marginTop: 8, fontSize: 12, fontWeight: '600', color: animationColors.text },
  connectionLines: { flexDirection: 'row', gap: 30, marginVertical: 20 },
  connectionLine: { width: 2, height: 60, backgroundColor: animationColors.primary },
  friendNodes: { flexDirection: 'row', gap: 30 },
  friendNodeContainer: { alignItems: 'center' },
  friendNode: { width: 60, height: 60, borderRadius: 30, backgroundColor: animationColors.card, alignItems: 'center', justifyContent: 'center' },
  coinBadge: { marginTop: 8, backgroundColor: animationColors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  coinBadgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
});

// Animation Components
const CoinFlowAnimation = () => {
  const coinRotate = useRef(new Animated.Value(0)).current;
  const coinTranslateY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;
  const dot1TranslateX = useRef(new Animated.Value(0)).current;
  const dot2TranslateX = useRef(new Animated.Value(0)).current;
  const dot3TranslateX = useRef(new Animated.Value(0)).current;
  const walletScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textSwitch = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Coin rotation and float
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(coinRotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(coinTranslateY, {
            toValue: -10,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coinTranslateY, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Pulse ring animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Flow dots moving animation
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 60,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ])
      );
    };

    createDotAnimation(dot1TranslateX, 0).start();
    createDotAnimation(dot2TranslateX, 200).start();
    createDotAnimation(dot3TranslateX, 400).start();

    // Wallet pulse when receiving
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.spring(walletScale, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(walletScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();

    // Text animation - switch between "Register or Refer" and "Earn"
    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textSwitch, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textSwitch, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = coinRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.animationContainer}>
      <View style={styles.coinFlowSection}>
        <View style={styles.coinAnimation}>
          <Animated.View style={{ transform: [{ rotateY: spin }, { translateY: coinTranslateY }] }}>
            <LinearGradient
              colors={['#fff462', '#ffb700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coinCircle}
            >
              <Text style={styles.coinSymbol}>₹</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View 
            style={[
              styles.coinPulse, 
              { 
                transform: [{ scale: pulseScale }], 
                opacity: pulseOpacity 
              }
            ]} 
          />
        </View>
        <View style={styles.arrowFlow}>
          <Animated.View style={[styles.flowDot, { transform: [{ translateX: dot1TranslateX }] }]} />
          <Animated.View style={[styles.flowDot, { transform: [{ translateX: dot2TranslateX }] }]} />
          <Animated.View style={[styles.flowDot, { transform: [{ translateX: dot3TranslateX }] }]} />
        </View>
        <Animated.View style={[styles.walletIconContainer, { transform: [{ scale: walletScale }] }]}>
          <Wallet size={32} color={animationColors.primary} strokeWidth={2} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.animatedTextContainer, { opacity: textOpacity }]}>
        <Animated.Text 
          style={[
            styles.animatedText,
            {
              opacity: textSwitch.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }
          ]}
        >
          Register or Refer
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.animatedText,
            styles.animatedTextEarn,
            {
              opacity: textSwitch.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              position: 'absolute',
            }
          ]}
        >
          Earn
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const BenefitsAnimation = () => {
  const icon1Scale = useRef(new Animated.Value(1)).current;
  const icon2Scale = useRef(new Animated.Value(1)).current;
  const icon3Scale = useRef(new Animated.Value(1)).current;
  const icon4Scale = useRef(new Animated.Value(1)).current;
  const icon1Rotate = useRef(new Animated.Value(0)).current;
  const icon2Rotate = useRef(new Animated.Value(0)).current;
  const icon3Rotate = useRef(new Animated.Value(0)).current;
  const icon4Rotate = useRef(new Animated.Value(0)).current;
  const icon1Opacity = useRef(new Animated.Value(1)).current;
  const icon2Opacity = useRef(new Animated.Value(1)).current;
  const icon3Opacity = useRef(new Animated.Value(1)).current;
  const icon4Opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Wave effect with scale, rotation, and opacity
    const createWaveAnimation = (
      scaleValue: Animated.Value,
      rotateValue: Animated.Value,
      opacityValue: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleValue, {
                toValue: 1.2,
                duration: 800,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: 800,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(rotateValue, {
                toValue: 1,
                duration: 1600,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: true,
              }),
              Animated.timing(rotateValue, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(opacityValue, {
                toValue: 0.6,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(opacityValue, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      );
    };

    createWaveAnimation(icon1Scale, icon1Rotate, icon1Opacity, 0).start();
    createWaveAnimation(icon2Scale, icon2Rotate, icon2Opacity, 400).start();
    createWaveAnimation(icon3Scale, icon3Rotate, icon3Opacity, 800).start();
    createWaveAnimation(icon4Scale, icon4Rotate, icon4Opacity, 1200).start();
  }, []);

  const icon1Spin = icon1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });
  const icon2Spin = icon2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });
  const icon3Spin = icon3Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });
  const icon4Spin = icon4Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  return (
    <View style={styles.benefitsAnimation}>
      <View style={styles.benefitIconRow}>
        <View style={styles.benefitItem}>
          <Animated.View 
            style={[
              styles.benefitIconAnimated, 
              { 
                transform: [{ scale: icon1Scale }, { rotate: icon1Spin }],
                opacity: icon1Opacity,
              }
            ]}
          >
            <Coins size={24} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Text style={styles.benefitLabel}>Earn Coins</Text>
        </View>
        <View style={styles.benefitItem}>
          <Animated.View 
            style={[
              styles.benefitIconAnimated, 
              { 
                transform: [{ scale: icon2Scale }, { rotate: icon2Spin }],
                opacity: icon2Opacity,
              }
            ]}
          >
            <Ticket size={24} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Text style={styles.benefitLabel}>Free Tickets</Text>
        </View>
      </View>
      <View style={styles.benefitIconRow}>
        <View style={styles.benefitItem}>
          <Animated.View 
            style={[
              styles.benefitIconAnimated, 
              { 
                transform: [{ scale: icon3Scale }, { rotate: icon3Spin }],
                opacity: icon3Opacity,
              }
            ]}
          >
            <Zap size={24} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Text style={styles.benefitLabel}>Instant Rewards</Text>
        </View>
        <View style={styles.benefitItem}>
          <Animated.View 
            style={[
              styles.benefitIconAnimated, 
              { 
                transform: [{ scale: icon4Scale }, { rotate: icon4Spin }],
                opacity: icon4Opacity,
              }
            ]}
          >
            <Award size={24} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Text style={styles.benefitLabel}>Exclusive Perks</Text>
        </View>
      </View>
    </View>
  );
};

const ReferralAnimation = () => {
  const userScale = useRef(new Animated.Value(1)).current;
  const userGlow = useRef(new Animated.Value(0)).current;
  const line1Scale = useRef(new Animated.Value(0)).current;
  const line2Scale = useRef(new Animated.Value(0)).current;
  const line3Scale = useRef(new Animated.Value(0)).current;
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;
  const friend1Scale = useRef(new Animated.Value(0)).current;
  const friend2Scale = useRef(new Animated.Value(0)).current;
  const friend3Scale = useRef(new Animated.Value(0)).current;
  const friend1Opacity = useRef(new Animated.Value(0)).current;
  const friend2Opacity = useRef(new Animated.Value(0)).current;
  const friend3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth user pulse with glow
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(userScale, {
            toValue: 1.08,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(userScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(userGlow, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(userGlow, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Smooth connection animation with staggered timing using scaleY
    Animated.loop(
      Animated.sequence([
        // Lines grow smoothly
        Animated.stagger(150, [
          Animated.parallel([
            Animated.timing(line1Scale, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true 
            }),
            Animated.timing(line1Opacity, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.timing(line2Scale, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true 
            }),
            Animated.timing(line2Opacity, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.timing(line3Scale, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true 
            }),
            Animated.timing(line3Opacity, { 
              toValue: 1, 
              duration: 800, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
        ]),
        // Friends appear smoothly
        Animated.delay(200),
        Animated.stagger(150, [
          Animated.parallel([
            Animated.spring(friend1Scale, { 
              toValue: 1, 
              friction: 8,
              tension: 40,
              useNativeDriver: true 
            }),
            Animated.timing(friend1Opacity, { 
              toValue: 1, 
              duration: 400, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.spring(friend2Scale, { 
              toValue: 1, 
              friction: 8,
              tension: 40,
              useNativeDriver: true 
            }),
            Animated.timing(friend2Opacity, { 
              toValue: 1, 
              duration: 400, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.spring(friend3Scale, { 
              toValue: 1, 
              friction: 8,
              tension: 40,
              useNativeDriver: true 
            }),
            Animated.timing(friend3Opacity, { 
              toValue: 1, 
              duration: 400, 
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true 
            }),
          ]),
        ]),
        // Hold the state
        Animated.delay(2000),
        // Fade out smoothly
        Animated.parallel([
          Animated.timing(line1Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(line2Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(line3Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(line1Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(line2Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(line3Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend1Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend2Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend3Scale, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend1Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend2Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(friend3Opacity, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.delay(800),
      ])
    ).start();
  }, []);

  const glowOpacity = userGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={styles.referralAnimation}>
      <Animated.View style={[styles.userNode, { transform: [{ scale: userScale }] }]}>
        <Animated.View style={[styles.userGlow, { opacity: glowOpacity }]} />
        <View style={styles.userCircle}>
          <User size={40} color={animationColors.text} strokeWidth={2} />
        </View>
        <Text style={styles.referralYouLabel}>You</Text>
      </Animated.View>
      <View style={styles.connectionLines}>
        <Animated.View style={[styles.connectionLine, { transform: [{ scaleY: line1Scale }], opacity: line1Opacity }]} />
        <Animated.View style={[styles.connectionLine, { transform: [{ scaleY: line2Scale }], opacity: line2Opacity }]} />
        <Animated.View style={[styles.connectionLine, { transform: [{ scaleY: line3Scale }], opacity: line3Opacity }]} />
      </View>
      <View style={styles.friendNodes}>
        <View style={styles.friendNodeContainer}>
          <Animated.View style={[styles.friendNode, { transform: [{ scale: friend1Scale }], opacity: friend1Opacity }]}>
            <Users size={28} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Animated.View style={[styles.coinBadge, { transform: [{ scale: friend1Scale }], opacity: friend1Opacity }]}>
            <Text style={styles.coinBadgeText}>+25</Text>
          </Animated.View>
        </View>
        <View style={styles.friendNodeContainer}>
          <Animated.View style={[styles.friendNode, { transform: [{ scale: friend2Scale }], opacity: friend2Opacity }]}>
            <Users size={28} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Animated.View style={[styles.coinBadge, { transform: [{ scale: friend2Scale }], opacity: friend2Opacity }]}>
            <Text style={styles.coinBadgeText}>+25</Text>
          </Animated.View>
        </View>
        <View style={styles.friendNodeContainer}>
          <Animated.View style={[styles.friendNode, { transform: [{ scale: friend3Scale }], opacity: friend3Opacity }]}>
            <Users size={28} color={animationColors.primary} strokeWidth={2} />
          </Animated.View>
          <Animated.View style={[styles.coinBadge, { transform: [{ scale: friend3Scale }], opacity: friend3Opacity }]}>
            <Text style={styles.coinBadgeText}>+25</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);

  // Wallet data
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralReward, setReferralReward] = useState(100);

  // Redeem code modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      const [balanceData, transactionsData, referralData] = await Promise.all([
        getWallet(),
        getTransactions(1, 50),
        getReferral(),
      ]);

      setWalletBalance(balanceData);
      setTransactions(transactionsData?.data || transactionsData?.transactions || []);
      setReferralInfo(referralData ? {
        referralCode: referralData.referralCode || referralData.code || '',
        totalReferred: referralData.totalReferred || referralData.totalReferrals || 0,
        totalCoinsEarned: referralData.totalCoinsEarned || referralData.totalRewards || 0,
      } : null);
      setReferralReward(100); // Hardcoded as per requirements
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleShareReferral = async () => {
    if (!referralInfo) return;

    try {
      await Share.share({
        message: `Join me on Unifesto! Use my referral code: ${referralInfo.referralCode}\n\nDownload the app!`,
      });
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
  };

  const handleApplyRedeemCode = async () => {
    if (!redeemCodeInput.trim()) {
      Alert.alert('Error', 'Please enter a redeem code');
      return;
    }

    try {
      setRedeemLoading(true);

      const result = await redeemCode(redeemCodeInput.trim());

      Alert.alert(
        'Success!',
        `You received coins!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowRedeemModal(false);
              setRedeemCodeInput('');
              handleRefresh();
            },
          },
        ]
      );
    } catch (error: any) {
      // Show more specific error messages
      let errorMessage = 'Failed to apply redeem code';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString().includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.toString().includes('No active session')) {
        errorMessage = 'Session expired. Please sign in again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type: string, coins: number) => {
    if (coins > 0) {
      return <ArrowDownLeft size={20} color={colors.success} strokeWidth={2} />;
    } else {
      return <ArrowUpRight size={20} color={colors.error} strokeWidth={2} />;
    }
  };

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  headerSection: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  pocketBranding: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  pocketImage: {
    width: 250,
    height: 100,
    marginBottom: spacing[2],
  },
  unifestoText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  walletCard: {
    padding: spacing[8],
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  balanceActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  pocketLogoFooter: {
    width: 150,
    height: 50,
  },
  walletBalance: {
    fontSize: 48,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  walletCurrency: {
    fontSize: typography.fontSize.base,
    color: 'rgba(0, 0, 0, 0.7)',
    fontFamily: typography.fontFamily.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
  },
  statCardFull: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.success,
    marginBottom: spacing[1],
  },
  statValueSpent: {
    color: colors.error,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('normal'),
  },
  redeemSection: {
    marginBottom: spacing[2],
  },
  redeemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  redeemInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    ...shadows.sm,
  },
  redeemInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
    fontFamily: typography.fontFamily.primary,
    textTransform: 'uppercase',
  },
  redeemButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  redeemButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  cardContent: {
    gap: spacing[4],
  },
  referralDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[2],
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  referralCodeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  referralCode: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  referralStat: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  referralStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  referralStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  transactionAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
  },
  transactionAmountEarned: {
    color: colors.success,
  },
  transactionAmountSpent: {
    color: colors.error,
  },
  transactionDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    paddingVertical: spacing[12],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('medium'),
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  // Guest User Styles
  guestContainer: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[12],
  },
  guestSection: {
    gap: spacing[4],
  },
  guestCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing[5],
    marginTop: spacing[6],
    ...shadows.lg,
  },
  guestCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  guestIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  guestCardContent: {
    flex: 1,
  },
  guestCardTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    marginBottom: spacing[1],
  },
  guestCardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  guestArrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newHereContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newHereText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('normal'),
  },
  newHereLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  // Information Sections
  infoSection: {
    marginTop: spacing[8],
  },
  infoSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[4],
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing[8],
    ...shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  // How Wallet Works Animation
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: spacing[4],
  },
  coinFlowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing[4],
  },
  coinAnimation: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  coinSymbol: {
    fontSize: 32,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  coinPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 244, 98, 0.3)',
  },
  arrowFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    justifyContent: 'center',
  },
  flowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  walletIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedTextContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  animatedText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    textAlign: 'center',
  },
  animatedTextEarn: {
    color: colors.primary,
  },
  // Benefits Animation
  benefitsAnimation: {
    gap: spacing[6],
  },
  benefitIconRow: {
    flexDirection: 'row',
    gap: spacing[6],
    justifyContent: 'center',
  },
  benefitItem: {
    alignItems: 'center',
    gap: spacing[2],
  },
  benefitIconAnimated: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  benefitLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('medium'),
  },
  // Referral Animation
  referralAnimation: {
    alignItems: 'center',
    gap: spacing[6],
    paddingVertical: spacing[4],
  },
  userNode: {
    alignItems: 'center',
    position: 'relative',
  },
  userGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  userCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  referralYouLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: getFontFamily('medium'),
    marginTop: spacing[2],
  },
  connectionLines: {
    flexDirection: 'row',
    gap: spacing[4],
    height: 40,
    alignItems: 'flex-start',
  },
  connectionLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(52, 145, 255, 0.3)',
    transformOrigin: 'top',
  },
  friendNodes: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  friendNodeContainer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  friendNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(52, 145, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  coinBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
  },
  coinBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
  },
  browseButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  browseButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  // Text Content Styles
  textContentContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    gap: spacing[4],
    width: '100%',
  },
  textContentTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
    textAlign: 'left',
    width: '100%',
  },
  textContentDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('normal'),
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    textAlign: 'left',
    width: '100%',
  },
  benefitTextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingRight: spacing[2],
  },
  benefitBullet: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
    lineHeight: typography.fontSize['2xl'],
    width: 24,
    marginRight: spacing[3],
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('normal'),
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

  if (!user) {
    return (
      <View style={styles.container}>
        <CustomHeader />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guestContainer}
        >
          <View style={styles.guestSection}>
            <TouchableOpacity
              style={styles.guestCard}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <View style={styles.guestCardRow}>
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.guestIconGradient}
                >
                  <Wallet size={24} color={colors.text} strokeWidth={2} />
                </LinearGradient>

                <View style={styles.guestCardContent}>
                  <Text style={styles.guestCardTitle}>Sign in to Unlock</Text>
                  <Text style={styles.guestCardDescription}>
                    Wallet, Coins & Rewards
                  </Text>
                </View>

                <View style={styles.guestArrowButton}>
                  <ArrowUpRight size={20} color={colors.primary} strokeWidth={2.5} />
                </View>
              </View>
            </TouchableOpacity>

            {/* New Here Link */}
            <View style={styles.newHereContainer}>
              <Text style={styles.newHereText}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.newHereLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* How Wallet Works Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>How Wallet Works</Text>
            <View style={styles.infoCard}>
              <View style={styles.textContentContainer}>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Sign up and create your account to activate your digital wallet</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Earn coins by registering for events, referring friends, and participating in activities</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Use your coins to get free tickets, discounts, and exclusive event perks</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Track your balance and transaction history in real-time</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Wallet Benefits</Text>
            <View style={styles.infoCard}>
              <View style={styles.textContentContainer}>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Get rewarded instantly for every event registration and referral</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Redeem coins for free tickets to premium campus events</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Unlock special discounts and early bird access to popular events</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Participate in exclusive contests and win bonus rewards</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Referral System Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Referral System</Text>
            <View style={styles.infoCard}>
              <View style={styles.textContentContainer}>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Share your unique referral code with friends and classmates</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Earn bonus coins when your friends sign up using your code</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Your referrals also get welcome bonus coins to start their journey</Text>
                </View>
                <View style={styles.benefitTextItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>Build your network and maximize earnings with unlimited referrals</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader />
      {/* Redeem Code Modal */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Tag size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRedeemModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Redeem Code</Text>
            <Text style={styles.modalDescription}>
              Enter your promotional or gift code to receive coins
            </Text>

            <TextInput
              style={styles.redeemInput}
              placeholder="Enter code"
              placeholderTextColor={colors.textMuted}
              value={redeemCodeInput}
              onChangeText={setRedeemCodeInput}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!redeemLoading}
            />

            <GradientButton
              onPress={handleApplyRedeemCode}
              loading={redeemLoading}
              disabled={redeemLoading || !redeemCodeInput.trim()}
              style={{ width: '100%' }}
            >
              {redeemLoading ? 'Applying...' : 'Apply Code'}
            </GradientButton>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: HEADER_TOP_OFFSET }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={HEADER_TOP_OFFSET}
          />
        }
      >
        {/* Wallet Balance Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={brandGradient}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={styles.walletCard}
          >
            {loading && !walletBalance ? (
              <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
                <Skeleton width={140} height={52} borderRadius={borderRadius.md} />
                <Skeleton width={90} height={16} borderRadius={borderRadius.sm} />
              </View>
            ) : (
              <>
                <View style={styles.balanceRow}>
                  <Text style={styles.walletBalance}>
                    {balanceVisible ? (walletBalance?.balance || 0) : '••••'}
                  </Text>
                  <View style={styles.balanceActions}>
                    <TouchableOpacity
                      style={styles.balanceActionButton}
                      onPress={() => setBalanceVisible(!balanceVisible)}
                      activeOpacity={0.7}
                    >
                      {balanceVisible ? (
                        <Eye size={20} color={colors.text} strokeWidth={2} />
                      ) : (
                        <EyeOff size={20} color={colors.text} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.balanceActionButton}
                      onPress={handleRefresh}
                      activeOpacity={0.7}
                      disabled={refreshing}
                    >
                      <RefreshCw size={20} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.walletCurrency}>{walletBalance?.currency || 'Uni Coins'}</Text>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Wallet Stats */}
        {walletBalance && (
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{walletBalance.balance || 0}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, styles.statValueSpent]}>0</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={[styles.statCard, styles.statCardFull]}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>
          </View>
        )}

        {/* Redeem Code Section */}
        <View style={styles.section}>
          <View style={styles.redeemSection}>
            <View style={styles.redeemInputRow}>
              <View style={styles.redeemInputWrapper}>
                <Tag size={20} color={colors.textMuted} strokeWidth={2} />
                <TextInput
                  style={styles.redeemInput}
                  placeholder="Enter redeem code"
                  placeholderTextColor={colors.textMuted}
                  value={redeemCodeInput}
                  onChangeText={setRedeemCodeInput}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!redeemLoading}
                />
              </View>
              <TouchableOpacity
                style={[styles.redeemButton, (!redeemCodeInput.trim() || redeemLoading) && styles.redeemButtonDisabled]}
                onPress={handleApplyRedeemCode}
                disabled={!redeemCodeInput.trim() || redeemLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.redeemButtonGradient}
                >
                  {redeemLoading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Referral Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Gift size={22} color={colors.primary} strokeWidth={2} />
                <Text style={styles.cardTitle}>Referral Program</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/referrals')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.referralDescription}>
                Invite friends and earn {referralReward} {walletBalance?.currency || 'coins'} per referral!
              </Text>

              {loading && !referralInfo ? (
                <View style={{ gap: spacing[3] }}>
                  <Skeleton width="100%" height={64} borderRadius={borderRadius.lg} />
                  <Skeleton width="100%" height={56} borderRadius={borderRadius.lg} />
                </View>
              ) : (
                <>
                  <View style={styles.referralCodeContainer}>
                    <View style={styles.referralCodeBox}>
                      <Text style={styles.referralCodeLabel}>Your Code</Text>
                      <Text style={styles.referralCode}>{referralInfo?.referralCode || 'LOADING'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={handleShareReferral}
                      activeOpacity={0.7}
                    >
                      <ShareIcon size={20} color={colors.primary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.referralStats}>
                    <View style={styles.referralStat}>
                      <Text style={styles.referralStatValue}>
                        {referralInfo?.totalReferred || 0}
                      </Text>
                      <Text style={styles.referralStatLabel}>Referrals</Text>
                    </View>
                    <View style={styles.referralStatDivider} />
                    <View style={styles.referralStat}>
                      <Text style={styles.referralStatValue}>
                        {referralInfo?.totalCoinsEarned || 0}
                      </Text>
                      <Text style={styles.referralStatLabel}>Coins Earned</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={22} color={colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>
          </View>

          <View style={styles.card}>
            {loading && transactions.length === 0 ? (
              <View>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i}>
                    <View style={styles.transactionItem}>
                      <Skeleton width={40} height={40} borderRadius={20} />
                      <View style={{ flex: 1, gap: spacing[2] }}>
                        <Skeleton width={180} height={13} borderRadius={borderRadius.sm} />
                        <Skeleton width={100} height={11} borderRadius={borderRadius.sm} />
                      </View>
                      <Skeleton width={36} height={18} borderRadius={borderRadius.sm} />
                    </View>
                    {i < 5 && <View style={styles.transactionDivider} />}
                  </View>
                ))}
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Sparkles size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Start earning coins by attending events!
                </Text>
              </View>
            ) : (
              transactions.slice(0, 10).map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type, transaction.coins)}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.coins > 0
                          ? styles.transactionAmountEarned
                          : styles.transactionAmountSpent,
                      ]}
                    >
                      {transaction.coins > 0 ? '+' : ''}
                      {transaction.coins}
                    </Text>
                  </View>
                  {index < Math.min(transactions.length, 10) - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Pocket Logo Footer */}
        <View style={styles.pocketFooter}>
          <Image
            source={require('../../assets/Pocket.png')}
            style={styles.pocketLogoFooter}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
}
